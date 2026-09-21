'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Phone, Copy, Check, ExternalLink, 
  Plus, Landmark, Bot 
} from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function TrackerHeader({
  onCopyWhatsApp,
  copiedWhatsApp,
  onOpenAddModal,
  onOpenPinModal
}) {
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(MAATS_COTTAGE_PROFILE.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <>
      {/* TOP ANNOUNCEMENT BANNER */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', borderBottom: '1px solid rgba(212,175,55,0.25)', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              LIVE TERMINAL SYNCED
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span>{MAATS_COTTAGE_PROFILE.facilityName}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#D4AF37', fontWeight: '600' }}>Managing Partner: Faiz Ahmed ({MAATS_COTTAGE_PROFILE.managingPartner.phone})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={onOpenPinModal}
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Bot size={13} /> Telegram PIN Auth
            </button>
          </div>
        </div>
      </div>

      {/* HEADER EXECUTIVE HERO */}
      <header style={{ background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.12) 0%, rgba(7,10,20,0.98) 75%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 1.25rem 2rem 1.25rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.72rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ShieldCheck size={13} /> Institutional PO Financing Facility
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff', letterSpacing: '-0.02em' }}>
                {MAATS_COTTAGE_PROFILE.companyName}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>{MAATS_COTTAGE_PROFILE.industry}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span>MD: <strong style={{ color: '#f1f5f9' }}>{MAATS_COTTAGE_PROFILE.founder}</strong></span>
                <span style={{ color: '#475569' }}>•</span>
                <a href={`tel:${MAATS_COTTAGE_PROFILE.phone}`} style={{ color: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={12} /> {MAATS_COTTAGE_PROFILE.phone}
                </a>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={onCopyWhatsApp}
                className="btn-outline"
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
                  borderColor: copiedWhatsApp ? '#10b981' : 'rgba(212,175,55,0.4)', 
                  color: copiedWhatsApp ? '#10b981' : '#D4AF37',
                  background: copiedWhatsApp ? 'rgba(16,185,129,0.1)' : 'rgba(212,175,55,0.08)',
                  padding: '0.6rem 1.1rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px'
                }}
              >
                {copiedWhatsApp ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedWhatsApp ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Update'}</span>
              </button>

              <Link 
                href="/track/maats-cottage/new" 
                className="btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px', textDecoration: 'none' }}
              >
                <ExternalLink size={15} /> Standalone Form
              </Link>

              <button 
                onClick={onOpenAddModal}
                className="btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px' }}
              >
                <Plus size={16} /> Log Work Order
              </button>
            </div>
          </div>

          {/* SETTLEMENT BANK DETAILS STRIP WITH 1-CLICK COPY */}
          <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: '#D4AF37', flexShrink: 0 }}>
                <Landmark size={16} />
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Primary Disbursement &amp; Settlement Account</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#f8fafc', fontWeight: '700' }}>{MAATS_COTTAGE_PROFILE.accountName}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#94a3b8' }}>A/C: <code style={{ color: '#D4AF37', fontWeight: 'bold' }}>{MAATS_COTTAGE_PROFILE.accountNumber}</code></span>
                  <button
                    onClick={handleCopyAccount}
                    style={{
                      background: copiedAccount ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${copiedAccount ? '#10b981' : 'rgba(255,255,255,0.12)'}`,
                      color: copiedAccount ? '#10b981' : '#94a3b8',
                      borderRadius: '4px',
                      padding: '0.15rem 0.45rem',
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title="Copy Account Number"
                  >
                    {copiedAccount ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedAccount ? 'Copied' : 'Copy A/C'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge status-badge--success" style={{ fontSize: '0.72rem' }}>
                Mode: {MAATS_COTTAGE_PROFILE.paymentMode}
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#94a3b8' }}>Revolving Limit: <strong style={{ color: '#fff' }}>{fmtLakhs(MAATS_COTTAGE_PROFILE.revolvingFacilityLimit)}</strong></span>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
