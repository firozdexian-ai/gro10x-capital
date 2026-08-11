import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../../lib/supabase';

// Pad 4-digit PIN to 6 chars for Supabase Auth password policy compatibility
function formatAuthPassword(pin) {
  return pin ? `${pin}00` : '';
}

function normalizePhone(phone) {
  let p = (phone || '').replace(/[\s\-\+\(\)]/g, '');
  if (p.startsWith('880')) p = '0' + p.slice(3);
  return p;
}

export async function POST(request) {
  try {
    const { identifier, temp_pin } = await request.json();

    if (!identifier || !temp_pin) {
      return NextResponse.json({ error: 'Identifier and PIN are required.' }, { status: 400 });
    }

    // 1. Verify PIN in telegram_auth_pins table
    const { data: pins, error: pinErr } = await supabase
      .from('telegram_auth_pins')
      .select('*')
      .eq('temp_pin', temp_pin)
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (pinErr) throw pinErr;

    if (!pins || pins.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired Telegram temporary PIN. Please request a new PIN from your bot.' }, { status: 400 });
    }

    const activePin = pins[0];
    if (new Date(activePin.pin_expires_at) < new Date()) {
      return NextResponse.json({ error: 'This temporary PIN has expired (valid for 15 mins). Please request a new PIN from your bot.' }, { status: 400 });
    }

    // 2. Resolve email, name, and role from identifier (email or phone)
    let targetEmail = identifier.trim();
    let userName = 'User';
    let userRole = activePin.user_role || 'investor';
    let resolvedInvestorId = null;
    let resolvedTeamId = null;

    const isEmail = targetEmail.includes('@');
    const phoneClean = !isEmail ? normalizePhone(targetEmail) : null;

    // --- A: Search TEAM table first ---
    if (isEmail) {
      const { data: teamMember } = await supabase.from('team').select('*').eq('email', targetEmail).maybeSingle();
      if (teamMember) {
        userName = teamMember.full_name;
        const tt = teamMember.team_type;
        userRole = tt === 'promoter' ? 'promoter' : tt === 'kam' ? 'kam' : 'admin';
        resolvedTeamId = teamMember.id;
      }
    } else {
      const { data: allTeam } = await supabase.from('team').select('*');
      const found = (allTeam || []).find(t => normalizePhone(t.phone) === phoneClean);
      if (found) {
        targetEmail = found.email;
        userName = found.full_name;
        const tt = found.team_type;
        userRole = tt === 'promoter' ? 'promoter' : tt === 'kam' ? 'kam' : 'admin';
        resolvedTeamId = found.id;
      }
    }

    // --- B: If not found in TEAM, search INVESTORS table ---
    if (!resolvedTeamId) {
      if (isEmail) {
        const { data: investor } = await supabase
          .from('investors')
          .select('id, email, full_name, alias_name, phone')
          .eq('email', targetEmail)
          .maybeSingle();

        if (investor) {
          userName = investor.alias_name || investor.full_name || 'Valued Investor';
          userRole = 'investor';
          resolvedInvestorId = investor.id;
        }
      } else {
        const { data: allInvestors } = await supabase
          .from('investors')
          .select('id, email, full_name, alias_name, phone');

        const foundInv = (allInvestors || []).find(i => normalizePhone(i.phone) === phoneClean);
        if (foundInv) {
          targetEmail = foundInv.email;
          userName = foundInv.alias_name || foundInv.full_name || 'Valued Investor';
          userRole = 'investor';
          resolvedInvestorId = foundInv.id;
        }
      }
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({
        error: `Account not found for '${identifier}'. Please verify your registered phone or email.`
      }, { status: 404 });
    }

    const authPassword = formatAuthPassword(temp_pin);

    // 3. Admin Supabase Client
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY is missing. Please add it to Vercel Environment Variables.'
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 4. Find or create Supabase Auth user
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    let authUserId = existingUser?.id;

    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: authPassword,
        email_confirm: true,
        user_metadata: { first_login: true, full_name: userName, role: userRole }
      });
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: authPassword,
        email_confirm: true,
        user_metadata: { first_login: true, full_name: userName, role: userRole }
      });
      if (createErr) throw createErr;
      authUserId = newUser?.user?.id;
    }

    // 5. Link auth.users.id → investors.user_id (if investor)
    if (resolvedInvestorId && authUserId) {
      await supabase
        .from('investors')
        .update({ user_id: authUserId })
        .eq('id', resolvedInvestorId);
    }

    // 6. Upsert user_roles table
    if (authUserId) {
      await supabase.from('user_roles').upsert({
        user_id: authUserId,
        role: userRole
      }, { onConflict: 'user_id' });
    }

    // 7. Mark PIN as verified
    await supabase.from('telegram_auth_pins').update({
      is_verified: true,
      verified_at: new Date().toISOString()
    }).eq('id', activePin.id);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      name: userName,
      role: userRole,
      chatId: activePin.telegram_chat_id,
      investorId: resolvedInvestorId || null
    });
  } catch (err) {
    console.error('Verify and onboard error:', err);
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 });
  }
}
