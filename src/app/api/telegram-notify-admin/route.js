import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { title, message, action_url, type = 'info' } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_TEAM_BOT_TOKEN is not configured' }, { status: 500 });
    }

    // Fetch all admin/manager chat IDs
    const { data: admins } = await supabase
      .from('team')
      .select('telegram_chat_id, full_name')
      .in('team_type', ['admin', 'manager'])
      .not('telegram_chat_id', 'is', null);

    if (!admins || admins.length === 0) {
      return NextResponse.json({ ok: true, notified: 0, reason: 'No admin Telegram Chat IDs linked' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const alertText = `🚨 <b>GRO10X Platform Alert</b>\n\n📌 <b>${title}</b>\n${message}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 View in Admin Panel', url: action_url || `${appUrl}/admin` }
        ]
      ]
    };

    let count = 0;
    for (const admin of admins) {
      if (admin.telegram_chat_id) {
        await sendTelegramMessage(botToken, admin.telegram_chat_id, alertText, keyboard);
        count++;
      }
    }

    return NextResponse.json({ success: true, notified_count: count });
  } catch (err) {
    console.error('Error in telegram-notify-admin API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
