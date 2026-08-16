import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { founderId, phone, chatId, title, message, actionUrl } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_CLIENT_BOT_TOKEN is not configured' }, { status: 500 });
    }

    let targetChatId = chatId;

    if (!targetChatId) {
      let founderQuery = supabase.from('founders').select('telegram_chat_id, full_name, phone');

      if (founderId) {
        founderQuery = founderQuery.eq('id', founderId);
      } else if (phone) {
        let phoneClean = phone.replace(/[\s\-\+\(\)]/g, '');
        if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);
        const last10 = phoneClean.slice(-10);
        founderQuery = founderQuery.or(`phone.eq.${phone},phone.eq.${phoneClean},phone.ilike.%${last10}`);
      } else {
        return NextResponse.json({ error: 'founderId, phone, or chatId is required' }, { status: 400 });
      }

      const { data: founder } = await founderQuery.maybeSingle();

      if (!founder || !founder.telegram_chat_id) {
        return NextResponse.json({ ok: true, notified: 0, reason: 'Founder Telegram Chat ID not linked' });
      }
      targetChatId = founder.telegram_chat_id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const alertText = `🏢 <b>GRO10X Founder Notification</b>\n\n📌 <b>${title}</b>\n${message}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Open Business Portal', url: actionUrl || `${appUrl}/business` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, targetChatId, alertText, keyboard);

    return NextResponse.json({ success: true, notified: 1 });
  } catch (err) {
    console.error('Error in telegram-notify-founder API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
