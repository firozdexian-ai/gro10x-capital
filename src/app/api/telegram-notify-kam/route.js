import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

/**
 * POST /api/telegram-notify-kam
 * Dedicated Telegram alert dispatcher for Key Account Managers (KAMs).
 * Dispatches real-time alerts via @gro10xmanbot for:
 * - New Cash Concierge OTC tickets in assigned territory
 * - SME cohort site visit & audit assignments
 * - POS daily sales anomalies or missed telemetry submissions
 * - Investor KYC Level 3 HNI clearance requests
 */
export async function POST(request) {
  try {
    const { kamId, phone, chatId, title, message, actionUrl, priority = 'normal' } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_TEAM_BOT_TOKEN is not configured' }, { status: 500 });
    }

    let targetChatId = chatId;

    if (!targetChatId) {
      // Look up KAM telegram_chat_id in team table
      let kamQuery = supabase
        .from('team')
        .select('id, telegram_chat_id, full_name, phone, team_type')
        .in('team_type', ['kam', 'manager', 'admin']);

      if (kamId) {
        kamQuery = kamQuery.eq('id', kamId);
      } else if (phone) {
        let phoneClean = phone.replace(/[\s\-\+\(\)]/g, '');
        if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);
        const last10 = phoneClean.slice(-10);
        kamQuery = kamQuery.or(`phone.eq.${phone},phone.eq.${phoneClean},phone.ilike.%${last10}`);
      } else {
        // Broadcast to all active KAMs if no specific KAM identified
        const { data: allKams } = await kamQuery.not('telegram_chat_id', 'is', null);
        if (!allKams || allKams.length === 0) {
          return NextResponse.json({ ok: true, notified: 0, reason: 'No active KAM Telegram chat IDs registered' });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const alertPrefix = priority === 'urgent' ? '🚨 <b>URGENT KAM ACTION REQUIRED</b>' : '💼 <b>KAM TASK ALERT</b>';
        const alertText = `${alertPrefix}\n\n📌 <b>${title}</b>\n${message}`;
        const keyboard = {
          inline_keyboard: [
            [{ text: '📱 Open KAM Desk', url: actionUrl || `${appUrl}/kam-dashboard` }]
          ]
        };

        let count = 0;
        await Promise.allSettled(
          allKams.map(async (k) => {
            if (k.telegram_chat_id) {
              await sendTelegramMessage(botToken, k.telegram_chat_id, alertText, keyboard);
              count++;
            }
          })
        );

        return NextResponse.json({ success: true, notified_count: count, broadcast: true });
      }

      const { data: kam } = await kamQuery.maybeSingle();

      if (!kam || !kam.telegram_chat_id) {
        return NextResponse.json({ ok: true, notified: 0, reason: 'KAM Telegram Chat ID not linked' });
      }
      targetChatId = kam.telegram_chat_id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const alertPrefix = priority === 'urgent' ? '🚨 <b>URGENT KAM ACTION REQUIRED</b>' : '💼 <b>KAM TASK ALERT</b>';
    const alertText = `${alertPrefix}\n\n📌 <b>${title}</b>\n${message}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📱 Open KAM Desk', url: actionUrl || `${appUrl}/kam-dashboard` },
          { text: '📲 Open MiniApp', url: `${appUrl}/team-miniapp` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, targetChatId, alertText, keyboard);

    return NextResponse.json({ success: true, notified: 1 });
  } catch (err) {
    console.error('Error in telegram-notify-kam API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
