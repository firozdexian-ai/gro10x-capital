import { supabase } from '../../../../lib/supabase';
import { sendTelegramMessage } from './authHandlers';

// 1. /portfolio Command — KAM Portfolio
export async function handlePortfolioCommand(botToken, chatId, appUrl) {
  try {
    // Resolve KAM user by telegram_chat_id
    const { data: teamUser } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    const { data: projects } = await supabase
      .from('funding_projects')
      .select('*, businesses(brand_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!projects || projects.length === 0) {
      await sendTelegramMessage(botToken, chatId, `📁 No active CapEx projects assigned.`);
      return;
    }

    let text = `📁 <b>Managing Partner Portfolio Dashboard</b>\n\n`;

    projects.forEach((p, idx) => {
      const brand = p.businesses?.brand_name || 'GRO10X SPV';
      const target = Number(p.target_amount_bdt || 0);
      const raised = Number(p.raised_amount_bdt || 0);
      const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
      
      const bars = Math.round(pct / 10);
      const progressBar = '█'.repeat(bars) + '░'.repeat(10 - bars);

      text += `<b>${idx + 1}. ${brand} — ${p.project_title || 'CapEx Target'}</b>\n`;
      text += `Stage: ${p.kanban_stage || 'Active'}\n`;
      text += `Raised: ৳${raised.toLocaleString()} / ৳${target.toLocaleString()} (${pct}%)\n`;
      text += `<code>${progressBar} ${pct}%</code>\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 KAM Web Portal', url: `${appUrl}/kam-dashboard` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handlePortfolioCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load portfolio: ${err.message}`);
  }
}

// 2. /tickets Command — Cash Concierge Tickets
export async function handleTicketsCommand(botToken, chatId, appUrl) {
  try {
    const { data: tickets } = await supabase
      .from('cash_tickets')
      .select('*, investors(alias_name, full_name, requires_anonymity), funding_projects(project_title)')
      .not('status', 'eq', 'closed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!tickets || tickets.length === 0) {
      await sendTelegramMessage(botToken, chatId, `🎫 <b>No Active Cash Concierge OTC Tickets</b>`);
      return;
    }

    let text = `🎫 <b>Active OTC Cash Concierge Consultations (${tickets.length})</b>\n\n`;

    tickets.forEach((t, idx) => {
      const name = t.investors?.requires_anonymity ? t.investors?.alias_name : (t.investors?.alias_name || t.investors?.full_name || 'Investor');
      const amt = Number(t.ticket_amount_bdt || 0).toLocaleString();
      
      text += `<b>${idx + 1}. Ticket #${t.id.slice(0, 6)} — ${name}</b>\n`;
      text += `Target: ${t.funding_projects?.project_title || 'CapEx Target'}\n`;
      text += `Amount: ৳${amt} BDT | Status: <b>${t.status}</b>\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Cash Concierge Portal', url: `${appUrl}/cash-concierge` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleTicketsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load tickets: ${err.message}`);
  }
}
