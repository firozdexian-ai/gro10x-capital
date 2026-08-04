'use client';
import React, { useState } from 'react';
import { 
  DollarSign, CheckCircle2, Clock, ArrowUpRight, Globe, Wallet, 
  CreditCard, Send, ShieldCheck, ChevronRight, RefreshCw
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialPayouts = [
  { id: 'PAY-701', promoter: 'Anisur Rahman', amount: 12500, method: 'bKash Merchant', recipient: '+8801711000111', date: '2026-08-01', status: 'Disbursed' },
  { id: 'PAY-702', promoter: 'Anisur Rahman', amount: 10000, method: 'Bank Wire (BRAC Bank)', recipient: '150120489912001', date: '2026-08-03', status: 'Processing Verification' },
];

export default function PayoutsPage() {
  const [currency, setCurrency] = useState('BDT');
  const [payouts, setPayouts] = useState(initialPayouts);
  
  // Request payout state
  const [requestAmount, setRequestAmount] = useState(7500);
  const [payoutMethod, setPayoutMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('+8801711000111');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleRequestPayout = (e) => {
    e.preventDefault();
    const newPayout = {
      id: `PAY-${700 + payouts.length + 1}`,
      promoter: 'Anisur Rahman',
      amount: Number(requestAmount),
      method: payoutMethod,
      recipient: accountNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'Processing Verification'
    };
    setPayouts([newPayout, ...payouts]);
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 3000);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(245,158,11,0.3)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f59e0b, #b45309)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900' }}>
            <Wallet size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>PROMOTER <span style={{ color: '#f59e0b' }}>COMMISSION PAYOUT LEDGER</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v2.6 Instant Cashout Engine (bKash / Nagad / Bank Wire)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#f59e0b' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/promoter" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Promoter Portal <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
        
        {/* LEFT: CASHOUT REQUEST FORM */}
        <div className="glass-card" style={{ borderColor: 'rgba(245,158,11,0.4)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} style={{ color: '#f59e0b' }} /> Request Instant Commission Cashout
          </h2>

          {requestSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} /> Payout Request Submitted to Supabase Ledger!
            </div>
          )}

          <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Payout Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                <input 
                  type="number" 
                  value={Math.round(requestAmount * CURRENCY_RATES[currency].rate)} 
                  onChange={(e) => setRequestAmount(Number(e.target.value) / CURRENCY_RATES[currency].rate)} 
                  className="form-input" 
                  style={{ paddingLeft: '2.2rem' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Disbursement Channel</label>
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="form-input">
                <option value="bKash">bKash Personal / Merchant</option>
                <option value="Nagad">Nagad Instant Transfer</option>
                <option value="Bank Wire">BRAC Bank EFTN Wire</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Account Number / Phone</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="form-input" placeholder="+8801700000000" required />
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070a14', padding: '0.85rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Send size={18} /> Request Cashout Payout
            </button>
          </form>
        </div>

        {/* RIGHT: PAYOUT HISTORY LEDGER */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#f59e0b' }} /> Disbursed & Pending Payout Ledger
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {payouts.map((p) => (
              <div key={p.id} style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.9rem' }}>{p.id}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {p.method}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Recipient: {p.recipient} ({p.date})
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>
                    {formatCurrency(p.amount, currency)}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: p.status.includes('Disbursed') ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                    color: p.status.includes('Disbursed') ? '#10b981' : '#f59e0b',
                    fontWeight: '700',
                    display: 'inline-block',
                    marginTop: '0.2rem'
                  }}>
                    ● {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
