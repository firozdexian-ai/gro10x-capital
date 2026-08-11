import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegram_chat_id, user_name, bot_key = 'team' } = await request.json();

    if (!telegram_chat_id) {
      return NextResponse.json({ ok: false, error: 'Missing telegram_chat_id' }, { status: 400 });
    }

    let botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (bot_key === 'investor') botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (bot_key === 'client') botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Bot token not configured' }, { status: 500 });
    }

    const messageText = `🎉 <b>Congratulations ${user_name || 'Team Member'}!</b>\n\nYour GRO10X OS account is now fully activated and verified.\n\nYou have complete access to your web control panel. Welcome aboard!`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Notify verified error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
