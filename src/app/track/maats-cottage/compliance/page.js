'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, FileText, Landmark, Building2, 
  MapPin, Phone, Mail, Globe, ExternalLink, Image as ImageIcon, X 
} from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function ComplianceVaultPage() {
  const [activePhoto, setActivePhoto] = useState(null);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      
      {/* Header bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: '#38bdf8' }} /> Legal &amp; Institutional Due Diligence Vault
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
          All regulatory registrations, corporate bank accounts, and security documents verified under Safe Plan SPV-01.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Compliance Checklist */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
              Regulatory &amp; Legal Clearances
            </span>
            <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
              100% Verified
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {MAATS_COTTAGE_PROFILE.complianceChecklist.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f1f5f9', fontWeight: '700', fontSize: '0.84rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                    {item.title}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                    {item.docNumber} • {item.date}
                  </div>
                </div>

                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '4px', padding: '0.15rem 0.45rem', fontSize: '0.68rem', fontWeight: '700' }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Profile & Bank Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Corporate Profile */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em', display: 'block', marginBottom: '0.75rem' }}>
              Corporate Entity Details
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Legal Entity:</span>
                <strong style={{ color: '#fff' }}>{MAATS_COTTAGE_PROFILE.legalName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Industry:</span>
                <span style={{ color: '#cbd5e1' }}>{MAATS_COTTAGE_PROFILE.industry}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Managing Director:</span>
                <strong style={{ color: '#D4AF37' }}>{MAATS_COTTAGE_PROFILE.founder}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Facility Line:</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>৳20.00 Cr Total Facility</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Headquarters:</span>
                <span style={{ color: '#94a3b8', textAlign: 'right', maxWidth: '200px' }}>{MAATS_COTTAGE_PROFILE.headquarters}</span>
              </div>
            </div>
          </div>

          {/* Primary Disbursement Bank Account */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Landmark size={18} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', textTransform: 'uppercase' }}>
                Designated Disbursement Bank
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem' }}>
              <div style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '0.2rem' }}>
                {MAATS_COTTAGE_PROFILE.accountName}
              </div>
              <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.04em' }}>
                A/C: {MAATS_COTTAGE_PROFILE.accountNumber}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                {MAATS_COTTAGE_PROFILE.bankName} • {MAATS_COTTAGE_PROFILE.paymentMode}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SHOWROOM & PRODUCTION SAMPLES GALLERY */}
      {MAATS_COTTAGE_PROFILE.showroomGallery && MAATS_COTTAGE_PROFILE.showroomGallery.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
              Production &amp; Sample Catalog ({MAATS_COTTAGE_PROFILE.showroomGallery.length} Items)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Institutional Merchandise Portfolio
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' }}>
            {MAATS_COTTAGE_PROFILE.showroomGallery.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setActivePhoto(item)}
                style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#D4AF37'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <div style={{ height: '110px', background: '#0a0f1d', position: 'relative', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ padding: '0.5rem 0.65rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: '600', lineHeight: 1.2, display: 'block', marginTop: '0.15rem' }}>
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '1.5rem' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '100%', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', overflow: 'hidden' }}
          >
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.88rem' }}>{activePhoto.title}</span>
              <button onClick={() => setActivePhoto(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activePhoto.url} alt={activePhoto.title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

    </div>
  );
}
