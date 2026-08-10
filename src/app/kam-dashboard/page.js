'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function KamDashboard() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [kamProfile, setKamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audits');
  const [cashTickets, setCashTickets] = useState([]);

  // Business Selection
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  
  // Unilever-style Audit Form State
  const [cashInHand, setCashInHand] = useState('');
  const [receivablesMarket, setReceivablesMarket] = useState('');
  const [receivablesCompany, setReceivablesCompany] = useState('');
  const [payables, setPayables] = useState('');
  const [stockInvestment, setStockInvestment] = useState('');
  const [payrollExpense, setPayrollExpense] = useState('');

  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedHealthScore, setCalculatedHealthScore] = useState(0);

  useEffect(() => {
    if (user) {
      fetchKamData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchKamData = async () => {
    try {
      setLoading(true);
      // Fetch KAM profile
      const { data: profile, error: profErr } = await supabase
        .from('kams')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profErr) {
        if (profErr.code !== 'PGRST116') throw profErr;
        setLoading(false);
        return;
      }
      
      setKamProfile(profile);

      // Fetch active businesses
      const { data: bizData, error: bizErr } = await supabase
        .from('businesses')
        .select('id, brand_name, ai_health_score')
        .order('created_at', { ascending: false });

      if (bizErr) throw bizErr;
      setBusinesses(bizData || []);
      if (bizData && bizData.length > 0) {
        setSelectedBusinessId(bizData[0].id);
      }

      // Fetch assigned Cash Tickets
      const { data: ticketData, error: ticketErr } = await supabase
        .from('cash_tickets')
        .select('*, investors(alias_name), funding_projects(project_title)')
        .eq('kam_id', profile.id)
        .order('created_at', { ascending: false });

      if (ticketErr) throw ticketErr;
      setCashTickets(ticketData || []);

    } catch (err) {
      console.error('Error fetching KAM data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Health Score Preview Calculation
  useEffect(() => {
    const assets = (Number(cashInHand) || 0) + (Number(stockInvestment) || 0) + (Number(receivablesMarket) || 0) + (Number(receivablesCompany) || 0);
    const liabilities = (Number(payables) || 0) + (Number(payrollExpense) || 0);
    const ratio = assets / (liabilities || 1); // Avoid div by zero
    // Simple mock formula: Base 40 + Ratio * 10, capped at 100
    let score = Math.round(40 + (ratio * 10));
    if (assets === 0 && liabilities === 0) score = 0;
    setCalculatedHealthScore(Math.min(100, Math.max(0, score)));
  }, [cashInHand, stockInvestment, receivablesMarket, receivablesCompany, payables, payrollExpense]);

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!kamProfile || !selectedBusinessId) return;

    try {
      setIsSubmitting(true);
      const auditMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM' format

      // 1. Insert into business_audits
      const { error: auditErr } = await supabase
        .from('business_audits')
        .insert([{
          kam_id: kamProfile.id,
          business_id: selectedBusinessId,
          audit_month: auditMonth,
          cash_in_hand_bdt: Number(cashInHand) / CURRENCY_RATES[currency].rate,
          stock_valuation_bdt: Number(stockInvestment) / CURRENCY_RATES[currency].rate,
          receivables_market_bdt: Number(receivablesMarket) / CURRENCY_RATES[currency].rate,
          receivables_company_bdt: Number(receivablesCompany) / CURRENCY_RATES[currency].rate,
          payables_bdt: Number(payables) / CURRENCY_RATES[currency].rate,
          payroll_expense_bdt: Number(payrollExpense) / CURRENCY_RATES[currency].rate,
          calculated_health_score: calculatedHealthScore
        }]);

      if (auditErr) throw auditErr;

      // 2. Update businesses table ai_health_score
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({ ai_health_score: calculatedHealthScore })
        .eq('id', selectedBusinessId);

      if (updateErr) throw updateErr;

      // 3. Emit Global Notification
      const bizName = businesses.find(b => b.id === selectedBusinessId)?.brand_name || 'a business';
      await supabase.from('notifications').insert([{
        title: 'New Audit Verified',
        message: `KAM has posted a verified physical audit for ${bizName}. AI Health Score updated.`,
        type: 'success'
      }]);

      setAuditSubmitted(true);
      
      // Reset form
      setCashInHand('');
      setStockInvestment('');
      setReceivablesMarket('');
      setReceivablesCompany('');
      setPayables('');
      setPayrollExpense('');

      setTimeout(() => setAuditSubmitted(false), 3000);
      fetchKamData(); // Refresh list to get updated scores
      addToast('Audit submitted successfully', 'success');

    } catch (err) {
      console.error('Failed to submit audit:', err);
      addToast('Error submitting audit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* LOCAL NAV (Under the global Navigation) */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(59,130,246,0.2)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', position: 'sticky', top: '70px', zIndex: 9, backdropFilter: 'blur(10px)' }}>
        <button onClick={() => setActiveTab('audits')} style={{ background: activeTab === 'audits' ? 'rgba(59,130,246,0.2)' : 'transparent', color: activeTab === 'audits' ? '#3b82f6' : '#94a3b8', border: activeTab === 'audits' ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
          <ClipboardCheck size={16} /> Monthly ROI Audits
        </button>
        <button onClick={() => setActiveTab('cash-pipeline')} style={{ background: activeTab === 'cash-pipeline' ? 'rgba(212,175,55,0.2)' : 'transparent', color: activeTab === 'cash-pipeline' ? '#D4AF37' : '#94a3b8', border: activeTab === 'cash-pipeline' ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
          <DollarSign size={16} /> Cash Advisory Pipeline
        </button>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {loading ? (
           <div style={{ textAlign: 'center', padding: '5rem', color: '#3b82f6' }}>
             <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
             <p style={{ color: '#94a3b8' }}>Syncing Ledger Data...</p>
           </div>
        ) : !kamProfile ? (
           <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderColor: 'rgba(59,130,246,0.3)' }}>
             <ShieldCheck size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
             <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No KAM Profile Found</h3>
             <p style={{ color: '#94a3b8' }}>Your account is not configured as a Key Account Manager. Contact Admin.</p>
          </div>
        ) : (
          <>
            {/* HEADER BAR */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <span className="badge-gold" style={{ marginBottom: '0.4rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>Field Operations & Transparency</span>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                  {activeTab === 'audits' ? 'Unilever-Style Monthly Business Audit' : 'Cash Advisory Pipeline'}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.2rem 0 0 0' }}>
                  {activeTab === 'audits' ? 'Enforcing strict financial integrity via physical KAM inspections.' : 'Manage High-Net-Worth block trading requests and meetings.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                {/* CURRENCY SELECTOR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                  <Globe size={16} style={{ color: '#3b82f6' }} />
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {Object.keys(CURRENCY_RATES).map(code => (
                      <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                        {CURRENCY_RATES[code].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </header>

            {/* AUDIT FORM & ASSET INSPECTION */}
            {activeTab === 'audits' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              
              {/* LEFT: UNILEVER BALANCE SHEET FORM */}
              <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.4)', padding: '2rem', height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Monthly Financial Balance Sheet</h2>
                  
                  {businesses.length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No Businesses</span>
                  ) : (
                    <select 
                      value={selectedBusinessId} 
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', outline: 'none' }}
                    >
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.brand_name} (Curr Score: {b.ai_health_score})</option>
                      ))}
                    </select>
                  )}
                </div>

                {auditSubmitted ? (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                    <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Audit Verified & Logged</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Business AI Health Score has been updated transparently for investors.</p>
                  </div>
                ) : businesses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                    No businesses are registered in the system yet.
                  </div>
                ) : (
                  <form onSubmit={handleAuditSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Physical Cash in Hand</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={cashInHand} onChange={(e) => setCashInHand(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Total Stock / Inventory Valuation</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={stockInvestment} onChange={(e) => setStockInvestment(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Receivables from Market</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={receivablesMarket} onChange={(e) => setReceivablesMarket(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Receivables from Company (e.g. FoodPanda)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={receivablesCompany} onChange={(e) => setReceivablesCompany(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Pending Payables (Suppliers, Rent)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={payables} onChange={(e) => setPayables(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem', borderColor: 'rgba(239,68,68,0.3)' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Monthly Payroll & Staff Expense</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>{CURRENCY_RATES[currency].symbol}</span>
                          <input type="number" required value={payrollExpense} onChange={(e) => setPayrollExpense(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem', borderColor: 'rgba(239,68,68,0.3)' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                    <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
                      Submit Verified Audit to Supabase
                    </button>
                  </form>
                )}
              </div>

              {/* RIGHT: PHYSICAL ASSET & SCORE CARD */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* AI HEALTH SCORE PREVIEW */}
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(7,10,20,0.8))', borderColor: 'rgba(16,185,129,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                      <BarChart2 size={24} />
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Projected New Health Score</p>
                      <h3 style={{ fontSize: '2rem', color: '#10b981', margin: 0, fontWeight: '800' }}>{calculatedHealthScore}/100</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    This score combines the <strong>Founder Track Record (40%)</strong> with this newly logged <strong>Monthly ROI & Asset Audit (60%)</strong>. Investors see this instantly on the Public Profile.
                  </p>
                </div>

                {/* FIELD ASSET INSPECTION */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={18} style={{ color: '#3b82f6' }} /> Field Asset Inspection
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Take live photos of franchise assets to prove collateral backing for investors.
                  </p>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px dashed rgba(59,130,246,0.4)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Specialty Espresso Machine</span>
                      <button style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>+ Add Photo</button>
                    </div>
                    <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px dashed rgba(59,130,246,0.4)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Media 5-Ton AC Cassettes</span>
                      <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={16} /> Verified
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            )}
            {/* CASH ADVISORY PIPELINE TAB */}
            {activeTab === 'cash-pipeline' && (
              <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#D4AF37' }}>Assigned Cash Concierge Tickets</h2>
                </div>
                
                {cashTickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No assigned advisory tickets.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {cashTickets.map(ticket => (
                      <div key={ticket.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{ticket.funding_projects?.project_title}</span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 1rem 0' }}>{formatCurrency(ticket.ticket_amount_bdt, currency)}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                          <div><strong>Client Pseudonym:</strong> {ticket.investors?.alias_name}</div>
                          <div><strong>Status:</strong> <span style={{ color: '#10b981' }}>{ticket.status.replace('_', ' ')}</span></div>
                          <div style={{ gridColumn: 'span 2' }}><strong>Meeting Preference:</strong> {ticket.preferred_meeting_time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Ensure tabBtnStyle is defined or removed if not needed since we replaced it inline

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#3b82f6' : '#94a3b8',
    border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
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
