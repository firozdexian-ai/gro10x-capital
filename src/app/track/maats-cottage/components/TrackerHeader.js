'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Phone, Copy, Check, ExternalLink, 
  Plus, Landmark, Bot, MoreHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function TrackerHeader({
  onCopyWhatsApp,
  copiedWhatsApp,
  onOpenAddModal,
  onOpenPinModal
}) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(MAATS_COTTAGE_PROFILE.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <header style={{ 
      background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.1) 0%, rgba(7,10,20,0.98) 70%)', 
      borderBottom: '1px solid rgba(255,255,255,0.07)', 
      padding: '1.5rem 1.25rem 1.25rem 1.25rem' 
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* SINGLE COMPACT HEADER ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* LEFT: Identity */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '5px', padding: '0.2rem 0.55rem', fontSize: '0.68rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={11} /> Institutional PO Financing
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {MAATS_COTTAGE_PROFILE.companyName}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span>{MAATS_COTTAGE_PROFILE.industry}</span>
              <span style={{ color: '#334155' }}>•</span>
              <span>MD: <strong style={{ color: '#94a3b8' }}>{MAATS_COTTAGE_PROFILE.founder}</strong></span>
              <span style={{ color: '#334155' }}>•</span>
              <a href={`tel:${MAATS_COTTAGE_PROFILE.phone}`} style={{ color: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Phone size={11} /> {MAATS_COTTAGE_PROFILE.phone}
              </a>
            </p>
          </div>

          {/* RIGHT: Primary action + overflow menu */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
            
            {/* Primary CTA */}
            <button 
              onClick={onOpenAddModal}
              className="btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px' }}
            >
              <Plus size={15} /> Log Work Order
            </button>

            {/* Overflow ⋯ menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowOverflow(v => !v)}
                className="btn-outline"
                style={{ padding: '0.55rem 0.65rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              {showOverflow && (
                <div 
                  style={{ 
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                    padding: '0.4rem', minWidth: '190px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
                  }}
                >
                  <button 
                    onClick={() => { onCopyWhatsApp(); setShowOverflow(false); }}
                    style={{ 
                      width: '100%', textAlign: 'left', background: copiedWhatsApp ? 'rgba(16,185,129,0.1)' : 'transparent',
                      border: 'none', color: copiedWhatsApp ? '#10b981' : '#cbd5e1', borderRadius: '7px',
                      padding: '0.5rem 0.75rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    {copiedWhatsApp ? <Check size={14} /> : <Copy size={14} />}
                    {copiedWhatsApp ? 'Copied!' : 'Copy WhatsApp Update'}
                  </button>

                  <Link 
                    href="/track/maats-cottage/new" 
                    onClick={() => setShowOverflow(false)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                      background: 'transparent', color: '#94a3b8', borderRadius: '7px',
                      padding: '0.5rem 0.75rem', fontSize: '0.82rem', fontWeight: '600',
                      textDecoration: 'none', cursor: 'pointer'
                    }}
                  >
                    <ExternalLink size={14} /> Standalone Form
                  </Link>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.3rem 0' }} />

                  <button 
                    onClick={() => { onOpenPinModal(); setShowOverflow(false); }}
                    style={{ 
                      width: '100%', textAlign: 'left', background: 'transparent',
                      border: 'none', color: '#64748b', borderRadius: '7px',
                      padding: '0.5rem 0.75rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <Bot size={14} /> Telegram PIN Auth
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BANK DETAILS — collapsed by default */}
        <div style={{ marginTop: '0.85rem' }}>
          <button 
            onClick={() => setShowBankDetails(v => !v)}
            style={{ 
              background: 'transparent', border: 'none', color: '#475569', fontSize: '0.75rem',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: 0, fontWeight: '600'
            }}
          >
            <Landmark size={12} />
            {showBankDetails ? 'Hide' : 'Show'} Settlement Bank Details
            {showBankDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showBankDetails && (
            <div style={{ 
              marginTop: '0.6rem',
              background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '10px', padding: '0.65rem 1rem', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', 
              gap: '0.65rem', fontSize: '0.82rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disbursement A/C</span>
                <span style={{ color: '#f8fafc', fontWeight: '700' }}>{MAATS_COTTAGE_PROFILE.accountName}</span>
                <span style={{ color: '#475569' }}>•</span>
                <code style={{ color: '#D4AF37', fontWeight: 'bold' }}>{MAATS_COTTAGE_PROFILE.accountNumber}</code>
                <button
                  onClick={handleCopyAccount}
                  style={{
                    background: copiedAccount ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${copiedAccount ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    color: copiedAccount ? '#10b981' : '#94a3b8',
                    borderRadius: '4px', padding: '0.15rem 0.45rem', fontSize: '0.68rem',
                    fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                  }}
                  title="Copy Account Number"
                >
                  {copiedAccount ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                  {MAATS_COTTAGE_PROFILE.paymentMode}
                </span>
                <span style={{ color: '#64748b' }}>Limit: <strong style={{ color: '#f1f5f9' }}>{fmtLakhs(MAATS_COTTAGE_PROFILE.revolvingFacilityLimit)}</strong></span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
