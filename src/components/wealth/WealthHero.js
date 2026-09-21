'use client';

import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, TrendingUp, Share2, 
  FileText, Calendar, ChevronRight, Phone, MessageSquare,
  Lock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

export default function WealthHero({ fundData, onOpenBriefing }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* BREADCRUMB & SHARE */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 0', 
        marginBottom: '1.25rem', 
        borderBottom: '1px solid rgba(255,255,255,0.06)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <a href="/showcase" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>Private Wealth Desk</a>
          <ChevronRight size={14} />
          <span style={{ color: '#D4AF37', fontWeight: '600' }}>Safe Plan SPV-01</span>
        </div>
        <button 
          onClick={handleShare} 
          style={{ 
            background: 'rgba(212,175,55,0.1)', 
            border: '1px solid rgba(212,175,55,0.3)', 
            color: '#D4AF37', 
            padding: '0.4rem 1rem', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '0.82rem', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }}
        >
          <Share2 size={14} /> {copied ? '✓ Copied Link' : 'Share Opportunity'}
        </button>
      </div>

      {/* INSTITUTIONAL BADGES */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <span style={{ 
          background: 'rgba(212,175,55,0.14)', 
          color: '#D4AF37', 
          border: '1px solid rgba(212,175,55,0.35)', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '6px', 
          fontSize: '0.78rem', 
          fontWeight: '800', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem',
          letterSpacing: '0.02em'
        }}>
          <Lock size={12} /> Safe Plan SPV-01 Ring-Fenced
        </span>
        <span style={{ 
          background: 'rgba(16,185,129,0.14)', 
          color: '#10b981', 
          border: '1px solid rgba(16,185,129,0.35)', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '6px', 
          fontSize: '0.78rem', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem' 
        }}>
          <ShieldCheck size={13} /> 100% Work-Order &amp; PO Backed
        </span>
        <span style={{ 
          background: 'rgba(56,189,248,0.14)', 
          color: '#38bdf8', 
          border: '1px solid rgba(56,189,248,0.35)', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '6px', 
          fontSize: '0.78rem', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <TrendingUp size={13} /> Target 18% – 22% p.a. Fixed Returns
        </span>
      </div>

      {/* HEADLINE & VALUE PROPOSITION */}
      <h1 style={{ 
        fontSize: '2.3rem', 
        fontWeight: '900', 
        color: '#f8fafc', 
        margin: '0 0 0.85rem 0', 
        lineHeight: 1.18,
        letterSpacing: '-0.02em'
      }}>
        Safe Plan Wealth Management Fund — ৳20 Cr Facility
      </h1>
      
      <p style={{ 
        color: '#94a3b8', 
        fontSize: '1.05rem', 
        lineHeight: '1.65', 
        maxWidth: '820px', 
        margin: '0 0 1.75rem 0' 
      }}>
        An institutional credit &amp; private wealth facility deployed into verified, rapid-turnover corporate purchase orders (7–10 day cycles, 12%–18% per-cycle gross margin) and asset-backed credit lines. Delivering predictable, audited monthly or annual distributions backed by ring-fenced bank escrow under Safe Plan SPV-01.
      </p>

      {/* 4 AT-A-GLANCE METRICS STRIP */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '0.85rem', 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(7,10,20,0.95) 100%)', 
        padding: '1.25rem', 
        borderRadius: '14px', 
        border: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        marginBottom: '1.5rem'
      }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Facility Target
          </span>
          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '1.35rem', marginTop: '0.2rem', fontWeight: '800' }}>
            ৳20.0 Crore
          </strong>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Institutional Credit Pool</span>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Active AUM / Deployed
          </span>
          <strong style={{ display: 'block', color: '#D4AF37', fontSize: '1.35rem', marginTop: '0.2rem', fontWeight: '800' }}>
            ৳5.25+ Crore
          </strong>
          <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: '600' }}>● 100% On-Time Settled</span>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Annual Target Yield
          </span>
          <strong style={{ display: 'block', color: '#10b981', fontSize: '1.35rem', marginTop: '0.2rem', fontWeight: '800' }}>
            18% – 22% p.a.
          </strong>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Monthly · Semi · Annual</span>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Minimum Subscription
          </span>
          <strong style={{ display: 'block', color: '#38bdf8', fontSize: '1.35rem', marginTop: '0.2rem', fontWeight: '800' }}>
            ৳10,00,000
          </strong>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>৳10 Lakh Ticket</span>
        </div>
      </div>

      {/* ACTION STRIP */}
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => onOpenBriefing('Hero Primary CTA')}
          className="btn-gold"
          style={{
            padding: '0.75rem 1.4rem',
            fontSize: '0.92rem',
            fontWeight: '800',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
            color: '#070a14',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
            transition: 'transform 0.15s ease'
          }}
        >
          <Calendar size={17} /> Schedule Briefing with Faiz Ahmed
        </button>

        <a
          href="/docs/maats-company-profile.pdf"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.88rem',
            fontWeight: '700',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#f8fafc',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'background 0.2s ease'
          }}
        >
          <FileText size={16} style={{ color: '#D4AF37' }} /> Download Fund Factsheet (PDF)
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem', marginLeft: 'auto' }}>
          <Phone size={13} style={{ color: '#10b981' }} />
          <span>Direct Desk: <strong style={{ color: '#cbd5e1' }}>+880 1784-397960</strong></span>
        </div>
      </div>
    </div>
  );
}
