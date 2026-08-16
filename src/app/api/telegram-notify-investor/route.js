import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { investorId, phone, chatId, title, message, actionUrl } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_INVESTOR_BOT_TOKEN is not configured' }, { status: 500 });
    }

    let targetChatId = chatId;

    if (!targetChatId) {
      let invQuery = supabase.from('investors').select('telegram_chat_id, full_name, phone');

      if (investorId) {
        invQuery = invQuery.eq('id', investorId);
      } else if (phone) {
        invQuery = invQuery.eq('phone', phone);
      } else {
        return NextResponse.json({ error: 'investorId, phone, or chatId is required' }, { status: 400 });
      }

      const { data: inv } = await invQuery.maybeSingle();

      if (!inv || !inv.telegram_chat_id) {
        return NextResponse.json({ ok: true, notified: 0, reason: 'Investor Telegram Chat ID not linked' });
      }
      targetChatId = inv.telegram_chat_id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const alertText = `🔔 <b>GRO10X Investor Notification</b>\n\n📌 <b>${title}</b>\n${message}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Open Investor Portal', url: actionUrl || `${appUrl}/investor` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, targetChatId, alertText, keyboard);

    return NextResponse.json({ success: true, notified: 1 });
  } catch (err) {
    console.error('Error in telegram-notify-investor API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
