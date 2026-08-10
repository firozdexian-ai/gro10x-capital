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

    // Optional Telegram Alert Dispatch
    try {
      const { data: setObj } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'owner_telegram_chat_id')
        .single();

      if (setObj && setObj.setting_value) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
          const alertMsg = `🚀 *NEW GRO10X COHORT APPLICATION*\n\n*Ref:* \`${ref_code}\`\n*Brand:* ${brand_name}\n*Sector:* ${industry_sector} (${outlet_count} outlets)\n*Lead Founder:* ${lead_founder_name} (${lead_founder_phone})\n*Capital Ask:* ৳${Number(requested_funding_bdt).toLocaleString()} (${preferred_funding_type})\n\nView details in Admin Panel → Business Registry tab.`;
          
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: setObj.setting_value,
              text: alertMsg,
              parse_mode: 'Markdown'
            })
          });
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
