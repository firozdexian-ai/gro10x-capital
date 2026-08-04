'use client';
import React, { useState } from 'react';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function KamDashboard() {
  const [currency, setCurrency] = useState('BDT');
  const [selectedBusiness, setSelectedBusiness] = useState('ORO Roasters - Mirpur');
  
  // Unilever-style Audit Form State
  const [cashInHand, setCashInHand] = useState(45000);
  const [receivablesMarket, setReceivablesMarket] = useState(12000);
  const [receivablesCompany, setReceivablesCompany] = useState(0);
  const [payables, setPayables] = useState(105000);
  const [stockInvestment, setStockInvestment] = useState(250000);
  const [payrollExpense, setPayrollExpense] = useState(135000);

  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    setAuditSubmitted(true);
    setTimeout(() => setAuditSubmitted(false), 3000);
  };

  const calculatedHealthScore = 88; // Example static score for UI preview

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', background: 'rgba(15, 23, 42, 0.8)', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #1e40af)', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '900' }}>K</div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>INTERNAL <span style={{ color: '#3b82f6' }}>KAM</span></span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Key Account Manager Hub</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button style={navBtnStyle(false)}>
            <Building2 size={18} /> Enlist New Business
          </button>
          <button style={navBtnStyle(true)}>
            <ClipboardCheck size={18} /> Monthly ROI Audits
          </button>
          <button style={navBtnStyle(false)}>
            <TrendingUp size={18} /> Deal Promotion Link
          </button>
        </nav>

        <div style={{ marginTop: 'auto', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>KAM Audit Score</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>Top 5% Auditor</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        
        {/* HEADER BAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge-gold" style={{ marginBottom: '0.4rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>Field Operations & Transparency</span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Unilever-Style Monthly Business Audit</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.2rem 0 0 0' }}>Enforcing strict financial integrity via physical KAM inspections.</p>
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
            
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '600' }}>
              Main Portal <ArrowUpRight size={16} />
            </a>
          </div>
        </header>

        {/* AUDIT FORM & ASSET INSPECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          
          {/* LEFT: UNILEVER BALANCE SHEET FORM */}
          <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.4)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Monthly Financial Balance Sheet</h2>
              <select 
                value={selectedBusiness} 
                onChange={(e) => setSelectedBusiness(e.target.value)}
                style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', outline: 'none' }}
              >
                <option>ORO Roasters - Mirpur</option>
                <option>ORO Roasters - Banani</option>
                <option>Segreto Hub - Dhanmondi</option>
              </select>
            </div>

            {auditSubmitted ? (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Audit Verified & Logged</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Business AI Health Score has been updated transparently for investors.</p>
              </div>
            ) : (
              <form onSubmit={handleAuditSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Physical Cash in Hand</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(cashInHand * CURRENCY_RATES[currency].rate)} onChange={(e) => setCashInHand(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Total Stock / Inventory Valuation</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(stockInvestment * CURRENCY_RATES[currency].rate)} onChange={(e) => setStockInvestment(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Receivables from Market</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(receivablesMarket * CURRENCY_RATES[currency].rate)} onChange={(e) => setReceivablesMarket(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Receivables from Company (e.g. FoodPanda)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(receivablesCompany * CURRENCY_RATES[currency].rate)} onChange={(e) => setReceivablesCompany(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Pending Payables (Suppliers, Rent)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(payables * CURRENCY_RATES[currency].rate)} onChange={(e) => setPayables(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem', borderColor: 'rgba(239,68,68,0.3)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Monthly Payroll & Staff Expense</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>{CURRENCY_RATES[currency].symbol}</span>
                      <input type="number" value={Math.round(payrollExpense * CURRENCY_RATES[currency].rate)} onChange={(e) => setPayrollExpense(Number(e.target.value) / CURRENCY_RATES[currency].rate)} className="form-input" style={{ paddingLeft: '2.5rem', borderColor: 'rgba(239,68,68,0.3)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                <button type="submit" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} /> Submit Verified Audit to Supabase
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
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Business AI Health Score</p>
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
      </main>
    </div>
  );
}

function navBtnStyle(active) {
  return {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: 'none',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#3b82f6' : '#94a3b8',
    fontWeight: active ? '700' : '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease'
  };
}
