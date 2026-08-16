import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    // If authorization bearer token is passed, verify user
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !user) {
        return NextResponse.json({ error: 'Unauthorized admin access required.' }, { status: 401 });
      }
      // Check user role
      const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      if (roleRow && roleRow.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin privilege required.' }, { status: 403 });
      }
    }

    const { bot_key = 'team' } = await request.json();

    let botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (bot_key === 'investor') botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (bot_key === 'client') botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: `Bot token for '${bot_key}' is not set in environment variables.` }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/telegram-webhook?bot=${bot_key}`;

    const tgUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    
    const res = await fetch(tgUrl);
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || 'Failed to register webhook with Telegram' }, { status: 400 });
    }

    return NextResponse.json({ success: true, webhookUrl, telegramResponse: data });
  } catch (err) {
    console.error('Register webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
