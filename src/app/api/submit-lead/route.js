import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/currency';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      phone, 
      email, 
      investment_range, 
      investmentRange, 
      notes, 
      meetingPref, 
      source_channel, 
      sourcePage, 
      referral_code,
      dealTitle,
      ticketAmount,
      yieldOption,
      projectId
    } = body;

    const leadName = name || 'Anonymous Investor';
    const leadPhone = phone || 'N/A';
    const budget = investment_range || investmentRange || 'N/A';
    const channel = source_channel || sourcePage || 'Website';

    // 1. Insert into inquiry_leads table
    const leadPayload = {
      name: leadName,
      phone: leadPhone,
      email: email || null,
      investment_range: budget,
      source_channel: channel,
      status: 'New',
      notes: notes || `Meeting Pref: ${meetingPref || 'N/A'}${yieldOption ? ` | Option: ${yieldOption}` : ''}`,
      referral_code: referral_code || null
    };

    if (dealTitle) leadPayload.deal_title = dealTitle;
    if (ticketAmount) leadPayload.ticket_amount = Number(ticketAmount);
    if (yieldOption) leadPayload.yield_option = yieldOption;

    const { data: insertedLead, error: insertErr } = await supabase
      .from('inquiry_leads')
      .insert([leadPayload])
      .select();

    if (insertErr) console.error('Error inserting inquiry lead:', insertErr);

    // 2. If lead came from an ROI Calculator booking with ticketAmount & projectId, increment booked_amount_bdt
    if (projectId && ticketAmount && Number(ticketAmount) > 0) {
      try {
        const { data: proj } = await supabase
          .from('funding_projects')
          .select('booked_amount_bdt')
          .eq('id', projectId)
          .single();

        if (proj) {
          const currentBooked = Number(proj.booked_amount_bdt) || 0;
          await supabase
            .from('funding_projects')
            .update({ booked_amount_bdt: currentBooked + Number(ticketAmount) })
            .eq('id', projectId);
        }
      } catch (bookErr) {
        console.error('Error auto-updating booked_amount_bdt:', bookErr);
      }
    }

    // 3. If referral code is provided, bridge lead into promoter_leads table
    if (referral_code) {
      const { data: promoter } = await supabase
        .from('promoters')
        .select('id')
        .eq('referral_code', referral_code)
        .maybeSingle();

      if (promoter) {
        await supabase.from('promoter_leads').insert([{
          promoter_id: promoter.id,
          name: leadName,
          phone: leadPhone,
          email: email || null,
          category: 'Referral Prospect',
          interest: budget,
          status: 'New Lead'
        }]);
      }
    }

    // 4. Dispatch real-time Telegram alert to Admins via @gro10xmanbot
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;

    if (botToken) {
      const { data: admins } = await supabase
        .from('team')
        .select('telegram_chat_id')
        .in('team_type', ['admin', 'manager'])
        .not('telegram_chat_id', 'is', null);

      if (admins && admins.length > 0) {
        let alertMsg = `🎯 <b>New Investor Lead</b>\n\n`;
        
        if (dealTitle) {
          alertMsg += `💼 <b>Deal:</b> ${dealTitle}\n`;
        }
        if (ticketAmount) {
          alertMsg += `💰 <b>Ticket Size:</b> ৳${Number(ticketAmount).toLocaleString('en-IN')}\n`;
        }
        if (yieldOption) {
          alertMsg += `📊 <b>Yield Model:</b> ${yieldOption}\n`;
        }
        
        alertMsg += `👤 <b>Name:</b> ${leadName}\n`;
        alertMsg += `📞 <b>Phone:</b> <code>${leadPhone}</code>\n`;
        alertMsg += `📋 <b>Budget:</b> ${budget}\n`;
        alertMsg += `🤝 <b>Meeting:</b> ${meetingPref || 'Online Call'}\n`;
        alertMsg += `📌 <b>Channel:</b> ${channel}\n`;
        if (referral_code) {
          alertMsg += `🏷️ <b>Ref Code:</b> ${referral_code}\n`;
        }

        const payloadText = `🚨 <b>GRO10X Platform Alert</b>\n\n${alertMsg}`;

        for (const admin of admins) {
          if (admin.telegram_chat_id) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: admin.telegram_chat_id,
                text: payloadText,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [[{ text: '🌐 View Lead CRM', url: `${appUrl}/admin` }]]
                }
              })
            }).catch(e => console.error('Admin push error:', e));
          }
        }
      }
    }

    return NextResponse.json({ success: true, lead: insertedLead?.[0] || null });
  } catch (err) {
    console.error('Submit Lead API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
