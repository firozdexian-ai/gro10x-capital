'use client';
import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, PieChart, DollarSign, Percent, ShieldCheck, 
  ArrowUpRight, Globe, BarChart3, LineChart, ChevronRight, CheckCircle2, Sliders
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function FinancialModelPage() {
  const [currency, setCurrency] = useState('BDT');

  // DCF Model Inputs
  const [initialMonthlySales, setInitialMonthlySales] = useState(3000000); // BDT 30 Lakhs
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(3); // 3% MoM
  const [netMarginPct, setNetMarginPct] = useState(18); // 18% Net Margin
  const [discountRate, setDiscountRate] = useState(14); // 14% Discount Rate
  const [exitMultiple, setExitMultiple] = useState(4.5); // 4.5x EBITDA

  // Cap Table Inputs
  const [preMoneyValuation, setPreMoneyValuation] = useState(50000000); // BDT 5 Crore
  const [investmentAmount, setInvestmentAmount] = useState(10000000); // BDT 1 Crore

  // Calculate 12-Month Projected Sales & Cash Flows
  let projectedsales = [];
  let currentSales = initialMonthlySales;
  let total12MoCashFlow = 0;

  for (let m = 1; m <= 12; m++) {
    const monthlyNetProfit = currentSales * (netMarginPct / 100);
    total12MoCashFlow += monthlyNetProfit;
    projectedsales.push({
      month: `M${m}`,
      sales: currentSales,
      profit: monthlyNetProfit
    });
    currentSales = currentSales * (1 + monthlyGrowthRate / 100);
  }

  // Enterprise Valuation Calculation
  const annualEbitda = total12MoCashFlow;
  const terminalValue = annualEbitda * exitMultiple;
  const npvValuation = total12MoCashFlow / (1 + discountRate / 100) + terminalValue / (1 + discountRate / 100);
  const calculatedIrr = (annualEbitda / investmentAmount) * 100;

  // Cap Table Calculations
  const postMoneyValuation = preMoneyValuation + investmentAmount;
  const investorEquityPct = (investmentAmount / postMoneyValuation) * 100;
  const gro10xStakePct = 10.0; // 10% SPV stake
  const founderEquityPct = 100 - investorEquityPct - gro10xStakePct;

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER BAR */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(168,85,247,0.3)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '900' }}>
            <Calculator size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>FINANCIAL MODEL & <span style={{ color: '#a855f7' }}>VALUATION ENGINE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v2.1 Interactive DCF, Cap Table & IRR Simulator</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#a855f7' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#a855f7', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Showcase <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* TOP STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ borderColor: 'rgba(168,85,247,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Projected 12-Mo Profit</p>
            <h2 style={{ fontSize: '1.8rem', color: '#a855f7', fontWeight: '800', margin: '0.2rem 0' }}>
              {formatCurrency(total12MoCashFlow, currency)}
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.78rem', margin: 0 }}>{netMarginPct}% Net Margin</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>NPV Enterprise Valuation</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800', margin: '0.2rem 0' }}>
              {formatCurrency(npvValuation, currency)}
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.78rem', margin: 0 }}>{exitMultiple}x EBITDA Multiple</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Calculated IRR</p>
            <h2 style={{ fontSize: '1.8rem', color: '#D4AF37', fontWeight: '800', margin: '0.2rem 0' }}>
              {calculatedIrr.toFixed(1)}%
            </h2>
            <p style={{ color: '#D4AF37', fontSize: '0.78rem', margin: 0 }}>Annualized Yield</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Post-Money Valuation</p>
            <h2 style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: '800', margin: '0.2rem 0' }}>
              {formatCurrency(postMoneyValuation, currency)}
            </h2>
            <p style={{ color: '#3b82f6', fontSize: '0.78rem', margin: 0 }}>Cap Table Verified</p>
          </div>
        </div>

        {/* TWO COLUMN WORKSPACE: DCF SIMULATOR & CAP TABLE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
          
          {/* LEFT: DCF CASH FLOW SIMULATOR */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} style={{ color: '#a855f7' }} /> Discounted Cash Flow (DCF) Controls
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>Baseline Monthly Revenue</span>
                  <strong style={{ color: '#a855f7' }}>{formatCurrency(initialMonthlySales, currency)}</strong>
                </div>
                <input 
                  type="range" 
                  min="1000000" 
                  max="10000000" 
                  step="500000" 
                  value={initialMonthlySales} 
                  onChange={(e) => setInitialMonthlySales(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>MoM Growth Rate</span>
                  <strong style={{ color: '#10b981' }}>{monthlyGrowthRate}% / month</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5" 
                  value={monthlyGrowthRate} 
                  onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>Target Net Margin %</span>
                  <strong style={{ color: '#D4AF37' }}>{netMarginPct}% Net Profit</strong>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="35" 
                  step="1" 
                  value={netMarginPct} 
                  onChange={(e) => setNetMarginPct(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: '#D4AF37' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Discount Rate (WACC %)</label>
                  <input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Exit Multiple (x EBITDA)</label>
                  <input type="number" step="0.5" value={exitMultiple} onChange={(e) => setExitMultiple(Number(e.target.value))} className="form-input" />
                </div>
              </div>
            </div>

            {/* MONTHLY PROJECTION MINI TABLE */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '1rem' }}>12-Month Growth Forecast Preview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
                {projectedsales.slice(0, 6).map((p, idx) => (
                  <div key={idx} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontWeight: '700' }}>{p.month}</div>
                    <div style={{ color: '#10b981', margin: '0.2rem 0' }}>{formatCurrency(p.profit, currency)}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: CAP TABLE & EQUITY DILUTION SIMULATOR */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} style={{ color: '#3b82f6' }} /> Cap Table & Equity Dilution
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Pre-Money Business Valuation</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                  <input 
                    type="number" 
                    value={Math.round(preMoneyValuation * CURRENCY_RATES[currency].rate)} 
                    onChange={(e) => setPreMoneyValuation(Number(e.target.value) / CURRENCY_RATES[currency].rate)} 
                    className="form-input" 
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Target Capital Raise</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                  <input 
                    type="number" 
                    value={Math.round(investmentAmount * CURRENCY_RATES[currency].rate)} 
                    onChange={(e) => setInvestmentAmount(Number(e.target.value) / CURRENCY_RATES[currency].rate)} 
                    className="form-input" 
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>
            </div>

            {/* CAP TABLE SPLIT BAR */}
            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '1rem' }}>Post-Round Shareholding Split</h3>
              
              <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden', display: 'flex', marginBottom: '1.25rem' }}>
                <div style={{ width: `${founderEquityPct}%`, height: '100%', background: '#3b82f6' }}></div>
                <div style={{ width: `${investorEquityPct}%`, height: '100%', background: '#10b981' }}></div>
                <div style={{ width: `${gro10xStakePct}%`, height: '100%', background: '#D4AF37' }}></div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }}></span> Founder Equity
                  </span>
                  <strong style={{ color: '#3b82f6' }}>{founderEquityPct.toFixed(1)}%</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></span> Investor Pool
                  </span>
                  <strong style={{ color: '#10b981' }}>{investorEquityPct.toFixed(1)}%</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <span style={{ width: '10px', height: '10px', background: '#D4AF37', borderRadius: '50%' }}></span> GRO10X SPV Stake
                  </span>
                  <strong style={{ color: '#D4AF37' }}>{gro10xStakePct.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
