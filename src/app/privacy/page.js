'use client';

import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: '#D4AF37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Platform Overview
        </Link>

        <div className="badge-gold" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ShieldCheck size={14} /> Legal &amp; Data Protection
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1.5rem 0' }}>Privacy Policy</h1>
        
        <div className="glass-card" style={{ padding: '2rem', lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Last updated: August 2026</p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>1. Data Collection</h3>
          <p>
            GRO10X Capital collects necessary identity information (KYC documentation, NID, bank details) strictly for legal compliance, SPV shareholding registration, and monthly yield disbursements.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>2. Data Protection &amp; Confidentiality</h3>
          <p>
            Your financial data is encrypted and accessible only by authorized Key Account Managers (KAM) and compliance officers. We do not sell or monetize investor information.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>3. Third-Party Disclosures</h3>
          <p>
            Information is disclosed only to regulatory authorities, bank payment partners, or SPV legal counsel when required for asset registration under Bangladesh commercial law.
          </p>

          <h3 style={{ color: '#D4AF37', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>4. Contact Compliance</h3>
          <p>
            For privacy inquiries or data update requests, contact our compliance desk at <strong>compliance@gro10x.com</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
