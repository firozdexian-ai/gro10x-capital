'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, PieChart, Globe, Sliders, BarChart3, 
  Layers, Save, RotateCcw, Check, Copy, ArrowRight, ShieldCheck, 
  Sparkles, DollarSign, Percent, Building2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../../lib/currency';
import { supabase } from '../../../lib/supabase';

/** Preset Modeling Scenarios */
const SCENARIO_PRESETS = [
  { id: 'conservative', label: 'Conservative', growth: 1.5, margin: 14, discount: 16, multiple: 3.5 },
  { id: 'base', label: 'Base Case (Target)', growth: 3.0, margin: 18, discount: 14, multiple: 4.5 },
  { id: 'aggressive', label: 'Aggressive Scale', growth: 5.5, margin: 22, discount: 12, multiple: 6.0 },
];

/** Shorthand Bengali/Crore currency formatter helper */
function formatShorthand(val, curr = 'BDT') {
  const num = Number(val) || 0;
  const rate = CURRENCY_RATES[curr]?.rate || 1;
  const symbol = CURRENCY_RATES[curr]?.symbol || '৳';
  const converted = num * rate;

  if (curr === 'BDT') {
    if (converted >= 10000000) {
      return `${symbol}${(converted / 10000000).toFixed(2)} Crore`;
    }
    if (converted >= 100000) {
      return `${symbol}${(converted / 100000).toFixed(1)} Lakhs`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  }

  if (converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(2)}M`;
  }
  if (converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * ValuationModelTab — Production Tab 3.5 for GRO10X Admin Panel.
 * Complete interactive DCF Cash Flow, Cap Table Dilution, and Live Deal Pipeline integration.
 */
export default function ValuationModelTab({
  projects = [],
  businesses = [],
  currency: globalCurrency,
  setCurrency: setGlobalCurrency,
  addToast,
  logPlatformActivity,
  fetchAdminData,
}) {
  // Local currency override if not managed globally
  const [localCurrency, setLocalCurrency] = useState('BDT');
  const currency = globalCurrency || localCurrency;
  const setCurrency = setGlobalCurrency || setLocalCurrency;

  // Selected Project State from Deal Pipeline
  const [selectedProjectId, setSelectedProjectId] = useState('custom');
  const [savingScenario, setSavingScenario] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [activeScenario, setActiveScenario] = useState('base');

  // DCF Model Inputs
  const [initialMonthlySales, setInitialMonthlySales] = useState(3000000); // 30 Lakhs
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(3); // 3% MoM
  const [netMarginPct, setNetMarginPct] = useState(18); // 18% Net Margin
  const [discountRate, setDiscountRate] = useState(14); // 14% Discount Rate
  const [exitMultiple, setExitMultiple] = useState(4.5); // 4.5x EBITDA

  // Cap Table Inputs
  const [preMoneyValuation, setPreMoneyValuation] = useState(50000000); // 5 Crore
  const [investmentAmount, setInvestmentAmount] = useState(10000000); // 1 Crore

  // Active Project Reference
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Sync model with selected project
  useEffect(() => {
    if (selectedProject) {
      const targetRaise = Number(selectedProject.target_raise_bdt) || 10000000;
      setInvestmentAmount(targetRaise);
      // Sensible pre-money heuristic: 3.5x - 5x target raise or default 5 Cr
      setPreMoneyValuation(Math.max(30000000, targetRaise * 4));
      
      // Auto-set baseline revenue heuristic based on target raise
      if (targetRaise <= 15000000) {
        setInitialMonthlySales(2500000);
      } else if (targetRaise <= 30000000) {
        setInitialMonthlySales(4500000);
      } else {
        setInitialMonthlySales(8000000);
      }
    }
  }, [selectedProjectId]);

  // Apply Preset Scenario
  const handleApplyPreset = (preset) => {
    setActiveScenario(preset.id);
    setMonthlyGrowthRate(preset.growth);
    setNetMarginPct(preset.margin);
    setDiscountRate(preset.discount);
    setExitMultiple(preset.multiple);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setSelectedProjectId('custom');
    setActiveScenario('base');
    setInitialMonthlySales(3000000);
    setMonthlyGrowthRate(3);
    setNetMarginPct(18);
    setDiscountRate(14);
    setExitMultiple(4.5);
    setPreMoneyValuation(50000000);
    setInvestmentAmount(10000000);
  };

  // Safe Financial Computations
  const safePreMoney = Math.max(100000, Number(preMoneyValuation) || 0);
  const safeInvestment = Math.max(100000, Number(investmentAmount) || 0);
  const safeDiscountRate = Math.max(1, Number(discountRate) || 14);
  const safeExitMultiple = Math.max(0.5, Number(exitMultiple) || 4.5);

  // Calculate 12-Month Projected Sales & Cash Flows
  let projectedSales = [];
  let currentSales = initialMonthlySales;
  let total12MoCashFlow = 0;
  let total12MoRevenue = 0;

  for (let m = 1; m <= 12; m++) {
    const monthlyNetProfit = currentSales * (netMarginPct / 100);
    total12MoCashFlow += monthlyNetProfit;
    total12MoRevenue += currentSales;
    projectedSales.push({ 
      month: `M${m}`, 
      sales: currentSales, 
      profit: monthlyNetProfit 
    });
    currentSales = currentSales * (1 + (monthlyGrowthRate / 100));
  }

  // Enterprise Valuation Calculations
  const annualEbitda = total12MoCashFlow;
  const terminalValue = annualEbitda * safeExitMultiple;
  const discountFactor = 1 + (safeDiscountRate / 100);
  const npvValuation = Math.round((total12MoCashFlow / discountFactor) + (terminalValue / discountFactor));
  const calculatedIrr = safeInvestment > 0 ? (annualEbitda / safeInvestment) * 100 : 0;

  // Cap Table Calculations (Guarded against div-by-zero)
  const postMoneyValuation = safePreMoney + safeInvestment;
  const investorEquityPct = postMoneyValuation > 0 
    ? Math.min(100, Math.max(0, (safeInvestment / postMoneyValuation) * 100))
    : 0;
  const gro10xStakePct = 10.0; // 10% Standard SPV Manager Stake
  const founderEquityPct = Math.max(0, 100 - investorEquityPct - gro10xStakePct);

  const irrColor = calculatedIrr >= 25 ? '#10b981' : calculatedIrr >= 15 ? '#D4AF37' : '#ef4444';

  // Save Valuation Scenario back to Supabase funding_projects
  const handleSaveScenarioToProject = async () => {
    if (!selectedProject) {
      if (addToast) addToast('Please select a project from the Deal Pipeline first.', 'warning');
      return;
    }

    setSavingScenario(true);
    try {
      const roundedEquity = Number(investorEquityPct.toFixed(1));
      const roundedIrr = Number(calculatedIrr.toFixed(1));

      const { error } = await supabase
        .from('funding_projects')
        .update({
          target_raise_bdt: safeInvestment,
          equity_investor_share: roundedEquity,
          yield_option_1_rate: Math.round(roundedIrr * 0.4),
          yield_option_2_rate: Math.round(roundedIrr * 0.6),
          yield_option_3_rate: Math.round(roundedIrr),
        })
        .eq('id', selectedProject.id);

      if (error) throw error;

      if (addToast) addToast(`Valuation parameters saved to "${selectedProject.project_title}"!`, 'success');
      if (logPlatformActivity) {
        logPlatformActivity(
          'Valuation Scenario Saved',
          `Saved DCF & Cap Table (NPV: ${formatCurrency(npvValuation, currency)}, IRR: ${roundedIrr}%, Investor Equity: ${roundedEquity}%) for "${selectedProject.project_title}"`,
          'success'
        );
      }
      if (fetchAdminData) fetchAdminData();
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to save valuation scenario', 'error');
    } finally {
      setSavingScenario(false);
    }
  };

  // Copy Valuation Summary to Clipboard
  const handleCopySummary = () => {
    const summaryText = `
=== GRO10X VALUATION & DCF SUMMARY ===
Project: ${selectedProject ? selectedProject.project_title : 'Custom Model'}
Currency: ${currency}

• Pre-Money Valuation: ${formatCurrency(safePreMoney, currency)} (${formatShorthand(safePreMoney, currency)})
• Target Raise: ${formatCurrency(safeInvestment, currency)} (${formatShorthand(safeInvestment, currency)})
• Post-Money Valuation: ${formatCurrency(postMoneyValuation, currency)} (${formatShorthand(postMoneyValuation, currency)})

--- CAP TABLE SPLIT ---
• Founder Equity: ${founderEquityPct.toFixed(1)}%
• Investor Pool: ${investorEquityPct.toFixed(1)}%
• GRO10X SPV Stake: ${gro10xStakePct.toFixed(1)}%

--- DCF & RETURN METRICS ---
• Projected 12-Mo Revenue: ${formatCurrency(total12MoRevenue, currency)}
• Projected 12-Mo EBITDA: ${formatCurrency(total12MoCashFlow, currency)} (${netMarginPct}% margin)
• NPV Enterprise Valuation: ${formatCurrency(npvValuation, currency)} (${safeExitMultiple}x EBITDA Multiple)
• Calculated IRR (Annualized): ${calculatedIrr.toFixed(1)}%
=======================================
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
    if (addToast) addToast('Valuation summary copied to clipboard!', 'info');
  };

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── TOP CONTROL BAR: Deal Selector + Presets + Actions ── */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Left: Project Selector from Deal Pipeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D4AF37', fontWeight: '700', fontSize: '0.85rem' }}>
            <Layers size={16} />
            <span>Target Deal:</span>
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              background: '#070a14',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#f8fafc',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              outline: 'none',
              minWidth: '260px',
              cursor: 'pointer'
            }}
          >
            <option value="custom">⚡ Freeform Simulation (Custom Model)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.businesses?.brand_name ? `${p.businesses.brand_name} — ` : ''}{p.project_title} ({p.status || 'Active'})
              </option>
            ))}
          </select>

          {selectedProject && (
            <span className="status-badge status-badge--gold" style={{ fontSize: '0.75rem' }}>
              Linked: {selectedProject.spv_name || 'SPV Entity'}
            </span>
          )}
        </div>

        {/* Right: Presets & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          
          {/* Preset Buttons */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            {SCENARIO_PRESETS.map(preset => {
              const isActive = activeScenario === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? '#D4AF37' : 'transparent',
                    color: isActive ? '#000' : '#94a3b8',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Currency Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', padding: '0.35rem 0.65rem', borderRadius: '8px' }}>
            <Globe size={14} style={{ color: '#a855f7' }} />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#a855f7', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetDefaults}
            className="btn-outline"
            title="Reset to default baseline"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '8px', color: '#94a3b8' }}
          >
            <RotateCcw size={14} />
          </button>

        </div>

      </div>

      {/* ── 4-CARD SUMMARY INTELLIGENCE STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Projected 12-Mo Profit */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(168,85,247,0.35)', background: 'linear-gradient(180deg, rgba(168,85,247,0.06), rgba(15,23,42,0.4))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projected 12-Mo Profit</span>
            <BarChart3 size={15} style={{ color: '#a855f7' }} />
          </div>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.6rem', fontWeight: '800', color: '#a855f7' }}>
            {formatShorthand(total12MoCashFlow, currency)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Exact: {formatCurrency(total12MoCashFlow, currency)}</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>{netMarginPct}% Net Margin</span>
          </div>
        </div>

        {/* Card 2: NPV Enterprise Valuation */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(16,185,129,0.35)', background: 'linear-gradient(180deg, rgba(16,185,129,0.06), rgba(15,23,42,0.4))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NPV Enterprise Value</span>
            <TrendingUp size={15} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
            {formatShorthand(npvValuation, currency)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Exact: {formatCurrency(npvValuation, currency)}</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>{safeExitMultiple}x EBITDA</span>
          </div>
        </div>

        {/* Card 3: Calculated Annualized IRR */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.35)', background: 'linear-gradient(180deg, rgba(212,175,55,0.06), rgba(15,23,42,0.4))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Calculated Yield (IRR)</span>
            <Calculator size={15} style={{ color: '#D4AF37' }} />
          </div>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.6rem', fontWeight: '800', color: irrColor }}>
            {calculatedIrr.toFixed(1)}%
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Annualized ROI</span>
            <span style={{ color: irrColor, fontWeight: '700' }}>
              {calculatedIrr >= 25 ? 'High Yield' : calculatedIrr >= 15 ? 'Target Return' : 'Sub-optimal'}
            </span>
          </div>
        </div>

        {/* Card 4: Post-Money Valuation */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.35)', background: 'linear-gradient(180deg, rgba(59,130,246,0.06), rgba(15,23,42,0.4))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Post-Money Valuation</span>
            <PieChart size={15} style={{ color: '#3b82f6' }} />
          </div>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.6rem', fontWeight: '800', color: '#3b82f6' }}>
            {formatShorthand(postMoneyValuation, currency)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Exact: {formatCurrency(postMoneyValuation, currency)}</span>
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>Cap Table Verified</span>
          </div>
        </div>

      </div>

      {/* ── TWO COLUMN WORKSPACE: DCF SIMULATOR & CAP TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>

        {/* LEFT: DCF CASH FLOW SIMULATOR */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
              <Sliders size={18} style={{ color: '#a855f7' }} /> Discounted Cash Flow (DCF) Controls
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#a855f7', background: 'rgba(168,85,247,0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
              12-Month Projections
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Control 1: Baseline Monthly Revenue */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#94a3b8' }}>Baseline Monthly Revenue</span>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#a855f7', fontSize: '0.95rem' }}>{formatShorthand(initialMonthlySales, currency)}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>({formatCurrency(initialMonthlySales, currency)}/mo)</span>
                </div>
              </div>
              <input 
                type="range" 
                min="500000" 
                max="15000000" 
                step="250000" 
                value={initialMonthlySales}
                onChange={(e) => setInitialMonthlySales(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#a855f7' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                <span>৳5.0 Lakhs</span>
                <span>৳50.0 Lakhs</span>
                <span>৳1.5 Crore/mo</span>
              </div>
            </div>

            {/* Control 2: MoM Growth Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#94a3b8' }}>Month-over-Month Growth Rate</span>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{monthlyGrowthRate}% / month</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="12" 
                step="0.5" 
                value={monthlyGrowthRate}
                onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                <span>0% (Flat)</span>
                <span>3.0% (Organic)</span>
                <span>6.0% (Scaling)</span>
                <span>12% (Hyper-growth)</span>
              </div>
            </div>

            {/* Control 3: Net Profit Margin */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Net Profit Margin</span>
                <strong style={{ color: '#D4AF37', fontSize: '0.95rem' }}>{netMarginPct}% Net Margin</strong>
              </div>
              <input 
                type="range" 
                min="5" 
                max="40" 
                step="1" 
                value={netMarginPct}
                onChange={(e) => setNetMarginPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D4AF37' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                <span>5% (Retail)</span>
                <span>18% (F&B Baseline)</span>
                <span>30% (Specialty Franchise)</span>
                <span>40%</span>
              </div>
            </div>

            {/* Control 4 & 5: Discount Rate & Exit Multiple */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Discount Rate (WACC %)
                </label>
                <input 
                  type="number" 
                  min="5" 
                  max="35" 
                  step="0.5" 
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))} 
                  className="form-input"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }} 
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>Cost of Capital benchmark</span>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Exit Multiple (x EBITDA)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  step="0.5" 
                  value={exitMultiple}
                  onChange={(e) => setExitMultiple(Number(e.target.value))} 
                  className="form-input"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }} 
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>Terminal valuation factor</span>
              </div>
            </div>

          </div>

          {/* 12-MONTH GROWTH FORECAST MATRIX */}
          <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, fontWeight: '700' }}>12-Month Cash Flow Matrix</h4>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                Annual Profit: {formatShorthand(total12MoCashFlow, currency)}
              </span>
            </div>

            {/* Row 1: M1 to M6 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem', textAlign: 'center', fontSize: '0.7rem' }}>
              {projectedSales.slice(0, 6).map((p, idx) => (
                <div key={idx} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.45rem 0.25rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#94a3b8', fontWeight: '700' }}>{p.month}</div>
                  <div style={{ color: '#10b981', marginTop: '0.15rem', fontWeight: '600', fontSize: '0.68rem' }}>
                    {formatShorthand(p.profit, currency)}
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: M7 to M12 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem', textAlign: 'center', fontSize: '0.7rem', marginTop: '0.35rem' }}>
              {projectedSales.slice(6, 12).map((p, idx) => (
                <div key={idx + 6} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.45rem 0.25rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#94a3b8', fontWeight: '700' }}>{p.month}</div>
                  <div style={{ color: '#10b981', marginTop: '0.15rem', fontWeight: '600', fontSize: '0.68rem' }}>
                    {formatShorthand(p.profit, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: CAP TABLE & EQUITY DILUTION SIMULATOR */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
              <PieChart size={18} style={{ color: '#3b82f6' }} /> Cap Table & Equity Dilution
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
              SPV Split Engine
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            {/* Input 1: Pre-Money Valuation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>Pre-Money Valuation</span>
                <strong style={{ color: '#3b82f6' }}>= {formatShorthand(safePreMoney, currency)}</strong>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
                  {CURRENCY_RATES[currency]?.symbol || '৳'}
                </span>
                <input
                  type="number"
                  step="1000000"
                  value={Math.round(safePreMoney * (CURRENCY_RATES[currency]?.rate || 1))}
                  onChange={(e) => setPreMoneyValuation(Number(e.target.value) / (CURRENCY_RATES[currency]?.rate || 1))}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                />
              </div>

              {/* Pre-Money Preset Chips */}
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {[20000000, 35000000, 50000000, 80000000, 120000000].map(val => (
                  <button
                    key={val}
                    onClick={() => setPreMoneyValuation(val)}
                    style={{
                      background: safePreMoney === val ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.04)',
                      border: safePreMoney === val ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                      color: safePreMoney === val ? '#fff' : '#94a3b8',
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {formatShorthand(val, currency)}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Target Capital Raise */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>Target Capital Raise</span>
                <strong style={{ color: '#10b981' }}>= {formatShorthand(safeInvestment, currency)}</strong>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
                  {CURRENCY_RATES[currency]?.symbol || '৳'}
                </span>
                <input
                  type="number"
                  step="1000000"
                  value={Math.round(safeInvestment * (CURRENCY_RATES[currency]?.rate || 1))}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value) / (CURRENCY_RATES[currency]?.rate || 1))}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                />
              </div>

              {/* Raise Preset Chips */}
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {[5000000, 10000000, 20000000, 30000000, 50000000].map(val => (
                  <button
                    key={val}
                    onClick={() => setInvestmentAmount(val)}
                    style={{
                      background: safeInvestment === val ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.04)',
                      border: safeInvestment === val ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      color: safeInvestment === val ? '#fff' : '#94a3b8',
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {formatShorthand(val, currency)}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* POST-ROUND SHAREHOLDING SPLIT CARD */}
          <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, fontWeight: '700' }}>Post-Round Shareholding Split</h4>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total: 100%</span>
            </div>

            {/* Tri-Color Split Progress Bar */}
            <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden', display: 'flex', marginBottom: '1rem' }}>
              <div 
                style={{ width: `${Math.max(0, founderEquityPct)}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }} 
                title={`Founder Equity: ${founderEquityPct.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${investorEquityPct}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }} 
                title={`Investor Pool: ${investorEquityPct.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${gro10xStakePct}%`, height: '100%', background: '#D4AF37', transition: 'width 0.3s ease' }} 
                title={`GRO10X Stake: ${gro10xStakePct.toFixed(1)}%`}
              />
            </div>

            {/* Shareholder Breakdown Rows */}
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.82rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1' }}>
                  <span style={{ width: '9px', height: '9px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }}></span>
                  Founder Equity
                </span>
                <div>
                  <strong style={{ color: '#3b82f6' }}>{Math.max(0, founderEquityPct).toFixed(1)}%</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.35rem' }}>
                    ({formatShorthand(postMoneyValuation * (founderEquityPct / 100), currency)})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1' }}>
                  <span style={{ width: '9px', height: '9px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                  Investor Allocation Pool
                </span>
                <div>
                  <strong style={{ color: '#10b981' }}>{investorEquityPct.toFixed(1)}%</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.35rem' }}>
                    ({formatShorthand(safeInvestment, currency)})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1' }}>
                  <span style={{ width: '9px', height: '9px', background: '#D4AF37', borderRadius: '50%', display: 'inline-block' }}></span>
                  GRO10X SPV Manager Stake
                </span>
                <div>
                  <strong style={{ color: '#D4AF37' }}>{gro10xStakePct.toFixed(1)}%</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.35rem' }}>
                    ({formatShorthand(postMoneyValuation * (gro10xStakePct / 100), currency)})
                  </span>
                </div>
              </div>

            </div>

            {/* Computed Mini Metrics */}
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '0.15rem' }}>Post-Money Valuation</div>
                <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.88rem' }}>{formatShorthand(postMoneyValuation, currency)}</div>
              </div>
              <div style={{ background: irrColor === '#10b981' ? 'rgba(16,185,129,0.08)' : irrColor === '#D4AF37' ? 'rgba(212,175,55,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${irrColor}30`, padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '0.15rem' }}>Annualized Yield (IRR)</div>
                <div style={{ color: irrColor, fontWeight: '800', fontSize: '0.88rem' }}>{calculatedIrr.toFixed(1)}% / yr</div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── BOTTOM ACTION STRIP: Save to Deal & Export ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderColor: selectedProject ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedProject ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: selectedProject ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', color: selectedProject ? '#D4AF37' : '#94a3b8' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
              {selectedProject ? `Sync Valuation with "${selectedProject.project_title}"` : 'Model Export & Persistence'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              {selectedProject 
                ? `Applies target raise (${formatShorthand(safeInvestment, currency)}) and ${investorEquityPct.toFixed(1)}% equity share to live campaign.` 
                : 'Select a project from the top dropdown to persist valuation scenarios back to the Deal Pipeline.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          
          <button
            onClick={handleCopySummary}
            className="btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.82rem', borderRadius: '8px', color: '#cbd5e1' }}
          >
            {copiedSummary ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            {copiedSummary ? 'Summary Copied!' : 'Copy Summary'}
          </button>

          {selectedProject && (
            <button
              onClick={handleSaveScenarioToProject}
              disabled={savingScenario}
              className="btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', fontWeight: '700' }}
            >
              <Save size={15} />
              {savingScenario ? 'Saving...' : 'Save to Deal Pipeline'}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
