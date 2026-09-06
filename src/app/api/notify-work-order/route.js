import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendTelegramMessage } from '../telegram-webhook/handlers/authHandlers';

export async function POST(request) {
  try {
    const { event_type, order } = await request.json();

    if (!order || !order.order_code) {
      return NextResponse.json({ error: 'Order object is required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gro10x-capital-rho.vercel.app';
    const invLac = (Number(order.investment_amount_bdt || 0) / 100000).toFixed(2);
    const retLac = (Number(order.return_amount_bdt || 0) / 100000).toFixed(2);
    const profitK = (Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt)) / 1000).toFixed(1);

    let title = '';
    let messageBody = '';

    if (event_type === 'created') {
      title = `📋 <b>NEW WORK ORDER SUBMITTED</b>`;
      messageBody = [
        `🏢 <b>Borrower:</b> Maats Cottage Ltd (Aysha Siddika)`,
        `📦 <b>Order Code:</b> <code>${order.order_code}</code>`,
        `🏢 <b>Corporate Buyer:</b> ${order.corporate_client}`,
        order.po_ref_number ? `📑 <b>PO Ref:</b> ${order.po_ref_number}` : '',
        order.po_value_bdt ? `🏷️ <b>Total PO Value:</b> ৳${(Number(order.po_value_bdt) / 100000).toFixed(2)} Lakhs` : '',
        `📝 <b>Item:</b> ${order.item_description}`,
        `💰 <b>Requested Capital:</b> ৳${invLac} Lakhs`,
        `📈 <b>Expected Return:</b> ৳${retLac} Lakhs (+৳${profitK}k)`,
        `⏱️ <b>Turnaround:</b> ${order.duration_days || 10} Days (Due: ${order.due_date || 'TBD'})`,
        order.po_document_url ? `📎 <i>Signed PO Document Attached</i>` : '',
        `\n<i>Awaiting review & sign-off from Firoz or Faiz Bhai</i>`
      ].filter(Boolean).join('\n');
    } else if (event_type === 'approved') {
      title = `⚡ <b>WORK ORDER APPROVED & DISBURSED</b>`;
      messageBody = [
        `📦 <b>Order Code:</b> <code>${order.order_code}</code>`,
        `🏢 <b>Client:</b> ${order.corporate_client} (${order.item_description})`,
        `💰 <b>Disbursed Capital:</b> ৳${invLac} Lakhs`,
        `📈 <b>Expected Gross Return:</b> ৳${retLac} Lakhs`,
        `🎯 <b>Net Yield:</b> +৳${profitK}k`,
        `📅 <b>Maturity Due Date:</b> ${order.due_date}`,
        `👤 <b>Sign-Off:</b> Faiz Ahmed / Firoz`
      ].filter(Boolean).join('\n');
    } else if (event_type === 'settled') {
      title = `🎉 <b>WORK ORDER SETTLED & REPAID</b>`;
      messageBody = [
        `📦 <b>Order Code:</b> <code>${order.order_code}</code>`,
        `🏢 <b>Client:</b> ${order.corporate_client}`,
        `💰 <b>Capital Repaid:</b> ৳${retLac} Lakhs`,
        `✨ <b>Net Profit Realized:</b> +৳${profitK}k`,
        `📑 <b>Verification:</b> Settlement Bank Slip & Corporate Delivery Challan Verified`,
        `🔓 <b>Facility Headroom:</b> Revolving limit headroom restored`
      ].filter(Boolean).join('\n');
    }

    const fullMessage = `${title}\n\n${messageBody}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📱 Live Order Terminal', url: `${appUrl}/track/maats-cottage` },
          { text: '🏛️ Admin PO Desk', url: `${appUrl}/admin` }
        ]
      ]
    };

    if (botToken) {
      // Fetch admin telegram chats
      try {
        const { data: admins } = await supabase
          .from('team')
          .select('telegram_chat_id, full_name')
          .in('team_type', ['admin', 'manager'])
          .not('telegram_chat_id', 'is', null);

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            if (admin.telegram_chat_id) {
              await sendTelegramMessage(botToken, admin.telegram_chat_id, fullMessage, keyboard);
            }
          }
        }
      } catch (e) {
        console.warn('Telegram notification query warning:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      event_type,
      order_code: order.order_code,
      message_preview: fullMessage
    });
  } catch (err) {
    console.error('Error in notify-work-order API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
