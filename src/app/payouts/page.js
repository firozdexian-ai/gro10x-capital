'use client';
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CheckCircle2, Clock, ArrowUpRight, Globe, Wallet, 
  CreditCard, Send, ShieldCheck, ChevronRight, RefreshCw, Loader2, Users
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function PayoutsPage() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payout Data State
  const [payouts, setPayouts] = useState([]);
  const [totalCommissionsBdt, setTotalCommissionsBdt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Request payout state
  const [requestAmount, setRequestAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPayoutData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      
      const { data: profile, error: profErr } = await supabase
        .from('promoters')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profErr) {
        if (profErr.code !== 'PGRST116') throw profErr;
        setLoading(false);
        return;
      }
      
      setPromoterProfile(profile);

      // Fetch actual commissions from DB
      const { data: commissions, error: commErr } = await supabase
        .from('promoter_commissions')
        .select('amount_bdt')
        .eq('promoter_id', profile.id);
        
      if (commErr) throw commErr;
      
      const sumCommissions = (commissions || []).reduce((acc, curr) => acc + Number(curr.amount_bdt), 0);
      setTotalCommissionsBdt(sumCommissions);

      // Fetch past payout requests
      const { data: payoutsData, error: payoutsErr } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('promoter_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (payoutsErr) throw payoutsErr;
      setPayouts(payoutsData || []);

    } catch (err) {
      console.error('Error fetching payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live Commission Logic (Excludes rejected payouts from consumption)
  const totalRequested = payouts
    .filter(p => p.status !== 'Rejected')
    .reduce((acc, curr) => acc + Number(curr.amount_bdt), 0);
  const availableBalance = Math.max(0, totalCommissionsBdt - totalRequested);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!promoterProfile || !requestAmount || !accountNumber) return;
    
    const requestNum = Number(requestAmount);
    const amountInBdt = requestNum / CURRENCY_RATES[currency].rate;
    if (amountInBdt > availableBalance) {
      addToast("Requested amount exceeds available balance.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('payout_requests')
        .insert([{
          promoter_id: promoterProfile.id,
          amount_bdt: amountInBdt,
          disbursement_channel: payoutMethod,
          account_details: accountNumber,
          status: 'Pending Verification'
        }]);

      if (error) throw error;

      // Dispatch Telegram Push Alert to Admin
      try {
        await fetch('/api/telegram-notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '💸 New Commission Payout Request',
            message: `Promoter: <b>${promoterProfile.full_name || 'Promoter'}</b>\nAmount: ৳${amountInBdt.toLocaleString()} BDT\nMethod: ${payoutMethod}\nAccount: <code>${accountNumber}</code>`,
            actionUrl: `${window.location.origin}/admin`
          })
        });
      } catch (tErr) {
        console.warn('Admin payout alert skipped:', tErr);
      }

      setRequestSuccess(true);
      addToast("Payout request submitted successfully", "success");
      setTimeout(() => {
        setRequestSuccess(false);
        setRequestAmount('');
      }, 3000);
      
      // Refresh
      fetchPayoutData();
      
    } catch (err) {
      console.error('Failed to submit payout:', err);
      addToast('Error submitting payout request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* LOCAL NAV (Under the global Navigation) */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', position: 'sticky', top: '70px', zIndex: 9, backdropFilter: 'blur(10px)' }}>
        <a href="/promoter" style={{ ...tabBtnStyle(false), textDecoration: 'none' }}>
          <Users size={16} /> Lead CRM Dashboard
        </a>
        <a href="/payouts" style={{ ...tabBtnStyle(true), textDecoration: 'none' }}>
          <DollarSign size={16} /> Commission Payouts
        </a>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {loading ? (
           <div style={{ textAlign: 'center', padding: '5rem', color: '#f59e0b' }}>
             <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
             <p style={{ color: '#94a3b8' }}>Syncing Ledger Data...</p>
           </div>
        ) : !promoterProfile ? (
           <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderColor: 'rgba(245,158,11,0.3)' }}>
             <ShieldCheck size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
             <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Promoter Profile Found</h3>
             <p style={{ color: '#94a3b8' }}>Your account is not configured as a Promoter. Please contact the Admin to register your Referral Code.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Wallet & Earnings</h2>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
              
              {/* LEFT: CASHOUT REQUEST FORM */}
              <div className="glass-card" style={{ borderColor: 'rgba(245,158,11,0.4)', padding: '2rem', height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} style={{ color: '#f59e0b' }} /> Request Instant Cashout
                </h2>

                <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>Available Balance to Cashout</p>
                  <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                    {formatCurrency(availableBalance, currency)}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Lifetime Earned: {formatCurrency(totalCommissionsBdt, currency)}
                  </p>
                </div>

                {requestSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} /> Payout Request Submitted to Supabase!
                  </div>
                )}

                <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Payout Amount</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input 
                        type="number" 
                        value={requestAmount} 
                        onChange={(e) => setRequestAmount(e.target.value)} 
                        className="form-input" 
                        style={{ paddingLeft: '2.2rem' }}
                        required 
                        max={availableBalance * CURRENCY_RATES[currency].rate}
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

                  <button type="submit" disabled={isSubmitting || availableBalance <= 0} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070a14', padding: '0.85rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: (isSubmitting || availableBalance <= 0) ? 0.6 : 1 }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                    Request Cashout Payout
                  </button>
                </form>
              </div>

              {/* RIGHT: PAYOUT HISTORY LEDGER */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#f59e0b' }} /> Disbursed & Pending Payout Ledger
                </h2>

                {payouts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No payout requests submitted yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {payouts.map((p) => {
                      const isDisbursed = p.status === 'Disbursed' || p.status === 'Cleared';
                      const isRejected = p.status === 'Rejected';
                      return (
                        <div key={p.id} style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.9rem' }}>#{p.id.split('-')[0]}...</span>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {p.disbursement_channel}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                              Recipient: {p.account_details} ({new Date(p.created_at).toLocaleDateString()})
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: isRejected ? '#94a3b8' : isDisbursed ? '#10b981' : '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {isRejected ? 'Rejected' : isDisbursed ? 'Cleared / Disbursed' : 'Pending Verification'}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: isRejected ? '#94a3b8' : '#10b981', textDecoration: isRejected ? 'line-through' : 'none' }}>
                              {formatCurrency(p.amount_bdt, currency)}
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: isDisbursed ? 'rgba(16,185,129,0.2)' : isRejected ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                              color: isDisbursed ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b',
                              fontWeight: '700',
                              display: 'inline-block',
                              marginTop: '0.2rem'
                            }}>
                              ● {p.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
    color: active ? '#f59e0b' : '#94a3b8',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: active ? '700' : '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s'
  };
}
