import { supabase } from '../../../../lib/supabase';
import { sendTelegramMessage } from './authHandlers';

// Helper to format currency in BDT Lakhs/Crores
function formatBdt(amount) {
  const num = Number(amount || 0);
  if (num >= 10000000) {
    return `৳${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `৳${(num / 100000).toFixed(2)} L`;
  }
  return `৳${num.toLocaleString()}`;
}

// 1. /kpis Command — Live Snapshot
export async function handleKpisCommand(botToken, chatId, appUrl) {
  try {
    // Fetch aggregated data
    const [{ count: activeProjectsCount }, { count: activeInvestorsCount }, { data: investmentsData }, { data: leadsData }, { data: kycData }, { data: payData }, { data: payoutData }] = await Promise.all([
      supabase.from('funding_projects').select('*', { count: 'exact', head: true }),
      supabase.from('investors').select('*', { count: 'exact', head: true }),
      supabase.from('investments').select('amount_bdt'),
      supabase.from('inquiry_leads').select('status'),
      supabase.from('kyc_submissions').select('*').eq('status', 'Pending'),
      supabase.from('payment_submissions').select('*').eq('status', 'Pending'),
      supabase.from('payout_requests').select('*').in('status', ['Pending', 'Pending Verification'])
    ]);

    const totalAum = (investmentsData || []).reduce((sum, i) => sum + Number(i.amount_bdt || 0), 0);
    const newLeadsCount = (leadsData || []).filter(l => l.status === 'New').length;
    const pendingKycCount = (kycData || []).length;
    const pendingPayCount = (payData || []).length;
    const pendingPayoutCount = (payoutData || []).length;

    const kpiText = `📊 <b>GRO10X OS — Live Executive Snapshot</b>\n📅 ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n💰 <b>Total AUM Raised:</b> ${formatBdt(totalAum)}\n👥 <b>Active Investors:</b> ${activeInvestorsCount || 0} Verified\n🏗️ <b>Active Projects:</b> ${activeProjectsCount || 0}\n🎯 <b>Unworked Leads:</b> ${newLeadsCount}\n\n⚠️ <b>Action Alerts Queue:</b>\n• <b>${pendingKycCount}</b> KYC Submissions Pending\n• <b>${pendingPayCount}</b> Payment Deposits Pending\n• <b>${pendingPayoutCount}</b> Promoter Payouts Pending`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔔 View Action Alerts', callback_data: 'cmd_alerts' },
          { text: '👥 View Leads', callback_data: 'cmd_leads' }
        ],
        [
          { text: '🌐 Open Admin Dashboard', url: `${appUrl}/admin` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, kpiText, keyboard);
  } catch (err) {
    console.error('Error in handleKpisCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load KPIs: ${err.message}`);
  }
}

// 2. /alerts Command — Action Alert Queue
export async function handleAlertsCommand(botToken, chatId, appUrl) {
  try {
    const [{ data: pendingKyc }, { data: pendingPayments }, { data: unworkedLeads }, { data: pendingPayouts }, { data: pendingCohorts }] = await Promise.all([
      supabase.from('kyc_submissions').select('id, full_name, created_at').eq('status', 'Pending').limit(5),
      supabase.from('payment_submissions').select('id, amount_bdt, created_at').eq('status', 'Pending').limit(5),
      supabase.from('inquiry_leads').select('id, name, investment_range').eq('status', 'New').limit(5),
      supabase.from('payout_requests').select('id, amount_bdt, promoter_id').in('status', ['Pending', 'Pending Verification']).limit(5),
      supabase.from('business_cohort_applications').select('id, brand_name, requested_funding_bdt').in('status', ['New_Submission', 'Under_Review']).limit(5)
    ]);

    const kycCount = pendingKyc?.length || 0;
    const payCount = pendingPayments?.length || 0;
    const leadCount = unworkedLeads?.length || 0;
    const payoutCount = pendingPayouts?.length || 0;
    const cohortCount = pendingCohorts?.length || 0;

    let alertText = `🔔 <b>GRO10X Action Alerts Queue</b>\n\n`;
    alertText += `📋 <b>Pending KYC Submissions:</b> ${kycCount}\n`;
    alertText += `💳 <b>Pending Payment Deposits:</b> ${payCount}\n`;
    alertText += `🎯 <b>Unworked Inquiries:</b> ${leadCount}\n`;
    alertText += `💸 <b>Pending Commission Payouts:</b> ${payoutCount}\n`;
    alertText += `🏢 <b>New Business Cohort Applications:</b> ${cohortCount}\n\n`;
    alertText += `<i>Tap an action button below to resolve directly:</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: `👥 Leads (${leadCount})`, callback_data: 'cmd_leads' },
          { text: `💳 Payouts (${payoutCount})`, callback_data: 'cmd_payouts' }
        ],
        [
          { text: `🏢 Cohorts (${cohortCount})`, callback_data: 'cmd_applications' },
          { text: `🌐 Web Panel`, url: `${appUrl}/admin` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, alertText, keyboard);
  } catch (err) {
    console.error('Error in handleAlertsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load alerts: ${err.message}`);
  }
}

// 3. /leads Command — Unworked Lead Pipeline
export async function handleLeadsCommand(botToken, chatId, appUrl) {
  try {
    const { data: leads } = await supabase
      .from('inquiry_leads')
      .select('*')
      .eq('status', 'New')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!leads || leads.length === 0) {
      await sendTelegramMessage(botToken, chatId, `🎉 <b>All Clean!</b> No unworked inquiry leads in queue.`);
      return;
    }

    let text = `🎯 <b>Unworked Inquiry Leads Queue (${leads.length})</b>\n\n`;
    
    leads.forEach((lead, idx) => {
      text += `<b>${idx + 1}. ${lead.name}</b>\n`;
      text += `📞 <code>${lead.phone}</code> | Range: ${lead.investment_range || 'N/A'}\n`;
      text += `Channel: ${lead.source_channel || 'Web'}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Full Lead CRM', url: `${appUrl}/admin` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleLeadsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load leads: ${err.message}`);
  }
}

// 4. /payouts Command — Promoter Payout Queue
export async function handlePayoutsCommand(botToken, chatId, appUrl) {
  try {
    const { data: payouts } = await supabase
      .from('payout_requests')
      .select('*, team(full_name, phone), promoters(full_name, phone)')
      .in('status', ['Pending', 'Pending Verification'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (!payouts || payouts.length === 0) {
      await sendTelegramMessage(botToken, chatId, `✅ <b>No Pending Commission Payout Requests!</b>`);
      return;
    }

    for (const p of payouts) {
      const promoterName = p.promoters?.full_name || p.team?.full_name || 'Promoter';
      const amountStr = formatBdt(p.amount_bdt);
      
      const pText = `💸 <b>Commission Payout Request</b>\n\n👤 <b>Promoter:</b> ${promoterName}\n💰 <b>Amount:</b> ${amountStr}\n💳 <b>Channel:</b> ${p.disbursement_channel || 'bKash'} (${p.account_details || 'N/A'})\n📅 <b>Requested:</b> ${new Date(p.created_at).toLocaleDateString('en-GB')}`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Clear Payout', callback_data: `approve_payout:${p.id}` },
            { text: '❌ Reject', callback_data: `reject_payout:${p.id}` }
          ]
        ]
      };

      await sendTelegramMessage(botToken, chatId, pText, keyboard);
    }
  } catch (err) {
    console.error('Error in handlePayoutsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load payouts: ${err.message}`);
  }
}

// 5. /applications Command — Cohort Business Applications
export async function handleApplicationsCommand(botToken, chatId, appUrl) {
  try {
    const { data: apps } = await supabase
      .from('business_cohort_applications')
      .select('*')
      .in('status', ['New_Submission', 'Under_Review'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (!apps || apps.length === 0) {
      await sendTelegramMessage(botToken, chatId, `🏢 <b>No pending business cohort applications!</b>`);
      return;
    }

    let text = `🏢 <b>Pending Business Applications (${apps.length})</b>\n\n`;
    apps.forEach((app, idx) => {
      text += `<b>${idx + 1}. ${app.brand_name}</b> (${app.industry_sector})\n`;
      text += `Founder: ${app.lead_founder_name} (<code>${app.lead_founder_phone}</code>)\n`;
      text += `Capital Ask: <b>৳${Number(app.requested_funding_bdt || 0).toLocaleString()}</b> (${app.preferred_funding_type})\n`;
      text += `Ref: <code>${app.ref_code}</code>\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📑 Review in Business Registry', url: `${appUrl}/admin` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleApplicationsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load applications: ${err.message}`);
  }
}

// 6. /kyc Command — Pending KYC Verifications
export async function handleKycCommand(botToken, chatId, appUrl) {
  try {
    const { data: kycs } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!kycs || kycs.length === 0) {
      await sendTelegramMessage(botToken, chatId, `🛡️ <b>No pending KYC submissions!</b>`);
      return;
    }

    let text = `🛡️ <b>Pending KYC Submissions (${kycs.length})</b>\n\n`;
    kycs.forEach((k, idx) => {
      text += `<b>${idx + 1}. ${k.full_name}</b>\n`;
      text += `NID: <code>${k.nid_number || 'Provided'}</code> | Submitted: ${new Date(k.created_at).toLocaleDateString('en-GB')}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 Verify in Investor Hub', url: `${appUrl}/admin` }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleKycCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load KYC submissions: ${err.message}`);
  }
}

// 7. /broadcast Command — Team Broadcast with Role Guard
export async function handleBroadcastCommand(botToken, chatId, textToBroadcast) {
  if (!textToBroadcast) {
    await sendTelegramMessage(botToken, chatId, `📢 <b>Usage:</b> <code>/broadcast Your message here...</code>`);
    return;
  }

  try {
    // 1. Role Guard: Verify sender is admin or manager in public.team
    const { data: sender } = await supabase
      .from('team')
      .select('team_type, full_name')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    if (!sender || !['admin', 'manager'].includes(sender.team_type)) {
      await sendTelegramMessage(botToken, chatId, `⛔ <b>Access Denied:</b> Only Platform Administrators & Operations Managers can issue executive broadcasts.`);
      return;
    }

    const { data: teamMembers } = await supabase
      .from('team')
      .select('telegram_chat_id, full_name')
      .not('telegram_chat_id', 'is', null);

    if (!teamMembers || teamMembers.length === 0) {
      await sendTelegramMessage(botToken, chatId, `⚠️ No team members have linked Telegram Chat IDs.`);
      return;
    }

    let successCount = 0;
    const msg = `📢 <b>Executive Team Announcement</b>\n\n${textToBroadcast}\n\n<i>— Broadcast by ${sender.full_name} via GRO10X OS</i>`;

    for (const member of teamMembers) {
      if (member.telegram_chat_id) {
        await sendTelegramMessage(botToken, member.telegram_chat_id, msg);
        successCount++;
      }
    }

    await sendTelegramMessage(botToken, chatId, `✅ <b>Broadcast Sent!</b> Delivered to ${successCount} team members.`);
  } catch (err) {
    console.error('Error in handleBroadcastCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Broadcast failed: ${err.message}`);
  }
}
