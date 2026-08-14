'use client';
import React from 'react';
import { 
  TrendingUp, RefreshCw, FileSpreadsheet, Send, Download, 
  Coins, Sparkles, ArrowRight, FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { formatCurrency, CURRENCY_RATES } from '../../../lib/currency';

/** Shorthand Bengali/Crore currency formatter helper */
function formatShorthand(val, curr = 'BDT') {
  const num = Number(val) || 0;
  const rate = CURRENCY_RATES[curr]?.rate || 1;
  const symbol = CURRENCY_RATES[curr]?.symbol || '৳';
  const converted = num * rate;

  if (curr === 'BDT') {
    if (converted >= 10000000) {
      return `${symbol}${(converted / 10000000).toFixed(2)} Crore`;
    }
    if (converted >= 100000) {
      return `${symbol}${(converted / 100000).toFixed(1)} Lakhs`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  }

  if (converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(2)}M`;
  }
  if (converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * YieldEngineTab — Production Tab 5 Yield Engine & Disbursement Management for GRO10X Admin.
 *
 * Sub-tabs:
 *   1. 'declare'     — Form to declare monthly yield batch & projected investor allocation preview
 *   2. 'ledger'      — Disbursement ledger table with expandable per-investor breakdown drilldown
 *   3. 'pos-reports' — POS sales report manual ingestion or batch CSV upload
 */
export default function YieldEngineTab({
  // KPI data
  yieldDisbursements = [],
  allInvestorYields = [],
  allPosReports = [],
  // Sub-tab control
  yieldSubTab = 'declare',
  setYieldSubTab,
  // Sub-tab 1: Declare Yield
  projects = [],
  dividendProjectId = '',
  setDividendProjectId,
  dividendMonth = 'Aug',
  setDividendMonth,
  dividendYear = 2026,
  setDividendYear,
  grossSales = '',
  setGrossSales,
  netProfit = '',
  setNetProfit,
  handleDistributeYield,
  handlePullPosData,
  posSyncStatus = '',
  isDistributing = false,
  activeInvestments = [],
  // Sub-tab 2: Disbursement Ledger
  selectedDisbursement = null,
  setSelectedDisbursement,
  disbPaymentForm = { payment_txn_ref: '', payment_date: '', notes: '' },
  setDisbPaymentForm,
  setDisbPaymentFile,
  uploadingDisbProof = false,
  handleSaveDisbursementProof,
  handleFinaliseDisbursement,
  handlePushYieldToTelegram,
  pushingToTelegram = false,
  handleDownloadYieldCSV,
  // Sub-tab 3: POS Reports
  posReportSubTab = 'manual',
  setPosReportSubTab,
  posEntryForm = { project_id: '', report_month: '', gross_sales_bdt: '', net_profit_bdt: '', transaction_count: '' },
  setPosEntryForm,
  savingPosReport = false,
  handleSubmitPosManual,
  setPosCSVFile,
  uploadingCSV = false,
  handleUploadPosCSV,
  // Shared
  currency = 'BDT',
}) {

  const totalDistributed = yieldDisbursements.reduce((acc, d) => acc + Number(d.total_disbursed_bdt || 0), 0);
  const unacknowledgedCount = allInvestorYields.filter(y => !y.acknowledged).length;

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── KPI METRIC STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Batches Declared */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Batches Declared
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {yieldDisbursements.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Completed Cycles</span>
        </div>

        {/* Card 2: All-Time Distributed */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(16,185,129,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            All-Time Distributed
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {formatShorthand(totalDistributed, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
            Exact: {formatCurrency(totalDistributed, currency)}
          </span>
        </div>

        {/* Card 3: Total Payee Rows */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Payee Rows
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {allInvestorYields.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Investor Credits</span>
        </div>

        {/* Card 4: Unacknowledged */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: unacknowledgedCount > 0 ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Unacknowledged
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: unacknowledgedCount > 0 ? '#f59e0b' : '#10b981', margin: 0 }}>
            {unacknowledgedCount}
          </h3>
          <span style={{ fontSize: '0.72rem', color: unacknowledgedCount > 0 ? '#f59e0b' : '#64748b' }}>
            {unacknowledgedCount > 0 ? 'Pending Telegram Receipt' : 'Awaiting Telegram Confirmation'}
          </span>
        </div>

        {/* Card 5: POS Reports on File */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(139,92,246,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            POS Reports on File
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', margin: 0 }}>
            {allPosReports.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Ingested Sales Files</span>
        </div>
      </div>

      {/* ── 3 SUB-TABS SELECTOR STRIP ── */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        <button
          onClick={() => setYieldSubTab('declare')}
          className={`tab-toggle-btn ${yieldSubTab === 'declare' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <TrendingUp size={15} /> Declare Monthly Yield
        </button>

        <button
          onClick={() => setYieldSubTab('ledger')}
          className={`tab-toggle-btn ${yieldSubTab === 'ledger' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <FileSpreadsheet size={15} /> Disbursement Ledger ({yieldDisbursements.length})
        </button>

        <button
          onClick={() => setYieldSubTab('pos-reports')}
          className={`tab-toggle-btn ${yieldSubTab === 'pos-reports' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <RefreshCw size={15} /> POS Sales Reports ({allPosReports.length})
        </button>
      </div>

      {/* ── SUB-TAB 1: DECLARE YIELD ── */}
      {yieldSubTab === 'declare' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '1.5rem' }}>
          
          {/* Form Panel */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37' }}>
              <TrendingUp size={22} /> Declare Yield Batch
            </h3>

            <form onSubmit={handleDistributeYield} style={{ display: 'grid', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Project Campaign</label>
                <select
                  value={dividendProjectId}
                  onChange={(e) => setDividendProjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                >
                  <option value="">-- Choose Active Campaign --</option>
                  {projects.filter(p => ['Trading', 'Active', 'Origination', 'Funding'].includes(p.status)).map(p => (
                    <option key={p.id} value={p.id}>{p.businesses?.brand_name ? `${p.businesses.brand_name} - ` : ''}{p.project_title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Operating Month</label>
                  <select
                    value={dividendMonth}
                    onChange={(e) => setDividendMonth(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                    required
                  >
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Year</label>
                  <input
                    type="number"
                    value={dividendYear}
                    onChange={(e) => setDividendYear(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePullPosData}
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.65rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={16} /> Pull Sales Data from POS Record
              </button>

              {posSyncStatus && (
                <div style={{ padding: '0.65rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                  {posSyncStatus}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Gross Sales (BDT)</label>
                <input
                  type="number"
                  value={grossSales}
                  onChange={(e) => setGrossSales(e.target.value)}
                  placeholder="e.g. 1800000 (= ৳18.0 Lakhs)"
                  style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Net Profit (BDT)</label>
                <input
                  type="number"
                  value={netProfit}
                  onChange={(e) => setNetProfit(e.target.value)}
                  placeholder="e.g. 420000 (= ৳4.20 Lakhs)"
                  style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isDistributing}
                className="btn-gold"
                style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.95rem', cursor: isDistributing ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontWeight: '700' }}
              >
                {isDistributing ? 'Distributing...' : 'Declare & Allocate Yield Batch'}
              </button>
            </form>
          </div>

          {/* Preview & Pre-Distribution Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Pool Preview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 1 (10% Gross)</span>
                <h4 style={{ margin: '0.2rem 0 0 0', color: '#fff', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  {formatShorthand(grossSales ? Number(grossSales) * 0.10 : 0, currency)}
                </h4>
              </div>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 2 (12% Gross)</span>
                <h4 style={{ margin: '0.2rem 0 0 0', color: '#fff', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  {formatShorthand(grossSales ? Number(grossSales) * 0.12 : 0, currency)}
                </h4>
              </div>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 3 (35% Net)</span>
                <h4 style={{ margin: '0.2rem 0 0 0', color: '#10b981', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  {formatShorthand(netProfit ? Number(netProfit) * 0.35 : 0, currency)}
                </h4>
              </div>
            </div>

            {/* Investor Table Preview */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={16} /> Projected Investor Allocation Preview
              </h4>
              
              {!dividendProjectId ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Select an active campaign from the form to preview individual investor yield shares.</p>
                </div>
              ) : (() => {
                const proj = projects.find(p => p.id === dividendProjectId);
                const projInvs = activeInvestments.filter(i => i.project_id === dividendProjectId);

                if (projInvs.length === 0) {
                  return (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No active settled investors found for this campaign yet.</p>
                    </div>
                  );
                }

                const r1 = Number(proj?.yield_option_1_rate || 10) / 100;
                const r2 = Number(proj?.yield_option_2_rate || 12) / 100;
                const r3 = Number(proj?.yield_option_3_rate || 35) / 100;

                const p1 = Number(grossSales || 0) * r1;
                const p2 = Number(grossSales || 0) * r2;
                const p3 = Number(netProfit || 0) * r3;

                const opt1Invs = projInvs.filter(i => Number(i.yield_option) === 1);
                const opt2Invs = projInvs.filter(i => Number(i.yield_option) === 2);
                const opt3Invs = projInvs.filter(i => Number(i.yield_option) === 3);

                const sum1 = opt1Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
                const sum2 = opt2Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
                const sum3 = opt3Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);

                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Investor</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Option</th>
                        <th style={{ padding: '0.6rem 0.5rem' }}>Invested Capital</th>
                        <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Projected Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projInvs.map(inv => {
                        const opt = Number(inv.yield_option || 1);
                        let share = 0;
                        if (opt === 1 && sum1 > 0) share = (Number(inv.amount_invested_bdt) / sum1) * p1;
                        if (opt === 2 && sum2 > 0) share = (Number(inv.amount_invested_bdt) / sum2) * p2;
                        if (opt === 3 && sum3 > 0) share = (Number(inv.amount_invested_bdt) / sum3) * p3;

                        return (
                          <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.6rem 0.5rem', fontWeight: 'bold', color: '#D4AF37' }}>{inv.investors?.alias_name || 'Investor'}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>Option {opt}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>{formatCurrency(inv.amount_invested_bdt, currency)}</td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(Math.round(share), currency)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* ── SUB-TAB 2: DISBURSEMENT LEDGER & DRILLDOWN ── */}
      {yieldSubTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {yieldDisbursements.length === 0 ? (
              /* Polished Empty State */
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                  <FileSpreadsheet size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                    No Yield Disbursements Declared Yet
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                    Monthly yield batches declared from operational POS sales and profits will be logged here with complete per-investor audit drilldowns and Telegram notifications.
                  </p>
                </div>
                <button
                  onClick={() => setYieldSubTab('declare')}
                  className="btn-gold"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginTop: '0.5rem' }}
                >
                  <TrendingUp size={16} /> Declare First Yield Batch
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Operating Period</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Target Campaign</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Gross Sales</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Net Profit</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Total Distributed</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {yieldDisbursements.map(disb => {
                    const status = disb.status || 'Draft';
                    const isSelected = selectedDisbursement?.id === disb.id;

                    return (
                      <React.Fragment key={disb.id}>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isSelected ? 'rgba(212,175,55,0.05)' : 'transparent' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                            {disb.disbursement_month || `${disb.month} ${disb.year}`}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ color: '#fff', fontWeight: '600' }}>{disb.funding_projects?.businesses?.brand_name}</span> - {disb.funding_projects?.project_title}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>{formatCurrency(disb.gross_sales_bdt, currency)}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>{formatCurrency(disb.net_profit_bdt, currency)}</td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(disb.total_disbursed_bdt, currency)}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className={`status-badge ${status === 'Paid_Out' ? 'status-badge--success' : status === 'Finalised' ? 'status-badge--info' : 'status-badge--gold'}`}>
                              {status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedDisbursement(null);
                                  } else {
                                    setSelectedDisbursement(disb);
                                    setDisbPaymentForm({
                                      payment_txn_ref: disb.payment_txn_ref || '',
                                      payment_date: disb.payment_date || new Date().toISOString().split('T')[0],
                                      notes: disb.notes || ''
                                    });
                                  }
                                }}
                                className="btn-sm"
                                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                              >
                                {isSelected ? 'Hide Breakdown ▲' : 'Inspect Breakdown ▼'}
                              </button>
                              <button
                                onClick={() => handleDownloadYieldCSV(disb)}
                                className="btn-sm"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}
                                title="Download Payout CSV Statement"
                              >
                                <Download size={13} style={{ display: 'inline', marginRight: '0.2rem' }} /> CSV
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* DRILLDOWN EXPANDED PANEL */}
                        {isSelected && (
                          <tr>
                            <td colSpan={7} style={{ background: '#070a14', padding: '1.5rem', borderBottom: '2px solid rgba(212,175,55,0.3)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>
                                    Per-Investor Allocation Ledger — {disb.disbursement_month || disb.month}
                                  </h4>
                                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {status === 'Draft' && (
                                      <button
                                        onClick={() => handleFinaliseDisbursement(disb.id)}
                                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                                      >
                                        Mark as Finalised
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handlePushYieldToTelegram(disb.id)}
                                      disabled={pushingToTelegram}
                                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                      <Send size={14} /> {pushingToTelegram ? 'Pushing...' : 'Push Notifications to Investors via Telegram'}
                                    </button>
                                  </div>
                                </div>

                                {/* Per-Investor Table */}
                                <div style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                                        <th style={{ padding: '0.65rem 1rem' }}>Investor Alias</th>
                                        <th style={{ padding: '0.65rem 1rem' }}>Yield Option</th>
                                        <th style={{ padding: '0.65rem 1rem' }}>Yield Credited</th>
                                        <th style={{ padding: '0.65rem 1rem' }}>Telegram Chat ID</th>
                                        <th style={{ padding: '0.65rem 1rem' }}>Receipt Acknowledged</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {allInvestorYields.filter(y => y.disbursement_id === disb.id).map(y => (
                                        <tr key={y.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                          <td style={{ padding: '0.65rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                            {y.investors?.alias_name || 'Investor'}
                                          </td>
                                          <td style={{ padding: '0.65rem 1rem' }}>Option {y.yield_option || 1}</td>
                                          <td style={{ padding: '0.65rem 1rem', fontWeight: 'bold', color: '#10b981' }}>
                                            {formatCurrency(y.amount_bdt, currency)}
                                          </td>
                                          <td style={{ padding: '0.65rem 1rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            {y.investors?.telegram_chat_id || 'Not Registered'}
                                          </td>
                                          <td style={{ padding: '0.65rem 1rem' }}>
                                            <span style={{ color: y.acknowledged ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                              {y.acknowledged ? 'Yes ✅' : 'Pending'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Proof Submission Form */}
                                <form onSubmit={(e) => handleSaveDisbursementProof(e, disb.id)} style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr auto', gap: '1rem', alignItems: 'end' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Bank / bKash TXN Ref</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. TXN-998811"
                                      value={disbPaymentForm.payment_txn_ref}
                                      onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, payment_txn_ref: e.target.value })}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Disbursement Date</label>
                                    <input
                                      type="date"
                                      value={disbPaymentForm.payment_date}
                                      onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, payment_date: e.target.value })}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Bank Receipt Attachment</label>
                                    <input
                                      type="file"
                                      onChange={(e) => setDisbPaymentFile(e.target.files[0])}
                                      style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8' }}
                                    />
                                    {disb.payment_attachment_url && (
                                      <a href={disb.payment_attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.1rem', display: 'block' }}>View Uploaded Proof</a>
                                    )}
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Notes</label>
                                    <input
                                      type="text"
                                      placeholder="Batch transfer notes..."
                                      value={disbPaymentForm.notes}
                                      onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, notes: e.target.value })}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                  <button type="submit" disabled={uploadingDisbProof} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                    {uploadingDisbProof ? 'Saving...' : 'Save Proof'}
                                  </button>
                                </form>

                              </div>
                            </td>
                          </tr>
                        )}

                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ── SUB-TAB 3: POS SALES REPORTS & INGESTION ── */}
      {yieldSubTab === 'pos-reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
          
          {/* Ingestion Form Panel */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div className="tab-toggle-group" style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => setPosReportSubTab('manual')}
                className={`tab-toggle-btn ${posReportSubTab === 'manual' ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                Manual Report Entry
              </button>
              <button
                onClick={() => setPosReportSubTab('csv')}
                className={`tab-toggle-btn ${posReportSubTab === 'csv' ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                CSV File Upload
              </button>
            </div>

            {posReportSubTab === 'manual' ? (
              <form onSubmit={handleSubmitPosManual} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <h4 style={{ margin: 0, color: '#D4AF37' }}>+ Ingest Monthly POS Report</h4>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Campaign / Brand</label>
                  <select
                    value={posEntryForm.project_id}
                    onChange={(e) => setPosEntryForm({ ...posEntryForm, project_id: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  >
                    <option value="">-- Choose Campaign --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Report Operating Month</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 2026"
                    value={posEntryForm.report_month}
                    onChange={(e) => setPosEntryForm({ ...posEntryForm, report_month: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Gross Sales (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1800000 (= ৳18.0 Lakhs)"
                      value={posEntryForm.gross_sales_bdt}
                      onChange={(e) => setPosEntryForm({ ...posEntryForm, gross_sales_bdt: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Net Profit (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 420000 (= ৳4.20 Lakhs)"
                      value={posEntryForm.net_profit_bdt}
                      onChange={(e) => setPosEntryForm({ ...posEntryForm, net_profit_bdt: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Transaction Count (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1420"
                    value={posEntryForm.transaction_count}
                    onChange={(e) => setPosEntryForm({ ...posEntryForm, transaction_count: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>

                <button type="submit" disabled={savingPosReport} className="btn-gold" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem', fontWeight: '700' }}>
                  {savingPosReport ? 'Submitting Report...' : 'Submit POS Report'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUploadPosCSV} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <h4 style={{ margin: 0, color: '#D4AF37' }}>📄 Batch Upload POS CSV File</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                  Expected CSV Columns: <code style={{ color: '#D4AF37' }}>Date, GrossSales, NetProfit, TxnCount</code>
                </p>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Campaign / Brand</label>
                  <select
                    value={posEntryForm.project_id}
                    onChange={(e) => setPosEntryForm({ ...posEntryForm, project_id: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  >
                    <option value="">-- Choose Campaign --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Report Month Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 2026"
                    value={posEntryForm.report_month}
                    onChange={(e) => setPosEntryForm({ ...posEntryForm, report_month: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setPosCSVFile(e.target.files[0])}
                    style={{ color: '#fff', fontSize: '0.8rem' }}
                    required
                  />
                </div>

                <button type="submit" disabled={uploadingCSV} className="btn-gold" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem', fontWeight: '700' }}>
                  {uploadingCSV ? 'Parsing & Uploading...' : 'Upload & Ingest CSV'}
                </button>
              </form>
            )}
          </div>

          {/* Ingested Reports Register Table */}
          <div className="glass-card" style={{ padding: '1.75rem', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={18} /> POS Ingested Sales Register
            </h3>
            
            {allPosReports.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', display: 'grid', placeItems: 'center', color: '#8b5cf6' }}>
                  <FileText size={24} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  No POS Sales Reports Ingested
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', maxWidth: '380px', margin: 0 }}>
                  Sales and gross profit statements submitted manually or uploaded via CSV batch files will appear in this audit register.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Month / Date</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Brand</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Gross Sales</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Net Profit</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {allPosReports.map(pos => (
                    <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.65rem 0.8rem', fontWeight: 'bold', color: '#D4AF37' }}>
                        {pos.report_month || pos.date}
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>{pos.businesses?.brand_name || 'SPV Brand'}</td>
                      <td style={{ padding: '0.65rem 0.8rem', fontWeight: 'bold', color: '#fff' }}>{formatCurrency(pos.gross_sales_bdt, currency)}</td>
                      <td style={{ padding: '0.65rem 0.8rem', color: '#10b981' }}>{formatCurrency(pos.net_profit_bdt, currency)}</td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <span className={`status-badge ${pos.sync_source === 'CSV_Upload' ? 'status-badge--info' : 'status-badge--muted'}`}>
                          {pos.sync_source || 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
