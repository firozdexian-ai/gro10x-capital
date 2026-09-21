'use client';

import React from 'react';
import { Building2, TrendingUp, Clock, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function LedgerMetricsGrid({ metrics, orders = [] }) {
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
    <section style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
      
      {/* 4 PRIMARY METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* Active Capital */}
        <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#D4AF37' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Active Capital</span>
            <Building2 size={16} style={{ color: '#D4AF37' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
            {fmtLakhs(metrics.totalDisbursedActive)}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: '#D4AF37', fontWeight: '700' }}>{metrics.activeCount} orders</span>
            <span>funded &amp; executing</span>
          </div>
        </div>

        {/* Expected Gross Return */}
        <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Expected Return</span>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', lineHeight: 1.1 }}>
            {fmtLakhs(metrics.totalExpectedReturnActive)}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.76rem', marginTop: '0.6rem', fontWeight: '600' }}>
            +৳{(metrics.totalActiveProfit / 1000).toFixed(0)}k yield ({metrics.avgMarginActivePct}% cycle ROI)
          </div>
        </div>

        {/* Turnaround Cycle */}
        <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#38bdf8' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Turnaround Cycle</span>
            <Clock size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
            {metrics.avgDurationDays} Days
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '0.6rem' }}>
            High-velocity revolving purchase orders
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#eab308' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Pending Clearance</span>
            <Sparkles size={16} style={{ color: '#eab308' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#eab308', lineHeight: 1.1 }}>
            {fmtLakhs(metrics.totalPendingCapital)}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '0.6rem' }}>
            <strong>{metrics.pendingCount} orders</strong> awaiting partner review
          </div>
        </div>

      </div>

      {/* REVOLVING FACILITY UTILIZATION & LIFETIME PERFORMANCE STRIP */}
      <div 
        style={{ 
          background: 'rgba(15,23,42,0.85)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '0.85rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: '#D4AF37' }} />
            <span style={{ color: '#fff', fontWeight: '700' }}>Safe Plan Fund Facility Limit:</span>
            <span style={{ color: '#D4AF37', fontWeight: '700' }}>৳20.00 Cr Total Facility</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#94a3b8' }}>Partner Base Line: <strong style={{ color: '#f1f5f9' }}>{fmtLakhs(baseLimit)}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> {fmtLakhs(totalSettledCapital)} Lifetime Settled
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#D4AF37', fontWeight: '700' }}>
              +৳{(totalSettledProfit / 1000).toFixed(0)}k Profit Realized
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden', display: 'flex' }}>
          <div 
            style={{ 
              width: `${Math.min(100, (activeDeployed / 6000000) * 100)}%`, 
              background: 'linear-gradient(90deg, #D4AF37 0%, #10b981 100%)', 
              borderRadius: '999px',
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </div>
      </div>

    </section>
  );
}
