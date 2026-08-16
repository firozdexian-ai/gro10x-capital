import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      brand_name, company_legal_name, company_type, company_registration_number,
      tin_number, bin_number, year_established, headquarters_address, website_url,
      social_links, industry_sector, outlet_count, expansion_outlet_count, pos_system_name,
      has_existing_franchise_agreement, franchise_brand_name,
      lead_founder_name, lead_founder_title, lead_founder_phone, lead_founder_email,
      lead_founder_linkedin_url, lead_founder_nid_number,
      monthly_gross_revenue_bdt, monthly_net_profit_bdt, existing_debt_bdt, asset_valuation_bdt,
      requested_funding_bdt, preferred_funding_type, use_of_funds_breakdown, pitch_text,
      pitch_deck_url, trade_license_url, financial_audit_url, tin_certificate_url, outlet_photos,
      stakeholders
    } = body;

    if (!brand_name || !lead_founder_name || !lead_founder_phone || !lead_founder_email || !monthly_gross_revenue_bdt || !requested_funding_bdt) {
      return NextResponse.json({ error: 'Missing required application fields.' }, { status: 400 });
    }

    // Generate unique Ref Code (GRO-2026-XXXXX)
    const { count } = await supabase.from('business_cohort_applications').select('*', { count: 'exact', head: true });
    const nextSeq = (count || 0) + 1;
    const year = new Date().getFullYear();
    const ref_code = `GRO-${year}-${String(nextSeq).padStart(5, '0')}`;

    // Insert cohort application
    const applicationPayload = {
      ref_code,
      brand_name,
      company_legal_name,
      company_type: company_type || 'Pvt Ltd',
      company_registration_number,
      tin_number,
      bin_number,
      year_established: year_established ? Number(year_established) : null,
      headquarters_address,
      website_url,
      social_links: social_links || {},
      industry_sector: industry_sector || 'F&B Franchise',
      outlet_count: Number(outlet_count || 1),
      expansion_outlet_count: Number(expansion_outlet_count || 1),
      pos_system_name,
      has_existing_franchise_agreement: Boolean(has_existing_franchise_agreement),
      franchise_brand_name,
      lead_founder_name,
      lead_founder_title: lead_founder_title || 'Founder & CEO',
      lead_founder_phone,
      lead_founder_email,
      lead_founder_linkedin_url,
      lead_founder_nid_number,
      monthly_gross_revenue_bdt: Number(monthly_gross_revenue_bdt),
      monthly_net_profit_bdt: Number(monthly_net_profit_bdt),
      existing_debt_bdt: Number(existing_debt_bdt || 0),
      asset_valuation_bdt: Number(asset_valuation_bdt || 0),
      requested_funding_bdt: Number(requested_funding_bdt),
      preferred_funding_type: preferred_funding_type || 'Franchise',
      use_of_funds_breakdown: use_of_funds_breakdown || {},
      pitch_text,
      pitch_deck_url,
      trade_license_url,
      financial_audit_url,
      tin_certificate_url,
      outlet_photos: outlet_photos || [],
      status: 'New_Submission'
    };

    const { data: newApp, error: appErr } = await supabase
      .from('business_cohort_applications')
      .insert([applicationPayload])
      .select()
      .single();

    if (appErr) throw appErr;

    // Insert stakeholders (Lead founder + additional team members)
    const stakeholderInserts = [
      {
        application_id: newApp.id,
        full_name: lead_founder_name,
        role_title: lead_founder_title || 'Founder & CEO',
        phone: lead_founder_phone,
        email: lead_founder_email,
        equity_ownership_pct: 100, // Default if not specified in stakeholder list
        is_primary_contact: true,
        linkedin_url: lead_founder_linkedin_url
      }
    ];

    if (Array.isArray(stakeholders) && stakeholders.length > 0) {
      // Overwrite/add additional team members
      const additional = stakeholders.map(s => ({
        application_id: newApp.id,
        full_name: s.full_name,
        role_title: s.role_title || 'Co-Founder',
        phone: s.phone,
        email: s.email,
        equity_ownership_pct: Number(s.equity_ownership_pct || 0),
        is_primary_contact: Boolean(s.is_primary_contact),
        linkedin_url: s.linkedin_url
      }));
      stakeholderInserts.push(...additional);
    }

    await supabase.from('business_stakeholders').insert(stakeholderInserts);

    // Direct Telegram Alert Dispatch to Admins
    try {
      const botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      if (botToken) {
        const { data: admins } = await supabase
          .from('team')
          .select('telegram_chat_id')
          .in('team_type', ['admin', 'manager'])
          .not('telegram_chat_id', 'is', null);

        if (admins && admins.length > 0) {
          const alertMsg = `🏢 <b>NEW COHORT BUSINESS APPLICATION</b>\n\n` +
            `🏷️ <b>Ref:</b> <code>${ref_code}</code>\n` +
            `🏢 <b>Brand:</b> ${brand_name} (${industry_sector})\n` +
            `👤 <b>Lead Founder:</b> ${lead_founder_name}\n` +
            `📞 <b>Phone:</b> <code>${lead_founder_phone}</code>\n` +
            `💰 <b>Capital Ask:</b> ৳${Number(requested_funding_bdt).toLocaleString()} (${preferred_funding_type})\n` +
            `📍 <b>Outlets:</b> ${outlet_count} Existing | ${expansion_outlet_count} Planned`;

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
                    inline_keyboard: [[{ text: '📑 Review in Business Registry', url: `${appUrl}/admin` }]]
                  }
                })
              }).catch(e => console.error('Admin cohort push error:', e));
            }
          }
        }

        // Also notify the applicant founder via client bot if phone is registered on Telegram
        const clientBotToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;
        if (clientBotToken && lead_founder_phone) {
          let cleanPhone = lead_founder_phone.replace(/[\s\-\+\(\)]/g, '');
          if (cleanPhone.startsWith('880')) cleanPhone = '0' + cleanPhone.slice(3);
          const last10 = cleanPhone.slice(-10);

          const { data: founderUser } = await supabase
            .from('founders')
            .select('telegram_chat_id')
            .or(`phone.eq.${lead_founder_phone},phone.eq.${cleanPhone},phone.ilike.%${last10}`)
            .not('telegram_chat_id', 'is', null)
            .maybeSingle();

          if (founderUser && founderUser.telegram_chat_id) {
            const founderMsg = `🎉 <b>Application Received!</b>\n\n` +
              `Your GRO10X Capital cohort funding application has been successfully logged.\n\n` +
              `🏷️ <b>Ref Code:</b> <code>${ref_code}</code>\n` +
              `🏢 <b>Brand:</b> ${brand_name}\n` +
              `💰 <b>Capital Ask:</b> ৳${Number(requested_funding_bdt).toLocaleString()} BDT\n\n` +
              `Our Investment Committee will review your financial disclosures and reach out shortly.`;

            await fetch(`https://api.telegram.org/bot${clientBotToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: founderUser.telegram_chat_id,
                text: founderMsg,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [[{ text: '🌐 View Business Portal', url: `${appUrl}/business` }]]
                }
              })
            }).catch(e => console.error('Founder cohort push error:', e));
          }
        }
      }
    } catch (tErr) {
      console.warn('Telegram notification alert skipped:', tErr.message);
    }

    return NextResponse.json({
      success: true,
      ref_code,
      application_id: newApp.id
    });
  } catch (err) {
    console.error('Error processing cohort application:', err);
    return NextResponse.json({ error: err.message || 'Cohort application processing error' }, { status: 500 });
  }
}
