'use client';

import React from 'react';
import { 
  Briefcase, TrendingUp, ShieldCheck, CheckCircle2, 
  ArrowRight, Calendar, FileText, Lock, Building2 
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

export default function WealthOverview({ fundData, onOpenBriefing, onNavigateTab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* 1. EXECUTIVE SUMMARY & FUND THESIS */}
      <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={22} style={{ color: '#D4AF37' }} /> Executive Summary &amp; Investment Thesis
        </h3>

        <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: '1.7', margin: '0 0 1.25rem 0' }}>
          <strong>Safe Plan Wealth Management Fund</strong> is an institutional credit facility designed for private wealth investors and family offices seeking steady, asset-backed returns. Rather than taking equity risk in volatile retail ventures, the fund deploys strictly into verified, short-term corporate purchase orders (POs) with rapid 7–10 day turnaround times and 12%–18% per-cycle gross margins.
        </p>

        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
          All operations are ring-fenced under <strong>Safe Plan Wealth Management SPV-01</strong>, an independent legal entity with isolated bank custody. The fund targets an annualized net return of <strong>18% to 22% p.a.</strong>, with actual monthly distributions determined by the realization of monthly deployments and the collection of performance incentives.
        </p>

        {/* 3 Core Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: '800', textTransform: 'uppercase' }}>Pillar 1</span>
            <h4 style={{ margin: '0.3rem 0 0.4rem', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>Revolving Work Orders</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>
              Rapid 7–10 day capital turnover. Capital is never locked in long-term illiquid debt.
            </p>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase' }}>Pillar 2</span>
            <h4 style={{ margin: '0.3rem 0 0.4rem', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>Audited Institutional Clients</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>
              Blue-chip corporate buyers (Delta Limited, Greenfield Jutex, Unique Group) with verified payment histories.
            </p>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '10px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>Pillar 3</span>
            <h4 style={{ margin: '0.3rem 0 0.4rem', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>Zero Unsecured Exposure</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>
              100% collateralized with signed security cheques, director CIB clearances, and SPV escrow title.
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE 3-STEP INVESTOR ONBOARDING JOURNEY */}
      <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              The 3-Step Private Wealth Onboarding Flow
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
              Transparent, professional onboarding tailored for high-net-worth individuals and corporate treasuries.
            </p>
          </div>
          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(16,185,129,0.12)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            Concierge Assisted
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: 'rgba(7,10,20,0.65)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: '900', background: 'rgba(212,175,55,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              STEP 1
            </span>
            <h4 style={{ margin: '0.5rem 0 0.35rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>
              Submit Confidential Inquiry
            </h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Choose your target ticket size (from ৳10 Lakh) and preferred payout schedule (Monthly, Semi-Annual, or Annual).
            </p>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.65)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '900', background: 'rgba(56,189,248,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              STEP 2
            </span>
            <h4 style={{ margin: '0.5rem 0 0.35rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>
              1-on-1 Briefing with Faiz Ahmed
            </h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Review live work orders, audited counterparty documents, and discuss capital allocation directly with fund leadership.
            </p>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.65)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '900', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              STEP 3
            </span>
            <h4 style={{ margin: '0.5rem 0 0.35rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>
              SPV Agreement &amp; Allocation
            </h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Execute SPV subscription documents, transfer funds to isolated SPV escrow, and receive your digital share certificate.
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => onOpenBriefing('Overview 3-Step CTA')}
            className="btn-gold"
            style={{
              padding: '0.7rem 1.3rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
              color: '#070a14',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Calendar size={15} /> Book 1-on-1 Briefing
          </button>

          <button
            onClick={() => onNavigateTab('returns')}
            style={{
              padding: '0.7rem 1.2rem',
              fontSize: '0.88rem',
              fontWeight: '700',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <TrendingUp size={15} style={{ color: '#D4AF37' }} /> Calculate Projected Returns <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
