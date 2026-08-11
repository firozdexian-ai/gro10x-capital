'use client';

import React, { useState } from 'react';

/**
 * AnalyticsTab Component (Tab 9)
 * Handles Platform Overview, Investor Analytics, Deal Pipeline Analytics,
 * and Growth & Promoters Leaderboard.
 */
export default function AnalyticsTab({
  currency = 'BDT',
  activeInvestments = [],
  allInvestors = [],
  allPromoters = [],
  promoterCommissions = [],
  inquiryLeads = [],
  projects = [],
  businesses = [],
  yieldDisbursements = [],
  allPosReports = [],
  payoutRequests = [],
  allBookings = []
}) {
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview');

  // ---- DERIVED METRICS ----
  const totalAum = (activeInvestments || []).reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
  const totalYieldDisbursed = (yieldDisbursements || []).reduce((acc, d) => acc + Number(d.total_disbursed_bdt || 0), 0);
  const totalCommissionsEarned = (promoterCommissions || []).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0);
  const totalLeads = (inquiryLeads || []).length;
  const activeInvestorCount = (allInvestors || []).filter(i => i.onboarding_status === 'Active').length;
  const avgInvestmentSize = (activeInvestments || []).length > 0 ? totalAum / activeInvestments.length : 0;

  // ---- MONTHLY INVESTMENT VOLUME (last 6 months) ----
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
    return months;
  };
  const months6 = getLast6Months();
  const monthlyVolume = months6.map(m => ({
    ...m,
    amount: (activeInvestments || [])
      .filter(i => i.created_at && i.created_at.startsWith(m.key))
      .reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0)
  }));
  const maxMonthlyVol = Math.max(...monthlyVolume.map(m => m.amount), 1);

  // ---- INVESTOR FUNNEL ----
  const investorStatusList = ['Lead', 'Invited', 'KYC_Pending', 'Active', 'Paused'];
  const funnelColors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#94a3b8'];
  const investorFunnel = investorStatusList.map((s, i) => ({
    label: s.replace(/_/g, ' '),
    count: (allInvestors || []).filter(inv => inv.onboarding_status === s).length,
    color: funnelColors[i]
  }));
  const maxFunnelCount = Math.max(...investorFunnel.map(f => f.count), 1);

  // ---- CATEGORY DONUT ----
  const catColorMap = { HNI: '#D4AF37', Angel: '#3b82f6', Corporate: '#10b981', Retail: '#8b5cf6' };
  const categoryBreakdown = ['HNI', 'Angel', 'Corporate', 'Retail'].map(cat => ({
    label: cat, color: catColorMap[cat],
    count: (allInvestors || []).filter(i => i.investor_category === cat).length
  })).filter(c => c.count > 0);
  const totalCatCount = categoryBreakdown.reduce((a, c) => a + c.count, 0) || 1;
  const buildDonutPaths = (data, total, cx, cy, r) => {
    let cum = 0;
    return data.map(seg => {
      const frac = seg.count / total;
      const startA = (cum / total) * 2 * Math.PI - Math.PI / 2;
      cum += seg.count;
      const endA = (cum / total) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
      const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
      return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`, color: seg.color, label: seg.label, count: seg.count };
    });
  };
  const donutPaths = buildDonutPaths(categoryBreakdown, totalCatCount, 80, 80, 65);

  // ---- DEAL PIPELINE ----
  const dealStages = ['Origination', 'Diligence', 'SPV_Structuring', 'Fundraising', 'Buildout', 'Live', 'Closed'];
  const stageColors = { Origination: '#94a3b8', Diligence: '#f59e0b', SPV_Structuring: '#3b82f6', Fundraising: '#D4AF37', Buildout: '#8b5cf6', Live: '#10b981', Closed: '#475569' };
  const dealPipeline = dealStages
    .map(s => ({ label: s.replace(/_/g, ' '), key: s, count: (projects || []).filter(p => p.status === s).length }))
    .filter(d => d.count > 0);
  const maxDealCount = Math.max(...dealPipeline.map(d => d.count), 1);

  // ---- PROMOTER LEADERBOARD ----
  const promoterLeaderboard = (allPromoters || [])
    .map(p => ({
      name: p.alias_name || p.full_name,
      id: p.id,
      tier: p.tier,
      earned: (promoterCommissions || []).filter(c => c.promoter_id === p.id).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0),
      leadCount: (inquiryLeads || []).filter(l => l.assigned_promoter_id === p.id).length
    }))
    .sort((a, b) => b.earned - a.earned)
    .slice(0, 5);
  const maxPromoterEarned = Math.max(...promoterLeaderboard.map(p => p.earned), 1);

  // ---- POS REVENUE ----
  const posRevenueByBiz = (businesses || [])
    .map(biz => ({
      name: biz.brand_name,
      revenue: (allPosReports || []).filter(r => r.business_id === biz.id).reduce((acc, r) => acc + Number(r.gross_sales_bdt || 0), 0)
    }))
    .filter(b => b.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
  const maxPosRevenue = Math.max(...posRevenueByBiz.map(b => b.revenue), 1);

  // ---- YIELD BY PROJECT ----
  const yieldByProj = {};
  (yieldDisbursements || []).forEach(d => {
    const k = d.funding_projects?.project_title || 'Unknown';
    yieldByProj[k] = (yieldByProj[k] || 0) + Number(d.total_disbursed_bdt || 0);
  });
  const yieldProjEntries = Object.entries(yieldByProj).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxYieldProj = Math.max(...yieldProjEntries.map(e => e[1]), 1);

  // ---- LEAD SOURCE ----
  const srcColorList = ['#3b82f6', '#D4AF37', '#8b5cf6', '#10b981', '#ec4899'];
  const leadSrcData = ['Organic', 'Referral', 'Promoter', 'Admin', 'Bot'].map((s, i) => ({
    label: s, color: srcColorList[i],
    count: (inquiryLeads || []).filter(l => (l.source || 'Organic') === s).length
  })).filter(l => l.count > 0);
  const maxSrcCount = Math.max(...leadSrcData.map(l => l.count), 1);

  // ---- HELPERS ----
  const fmtCompact = (n) => {
    n = Number(n || 0);
    if (n >= 10000000) return `৳${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
    return `৳${n}`;
  };

  const card = { background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.4rem' };
  const secTitle = (t, sub) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{t}</h3>
      {sub && <p style={{ color: '#475569', fontSize: '0.72rem', margin: '0.15rem 0 0 0' }}>{sub}</p>}
    </div>
  );
  const progressRow = (label, value, max, color, sub) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.28rem', fontSize: '0.8rem' }}>
        <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{label}</span>
        <span style={{ color, fontWeight: '900' }}>{sub || value}</span>
      </div>
      <div className="progress-bar-track" style={{ height: '7px' }}>
        <div className="progress-bar-fill" style={{ width: `${Math.max(value > 0 ? (value / max) * 100 : 0, value > 0 ? 3 : 0)}%`, background: color }} />
      </div>
    </div>
  );

  const subTabs = [
    { key: 'overview', label: 'Platform Overview' },
    { key: 'investors', label: 'Investor Analytics' },
    { key: 'deals', label: 'Deal Pipeline' },
    { key: 'growth', label: 'Growth & Promoters' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>Platform Analytics</h2>
          <p style={{ color: '#475569', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>Real-time intelligence across AUM, investors, deal pipeline, and promoter growth channels.</p>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
          Live · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* 6-TILE HERO KPI STRIP */}
      <div className="kpi-grid-6">
        {[
          { label: 'Total AUM', value: fmtCompact(totalAum), sub: `${(activeInvestments||[]).length} investments`, color: '#D4AF37' },
          { label: 'Active Investors', value: activeInvestorCount, sub: `of ${(allInvestors||[]).length} total`, color: '#10b981' },
          { label: 'Avg Ticket Size', value: fmtCompact(avgInvestmentSize), sub: 'per booking', color: '#3b82f6' },
          { label: 'Yield Disbursed', value: fmtCompact(totalYieldDisbursed), sub: `${(yieldDisbursements||[]).length} batches`, color: '#8b5cf6' },
          { label: 'Leads Captured', value: totalLeads, sub: 'all channels', color: '#ec4899' },
          { label: 'Commissions Out', value: fmtCompact(totalCommissionsEarned), sub: `${(allPromoters||[]).length} promoters`, color: '#f59e0b' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card" style={{ borderTop: `3px solid ${kpi.color}`, padding: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.65rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</h3>
            <span style={{ fontSize: '0.62rem', color: '#334155', display: 'block', marginTop: '0.2rem' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* SUB-TAB SELECTOR */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setAnalyticsSubTab(t.key)} className={`tab-toggle-btn ${analyticsSubTab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ============================================================
          SUB-TAB 1: PLATFORM OVERVIEW
      ============================================================ */}
      {analyticsSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Monthly Investment Volume Bar Chart */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Monthly Investment Volume', 'Capital committed by investors — last 6 months')}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '150px' }}>
                {monthlyVolume.map((m, i) => {
                  const h = maxMonthlyVol > 0 ? (m.amount / maxMonthlyVol) * 100 : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '700', textAlign: 'center' }}>
                        {m.amount > 0 ? fmtCompact(m.amount) : ''}
                      </span>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: `${Math.max(h, m.amount > 0 ? 5 : 2)}%`,
                        background: m.amount > 0 ? 'linear-gradient(to top, #b8962e, #D4AF37)' : 'rgba(255,255,255,0.04)',
                        boxShadow: m.amount > 0 ? '0 0 8px rgba(212,175,55,0.3)' : 'none',
                        transition: 'height 0.5s ease'
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#475569' }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yield Disbursements by Project */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Yield Paid Out — by Project', 'Total investor yield distributed per deal')}
              {yieldProjEntries.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem', paddingTop: '0.5rem' }}>No yield disbursements recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {yieldProjEntries.map(([proj, amount], i) => progressRow(proj, amount, maxYieldProj, '#8b5cf6', fmtCompact(amount)))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* POS Revenue by Business */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('POS Gross Revenue — by Business', 'Gross sales from POS daily reports')}
              {posRevenueByBiz.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem', paddingTop: '0.5rem' }}>No POS data recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posRevenueByBiz.map((b, i) => progressRow(b.name, b.revenue, maxPosRevenue, '#10b981', fmtCompact(b.revenue)))}
                </div>
              )}
            </div>

            {/* Platform Vitals Grid */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Platform Vitals', 'Snapshot across all operational areas')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                {[
                  { label: 'Total Projects', value: (projects||[]).length, color: '#D4AF37' },
                  { label: 'Businesses', value: (businesses||[]).length, color: '#3b82f6' },
                  { label: 'Pending Bookings', value: (allBookings||[]).filter(b => b.status === 'Pending').length, color: '#f59e0b' },
                  { label: 'KYC Pending', value: (allInvestors||[]).filter(i => i.onboarding_status === 'KYC_Pending').length, color: '#ec4899' },
                  { label: 'Total Promoters', value: (allPromoters||[]).length, color: '#8b5cf6' },
                  { label: 'Payout Requests', value: (payoutRequests||[]).filter(r => r.status === 'Pending').length, color: '#ef4444' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.8rem', borderLeft: `3px solid ${stat.color}` }}>
                    <p style={{ color: '#475569', fontSize: '0.62rem', margin: '0 0 0.2rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 2: INVESTOR ANALYTICS
      ============================================================ */}
      {analyticsSubTab === 'investors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Onboarding Funnel */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Investor Onboarding Funnel', 'Conversion from Lead → Active investor')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {investorFunnel.map((stage, i) => progressRow(stage.label, stage.count, maxFunnelCount, stage.color, stage.count))}
              </div>
            </div>

            {/* Investor Category Donut */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Investor Category Mix', 'HNI · Angel · Corporate · Retail breakdown')}
              {categoryBreakdown.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No investor data.</p>
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                    {donutPaths.map((path, i) => <path key={i} d={path.d} fill={path.color} opacity={0.9} />)}
                    <circle cx="80" cy="80" r="40" fill="#0f172a" />
                    <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">{allInvestors.length}</text>
                    <text x="80" y="92" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="600">INVESTORS</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {categoryBreakdown.map((cat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: cat.color, marginLeft: 'auto' }}>
                          {cat.count} <span style={{ fontSize: '0.65rem', color: '#475569' }}>({Math.round((cat.count / totalCatCount) * 100)}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investor Table Snapshot */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            {secTitle('Recent Investors — Activity Snapshot', 'Latest 10 investors with investment status')}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Investor', 'Category', 'Joined', 'Status', '# Investments', 'Total Committed'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(allInvestors || []).slice(0, 10).map(inv => {
                    const invInvs = (activeInvestments || []).filter(i => i.investor_id === inv.id);
                    const committed = invInvs.reduce((a, i) => a + Number(i.amount_invested_bdt || 0), 0);
                    const statusBadgeMap = {
                      Active: 'status-badge status-badge--success',
                      KYC_Pending: 'status-badge status-badge--warning',
                      Invited: 'status-badge status-badge--info',
                      Lead: 'status-badge status-badge--muted',
                      Paused: 'status-badge status-badge--danger'
                    };
                    return (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>
                          {inv.requires_anonymity ? '•••••••' : (inv.alias_name || inv.full_name)}
                        </td>
                        <td style={{ color: catColorMap[inv.investor_category] || '#94a3b8', fontWeight: '700', fontSize: '0.75rem' }}>{inv.investor_category}</td>
                        <td style={{ color: '#475569' }}>
                          {new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td>
                          <span className={statusBadgeMap[inv.onboarding_status] || 'status-badge'}>
                            {(inv.onboarding_status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ color: '#cbd5e1', textAlign: 'center' }}>{invInvs.length}</td>
                        <td style={{ color: '#D4AF37', fontWeight: '800' }}>{committed > 0 ? fmtCompact(committed) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 3: DEAL PIPELINE
      ============================================================ */}
      {analyticsSubTab === 'deals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Deal Pipeline Stage Breakdown */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Deal Pipeline by Stage', 'Active projects per pipeline stage')}
              {dealPipeline.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No project data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {dealPipeline.map((d, i) => {
                    const c = stageColors[d.key] || '#94a3b8';
                    return progressRow(d.label, d.count, maxDealCount, c, d.count);
                  })}
                </div>
              )}
            </div>

            {/* Fundraising Progress */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Fundraising Progress per Active Deal', 'Capital raised vs. target')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(projects || []).filter(p => ['Fundraising', 'Buildout', 'Live'].includes(p.status)).slice(0, 5).map(proj => {
                  const raised = (activeInvestments || [])
                    .filter(i => i.project_id === proj.id)
                    .reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                  const target = Number(proj.target_raise_bdt || 1);
                  const pct = Math.min(Math.round((raised / target) * 100), 100);
                  return (
                    <div key={proj.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: '700' }}>{proj.businesses?.brand_name} — {proj.project_title}</span>
                        <span style={{ color: pct >= 100 ? '#10b981' : '#D4AF37', fontWeight: '900' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar-track" style={{ height: '8px' }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'linear-gradient(to right,#059669,#10b981)' : 'linear-gradient(to right,#b8962e,#D4AF37)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#334155', marginTop: '0.2rem' }}>
                        <span>Raised: {fmtCompact(raised)}</span><span>Target: {fmtCompact(target)}</span>
                      </div>
                    </div>
                  );
                })}
                {(projects || []).filter(p => ['Fundraising', 'Buildout', 'Live'].includes(p.status)).length === 0 && (
                  <p style={{ color: '#334155', fontSize: '0.82rem' }}>No active fundraising campaigns.</p>
                )}
              </div>
            </div>
          </div>

          {/* Full Projects Table */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            {secTitle('All Deal Records', 'Complete project portfolio with capital and yield rates')}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Business / Project', 'Stage', 'Type', 'Target', 'Raised', 'Progress', 'Yield Rates'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(projects || []).map(proj => {
                    const raised = (activeInvestments || []).filter(i => i.project_id === proj.id).reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                    const target = Number(proj.target_raise_bdt || 1);
                    const pct = Math.min(Math.round((raised / target) * 100), 100);
                    return (
                      <tr key={proj.id}>
                        <td>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>{proj.businesses?.brand_name}</div>
                          <div style={{ color: '#475569', fontSize: '0.7rem' }}>{proj.project_title}</div>
                        </td>
                        <td>
                          <span className="status-badge status-badge--gold">
                            {(proj.status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{proj.funding_type}</td>
                        <td style={{ color: '#cbd5e1' }}>{fmtCompact(target)}</td>
                        <td style={{ color: '#D4AF37', fontWeight: '800' }}>{fmtCompact(raised)}</td>
                        <td style={{ width: '110px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div className="progress-bar-track" style={{ flex: 1, height: '5px' }}>
                              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#D4AF37' }} />
                            </div>
                            <span style={{ fontSize: '0.62rem', color: '#475569', whiteSpace: 'nowrap' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {proj.yield_option_1_rate}% / {proj.yield_option_2_rate}% / {proj.yield_option_3_rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: GROWTH & PROMOTERS
      ============================================================ */}
      {analyticsSubTab === 'growth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Promoter Commission Leaderboard */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Promoter Commission Leaderboard', 'Top 5 promoters by earnings')}
              {promoterLeaderboard.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No commission data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {promoterLeaderboard.map((p, i) => {
                    const rankColor = i === 0 ? '#D4AF37' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#475569';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '900', color: rankColor, width: '22px', textAlign: 'center', flexShrink: 0 }}>#{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: '700', fontSize: '0.82rem' }}>{p.name}</span>
                            <span style={{ color: '#D4AF37', fontWeight: '900', fontSize: '0.82rem' }}>{p.earned > 0 ? fmtCompact(p.earned) : '৳0'}</span>
                          </div>
                          <div className="progress-bar-track" style={{ height: '7px' }}>
                            <div className="progress-bar-fill" style={{ width: `${(p.earned / maxPromoterEarned) * 100}%`, background: i === 0 ? 'linear-gradient(to right,#b8962e,#D4AF37)' : 'rgba(212,175,55,0.3)' }} />
                          </div>
                          <span style={{ fontSize: '0.62rem', color: '#334155' }}>{p.leadCount} leads assigned · {p.tier}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lead Source + Status */}
            <div className="glass-card" style={{ padding: '1.4rem' }}>
              {secTitle('Lead Acquisition Channels', 'Where investors discover GRO10X')}
              {leadSrcData.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No lead source data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {leadSrcData.map((src, i) => progressRow(src.label, src.count, maxSrcCount, src.color, `${src.count} leads`))}
                </div>
              )}
              <div style={{ marginTop: '1.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <p style={{ color: '#D4AF37', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.04em' }}>Lead Conversion Status</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { s: 'new', c: '#3b82f6' }, { s: 'contacted', c: '#f59e0b' }, { s: 'qualified', c: '#8b5cf6' },
                    { s: 'converted', c: '#10b981' }, { s: 'dead', c: '#ef4444' }
                  ].map(({ s, c }, i) => {
                    const cnt = (inquiryLeads || []).filter(l => (l.status || 'new') === s).length;
                    return (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '6px', borderLeft: `3px solid ${c}` }}>
                        <p style={{ color: '#475569', fontSize: '0.6rem', margin: '0 0 0.15rem 0', fontWeight: '800', textTransform: 'uppercase' }}>{s}</p>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: c, lineHeight: 1 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* All Promoters Table */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            {secTitle('All Promoters — Performance Overview', 'Commission, leads, tier, and payout status')}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Promoter', 'Tier', 'Leads', 'Commissions Earned', 'Pending Payouts', 'Joined'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(allPromoters || []).map(p => {
                    const earned = (promoterCommissions || []).filter(c => c.promoter_id === p.id).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0);
                    const pending = (payoutRequests || []).filter(r => r.promoter_id === p.id && r.status === 'Pending').length;
                    const leads = (inquiryLeads || []).filter(l => l.assigned_promoter_id === p.id).length;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{p.alias_name || p.full_name}</td>
                        <td>
                          <span className="status-badge status-badge--gold">{p.tier}</span>
                        </td>
                        <td style={{ color: '#cbd5e1', textAlign: 'center' }}>{leads}</td>
                        <td style={{ color: '#D4AF37', fontWeight: '800' }}>{earned > 0 ? fmtCompact(earned) : '—'}</td>
                        <td style={{ color: pending > 0 ? '#f59e0b' : '#334155', fontWeight: pending > 0 ? '700' : 'normal' }}>
                          {pending > 0 ? `${pending} pending` : 'None'}
                        </td>
                        <td style={{ color: '#475569' }}>
                          {p.joined_at ? new Date(p.joined_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
