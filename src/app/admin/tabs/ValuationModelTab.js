'use client';
import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, PieChart, Globe, Sliders, BarChart3 
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../../lib/currency';

/**
 * ValuationModelTab — Interactive DCF, Cap Table & IRR Simulator
 * Tab 4 of the GRO10X Admin Panel.
 *
 * Props:
 *   currency        (string)  — inherited from global admin currency state
 *   setCurrency     (fn)      — optional override; if not passed, uses local state
 */
export default function ValuationModelTab({ currency: globalCurrency, setCurrency: setGlobalCurrency }) {
  // Local currency override if not managed globally
  const [localCurrency, setLocalCurrency] = useState('BDT');
  const currency = globalCurrency || localCurrency;
  const setCurrency = setGlobalCurrency || setLocalCurrency;

  // DCF Model Inputs
  const [initialMonthlySales, setInitialMonthlySales] = useState(3000000);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(3);
  const [netMarginPct, setNetMarginPct] = useState(18);
  const [discountRate, setDiscountRate] = useState(14);
  const [exitMultiple, setExitMultiple] = useState(4.5);

  // Cap Table Inputs
  const [preMoneyValuation, setPreMoneyValuation] = useState(50000000);
  const [investmentAmount, setInvestmentAmount] = useState(10000000);

  // Calculate 12-Month Projected Sales & Cash Flows
  let projectedSales = [];
  let currentSales = initialMonthlySales;
  let total12MoCashFlow = 0;

  for (let m = 1; m <= 12; m++) {
    const monthlyNetProfit = currentSales * (netMarginPct / 100);
    total12MoCashFlow += monthlyNetProfit;
    projectedSales.push({ month: `M${m}`, sales: currentSales, profit: monthlyNetProfit });
    currentSales = currentSales * (1 + monthlyGrowthRate / 100);
  }

  // Enterprise Valuation Calculations
  const annualEbitda = total12MoCashFlow;
  const terminalValue = annualEbitda * exitMultiple;
  const npvValuation = total12MoCashFlow / (1 + discountRate / 100) + terminalValue / (1 + discountRate / 100);
  const calculatedIrr = (annualEbitda / investmentAmount) * 100;

  // Cap Table Calculations
  const postMoneyValuation = preMoneyValuation + investmentAmount;
  const investorEquityPct = (investmentAmount / postMoneyValuation) * 100;
  const gro10xStakePct = 10.0;
  const founderEquityPct = 100 - investorEquityPct - gro10xStakePct;

  const irrColor = calculatedIrr >= 25 ? '#10b981' : calculatedIrr >= 15 ? '#D4AF37' : '#ef4444';

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── TOP CONTROL BAR: Title + Currency Selector ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(126,34,206,0.25))', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#a855f7', flexShrink: 0 }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#f8fafc' }}>
              Financial Model & <span style={{ color: '#a855f7' }}>Valuation Engine</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Interactive DCF, Cap Table & IRR Simulator — v2.1</p>
          </div>
        </div>

        {/* Currency Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
          <Globe size={15} style={{ color: '#a855f7' }} />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#a855f7', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', outline: 'none' }}
          >
            {Object.keys(CURRENCY_RATES).map(code => (
              <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                {CURRENCY_RATES[code].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── SUMMARY KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(168,85,247,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BarChart3 size={16} style={{ color: '#a855f7' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projected 12-Mo Profit</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#a855f7' }}>{formatCurrency(total12MoCashFlow, currency)}</h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#10b981' }}>{netMarginPct}% Net Margin</p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NPV Enterprise Value</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(npvValuation, currency)}</h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#10b981' }}>{exitMultiple}x EBITDA Multiple</p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calculator size={16} style={{ color: '#D4AF37' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Calculated IRR</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: irrColor }}>{calculatedIrr.toFixed(1)}%</h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: irrColor }}>Annualized Yield</p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <PieChart size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Post-Money Valuation</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>{formatCurrency(postMoneyValuation, currency)}</h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#3b82f6' }}>Cap Table Verified</p>
        </div>

      </div>

      {/* ── TWO COLUMN WORKSPACE: DCF SIMULATOR & CAP TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>

        {/* LEFT: DCF CASH FLOW SIMULATOR */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
            <Sliders size={18} style={{ color: '#a855f7' }} /> Discounted Cash Flow (DCF) Controls
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Baseline Monthly Revenue</span>
                <strong style={{ color: '#a855f7' }}>{formatCurrency(initialMonthlySales, currency)}</strong>
              </div>
              <input type="range" min="1000000" max="10000000" step="500000" value={initialMonthlySales}
                onChange={(e) => setInitialMonthlySales(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#a855f7' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>MoM Growth Rate</span>
                <strong style={{ color: '#10b981' }}>{monthlyGrowthRate}% / month</strong>
              </div>
              <input type="range" min="0" max="10" step="0.5" value={monthlyGrowthRate}
                onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Net Margin %</span>
                <strong style={{ color: '#D4AF37' }}>{netMarginPct}% Net Profit</strong>
              </div>
              <input type="range" min="10" max="35" step="1" value={netMarginPct}
                onChange={(e) => setNetMarginPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D4AF37' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Discount Rate (WACC %)</label>
                <input type="number" value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))} className="form-input" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Exit Multiple (x EBITDA)</label>
                <input type="number" step="0.5" value={exitMultiple}
                  onChange={(e) => setExitMultiple(Number(e.target.value))} className="form-input" />
              </div>
            </div>
          </div>

          {/* 12-MONTH GROWTH FORECAST MINI TABLE */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.85rem', fontWeight: '700' }}>12-Month Growth Forecast Preview</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.72rem' }}>
              {projectedSales.slice(0, 6).map((p, idx) => (
                <div key={idx} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#94a3b8', fontWeight: '700' }}>{p.month}</div>
                  <div style={{ color: '#10b981', marginTop: '0.2rem' }}>{formatCurrency(p.profit, currency)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.72rem', marginTop: '0.4rem' }}>
              {projectedSales.slice(6, 12).map((p, idx) => (
                <div key={idx + 6} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#94a3b8', fontWeight: '700' }}>{p.month}</div>
                  <div style={{ color: '#10b981', marginTop: '0.2rem' }}>{formatCurrency(p.profit, currency)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CAP TABLE & EQUITY DILUTION SIMULATOR */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
            <PieChart size={18} style={{ color: '#3b82f6' }} /> Cap Table & Equity Dilution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Pre-Money Business Valuation</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem' }}>
                  {CURRENCY_RATES[currency]?.symbol || '৳'}
                </span>
                <input
                  type="number"
                  value={Math.round(preMoneyValuation * (CURRENCY_RATES[currency]?.rate || 1))}
                  onChange={(e) => setPreMoneyValuation(Number(e.target.value) / (CURRENCY_RATES[currency]?.rate || 1))}
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Target Capital Raise</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem' }}>
                  {CURRENCY_RATES[currency]?.symbol || '৳'}
                </span>
                <input
                  type="number"
                  value={Math.round(investmentAmount * (CURRENCY_RATES[currency]?.rate || 1))}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value) / (CURRENCY_RATES[currency]?.rate || 1))}
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                />
              </div>
            </div>
          </div>

          {/* CAP TABLE SPLIT BAR */}
          <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: '700' }}>Post-Round Shareholding Split</h4>

            {/* Visual Bar */}
            <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden', display: 'flex', marginBottom: '1.25rem' }}>
              <div style={{ width: `${Math.max(0, founderEquityPct)}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }}></div>
              <div style={{ width: `${investorEquityPct}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }}></div>
              <div style={{ width: `${gro10xStakePct}%`, height: '100%', background: '#D4AF37', transition: 'width 0.3s ease' }}></div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }}></span>
                  Founder Equity
                </span>
                <strong style={{ color: '#3b82f6' }}>{Math.max(0, founderEquityPct).toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                  Investor Pool
                </span>
                <strong style={{ color: '#10b981' }}>{investorEquityPct.toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <span style={{ width: '10px', height: '10px', background: '#D4AF37', borderRadius: '50%', display: 'inline-block' }}></span>
                  GRO10X SPV Stake
                </span>
                <strong style={{ color: '#D4AF37' }}>{gro10xStakePct.toFixed(1)}%</strong>
              </div>
            </div>

            {/* Computed Summary Row */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Post-Money Val.</div>
                <div style={{ color: '#10b981', fontWeight: '800' }}>{formatCurrency(postMoneyValuation, currency)}</div>
              </div>
              <div style={{ background: irrColor === '#10b981' ? 'rgba(16,185,129,0.08)' : irrColor === '#D4AF37' ? 'rgba(212,175,55,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${irrColor}30`, padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Annualized IRR</div>
                <div style={{ color: irrColor, fontWeight: '800' }}>{calculatedIrr.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
