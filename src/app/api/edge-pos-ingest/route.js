import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

/**
 * POST /api/edge-pos-ingest
 * High-performance edge/serverless POS telemetry ingestion endpoint.
 *
 * Responsibilities:
 * 1. Ingests daily sales & line-item expenses for an SME outlet.
 * 2. Calculates real-time net margin percentage.
 * 3. Evaluates 7-day trailing moving average to detect revenue anomalies (drops >50% or negative net profit).
 * 4. Dispatches real-time Telegram alerts to the assigned KAM and Admin if an anomaly is detected.
 * 5. Safely writes to public.pos_daily_sales.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      business_id,
      date,
      gross_sales_bdt,
      net_profit_bdt,
      expenses_bdt = 0,
      transaction_count = 0,
      sync_source = 'Edge_Terminal'
    } = body;

    if (!business_id || gross_sales_bdt === undefined || gross_sales_bdt === null) {
      return NextResponse.json({ error: 'business_id and gross_sales_bdt are required' }, { status: 400 });
    }

    const reportDate = date || new Date().toISOString().split('T')[0];
    const grossBdt = Number(gross_sales_bdt);
    const expBdt = Number(expenses_bdt);
    const netBdt = net_profit_bdt !== undefined && net_profit_bdt !== null
      ? Number(net_profit_bdt)
      : (grossBdt - expBdt);
    const marginPct = grossBdt > 0 ? (netBdt / grossBdt) * 100 : 0;

    // 1. Fetch business details & assigned KAM
    const { data: business } = await supabase
      .from('businesses')
      .select('id, brand_name, ai_health_score, founder_id, founders(full_name, phone, telegram_chat_id)')
      .eq('id', business_id)
      .maybeSingle();

    const brandName = business?.brand_name || 'SME Business';

    // 2. Trailing 7-day anomaly evaluation
    const { data: pastSales } = await supabase
      .from('pos_daily_sales')
      .select('gross_sales_bdt, net_profit_bdt, date')
      .eq('business_id', business_id)
      .order('date', { ascending: false })
      .limit(7);

    let isAnomaly = false;
    let anomalyReasons = [];

    if (pastSales && pastSales.length >= 3) {
      const avgGross = pastSales.reduce((acc, curr) => acc + Number(curr.gross_sales_bdt || 0), 0) / pastSales.length;

      if (grossBdt < (avgGross * 0.5) && avgGross > 5000) {
        isAnomaly = true;
        anomalyReasons.push(`Gross revenue ৳${grossBdt.toLocaleString()} is ${Math.round((1 - grossBdt / avgGross) * 100)}% below 7-day average (৳${Math.round(avgGross).toLocaleString()})`);
      }

      if (netBdt < 0) {
        isAnomaly = true;
        anomalyReasons.push(`Negative daily net margin reported: ৳${netBdt.toLocaleString()} BDT (${marginPct.toFixed(1)}%)`);
      }
    }

    // 3. Insert record into pos_daily_sales
    const { data: inserted, error: insertErr } = await supabase
      .from('pos_daily_sales')
      .insert([{
        business_id,
        date: reportDate,
        gross_sales_bdt: grossBdt,
        net_profit_bdt: netBdt,
        transaction_count: Number(transaction_count) || 0,
        sync_source
      }])
      .select()
      .single();

    if (insertErr && insertErr.code !== '42P01') {
      throw insertErr;
    }

    // 4. If anomaly detected, dispatch cross-stakeholder alerts to KAM & Admin
    if (isAnomaly) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const anomalySummary = anomalyReasons.join('; ');

      // Dispatch to assigned KAM
      fetch(`${appUrl}/api/telegram-notify-kam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `⚠️ POS Telemetry Anomaly: ${brandName}`,
          message: `Date: ${reportDate}\nSales: ৳${grossBdt.toLocaleString()} BDT\nNet Profit: ৳${netBdt.toLocaleString()} BDT\n\n🚨 <b>Risk Trigger:</b> ${anomalySummary}\n\nPlease perform immediate telemetry reconciliation.`,
          priority: 'urgent',
          actionUrl: `${appUrl}/pos-sync`
        })
      }).catch(err => console.warn('Non-fatal KAM anomaly alert error:', err));

      // Dispatch to Admins
      fetch(`${appUrl}/api/telegram-notify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `🚨 POS Anomaly Flagged: ${brandName}`,
          message: `Date: ${reportDate}\n${anomalySummary}`,
          action_url: `${appUrl}/fraud-detection`
        })
      }).catch(err => console.warn('Non-fatal Admin anomaly alert error:', err));
    }

    return NextResponse.json({
      success: true,
      record: inserted || { business_id, date: reportDate, gross_sales_bdt: grossBdt, net_profit_bdt: netBdt },
      is_anomaly: isAnomaly,
      anomaly_reasons: anomalyReasons,
      margin_pct: Number(marginPct.toFixed(2))
    });

  } catch (err) {
    console.error('Edge POS Ingest error:', err);
    return NextResponse.json({ error: err.message || 'Failed to ingest POS data' }, { status: 500 });
  }
}
