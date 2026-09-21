'use client';

import React from 'react';
import { 
  Lock, ShieldCheck, TrendingUp, Calendar, 
  FileText, MessageSquare, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

export default function WealthStickySidebar({ fundData, onOpenBriefing }) {
  const target = Number(fundData?.target_facility_bdt || fundData?.target_raise_bdt) || 200000000; // 20 Cr
  const raised = Number(fundData?.active_aum_bdt || fundData?.amount_raised_bdt) || 52500000;    // 5.25 Cr
  const booked = Number(fundData?.booked_amount_bdt) || 20000000;                               // 2.0 Cr
  const minTicket = Number(fundData?.min_ticket_bdt || fundData?.min_otc_investment_bdt) || 1000000;

  const raisedPct = Math.min(100, Math.round((raised / target) * 100));
  const bookedPct = Math.min(100 - raisedPct, Math.round((booked / target) * 100));

  return (
    <div style={{ position: 'sticky', top: '80px' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.75rem', 
          borderColor: 'rgba(212,175,55,0.4)', 
          boxShadow: '0 8px 40px rgba(212,175,55,0.08)',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
            Facility Target
          </span>
          <span style={{ 
            fontSize: '0.7rem', 
            color: '#10b981', 
            background: 'rgba(16,185,129,0.12)', 
            padding: '0.15rem 0.5rem', 
            borderRadius: '4px', 
            fontWeight: '700' 
          }}>
            Active Allocation
          </span>
        </div>

        <h2 style={{ fontSize: '2.1rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 1.25rem' }}>
          {formatCurrency(target, 'BDT')}
        </h2>

        {/* PROGRESS BAR */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.3rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', fontWeight: '700' }}>{raisedPct}% Deployed</span>
              <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.72rem', background: 'rgba(245,158,11,0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                +{bookedPct}% Committed
              </span>
            </div>
            <span style={{ color: '#cbd5e1', fontWeight: '600' }}>
              {formatCurrency(raised + booked, 'BDT')}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', height: '9px', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${raisedPct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #b49127)', transition: 'width 0.6s ease' }} />
            <div style={{ width: `${bookedPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', transition: 'width 0.6s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.45rem' }}>
            <span>🔒 Ring-Fenced SPV-01</span>
            <span>Available: {formatCurrency(Math.max(0, target - raised - booked), 'BDT')}</span>
          </div>
        </div>

        {/* 4 CORE PARAMETERS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(7,10,20,0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Min Subscription</span>
            <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{formatCurrency(minTicket, 'BDT')}</strong>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Annual Target ROI</span>
            <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>18% – 22% p.a.</strong>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Facility Term</span>
            <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>36 Months</strong>
          </div>

          <div style={{ background: 'rgba(7,10,20,0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Payout Schedule</span>
            <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>Monthly / Semi / Ann</strong>
          </div>
        </div>

        {/* PRIMARY CTA */}
        <button
          onClick={() => onOpenBriefing('Sticky Sidebar Primary CTA')}
          className="btn-gold"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '0.95rem',
            fontWeight: '800',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
            color: '#070a14'
          }}
        >
          <Calendar size={17} /> Schedule Briefing with Faiz Ahmed
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', margin: '0.75rem 0 1.25rem' }}>
          🔒 Direct discussion with fund leadership. Zero obligation.
        </p>

        {/* FACTSHEET LINK */}
        <a
          href="/docs/maats-company-profile.pdf"
          target="_blank"
          rel="noreferrer"
          style={{
            width: '100%',
            padding: '0.65rem',
            fontSize: '0.82rem',
            fontWeight: '700',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.04)',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            textDecoration: 'none'
          }}
        >
          <FileText size={14} style={{ color: '#D4AF37' }} /> Download Fund Factsheet (PDF)
        </a>

        {/* SPV STRUCTURE BADGE */}
        <div style={{ 
          marginTop: '1.25rem', 
          padding: '0.85rem', 
          background: 'rgba(16,185,129,0.06)', 
          border: '1px solid rgba(16,185,129,0.2)', 
          borderRadius: '8px' 
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={13} /> SPV Legal Structure
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Safe Plan Wealth Management SPV-01 (Isolated Bank Custody)
          </p>
        </div>
      </div>
    </div>
  );
}
