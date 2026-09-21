'use client';

import React from 'react';
import { 
  Lock, ShieldCheck, FileCheck, CheckCircle2, 
  ArrowRight, Landmark, FileText, AlertCircle
} from 'lucide-react';

const SECURITY_PILLARS = [
  {
    icon: FileCheck,
    title: 'Dual-Document Settlement Audit',
    badge: '100% Documented',
    description: 'Capital is released only against audited corporate purchase orders (POs). Repayment is verified via signed corporate delivery challans and bank advice credit slips.',
    color: '#D4AF37'
  },
  {
    icon: Landmark,
    title: 'Undated Signed Security Cheques',
    badge: 'Physical Collateral',
    description: 'Every borrowing counterparty deposits an undated signed security cheque for the full facility amount with the SPV custodian prior to any capital disbursement.',
    color: '#10b981'
  },
  {
    icon: ShieldCheck,
    title: 'Director Personal Guarantee & CIB',
    badge: 'Zero Default Record',
    description: 'Corporate directors provide personal guarantees backed by verified Grade-A Bangladesh Bank CIB credit clearances, ensuring zero willful default risk.',
    color: '#38bdf8'
  },
  {
    icon: Lock,
    title: 'Safe Plan SPV-01 Ring-Fencing',
    badge: 'Legal Entity Isolation',
    description: 'All investor funds reside in a dedicated, bankruptcy-remote Special Purpose Vehicle (SPV-01) with dedicated bank escrow. Zero commingling with GRO10X operational funds.',
    color: '#a855f7'
  }
];

const FLOW_STEPS = [
  { step: '01', title: 'Investor Capital', desc: 'Deposited into Safe Plan SPV-01 bank escrow' },
  { step: '02', title: 'PO Audit & Sign-off', desc: 'Faiz Ahmed & Committee verify buyer contract' },
  { step: '03', title: 'Tranche Disbursement', desc: 'Disbursed via EFT/NPSB against supplier invoices' },
  { step: '04', title: 'Corporate Delivery', desc: 'Goods delivered; signed challan obtained' },
  { step: '05', title: 'Corporate Repayment', desc: 'Buyer clears invoice directly to SPV account' },
  { step: '06', title: 'Investor Yield Payout', desc: 'Distributed 7th of month to your bank' },
];

export default function SpvSecurityFramework() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. VISUAL RING-FENCING WORKFLOW */}
      <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} style={{ color: '#D4AF37' }} /> Safe Plan SPV-01 Capital Flow &amp; Ring-Fencing
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
              How capital is deployed, secured, repaid, and distributed under bankruptcy-remote SPV governance.
            </p>
          </div>
          <span style={{ 
            background: 'rgba(212,175,55,0.12)', 
            border: '1px solid rgba(212,175,55,0.3)', 
            color: '#D4AF37', 
            padding: '0.25rem 0.65rem', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            fontWeight: '700' 
          }}>
            Ring-Fenced Legal Custody
          </span>
        </div>

        {/* Step Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {FLOW_STEPS.map((s, idx) => (
            <div
              key={s.step}
              style={{
                background: 'rgba(7,10,20,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '1rem',
                position: 'relative'
              }}
            >
              <span style={{ 
                fontSize: '0.68rem', 
                color: '#D4AF37', 
                fontWeight: '900', 
                background: 'rgba(212,175,55,0.15)', 
                padding: '0.1rem 0.4rem', 
                borderRadius: '4px' 
              }}>
                STEP {s.step}
              </span>
              <h4 style={{ margin: '0.45rem 0 0.2rem 0', color: '#f8fafc', fontSize: '0.88rem', fontWeight: '700' }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 4-PILLAR SECURITY GRID */}
      <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: '#10b981' }} /> 4 Pillars of Institutional Capital Protection
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {SECURITY_PILLARS.map(p => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                style={{
                  background: 'rgba(7,10,20,0.65)',
                  border: `1px solid ${p.color}35`,
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px', 
                    background: `${p.color}18`, 
                    display: 'grid', 
                    placeItems: 'center',
                    color: p.color
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: p.color, 
                    fontWeight: '700', 
                    background: `${p.color}15`, 
                    border: `1px solid ${p.color}30`, 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px' 
                  }}>
                    {p.badge}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.98rem', color: '#f8fafc', fontWeight: '800' }}>
                  {p.title}
                </h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Check Badges */}
        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          display: 'flex', 
          gap: '1.5rem', 
          fontSize: '0.8rem', 
          color: '#cbd5e1', 
          flexWrap: 'wrap' 
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Executed SPV Subscription Agreement
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Digital Share Ownership Certificate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Monthly External KAM Settlement Audit
          </span>
        </div>
      </div>

    </div>
  );
}
