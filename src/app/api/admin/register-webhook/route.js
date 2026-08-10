import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { bot_key = 'team' } = await request.json();

    let botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (botKey === 'investor') botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (botKey === 'client') botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: `Bot token for '${bot_key}' is not set in environment variables.` }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/telegram-webhook?bot=${botKey}`;

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
