import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../../lib/supabase';

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

    // 2. Resolve email from identifier (email or phone)
    let targetEmail = identifier.trim();
    let userName = 'Team Member';
    let userRole = activePin.user_role || 'admin';

    if (!targetEmail.includes('@')) {
      let phoneClean = targetEmail.replace(/[\s\-\+\(\)]/g, '');
      if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);

      const { data: teamMembers } = await supabase.from('team').select('*');
      if (teamMembers && teamMembers.length > 0) {
        const found = teamMembers.find(t => {
          let p = (t.phone || '').replace(/[\s\-\+\(\)]/g, '');
          if (p.startsWith('880')) p = '0' + p.slice(3);
          return p === phoneClean;
        });
        if (found && found.email) {
          targetEmail = found.email;
          userName = found.full_name;
          userRole = found.team_type === 'promoter' ? 'promoter' : 'admin';
        }
      }
    } else {
      const { data: teamMember } = await supabase.from('team').select('*').eq('email', targetEmail).single();
      if (teamMember) {
        userName = teamMember.full_name;
        userRole = teamMember.team_type === 'promoter' ? 'promoter' : 'admin';
      }
    }

    // 3. Admin Supabase Client (if SUPABASE_SERVICE_ROLE_KEY is present)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceKey && supabaseUrl) {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // Find user in auth.users
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());

      if (existingUser) {
        // Update existing user password to temp_pin & first_login: true
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: temp_pin,
          user_metadata: { first_login: true, full_name: userName }
        });
      } else {
        // Create user with temp_pin
        await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: temp_pin,
          email_confirm: true,
          user_metadata: { first_login: true, full_name: userName }
        });
      }
    }

    // 4. Mark PIN as verified in DB
    await supabase.from('telegram_auth_pins').update({
      is_verified: true,
      verified_at: new Date().toISOString()
    }).eq('id', activePin.id);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      name: userName,
      role: userRole,
      chatId: activePin.telegram_chat_id
    });
  } catch (err) {
    console.error('Verify and onboard error:', err);
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 });
  }
}
