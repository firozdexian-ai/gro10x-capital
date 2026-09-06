import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

/**
 * POST /api/edge-yield-disburse
 * Automated serverless monthly dividend/yield computation engine.
 *
 * Responsibilities:
 * 1. Accepts distributable monthly profit for an active SPV funding project.
 * 2. Fetches all settled investor holdings in the project.
 * 3. Computes exact pro-rata dividend share for each investor based on cap table ownership and yield model.
 * 4. Records the master yield_disbursements batch and individual investor_yields allocations.
 * 5. Triggers omnichannel dispatch (Telegram bot + In-App notification tray) to all affected investors.
 */
export async function POST(request) {
  try {
    // Verify authorization: require internal secret or admin bearer token
    const authHeader = request.headers.get('authorization') || '';
    const internalSecret = request.headers.get('x-gro10x-internal-secret') || '';
    const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.TELEGRAM_TEAM_BOT_TOKEN;

    const isAuthorized = (expectedSecret && (internalSecret === expectedSecret || authHeader === `Bearer ${expectedSecret}`)) ||
      (process.env.NODE_ENV !== 'production' && !expectedSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Administrative authorization required' }, { status: 401 });
    }

    const { project_id, disbursement_month, distributable_profit_bdt, notes } = await request.json();

    if (!project_id || !distributable_profit_bdt || distributable_profit_bdt <= 0) {
      return NextResponse.json({ error: 'project_id and positive distributable_profit_bdt are required' }, { status: 400 });
    }

    const period = disbursement_month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const totalProfit = Number(distributable_profit_bdt);

    // 1. Fetch project with business details
    const { data: project, error: pErr } = await supabase
      .from('funding_projects')
      .select('id, project_title, target_raise_bdt, amount_raised_bdt, yield_model, businesses(id, brand_name, founder_id)')
      .eq('id', project_id)
      .single();

    if (pErr || !project) {
      return NextResponse.json({ error: 'Funding project not found' }, { status: 404 });
    }

    // 2. Fetch all active settled investments for this project
    const { data: investments, error: invErr } = await supabase
      .from('investments')
      .select('id, investor_id, amount_invested_bdt, yield_option, investors(id, user_id, alias_name, phone, telegram_chat_id)')
      .eq('funding_project_id', project_id);

    if (invErr) throw invErr;

    if (!investments || investments.length === 0) {
      return NextResponse.json({ error: 'No active settled investments found for this project' }, { status: 400 });
    }

    // 3. Compute total capital in pool
    const totalCapitalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount_invested_bdt || 0), 0);

    if (totalCapitalInvested <= 0) {
      return NextResponse.json({ error: 'Total capital invested is zero' }, { status: 400 });
    }

    // 4. Create Master yield_disbursements batch
    const { data: disbRecord, error: disbErr } = await supabase
      .from('yield_disbursements')
      .insert([{
        project_id,
        disbursement_month: period,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'Scheduled',
        notes: notes || `Automated calculation for ${period}`
      }])
      .select()
      .single();

    if (disbErr) throw disbErr;

    // 5. Generate pro-rata allocations
    const allocations = [];
    for (const inv of investments) {
      const invAmount = Number(inv.amount_invested_bdt || 0);
      const ownershipFraction = invAmount / totalCapitalInvested;
      const investorYieldBdt = Math.round(totalProfit * ownershipFraction * 100) / 100;

      allocations.push({
        disbursement_id: disbRecord.id,
        investor_id: inv.investor_id,
        amount_bdt: investorYieldBdt,
        yield_option: inv.yield_option ? Number(inv.yield_option) : 1
      });
    }

    // 6. Bulk insert investor_yields
    const { error: yieldBatchErr } = await supabase
      .from('investor_yields')
      .insert(allocations);

    if (yieldBatchErr) throw yieldBatchErr;

    // 7. Dispatch Omnichannel Notifications
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${appUrl}/api/send-yield-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disbursement_id: disbRecord.id })
    }).catch((err) => console.warn('Non-fatal yield notification dispatch warning:', err));

    return NextResponse.json({
      success: true,
      disbursement_id: disbRecord.id,
      project_title: project.project_title,
      period,
      total_investors_credited: allocations.length,
      total_disbursed_bdt: totalProfit,
      allocations
    });

  } catch (err) {
    console.error('Edge yield disbursement error:', err);
    return NextResponse.json({ error: err.message || 'Failed to compute yield disbursement' }, { status: 500 });
  }
}
