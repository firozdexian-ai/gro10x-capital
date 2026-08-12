'use client';

import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RiskDisclosurePage() {
  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: '#D4AF37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Platform Overview
        </Link>

        <div style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={14} /> Investor Regulatory Notice
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1.5rem 0' }}>Risk Disclosure Statement</h1>
        
        <div className="glass-card" style={{ padding: '2rem', lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Last updated: August 2026</p>

          <h3 style={{ color: '#ef4444', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>1. Business &amp; Commercial Risk</h3>
          <p>
            Co-investing in SME and F&amp;B franchise outlets carries inherent operational and commercial risk. Revenue disbursements depend on physical outlet sales, footfall, and market conditions.
          </p>

          <h3 style={{ color: '#ef4444', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>2. Capital Guarantee Disclaimer</h3>
          <p>
            Past performance is not a guarantee of future yield. GRO10X Capital manages physical collateral and SPV structures to mitigate loss, but capital returns are not guaranteed by any government agency.
          </p>

          <h3 style={{ color: '#ef4444', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>3. Liquidity Notice</h3>
          <p>
            Private equity co-investments are medium-to-long term commitments. Liquidity before campaign maturity is available primarily through the P2P secondary market, subject to buyer demand.
          </p>

          <h3 style={{ color: '#ef4444', fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>4. Regulatory Status</h3>
          <p>
            GRO10X Capital operates under private commercial shareholding contracts under Bangladesh Company Law and is not a bank, non-bank financial institution (NBFI), or BSEC-regulated public fund.
          </p>
        </div>

      </div>
    </div>
  );
}
