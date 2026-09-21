'use client';

import React, { useState } from 'react';
import { Building2, TrendingUp, Clock, Sparkles, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Handshake, DollarSign } from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function LedgerMetricsGrid({ metrics, orders = [], alertNode = null }) {
  const [showDetails, setShowDetails] = useState(false);
  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  // Revolving Facility Metrics
  const baseLimit = MAATS_COTTAGE_PROFILE.revolvingFacilityLimit || 2500000;
  const activeDeployed = metrics.totalDisbursedActive || 0;
  const utilizationPct = Math.min(100, Math.round((activeDeployed / baseLimit) * 100));

  // Settled Lifetime Metrics
  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');
  const totalSettledCapital = settledOrders.reduce((sum, o) => sum + Number(o.investment_amount_bdt || 0), 0);
  const totalSettledProfit = settledOrders.reduce((sum, o) => sum + Number(o.profit_bdt || (o.return_amount_bdt - o.investment_amount_bdt) || 0), 0);

  return (
    <section style={{ maxWidth: '1000px', margin: '1rem auto', padding: '0 1.25rem' }}>
      
      {/* COMPACT 2-KPI HERO STRIP WITH INLINE ALERT */}
      <div 
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(7,10,20,0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.08)'
        }}
      >
        {/* Top meta row: status pill on the right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: '700' }}>
            Portfolio Summary
          </span>
          {alertNode && (
            <div>{alertNode}</div>
          )}
        </div>

        {/* 2 Primary Numbers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          
          {/* 1. Active Capital */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37', flexShrink: 0 }}>
              <Building2 size={20} />
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block' }}>
                Active Capital
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', lineHeight: 1.15 }}>
                {fmtLakhs(metrics.totalDisbursedActive)}
              </div>
              <div style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '600', marginTop: '0.2rem' }}>
                {metrics.activeCount} orders active
              </div>
            </div>
          </div>

          {/* 2. Expected Gross Return */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', color: '#10b981', flexShrink: 0 }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', display: 'block' }}>
                Expected Return
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', lineHeight: 1.15 }}>
                {fmtLakhs(metrics.totalExpectedReturnActive)}
              </div>
              <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600', marginTop: '0.2rem' }}>
                +৳{(metrics.totalActiveProfit / 1000).toFixed(0)}k profit ({metrics.avgMarginActivePct}%)
              </div>
            </div>
          </div>

        </div>

        {/* ── PARTNERSHIP WIN-WIN DYNAMICS STRIP ── */}
        <div 
          style={{
            marginTop: '1.1rem',
            padding: '0.85rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(212, 175, 55, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D4AF37', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Handshake size={14} /> Partnership Dynamics · Win-Win Value Created
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Cumulative Lifetime Performance
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            
            {/* 1. Total Fund Given So Far */}
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.65rem 0.85rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                Total Funded So Far
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
                {fmtLakhs(metrics.totalLifetimeDisbursed)}
              </div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '0.25rem', display: 'block' }}>
                {fmtLakhs(metrics.totalSettledCapital)} repaid + {fmtLakhs(metrics.totalDisbursedActive)} active
              </span>
            </div>

            {/* 2. Fund Profit Earned */}
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.65rem 0.85rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                Fund Profit Earned
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981', lineHeight: 1.1 }}>
                +৳{(metrics.totalFundProfitRealized / 1000).toFixed(0)}k <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#64748b' }}>Realized</span>
              </div>
              <span style={{ color: '#10b981', fontSize: '0.68rem', marginTop: '0.25rem', display: 'block' }}>
                +৳{(metrics.totalFundProfitPipeline / 1000).toFixed(0)}k contracted in cycle
              </span>
            </div>

            {/* 3. Client Profit Earned */}
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.65rem 0.85rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                Client Profit Earned
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#D4AF37', lineHeight: 1.1 }}>
                +৳{(metrics.totalClientProfitLifetime / 1000).toFixed(0)}k <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#64748b' }}>Retained</span>
              </div>
              <span style={{ color: '#D4AF37', fontSize: '0.68rem', marginTop: '0.25rem', display: 'block' }}>
                Value generated for Maats Cottage
              </span>
            </div>

          </div>
        </div>

        {/* Toggle to reveal secondary stats (Turnaround, Pending, Revolving Facility) */}
        <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowDetails(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: 0
            }}
          >
            <span>{showDetails ? 'Hide Details' : 'Facility Limit & Cycle Details'}</span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* COLLAPSED SECONDARY DETAILS */}
        {showDetails && (
          <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Secondary 2 KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <span>Avg Turnaround</span>
                  <Clock size={14} style={{ color: '#38bdf8' }} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                  {metrics.avgDurationDays} Days
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <span>Pending Clearance</span>
                  <Sparkles size={14} style={{ color: '#eab308' }} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#eab308' }}>
                  {fmtLakhs(metrics.totalPendingCapital)} ({metrics.pendingCount} orders)
                </div>
              </div>
            </div>

            {/* Revolving Facility Utilization & Lifetime Performance */}
            <div 
              style={{ 
                background: 'rgba(0,0,0,0.4)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                  <ShieldCheck size={14} style={{ color: '#D4AF37' }} />
                  <span>Safe Plan Facility: <strong style={{ color: '#D4AF37' }}>৳20.00 Cr</strong></span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span>Base Line: <strong style={{ color: '#f1f5f9' }}>{fmtLakhs(baseLimit)}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ color: '#10b981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={12} /> {fmtLakhs(totalSettledCapital)} Settled
                  </span>
                  <span style={{ color: '#475569' }}>|</span>
                  <span style={{ color: '#D4AF37', fontWeight: '600' }}>
                    +৳{(totalSettledProfit / 1000).toFixed(0)}k Profit Realized
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, (activeDeployed / 6000000) * 100)}%`, 
                    background: 'linear-gradient(90deg, #D4AF37 0%, #10b981 100%)', 
                    borderRadius: '999px',
                    height: '100%'
                  }}
                />
              </div>
            </div>

          </div>
        )}

      </div>

    </section>
  );
}
