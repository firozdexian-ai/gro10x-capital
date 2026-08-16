import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { promoterId, phone, title, message, actionUrl } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_TEAM_BOT_TOKEN is not configured' }, { status: 500 });
    }

    // Find promoter telegram_chat_id from public.team
    let promoterQuery = supabase.from('team').select('telegram_chat_id, full_name, phone');

    if (promoterId) {
      promoterQuery = promoterQuery.eq('id', promoterId);
    } else if (phone) {
      promoterQuery = promoterQuery.eq('phone', phone);
    } else {
      return NextResponse.json({ error: 'promoterId or phone is required' }, { status: 400 });
    }

    const { data: promoter } = await promoterQuery.maybeSingle();

    if (!promoter || !promoter.telegram_chat_id) {
      return NextResponse.json({ ok: true, notified: 0, reason: 'Promoter Telegram Chat ID not linked' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const alertText = `🔔 <b>GRO10X Growth Partner Notification</b>\n\n📌 <b>${title}</b>\n${message}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Open Promoter Hub', url: actionUrl || `${appUrl}/promoter` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, promoter.telegram_chat_id, alertText, keyboard);

    return NextResponse.json({ success: true, notified: 1 });
  } catch (err) {
    console.error('Error in telegram-notify-promoter API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
