import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '../../../../lib/supabase';
import { mapTeamTypeToRole } from '../../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json({ error: 'initData string is required' }, { status: 400 });
    }

    const tokens = [
      process.env.TELEGRAM_TEAM_BOT_TOKEN,
      process.env.TELEGRAM_INVESTOR_BOT_TOKEN,
      process.env.TELEGRAM_CLIENT_BOT_TOKEN
    ].filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No Telegram bot tokens configured' }, { status: 500 });
    }

    // 1. Parse query params from initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return NextResponse.json({ error: 'Missing hash parameter in initData' }, { status: 400 });
    }

    params.delete('hash');

    // 2. Sort keys alphabetically and format data-check-string
    const sortedKeys = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = sortedKeys.map(([k, v]) => `${k}=${v}`).join('\n');

    // 3. Calculate HMAC-SHA256 signature across configured bot tokens
    let isValid = false;
    for (const token of tokens) {
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      if (calculatedHash === hash) {
        isValid = true;
        break;
      }
    }

    // 4. Compare hashes
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid initData signature' }, { status: 401 });
    }

    // 5. Check auth_date freshness (must be within last 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (authDate > 0 && now - authDate > 86400) {
      return NextResponse.json({ error: 'Telegram session expired, please restart the bot' }, { status: 401 });
    }

    // 6. Extract user payload
    const userJson = params.get('user');
    if (!userJson) {
      return NextResponse.json({ error: 'Missing user object in initData' }, { status: 400 });
    }

    const tgUser = JSON.parse(userJson);
    const chatIdStr = String(tgUser.id);

    // 7. Look up linked team user in Supabase
    const { data: teamMember } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', chatIdStr)
      .maybeSingle();

    if (teamMember) {
      const userRole = mapTeamTypeToRole(teamMember.team_type);
      return NextResponse.json({
        success: true,
        user: {
          id: teamMember.id,
          full_name: teamMember.full_name,
          email: teamMember.email,
          phone: teamMember.phone,
          team_type: teamMember.team_type,
          role: userRole,
          referral_code: teamMember.referral_code || null,
          promoter_tier: teamMember.promoter_tier || 'Associate',
          telegram_chat_id: teamMember.telegram_chat_id
        }
      });
    }

    // 8. Cascade lookup: Check public.investors
    const { data: investorMember } = await supabase
      .from('investors')
      .select('*')
      .eq('telegram_chat_id', chatIdStr)
      .maybeSingle();

    if (investorMember) {
      return NextResponse.json({
        success: true,
        user: {
          id: investorMember.id,
          full_name: investorMember.full_name || investorMember.alias_name,
          email: investorMember.email,
          phone: investorMember.phone,
          team_type: 'investor',
          role: 'investor',
          category: investorMember.category,
          kyc_verified: investorMember.kyc_verified,
          telegram_chat_id: investorMember.telegram_chat_id
        }
      });
    }

    // 9. Cascade lookup: Check public.founders
    const { data: founderMember } = await supabase
      .from('founders')
      .select('*, businesses(brand_name)')
      .eq('telegram_chat_id', chatIdStr)
      .maybeSingle();

    if (founderMember) {
      return NextResponse.json({
        success: true,
        user: {
          id: founderMember.id,
          full_name: founderMember.full_name,
          email: founderMember.email,
          phone: founderMember.phone,
          team_type: 'founder',
          role: 'founder',
          brand_name: founderMember.businesses?.[0]?.brand_name || null,
          telegram_chat_id: founderMember.telegram_chat_id
        }
      });
    }

    return NextResponse.json({
      error: 'not_linked',
      message: 'Your Telegram account is not yet registered. Please start your respective bot and share your registered phone number first.',
      tgUser: {
        id: tgUser.id,
        first_name: tgUser.first_name,
        username: tgUser.username
      }
    }, { status: 403 });

  } catch (err) {
    console.error('MiniApp Auth Validation error:', err);
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 500 });
  }
}
