'use client';
import React, { useState } from 'react';
import { 
  Users, TrendingUp, DollarSign, Link2, Copy, CheckCircle2, 
  ArrowUpRight, Award, ChevronRight, Share2, ShieldCheck, UserCheck
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialReferredInvestors = [
  { id: 'REF-801', investorName: 'Tanvir Ahmed (NRB)', project: 'ORO Roasters - Mirpur', amount: 1500000, commission: 7500, status: 'Commission Paid' },
  { id: 'REF-802', investorName: 'Kazi Mahbub', project: 'ORO Roasters - Banani', amount: 1000000, commission: 5000, status: 'Commission Paid' },
  { id: 'REF-803', investorName: 'Syed Rahat Kabir', project: 'Segreto Hub - Dhanmondi', amount: 2000000, commission: 10000, status: 'Pending Payout' },
];

export default function PromoterPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [promoterName, setPromoterName] = useState('Anisur Rahman (Broker Partner)');
  const [promoterCode, setPromoterCode] = useState('PROMO-ANISUR7');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState(initialReferredInvestors);

  const totalCapitalReferred = referrals.reduce((sum, r) => sum + r.amount, 0);
  const totalCommissionEarned = totalCapitalReferred * 0.005; // 0.5% referral commission
  const paidCommission = referrals.filter(r => r.status.includes('Paid')).reduce((sum, r) => sum + r.commission, 0);
  const pendingCommission = totalCommissionEarned - paidCommission;

  const referralLink = `http://localhost:3000/?ref=${promoterCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            P
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>PROMOTER & BROKER <span style={{ color: '#D4AF37' }}>PORTAL</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>0.5% Capital Referral Partner Dashboard v0.1.3</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ color: '#D4AF37', fontWeight: '700', fontSize: '0.9rem' }}>{promoterName}</span>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* REFERRAL LINK GENERATOR CARD */}
        <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.4)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.4rem' }}>0.5% Referral Commission</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Your Unique Referral Link</h2>
            </div>
            <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
              ● 0.5% Commission Active
            </span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            Share your unique link with investors or real estate clients. When they commit capital to any GRO10X outlet, you earn an instant <strong>0.5% referral commission</strong>.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="form-input" 
              style={{ fontWeight: '600', color: '#D4AF37' }}
            />
            <button onClick={handleCopyLink} className="btn-gold" style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Capital Referred</p>
            <h2 style={{ fontSize: '1.8rem', color: '#D4AF37', fontWeight: '800' }}>
              {formatCurrency(totalCapitalReferred, currency)}
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>{referrals.length} Investors Onboarded</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total 0.5% Commission Earned</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800' }}>
              {formatCurrency(totalCommissionEarned, currency)}
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>0.5% of Referred Funds</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Commissions Paid Out</p>
            <h2 style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: '800' }}>
              {formatCurrency(paidCommission, currency)}
            </h2>
            <p style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.25rem' }}>Disbursed to Bank Account</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pending Commission Payout</p>
            <h2 style={{ fontSize: '1.8rem', color: '#f59e0b', fontWeight: '800' }}>
              {formatCurrency(pendingCommission, currency)}
            </h2>
            <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Processing Verification</p>
          </div>
        </div>

        {/* REFERRED INVESTORS LOG */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Referred Investor Deals</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Referral ID</th>
                <th style={{ padding: '0.75rem' }}>Investor Name</th>
                <th style={{ padding: '0.75rem' }}>Target Project</th>
                <th style={{ padding: '0.75rem' }}>Capital Committed</th>
                <th style={{ padding: '0.75rem' }}>Your 0.5% Commission</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '600' }}>{r.id}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '600' }}>{r.investorName}</td>
                  <td style={{ padding: '0.85rem', color: '#94a3b8' }}>{r.project}</td>
                  <td style={{ padding: '0.85rem', color: '#10b981', fontWeight: '600' }}>
                    {formatCurrency(r.amount, currency)}
                  </td>
                  <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '700' }}>
                    {formatCurrency(r.commission, currency)}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '12px', 
                      background: r.status.includes('Paid') ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', 
                      color: r.status.includes('Paid') ? '#10b981' : '#f59e0b' 
                    }}>
                      ● {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
