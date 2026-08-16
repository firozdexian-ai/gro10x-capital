import { supabase } from '../../../../lib/supabase';
import { sendTelegramMessage } from './authHandlers';

// Helper to format currency in BDT Lakhs/Crores
function formatBdt(amount) {
  const num = Number(amount || 0);
  if (num >= 10000000) return `৳${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `৳${(num / 100000).toFixed(2)} L`;
  return `৳${num.toLocaleString()}`;
}

// 1. /portfolio Command — KAM Portfolio (scoped to KAM's assigned projects)
export async function handlePortfolioCommand(botToken, chatId, appUrl) {
  try {
    // Resolve KAM user by telegram_chat_id
    const { data: teamUser } = await supabase
      .from('team')
      .select('id, full_name, team_type')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    // Build project query — scope by kam_id if this is a KAM
    let projectsQuery = supabase
      .from('funding_projects')
      .select('*, businesses(brand_name)')
      .order('created_at', { ascending: false })
      .limit(7);

    if (teamUser && teamUser.team_type === 'kam') {
      const { data: kamRecord } = await supabase
        .from('kams')
        .select('id')
        .eq('user_id', teamUser.id)
        .maybeSingle();

      if (kamRecord?.id) {
        projectsQuery = projectsQuery.eq('kam_id', kamRecord.id);
      }
    }

    const { data: projects } = await projectsQuery;

    if (!projects || projects.length === 0) {
      await sendTelegramMessage(botToken, chatId, `📁 <b>No active CapEx projects in your portfolio.</b>\n\nContact Admin to assign projects to your account.`);
      return;
    }

    let text = `📁 <b>Managing Partner Portfolio Dashboard</b>\n`;
    if (teamUser?.full_name) text += `<i>Viewing as: ${teamUser.full_name}</i>\n`;
    text += `\n`;

    projects.forEach((p, idx) => {
      const brand = p.businesses?.brand_name || 'GRO10X SPV';
      // Fixed: correct schema column names target_raise_bdt, amount_raised_bdt, status
      const target = Number(p.target_raise_bdt || 0);
      const raised = Number(p.amount_raised_bdt || 0);
      const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
      const bars = Math.round(pct / 10);
      const progressBar = '\u2588'.repeat(bars) + '\u2591'.repeat(10 - bars);

      text += `<b>${idx + 1}. ${brand} \u2014 ${p.project_title || 'CapEx Target'}</b>\n`;
      text += `Stage: ${p.status || 'Origination'} | Type: ${p.funding_type || 'Franchise'}\n`;
      text += `${formatBdt(raised)} / ${formatBdt(target)} (${pct}%)\n`;
      text += `<code>${progressBar} ${pct}%</code>\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '\uD83C\uDFAB My Cash Tickets', callback_data: 'cmd_tickets' },
          { text: '\uD83C\uDF10 KAM Portal', url: `${appUrl}/kam-dashboard` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handlePortfolioCommand:', err);
    await sendTelegramMessage(botToken, chatId, `\u26A0\uFE0F Failed to load portfolio: ${err.message}`);
  }
}

// 2. /tickets Command \u2014 Active Cash Concierge OTC Tickets (scoped to KAM)
export async function handleTicketsCommand(botToken, chatId, appUrl) {
  try {
    // Resolve KAM by telegram_chat_id
    const { data: teamUser } = await supabase
      .from('team')
      .select('id, team_type')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    // Fixed: use correct FK hint funding_projects!target_project_id(...)
    let ticketQuery = supabase
      .from('cash_tickets')
      .select(`
        id, ticket_amount_bdt, status, preferred_meeting_time, created_at,
        investors(alias_name, full_name, requires_anonymity),
        funding_projects!target_project_id(project_title)
      `)
      .not('status', 'eq', 'Closed')
      .order('created_at', { ascending: false })
      .limit(5);

    // Scope to KAM's assigned tickets
    if (teamUser && teamUser.team_type === 'kam') {
      const { data: kamRecord } = await supabase
        .from('kams')
        .select('id')
        .eq('user_id', teamUser.id)
        .maybeSingle();

      if (kamRecord?.id) {
        ticketQuery = ticketQuery.eq('kam_id', kamRecord.id);
      }
    }

    const { data: tickets } = await ticketQuery;

    if (!tickets || tickets.length === 0) {
      await sendTelegramMessage(botToken, chatId, `\uD83C\uDFAB <b>No Active OTC Cash Concierge Tickets</b>\n\nAll tickets are resolved or none assigned to you yet.`);
      return;
    }

    let text = `\uD83C\uDFAB <b>Active OTC Cash Concierge Tickets (${tickets.length})</b>\n\n`;

    tickets.forEach((t, idx) => {
      const investor = t.investors;
      const name = investor?.requires_anonymity
        ? (investor?.alias_name || '\uD83D\uDD12 Anonymous OTC')
        : (investor?.alias_name || investor?.full_name || 'Investor');
      const amt = formatBdt(t.ticket_amount_bdt);
      const projectTitle = t.funding_projects?.project_title || 'CapEx Target';
      const statusEmoji = t.status === 'Pending_Review' ? '\uD83D\uDFE1' : t.status === 'Meeting_Scheduled' ? '\uD83D\uDD35' : t.status === 'Funds_Cleared' ? '\uD83D\uDFE2' : '\u26AA';

      text += `<b>${idx + 1}. #${t.id.slice(0, 6)} \u2014 ${name}</b>\n`;
      text += `${statusEmoji} <b>${t.status?.replace(/_/g, ' ')}</b>\n`;
      text += `\uD83D\uDCB0 ${amt} \u2192 ${projectTitle}\n`;
      if (t.preferred_meeting_time) text += `\uD83D\uDCC5 Pref: ${t.preferred_meeting_time}\n`;
      text += `\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '\uD83D\uDCC1 My Portfolio', callback_data: 'cmd_portfolio' },
          { text: '\uD83C\uDF10 KAM Dashboard', url: `${appUrl}/kam-dashboard` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleTicketsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `\u26A0\uFE0F Failed to load tickets: ${err.message}`);
  }
}
