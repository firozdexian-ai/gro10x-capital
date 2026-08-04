'use client';
import React, { useState } from 'react';
import { 
  TrendingUp, Building2, ShieldCheck, RefreshCw, ChevronRight, 
  ArrowUpRight, Users, Lock, Zap, DollarSign, Award, CheckCircle2,
  Calendar, Layers, BarChart3, HelpCircle, Globe, Shield, Info, Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CURRENCY_RATES, formatCurrency } from '../lib/currency';

const livePerformanceData = [
  { month: 'Mar', Mirpur: 38.5, Banani: 25.0 },
  { month: 'Apr', Mirpur: 27.4, Banani: 28.2 },
  { month: 'May', Mirpur: 31.1, Banani: 29.5 },
  { month: 'Jun', Mirpur: 29.3, Banani: 30.3 },
  { month: 'Jul', Mirpur: 32.8, Banani: 34.1 },
];

export default function PublicPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [investmentAmount, setInvestmentAmount] = useState(1500000); // 15 Lakhs BDT
  const [resellMonth, setResellMonth] = useState(6);
  const [resellPremium, setResellPremium] = useState(5);

  // Secondary market calculations
  const monthlyReturnBase = (investmentAmount * 0.20) / 12;
  const projectValuationGain = (investmentAmount * 1.15);
  const sellPriceWithTolerance = projectValuationGain * (1 + resellPremium / 100);

  // Option calculations for Yield Matrix
  const monthlySalesBaseline = 3160000; // Mirpur BDT 31.6L
  const monthlyProfitBaseline = 534000; // Mirpur BDT 5.34L
  const ownershipRatio = investmentAmount / 20000000; // Out of BDT 2 Crore hub CapEx

  const op1Monthly = (monthlySalesBaseline * 0.10) * ownershipRatio;
  const op2Monthly = (monthlySalesBaseline * 0.12) * ownershipRatio;
  const op3Monthly = ((monthlySalesBaseline * 0.05) + (monthlyProfitBaseline * 0.35)) * ownershipRatio;

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. TOP TICKER BAR */}
      <div className="ticker-wrap" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="ticker-move">
          <div className="ticker-item">
            <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>ORO MIRPUR:</span>
            <span>Avg Sales: <strong>{formatCurrency(3160000, currency)}</strong></span>
            <span style={{ color: '#10b981' }}>▲ +16.89% Margin</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>ORO BANANI:</span>
            <span>Launch Month: <strong>{formatCurrency(3030000, currency)}</strong></span>
            <span style={{ color: '#10b981' }}>▲ 19.85% Verified Margin</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>MULTI-CURRENCY ENGINE:</span>
            <span>Switch Viewing Currency (BDT, USD, GBP, AED)</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>SECONDARY MARKET:</span>
            <span>Dynamic Liquidity Pool Active (±10% Corridor)</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR WITH CURRENCY SELECTOR */}
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.25rem' }}>
            G
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>v0.1.1 NRB & HNI Investor Suite</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <a href="/showcase" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '700' }}>⭐ Deal Showcase</a>
          <a href="/funding-rounds" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '600' }}>🎯 Funding Rounds</a>
          <a href="/secondary-market" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>🔄 Secondary Orderbook</a>
          <a href="/pos-sync" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>📊 POS Sync</a>
          <a href="/ai-assistant" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>✨ AI Assistant</a>
          <a href="/buildout-tracker" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>🏗️ Buildout</a>
          <a href="/legal-contracts" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>📜 Contracts</a>
          <a href="/cash-concierge" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>🔒 Cash Concierge</a>
          <a href="/promoter" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '600' }}>🤝 Promoter</a>
          <a href="/investor" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>💼 Investor</a>
          <a href="/kam-dashboard" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>👨‍💼 KAM</a>
          <a href="/admin" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>⚡ Admin</a>
        </nav>

        {/* CURRENCY SELECTOR */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="#concierge" className="btn-gold" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>Investor Access</a>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="container" style={{ padding: '3.5rem 0 2.5rem 0', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '1.5rem' }}>
          <ShieldCheck size={16} /> Transparent • Multi-Currency • NRB & HNI Certified
        </div>

        <h1 style={{ fontSize: '3.3rem', fontWeight: '800', lineHeight: 1.15, maxWidth: '920px', margin: '0 auto 1.5rem auto' }}>
          Invest in High-Margin SME Hubs with <span style={{ background: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Audited Asset Protection</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          Targeting 20% annual ROI backed by hard machinery assets, 25% net margin mandates, and a 6-month secondary share marketplace for NRB and High-Net-Worth investors.
        </p>

        {/* HERO STATS BAR WITH MULTI-CURRENCY CONVERSION */}
        <div className="grid-4" style={{ marginTop: '2.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '20px', padding: '2rem' }}>
          <div>
            <h3 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: '800' }}>20% ROI</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Target Annual Yield</p>
          </div>
          <div>
            <h3 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: '800' }}>{formatCurrency(2000000000, currency)}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>BDT 200 Cr Network Target</p>
          </div>
          <div>
            <h3 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: '800' }}>100 Hubs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>6-Month Expansion Goal</p>
          </div>
          <div>
            <h3 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: '800' }}>80% Secured</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Physical Assets & Equipment</p>
          </div>
        </div>
      </section>

      {/* 4. AUDITED ASSET SAFETY INDEX (VERSION 0.1.1 NEW FEATURE) */}
      <section id="asset-safety" style={{ background: 'linear-gradient(180deg, #070a14 0%, #0f172a 100%)', padding: '4.5rem 0', borderY: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <div className="badge-gold" style={{ marginBottom: '0.75rem' }}>
              <Shield size={14} /> Principal Capital Protection
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '1rem' }}>
              Audited Asset Safety Index
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
              Every BDT 2 Crore hub investment is backed by physical assets, high-value coffee machinery, commercial kitchen equipment, and transferable key-money leasehold value.
            </p>
          </div>

          <div className="grid-4">
            {/* TIER 1: MACHINERY */}
            <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1.4rem' }}>6% CapEx</span>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>100% Resale Liquid</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Specialty Coffee Machinery</h4>
              <p style={{ color: '#D4AF37', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {formatCurrency(1200000, currency)}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Italian Espresso Machines, Grinders, Ice Machines. Direct unencumbered physical asset claims.
              </p>
            </div>

            {/* TIER 2: KITCHEN */}
            <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: '800', fontSize: '1.4rem' }}>11% CapEx</span>
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>80% Resale Value</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Commercial Kitchen Hardware</h4>
              <p style={{ color: '#D4AF37', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {formatCurrency(2200000, currency)}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Deep Chillers, Convection Ovens, Fryers, Stainless Steel Workstations. High liquidation demand.
              </p>
            </div>

            {/* TIER 3: CIVIL FIT-OUT */}
            <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.4rem' }}>59% CapEx</span>
                <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>Leasehold Value</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Cafe Civil & Key-Money Fit-Out</h4>
              <p style={{ color: '#D4AF37', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {formatCurrency(11800000, currency)}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Prime high-street interior, panelling, glasswork. Retains long-term leasehold key-money transfer value.
              </p>
            </div>

            {/* TIER 4: WORKING CAPITAL */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: '800', fontSize: '1.4rem' }}>24% CapEx</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>Operational</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Advance Rent & Launch Ops</h4>
              <p style={{ color: '#D4AF37', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {formatCurrency(4800000, currency)}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                7-Month Security Advance Rent, POS IT infrastructure, CCTV grids, and launch marketing reserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIDE-BY-SIDE YIELD COMPARISON MATRIX (VERSION 0.1.1 NEW FEATURE) */}
      <section className="container" style={{ padding: '4.5rem 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
          <div className="badge-gold" style={{ marginBottom: '0.75rem' }}>
            <BarChart3 size={14} /> Yield Structure Options
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '1rem' }}>
            Choose Your Investment Structure
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
            Adjust your sample investment amount below to compare monthly cash distributions across all 3 yield options in <strong>{currency}</strong>.
          </p>
        </div>

        {/* SAMPLE INVESTMENT SLIDER */}
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Sample Investment Input: <strong style={{ color: '#D4AF37', fontSize: '1.2rem' }}>{formatCurrency(investmentAmount, currency)}</strong>
          </label>
          <input 
            type="range" 
            min="500000" 
            max="20000000" 
            step="500000" 
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#D4AF37' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
            <span>{formatCurrency(500000, currency)} (Min Share)</span>
            <span>{formatCurrency(20000000, currency)} (Full Hub Acquisition)</span>
          </div>
        </div>

        {/* COMPARISON MATRIX CARDS */}
        <div className="grid-3">
          {/* OPTION 1 */}
          <div className="glass-card flex-col" style={{ textAlign: 'center' }}>
            <span className="badge-gold" style={{ margin: '0 auto 1rem auto' }}>Option 1</span>
            <h3 style={{ fontSize: '1.5rem', color: '#D4AF37', marginBottom: '0.4rem' }}>Capped Yield</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              10% Gross Network Sales<br/>Capped at 22% Max Annual ROI
            </p>
            <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Projected Monthly Payout</p>
              <h2 style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>
                {formatCurrency(op1Monthly, currency)} / mo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                ~{formatCurrency(op1Monthly * 12, currency)} / year
              </p>
            </div>
            <ul style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', display: 'grid', gap: '0.5rem', paddingLeft: '1rem' }}>
              <li>✔ Guaranteed top-line gross revenue priority</li>
              <li>✔ Cap protection against market volatility</li>
              <li>✔ Monthly cash distribution to bank/cash</li>
            </ul>
          </div>

          {/* OPTION 2 */}
          <div className="glass-card flex-col" style={{ textAlign: 'center', borderColor: '#D4AF37', boxShadow: '0 10px 30px rgba(212,175,55,0.2)' }}>
            <span className="badge-gold" style={{ margin: '0 auto 1rem auto', background: '#D4AF37', color: '#070a14' }}>Option 2 • Most Popular</span>
            <h3 style={{ fontSize: '1.5rem', color: '#D4AF37', marginBottom: '0.4rem' }}>The Multiplier</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              12% Gross Network Sales<br/>Ends at 1.5X Total Buyout Exit
            </p>
            <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Projected Monthly Payout</p>
              <h2 style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>
                {formatCurrency(op2Monthly, currency)} / mo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Total 1.5X Exit Target: {formatCurrency(investmentAmount * 1.5, currency)}
              </p>
            </div>
            <ul style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', display: 'grid', gap: '0.5rem', paddingLeft: '1rem' }}>
              <li>✔ Higher top-line gross payout (12%)</li>
              <li>✔ Defined 1.5X total buyout return target</li>
              <li>✔ Automatic contract exit upon reaching 1.5X</li>
            </ul>
          </div>

          {/* OPTION 3 */}
          <div className="glass-card flex-col" style={{ textAlign: 'center' }}>
            <span className="badge-gold" style={{ margin: '0 auto 1rem auto' }}>Option 3</span>
            <h3 style={{ fontSize: '1.5rem', color: '#D4AF37', marginBottom: '0.4rem' }}>The Partnership</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              5% Gross Floor Payout<br/>+ 35% Net Profit Share
            </p>
            <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Projected Monthly Payout</p>
              <h2 style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>
                {formatCurrency(op3Monthly, currency)} / mo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                ~{formatCurrency(op3Monthly * 12, currency)} / year
              </p>
            </div>
            <ul style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', display: 'grid', gap: '0.5rem', paddingLeft: '1rem' }}>
              <li>✔ 5% gross sales safety floor</li>
              <li>✔ Unlimited upside via 35% net profit share</li>
              <li>✔ Long-term equity-style participation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. CONCIERGE & CASH SETTLEMENT FORM */}
      <section id="concierge" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #070a14 100%)', padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(212,175,55,0.4)', padding: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="badge-gold" style={{ marginBottom: '0.75rem' }}>
                <Lock size={14} /> Confidential NRB & HNI Onboarding
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>
                Private Wealth & Cash Concierge
              </h2>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '1rem' }}>
                Discrete, white-glove onboarding for expatriates and investors seeking custom agreement terms or offline cash deployment.
              </p>
            </div>

            <form style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Full Name or Confidential Alias</label>
                  <input type="text" placeholder="e.g. Tanvir Ahmed" className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Investor Category</label>
                  <select className="form-input">
                    <option>NRB (Expatriate Investor - UK / USA / Gulf)</option>
                    <option>High Net Worth Individual (HNI)</option>
                    <option>Institutional / Corporate Fund</option>
                    <option>Project Founder (Applying for Capital)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Preferred Contact Channel</label>
                  <input type="text" placeholder="WhatsApp / Signal / Email" className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Target Commitment Amount ({currency})</label>
                  <select className="form-input">
                    <option>{formatCurrency(1500000, currency)} - {formatCurrency(2500000, currency)}</option>
                    <option>{formatCurrency(2500000, currency)} - {formatCurrency(5000000, currency)}</option>
                    <option>{formatCurrency(20000000, currency)} (Full Outlet Acquisition)</option>
                    <option>Custom Concierge / Cash Settlement Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Specific Inquiries or Offline Settlement Details</label>
                <textarea rows={4} placeholder="Let us know if you require a physical outlet visit, private terms, or cash transaction services..." className="form-input" style={{ resize: 'vertical' }}></textarea>
              </div>

              <button type="button" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>
                Submit Confidential Inquiry <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container" style={{ padding: '3rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#f8fafc', fontWeight: '700', marginBottom: '0.25rem' }}>GRO10X CAPITAL PLATFORM v0.1.1</p>
          <p>© 2026 GRO10X Technologies Ltd. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Term Sheet Guidelines</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Risk Disclosure</a>
        </div>
      </footer>

    </div>
  );
}
