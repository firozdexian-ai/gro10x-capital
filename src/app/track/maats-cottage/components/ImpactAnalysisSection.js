'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, PieChart, Building2, ShieldCheck, ArrowUpRight, 
  Handshake, CheckCircle2, DollarSign, Clock, Layers, Sparkles 
} from 'lucide-react';

export default function ImpactAnalysisSection({ metrics }) {
  const [splitMode, setSplitMode] = useState('lifetime'); // 'lifetime' | 'realized'

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  const isRealized = splitMode === 'realized';
  const fundShare = isRealized ? metrics.totalFundProfitRealized : metrics.totalFundProfitLifetime;
  const clientShare = isRealized ? metrics.totalClientProfitRealized : metrics.totalClientProfitLifetime;
  const totalValue = isRealized ? metrics.realizedTotalValue : metrics.lifetimeTotalValue;
  const fundPct = isRealized ? metrics.realizedFundSharePct : metrics.lifetimeFundSharePct;
  const clientPct = isRealized ? metrics.realizedClientSharePct : metrics.lifetimeClientSharePct;
  const baseCapital = isRealized ? metrics.totalSettledCapital : metrics.totalLifetimeDisbursed;

  return (
    <section style={{ margin: '2rem 0' }}>
      
      {/* SECTION TITLE & CONTEXT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#D4AF37', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            <Handshake size={14} /> Underwriting &amp; Commercial Impact
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
            Partnership Economics &amp; Gross Margin Analysis
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.3rem 0 0 0' }}>
            Forensic analysis of underlying purchase order margins, win-win value distribution, and capital velocity.
          </p>
        </div>

        {/* Mode Toggle: Realized vs Lifetime */}
        <div style={{ display: 'inline-flex', background: 'rgba(15,23,42,0.85)', padding: '0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setSplitMode('lifetime')}
            style={{
              background: splitMode === 'lifetime' ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: splitMode === 'lifetime' ? '#D4AF37' : '#94a3b8',
              border: splitMode === 'lifetime' ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Full Portfolio ({fmtLakhs(metrics.totalLifetimeDisbursed)})
          </button>
          <button
            onClick={() => setSplitMode('realized')}
            style={{
              background: splitMode === 'realized' ? 'rgba(16,185,129,0.2)' : 'transparent',
              color: splitMode === 'realized' ? '#10b981' : '#94a3b8',
              border: splitMode === 'realized' ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Cash in Hand ({fmtLakhs(metrics.totalSettledCapital)})
          </button>
        </div>
      </div>

      {/* 4 PRIMARY IMPACT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        
        {/* Total Invoiced PO Revenue */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
            Invoiced PO Revenue
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', lineHeight: 1.15 }}>
            {fmtLakhs(metrics.totalPoValueLifetime)}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.35rem' }}>
            Across {metrics.totalOrdersCount} corporate purchase orders
          </div>
        </div>

        {/* Sourcing Cost (COGS) */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
            Sourcing &amp; Procurement
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#94a3b8', lineHeight: 1.15 }}>
            {fmtLakhs(metrics.totalLifetimeDisbursed)}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.35rem' }}>
            Funded 100% via Gro10x revolving capital
          </div>
        </div>

        {/* Business Gross Margin */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem', borderLeft: '4px solid #D4AF37' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
            Business Gross Margin
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#D4AF37', lineHeight: 1.15 }}>
            {metrics.grossMarginPct}%
          </div>
          <div style={{ color: '#D4AF37', fontSize: '0.72rem', marginTop: '0.35rem', fontWeight: '600' }}>
            {metrics.markupPct}% markup on cost ({fmtLakhs(metrics.totalGrossProfitLifetime)} profit)
          </div>
        </div>

        {/* Turnaround Velocity */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem', borderLeft: '4px solid #38bdf8' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
            Cycle Turnaround
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', lineHeight: 1.15 }}>
            {metrics.avgDurationDays} Days
          </div>
          <div style={{ color: '#38bdf8', fontSize: '0.72rem', marginTop: '0.35rem', fontWeight: '600' }}>
            ~4 capital rotations / month (high velocity)
          </div>
        </div>

      </div>

      {/* APPLES-TO-APPLES VALUE CREATED STRIP */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.25rem', 
          background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(7,10,20,0.98) 100%)',
          marginBottom: '1.25rem' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#D4AF37', letterSpacing: '0.05em' }}>
              Apples-to-Apples Value Split: {isRealized ? 'Settled Cash in Hand (৳10.00L)' : 'Full Portfolio Volume (৳71.25L)'}
            </span>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>
              Comparing {isRealized ? 'only fully repaid orders' : 'all contracted and active orders'} on the exact same capital base.
            </p>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
            Total Value Created: {fmtLakhs(totalValue)}
          </span>
        </div>

        {/* Visual Split Bar */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginBottom: '1rem' }}>
          <div style={{ width: `${fundPct}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 0.4s ease' }} title={`Fund Share: ${fundPct}%`} />
          <div style={{ width: `${clientPct}%`, background: 'linear-gradient(90deg, #D4AF37 0%, #b45309 100%)', transition: 'width 0.4s ease' }} title={`Maats Share: ${clientPct}%`} />
        </div>

        {/* Side-by-Side Comparison Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Fund Share */}
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Gro10x / Fund Share ({fundPct}%)
              </span>
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', lineHeight: 1.15 }}>
              +৳{(fundShare / 1000).toFixed(0)}k
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0.4rem 0 0 0' }}>
              {isRealized 
                ? 'Cash realized & collected in bank from 4 completed orders.' 
                : `${fmtLakhs(metrics.totalFundProfitRealized)} realized + ${fmtLakhs(metrics.totalFundProfitPipeline)} contracted in active pipeline.`}
            </p>
          </div>

          {/* Maats Cottage Share */}
          <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Maats Cottage Ltd ({clientPct}%)
              </span>
              <Building2 size={14} style={{ color: '#D4AF37' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', lineHeight: 1.15 }}>
              +৳{(clientShare / 1000).toFixed(0)}k
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0.4rem 0 0 0' }}>
              {isRealized 
                ? 'Pure operational business profit retained by founder with zero equity tied.' 
                : `${fmtLakhs(metrics.totalClientProfitRealized)} collected + ${fmtLakhs(metrics.totalClientProfitPipeline)} currently delivering.`}
            </p>
          </div>

        </div>
      </div>

      {/* CORPORATE CLIENT BREAKDOWN TABLE */}
      {metrics.clientBreakdown && metrics.clientBreakdown.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
              Corporate Client Breakdown &amp; Value Contribution
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {metrics.clientBreakdown.length} Institutional Clients
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.5rem 0.5rem' }}>Client</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>Orders</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>Total PO Value</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>Capital Funded</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>Fund Profit</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>Client Profit</th>
              </tr>
            </thead>
            <tbody>
              {metrics.clientBreakdown.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                      {c.orderCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: '600', color: '#fff' }}>
                    {fmtLakhs(c.totalPoValue)}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#94a3b8' }}>
                    {fmtLakhs(c.totalDisbursed)}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                    +৳{(c.fundProfit / 1000).toFixed(0)}k
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: '700', color: '#D4AF37' }}>
                    +৳{(c.clientProfit / 1000).toFixed(0)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  );
}
