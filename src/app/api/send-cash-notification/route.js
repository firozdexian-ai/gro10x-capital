import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { ticket_id, message_type } = await request.json();

    if (!ticket_id) {
      return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 });
    }

    // Fetch ticket details with investor, project, and KAM
    const { data: ticket, error: tErr } = await supabase
      .from('cash_tickets')
      .select(`
        *,
        investors (
          alias_name,
          phone,
          email,
          telegram_chat_id,
          requires_anonymity
        ),
        funding_projects (
          project_title,
          businesses ( brand_name )
        ),
        kams (
          full_name,
          email
        )
      `)
      .eq('id', ticket_id)
      .single();

    if (tErr || !ticket) {
      return NextResponse.json({ error: 'Cash ticket record not found.' }, { status: 404 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatID = ticket.investors?.telegram_chat_id;
    const investorName = ticket.investors?.requires_anonymity 
      ? ticket.investors?.alias_name 
      : (ticket.investors?.alias_name || 'Valued Partner');

    const brandName = ticket.funding_projects?.businesses?.brand_name || 'GRO10X SPV';
    const projectTitle = ticket.funding_projects?.project_title || 'CapEx Target';
    const amountStr = Number(ticket.ticket_amount_bdt || 0).toLocaleString();
    const kamName = ticket.kams?.full_name || 'Managing Partner Desk';

    let messageText = '';

    switch (message_type) {
      case 'meeting_confirmed':
        const meetingDateStr = ticket.confirmed_meeting_date 
          ? new Date(ticket.confirmed_meeting_date).toLocaleString()
          : (ticket.preferred_meeting_time || 'To be scheduled');
        messageText = `📅 *GRO10X Cash Concierge — Consultation Scheduled* 📅\n\n` +
          `👤 *Investor:* ${investorName}\n` +
          `🏢 *Project Target:* ${brandName} — ${projectTitle}\n` +
          `💰 *Commitment Target:* ৳${amountStr} BDT\n` +
          `⏰ *Confirmed Time:* ${meetingDateStr}\n` +
          `📍 *Format:* ${(ticket.meeting_format || 'In_Person').replace('_', ' ')}\n` +
          `👔 *Assigned Partner:* ${kamName}\n\n` +
          `Your private OTC consultation has been confirmed. Please ensure your Source of Funds verification documentation is ready for your meeting.`;
        break;

      case 'funds_cleared':
        messageText = `✅ *GRO10X Cash Concierge — Funds Cleared* ✅\n\n` +
          `👤 *Investor:* ${investorName}\n` +
          `🏢 *Project Target:* ${brandName} — ${projectTitle}\n` +
          `💰 *Amount Cleared:* ৳${amountStr} BDT\n` +
          `🧾 *Transfer Ref:* \`${ticket.funds_transfer_ref || 'N/A'}\`\n\n` +
          `Your OTC block trade commitment funds have been verified and cleared by GRO10X Advisory. Your allocation certificate will be issued under your portfolio.`;
        break;

      case 'closed':
        messageText = `📋 *GRO10X Cash Concierge — Case File Closed* 📋\n\n` +
          `👤 *Investor:* ${investorName}\n` +
          `🏢 *Project:* ${brandName} — ${projectTitle}\n` +
          `💰 *Commitment:* ৳${amountStr} BDT\n\n` +
          `This consultation ticket has been successfully executed and closed. Thank you for partnering with GRO10X Capital.`;
        break;

      default: // General Status Update
        messageText = `ℹ️ *GRO10X Cash Concierge — Advisory Update* ℹ️\n\n` +
          `👤 *Investor:* ${investorName}\n` +
          `🏢 *Project:* ${brandName} — ${projectTitle}\n` +
          `📊 *New Status:* ${ticket.status.replace('_', ' ')}\n` +
          `👔 *Assigned Partner:* ${kamName}\n\n` +
          `Your OTC consultation ticket status has been updated in the GRO10X Advisory Portal.`;
        break;
    }

    let sentTelegram = false;
    let tgResponse = null;

    if (botToken && chatID) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatID,
            text: messageText,
            parse_mode: 'Markdown'
          })
        });
        tgResponse = await res.json();
        sentTelegram = tgResponse.ok;
      } catch (err) {
        console.error('Telegram push exception:', err);
      }
    }

    // Also record a system notification for the user
    await supabase.from('notifications').insert([{
      user_id: ticket.investors?.id || ticket.id,
      title: `Cash Concierge: ${ticket.status.replace('_', ' ')}`,
      message: `OTC Ticket for ${brandName} (${amountStr} BDT) status updated to ${ticket.status.replace('_', ' ')}.`,
      type: 'info'
    }]);

    return NextResponse.json({
      success: true,
      sent_telegram: sentTelegram,
      has_telegram_id: Boolean(chatID),
      tg_response: tgResponse
    });

  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to send cash notification' }, { status: 500 });
  }
}
