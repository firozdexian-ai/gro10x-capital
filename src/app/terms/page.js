'use client';

import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: '#D4AF37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Platform Overview
        </Link>

        <div className="badge-gold" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <FileText size={14} /> Platform Agreement
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1.5rem 0' }}>Terms of Service</h1>
        
        <div className="glass-card" style={{ padding: '2rem', lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Last updated: August 2026</p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>1. Platform Nature</h3>
          <p>
            GRO10X Capital is a technology and growth management platform facilitating private equity co-investment into operating SME and franchise campaigns.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>2. Investor Qualification &amp; SPV Membership</h3>
          <p>
            Investors acquire equity or yield-holding rights through isolated Special Purpose Vehicle (SPV) structures. All members must complete identity verification (KYC) prior to capital deployment.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>3. Monthly Disbursements</h3>
          <p>
            Yield payouts are calculated from audited POS sales and disbursed monthly by the 7th of each calendar month. Figures are subject to business operational performance.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>4. Governing Law</h3>
          <p>
            These terms are governed under the laws of the People's Republic of Bangladesh.
          </p>
        </div>

      </div>
    </div>
  );
}
