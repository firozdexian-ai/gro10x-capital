'use client';

import React from 'react';
import Link from 'next/link';
import { useTracker } from './context/TrackerContext';
import DynamicMaturityAlert from './components/DynamicMaturityAlert';
import LedgerMetricsGrid from './components/LedgerMetricsGrid';
import ImpactAnalysisSection from './components/ImpactAnalysisSection';
import { 
  ArrowRight, Zap, Clock, CheckCircle2, ShieldCheck, 
  TrendingUp, Building2, ChevronRight 
} from 'lucide-react';

export default function TrackerOverviewPage() {
  const { orders, metrics, openDocs, setSettleTargetOrder } = useTracker();

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div>
      {/* ── KPI METRICS STRIP WITH INLINE MATURITY PILL & APPLES-TO-APPLES DYNAMICS ── */}
      <LedgerMetricsGrid 
        metrics={metrics}
        orders={orders}
        alertNode={
          <DynamicMaturityAlert 
            orders={orders}
            onInspectOrder={(order) => openDocs(order, 0)}
            onSettleOrder={(order) => setSettleTargetOrder(order)}
          />
        }
      />

      {/* ── QUICK SECTION NAV CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', margin: '1.25rem 0' }}>
        
        {/* Active Deployments Card */}
        <Link 
          href="/track/maats-cottage/active"
          className="glass-card"
          style={{ 
            padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', 
            flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #10b981',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={14} /> Active Orders
              </span>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                {metrics.activeCount}
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
              {fmtLakhs(metrics.totalDisbursedActive)} Deployed
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
              Expected: {fmtLakhs(metrics.totalExpectedReturnActive)}
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#10b981', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Manage Deployments</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* Pending Clearance Card */}
        <Link 
          href="/track/maats-cottage/pending"
          className="glass-card"
          style={{ 
            padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', 
            flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #eab308',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#eab308', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> Pending Review
              </span>
              <span style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                {metrics.pendingCount}
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
              {fmtLakhs(metrics.totalPendingCapital)} Queued
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
              Awaiting Partner Disbursal
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#eab308', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Review Clearances</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* Settled & Repaid Card */}
        <Link 
          href="/track/maats-cottage/settled"
          className="glass-card"
          style={{ 
            padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', 
            flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #D4AF37',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Settled Ledger
              </span>
              <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                {metrics.settledCount}
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
              {fmtLakhs(metrics.totalSettledCapital)} Recovered
            </div>
            <span style={{ color: '#10b981', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
              +৳{(metrics.totalSettledProfit / 1000).toFixed(0)}k Profit Realized
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#D4AF37', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Audit Repayment Slips</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* Compliance Vault Card */}
        <Link 
          href="/track/maats-cottage/compliance"
          className="glass-card"
          style={{ 
            padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', 
            flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #38bdf8',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={14} /> Due Diligence
              </span>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                6 Docs
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
              100% Compliant
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
              Trade, BIN, NID, Cheque
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Inspect Vault</span>
            <ChevronRight size={14} />
          </div>
        </Link>

      </div>

      {/* ── IMPACT ANALYSIS SEGMENT ── */}
      <ImpactAnalysisSection metrics={metrics} />
    </div>
  );
}
