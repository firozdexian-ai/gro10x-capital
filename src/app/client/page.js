'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { 
  Building2, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle2, 
  Upload, ArrowUpRight, ShieldCheck, ChevronRight, FileText, Send, Calendar, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialSettlementHistory = [
  { id: 'SET-901', period: 'June 2026 (Monthly)', sales: 3029577, investorShare: 302957, gro10xFee: 75739, totalOwed: 378696, status: 'Verified & Disbursed', method: 'Bank Wire Transfer' },
  { id: 'SET-902', period: 'July Week 1 (Weekly)', sales: 750000, investorShare: 75000, gro10xFee: 18750, totalOwed: 93750, status: 'Verified & Disbursed', method: 'bKash Merchant' },
  { id: 'SET-903', period: 'July Week 2 (Weekly)', sales: 820000, investorShare: 82000, gro10xFee: 20500, totalOwed: 102500, status: 'Pending Verification', method: 'Bank Deposit Slip' },
];

export default function ClientPortal() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [selectedHub, setSelectedHub] = useState('ORO Roasters - Mirpur');
  const [settlementCycle, setSettlementCycle] = useState('Weekly');
  const [settlements, setSettlements] = useState(initialSettlementHistory);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [paymentTxRef, setPaymentTxRef] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      }
    }
  }, [user, authLoading, router]);

  // Calculated current cycle metrics based on Mirpur baseline
  const currentMonthSales = 3160000;
  const investorShareOwed = 316000; // ~10% average yield distribution
  const gro10xFeeOwed = 79000; // 2.5% management fee
  const totalLiabilityOwed = investorShareOwed + gro10xFeeOwed;
  const netOwnerRetained = currentMonthSales - totalLiabilityOwed;

  const handlePayPlatform = async (e) => {
    e.preventDefault();
    if (!paymentTxRef) return;

    const amountOwed = totalLiabilityOwed / 4;
    const newSettlement = {
      id: `SET-90${settlements.length + 1}`,
      period: `July Week 3 (${settlementCycle})`,
      sales: currentMonthSales / 4,
      investorShare: investorShareOwed / 4,
      gro10xFee: gro10xFeeOwed / 4,
      totalOwed: amountOwed,
      status: 'Pending Verification',
      method: `${paymentMethod} (Ref: ${paymentTxRef})`
    };

    setSettlements([newSettlement, ...settlements]);

    // Dispatch Telegram push notification to Admin
    try {
      await fetch('/api/telegram-notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🏢 Platform Settlement Deposit Submitted',
          message: `Founder logged settlement distribution for ${selectedHub}.\nPeriod: July Week 3 (${settlementCycle})\nAmount: ৳${amountOwed.toLocaleString()} BDT\nMethod: ${paymentMethod}\nTxRef: ${paymentTxRef}`,
          actionUrl: `${window.location.origin}/admin`
        })
      });
    } catch (err) {
      console.warn('Failed to notify admin of settlement payment:', err);
    }

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
      setPaymentTxRef('');
    }, 1800);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
        <Loader2 className="spin" size={40} />
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            O
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>PROJECT OWNER <span style={{ color: '#D4AF37' }}>SETTLEMENT PORTAL</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Capital Payout & Settlement Engine v0.1.2</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <select 
            value={selectedHub} 
            onChange={(e) => setSelectedHub(e.target.value)} 
            style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            <option>ORO Roasters - Mirpur</option>
            <option>ORO Roasters - Banani</option>
          </select>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* PAYMENT DUE REMINDER ALERT BANNER */}
        <div style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', padding: '1.25rem 1.75rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', background: 'rgba(212,175,55,0.2)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#D4AF37', margin: 0 }}>
                {settlementCycle} Settlement Payment Pending
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Due in <strong>2 Days</strong> • Total Liability: <strong>{formatCurrency(totalLiabilityOwed / (settlementCycle === 'Weekly' ? 4 : 1), currency)}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              value={settlementCycle} 
              onChange={(e) => setSettlementCycle(e.target.value)}
              style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
            >
              <option value="Weekly">Weekly Settlement Cycle</option>
              <option value="Monthly">Monthly Settlement Cycle</option>
              <option value="Daily">Daily Settlement Cycle</option>
            </select>

            <button onClick={() => setShowPaymentModal(true)} className="btn-gold" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
              <DollarSign size={16} /> Pay Platform Distribution
            </button>
          </div>
        </div>

        {/* 4 CORE CASH FLOW METRICS CARDS */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Sales Collected (Owner Side)</p>
            <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', fontWeight: '800' }}>
              {formatCurrency(currentMonthSales, currency)}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>In Cash & POS Cards</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Investor Yield Share Owed</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800' }}>
              {formatCurrency(investorShareOwed, currency)}
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>For Investor Distributions</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.4)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>GRO10X Management Fee (2.5%)</p>
            <h2 style={{ fontSize: '1.8rem', color: '#D4AF37', fontWeight: '800' }}>
              {formatCurrency(gro10xFeeOwed, currency)}
            </h2>
            <p style={{ color: '#D4AF37', fontSize: '0.8rem', marginTop: '0.25rem' }}>Platform Growth Fee</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Net Owner Retained Cash</p>
            <h2 style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: '800' }}>
              {formatCurrency(netOwnerRetained, currency)}
            </h2>
            <p style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.25rem' }}>Owner Operating Cash</p>
          </div>
        </div>

        {/* SETTLEMENT HISTORY TABLE */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Settlement & Payment Log</h3>
            <button onClick={() => setShowPaymentModal(true)} className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              + Submit Payment Deposit
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Settlement ID</th>
                <th style={{ padding: '0.75rem' }}>Billing Period</th>
                <th style={{ padding: '0.75rem' }}>Gross Sales</th>
                <th style={{ padding: '0.75rem' }}>Investor Share</th>
                <th style={{ padding: '0.75rem' }}>GRO10X Fee</th>
                <th style={{ padding: '0.75rem' }}>Total Paid</th>
                <th style={{ padding: '0.75rem' }}>Method / Ref</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '600' }}>{s.id}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '600' }}>{s.period}</td>
                  <td style={{ padding: '0.85rem' }}>{formatCurrency(s.sales, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#10b981' }}>{formatCurrency(s.investorShare, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#D4AF37' }}>{formatCurrency(s.gro10xFee, currency)}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '700' }}>{formatCurrency(s.totalOwed, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#94a3b8', fontSize: '0.85rem' }}>{s.method}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '12px', 
                      background: s.status.includes('Verified') ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', 
                      color: s.status.includes('Verified') ? '#10b981' : '#D4AF37' 
                    }}>
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* PAYMENT SUBMISSION MODAL */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '92%', borderColor: '#D4AF37' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pay Platform Distribution</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Transfer the calculated settlement liability back to GRO10X Capital. Once verified by Admin, investor payouts will be disbursed.
            </p>

            {paymentSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#10b981', fontSize: '1.2rem' }}>Payment Submitted Successfully!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Pending GRO10X Admin deposit verification.</p>
              </div>
            ) : (
              <form onSubmit={handlePayPlatform} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Amount Owed ({settlementCycle}):</span>
                    <p style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.2rem' }}>
                      {formatCurrency(totalLiabilityOwed / (settlementCycle === 'Weekly' ? 4 : 1), currency)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Includes:</span>
                    <p style={{ fontSize: '0.8rem', color: '#10b981' }}>Investor Yield + 2.5% Fee</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-input">
                    <option>Bank Wire Transfer (City Bank / EBL)</option>
                    <option>bKash Merchant Payment</option>
                    <option>Nagad Corporate Payment</option>
                    <option>Cash Deposit Slip at GRO10X Office</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Transaction Reference / Deposit Slip No.</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TXN-99881234 or Deposit Slip #4412" 
                    value={paymentTxRef}
                    onChange={(e) => setPaymentTxRef(e.target.value)}
                    className="form-input" 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                    Confirm & Submit Deposit
                  </button>
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
