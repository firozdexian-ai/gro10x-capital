import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { disbursement_id } = await request.json();

    if (!disbursement_id) {
      return NextResponse.json({ error: 'disbursement_id is required' }, { status: 400 });
    }

    // Fetch disbursement record with project details
    const { data: disb, error: dErr } = await supabase
      .from('yield_disbursements')
      .select(`
        *,
        funding_projects (
          project_title,
          businesses ( brand_name )
        )
      `)
      .eq('id', disbursement_id)
      .single();

    if (dErr || !disb) {
      return NextResponse.json({ error: 'Yield disbursement record not found.' }, { status: 404 });
    }

    // Fetch investor yields for this disbursement
    const { data: yields, error: yErr } = await supabase
      .from('investor_yields')
      .select(`
        *,
        investors (
          alias_name,
          telegram_chat_id,
          phone,
          requires_anonymity
        )
      `)
      .eq('disbursement_id', disbursement_id);

    if (yErr) {
      return NextResponse.json({ error: yErr.message }, { status: 500 });
    }

    const botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    const projectTitle = disb.funding_projects?.project_title || 'Project CapEx';
    const brandName = disb.funding_projects?.businesses?.brand_name || 'GRO10X SPV';
    const period = disb.disbursement_month || `${disb.month || ''} ${disb.year || ''}`;

    let notifiedCount = 0;
    const logs = [];

    for (const item of yields || []) {
      const chatID = item.investors?.telegram_chat_id;
      const investorName = item.investors?.requires_anonymity ? item.investors?.alias_name : (item.investors?.alias_name || 'Investor');
      const amount = Number(item.amount_bdt || 0).toLocaleString();

      const messageText = `✨ *GRO10X Capital — Monthly Yield Distribution* ✨\n\n` +
        `👤 *Investor:* ${investorName}\n` +
        `🏢 *Project:* ${brandName} — ${projectTitle}\n` +
        `📅 *Operating Period:* ${period}\n` +
        `💰 *Yield Credited:* ৳${amount} BDT\n\n` +
        `Your yield distribution has been calculated and finalised. Funds are credited to your registered account according to your Option ${item.yield_option || 1} agreement.`;

      if (botToken && chatID) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatID,
              text: messageText,
              parse_mode: 'Markdown'
            })
          });
          const tgData = await tgRes.json();
          if (tgData.ok) {
            notifiedCount++;
            logs.push({ investor: investorName, status: 'Sent' });
          } else {
            logs.push({ investor: investorName, status: 'Telegram Error', detail: tgData.description });
          }
        } catch (err) {
          logs.push({ investor: investorName, status: 'Network Failed', detail: err.message });
        }
      } else {
        logs.push({ investor: investorName, status: 'No Telegram Chat ID Registered' });
      }
    }

    // Update disbursement status to Finalised
    await supabase
      .from('yield_disbursements')
      .update({ status: 'Finalised' })
      .eq('id', disbursement_id);

    return NextResponse.json({
      success: true,
      notified_count: notifiedCount,
      total_investors: yields.length,
      logs
    });

  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to dispatch yield notifications' }, { status: 500 });
  }
}
