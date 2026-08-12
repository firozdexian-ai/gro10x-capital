'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Building2, ShieldCheck, RefreshCw, ChevronRight, 
  ArrowUpRight, Users, Lock, Zap, DollarSign, Award, CheckCircle2,
  Calendar, Layers, BarChart3, HelpCircle, Globe, Shield, Info, Check, MessageSquare,
  FileText, AlertTriangle, ArrowRight, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../lib/currency';
import { supabase } from '../lib/supabase';
import ProjectCard from '../components/ProjectCard';
import ROICalculator from '../components/ROICalculator';

export default function Homepage() {
  const [currency, setCurrency] = useState('BDT');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [stats, setStats] = useState({
    totalInvestors: 140,
    totalRaised: 42000000,
    activeProjects: 4,
    avgYield: 18
  });

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      // 1. Fetch featured deals
      const { data: deals, error: dealsErr } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (
            brand_name,
            industry_sector,
            ai_health_score,
            operational_months
          )
        `)
        .limit(3);

      if (!dealsErr && deals) {
        setFeaturedProjects(deals);
      }

      // 2. Fetch live stats from DB
      const { count: investorCount } = await supabase
        .from('investors')
        .select('*', { count: 'exact', head: true });

      const { data: allProjects } = await supabase
        .from('funding_projects')
        .select('amount_raised_bdt, status');

      if (allProjects && allProjects.length > 0) {
        const sumRaised = allProjects.reduce((acc, p) => acc + (Number(p.amount_raised_bdt) || 0), 0);
        const activeCount = allProjects.filter(p => p.status === 'Active Capital Raise' || p.status === 'Origination').length;

        setStats({
          totalInvestors: investorCount || 140,
          totalRaised: sumRaised > 0 ? sumRaised : 42000000,
          activeProjects: activeCount > 0 ? activeCount : 4,
          avgYield: 18
        });
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    }
  };

  const handleOpenBot = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-bot', { detail: {} }));
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', padding: '5rem 1.5rem 4rem 1.5rem', textAlign: 'center', background: 'radial-gradient(circle at top center, rgba(212,175,55,0.15) 0%, rgba(7,10,20,1) 70%)' }}>
        <div className="container" style={{ maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          <div className="badge-gold" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex' }}>
            <ShieldCheck size={16} /> Asset-Backed Private Equity &amp; Yield Platform
          </div>

          <h1 style={{ fontSize: '3.4rem', fontWeight: '900', lineHeight: '1.15', margin: '0 0 1.25rem 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bangladesh's First<br />Revenue-Share Investment Platform
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
            Invest from ৳5 Lakh in verified, high-growth SME &amp; Franchise campaigns. Backed by physical outlet assets, managed via isolated legal SPVs, and audited monthly by Key Account Managers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/showcase" className="btn-gold" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: '800', textDecoration: 'none' }}>
              Explore Live Deals <ArrowUpRight size={18} />
            </a>
            <button onClick={handleOpenBot} className="btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 'bold' }}>
              <MessageSquare size={18} /> Speak to Advisor
            </button>
          </div>

          {/* STATS BAR (PULLED FROM DB) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1.5rem', marginTop: '4rem', backdropFilter: 'blur(10px)' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Total Capital Raised</span>
              <strong style={{ fontSize: '1.5rem', color: '#D4AF37', fontWeight: '800' }}>{formatCurrency(stats.totalRaised, currency)}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Verified Investors</span>
              <strong style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '800' }}>{stats.totalInvestors}+</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Active Campaigns</span>
              <strong style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: '800' }}>{stats.activeProjects}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Target Annual Yield</span>
              <strong style={{ fontSize: '1.5rem', color: '#8b5cf6', fontWeight: '800' }}>{stats.avgYield}% – 24%</strong>
            </div>
          </div>

          {/* TRUST BADGE STRIP */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} style={{ color: '#D4AF37' }} /> SPV Entity Protected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} /> KAM Monthly Audited
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} style={{ color: '#8b5cf6' }} /> Digital Share Certificate
            </span>
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'rgba(15,23,42,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Institutional Grade Process</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 3rem 0' }}>How GRO10X Protects Your Investment</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'left' }}>
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  1
                </div>
                <span style={{ fontSize: '0.7rem', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>2–4 Weeks</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Physical Due Diligence</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Our Key Account Managers physically inspect machinery, POS sales logs, and bank accounts before any deal is listed.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  2
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>Pre-Raise</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Isolated SPV Entity</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Capital goes directly into a dedicated Special Purpose Vehicle (Pvt Ltd). Investors receive legal share certificates.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  3
                </div>
                <span style={{ fontSize: '0.7rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>By 7th Monthly</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Monthly POS Payouts</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Yield disbursements are calculated monthly from gross POS sales and transferred straight to your registered bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFIED NUMBERS STRIP */}
      <section style={{ padding: '4rem 1.5rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(7,10,20,1) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Empirical Due Diligence
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0 0.4rem 0' }}>
              These are not projections. They are verified outlet financials.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Audited performance metrics from Oro Roasters flagship locations:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', background: 'rgba(7,10,20,0.85)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Avg. Monthly Gross</span>
              <strong style={{ fontSize: '1.6rem', color: '#D4AF37', fontWeight: '900', display: 'block', margin: '0.2rem 0' }}>৳31.6 Lakh</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Mirpur Hub POS sales</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Net Profit Margin</span>
              <strong style={{ fontSize: '1.6rem', color: '#10b981', fontWeight: '900', display: 'block', margin: '0.2rem 0' }}>16.89%</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Post OPEX net margin</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Day-1 Gross Margin</span>
              <strong style={{ fontSize: '1.6rem', color: '#8b5cf6', fontWeight: '900', display: 'block', margin: '0.2rem 0' }}>19.85%</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Immediate cashflow</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Avg. Monthly Net Profit</span>
              <strong style={{ fontSize: '1.6rem', color: '#f8fafc', fontWeight: '900', display: 'block', margin: '0.2rem 0' }}>৳5.34 Lakh</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Available pool for yield</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE ROI CALCULATOR */}
      <section style={{ padding: '4rem 1.5rem', background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, rgba(7,10,20,1) 75%)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Real-Time Investment Estimator
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 0.5rem 0' }}>
              Calculate Your Monthly Passive Yield
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              Slide your target investment ticket and compare expected monthly payouts across 3 yield structures.
            </p>
          </div>

          <ROICalculator isPreviewMode={true} currency={currency} />
        </div>
      </section>

      {/* 5. FEATURED LIVE DEALS */}
      <section style={{ padding: '4.5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>Active Opportunities</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Featured SME Campaigns</h2>
            </div>

            <a href="/showcase" className="btn-outline" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              View All Opportunities ({featuredProjects.length > 0 ? featuredProjects.length : '4'}) <ChevronRight size={16} />
            </a>
          </div>

          {featuredProjects.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {featuredProjects.map(project => (
                <ProjectCard key={project.id} project={project} currency={currency} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15,23,42,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>Explore open funding campaigns on our deal showcase.</p>
              <a href="/showcase" className="btn-gold" style={{ display: 'inline-flex' }}>Go to Deal Showcase</a>
            </div>
          )}
        </div>
      </section>

      {/* 6. WHY GRO10X VS TRADITIONAL INVESTMENTS */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'rgba(15,23,42,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Asset Class Comparison
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 0.5rem 0' }}>
              Why GRO10X Capital?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Compare GRO10X asset-backed private equity against traditional investment instruments.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(7,10,20,0.9)' }}>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Feature</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#D4AF37', fontWeight: '800', background: 'rgba(212,175,55,0.12)', borderLeft: '1px solid rgba(212,175,55,0.3)', borderRight: '1px solid rgba(212,175,55,0.3)' }}>GRO10X Capital</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Bank Fixed Deposit (FD)</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Public Stock Market</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Target Annual Return', gro: '18% – 24%', fd: '8% – 9%', stock: 'Volatile / Uncertain' },
                  { feature: 'Payout Frequency', gro: 'Monthly (by 7th)', fd: 'Quarterly / Maturity', stock: 'Annual Dividend (if any)' },
                  { feature: 'Underlying Protection', gro: 'Physical Machinery & SPV Share', fd: 'Bank Insolvency Risk', stock: 'Unsecured Market Risk' },
                  { feature: 'Due Diligence', gro: 'Physical POS & Audit by KAM', fd: 'None', stock: 'Self-Managed Analysis' },
                  { feature: 'Min. Ticket Size', gro: '৳5 Lakh', fd: 'No Minimum', stock: 'Any Amount' },
                  { feature: 'Liquidity Exit', gro: 'P2P Secondary Market', fd: 'Penalty on Early Exit', stock: 'High (Immediate)' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(15,23,42,0.6)' : 'rgba(7,10,20,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: '600', color: '#f8fafc' }}>{row.feature}</td>
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', fontWeight: '800', color: '#D4AF37', background: 'rgba(212,175,55,0.06)', borderLeft: '1px solid rgba(212,175,55,0.2)', borderRight: '1px solid rgba(212,175,55,0.2)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Check size={14} style={{ color: '#10b981' }} /> {row.gro}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', color: '#94a3b8' }}>{row.fd}</td>
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', color: '#94a3b8' }}>{row.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. LEADERSHIP TEAM SECTION */}
      <section style={{ padding: '4.5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Leadership &amp; Execution
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 3rem 0' }}>
            Backing High-Growth SMEs
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'left' }}>
            {/* CEO Card */}
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.3)', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(7,10,20,0.9) 100%)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '1.4rem', color: '#070a14', marginBottom: '1rem' }}>
                FA
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: '#f8fafc' }}>Firoz Uddin Ahmed</h3>
              <p style={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: '700', margin: '0 0 0.8rem 0' }}>Founder &amp; Managing Director</p>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>
                20+ years of operational leadership in F&amp;B franchise scaling, private equity co-investments, and retail growth management in Bangladesh.
              </p>
            </div>

            {/* Placeholder Head 1 */}
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#64748b', marginBottom: '1rem' }}>
                SPV
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: '#f8fafc' }}>Managing Partners Pool</h3>
              <p style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: '700', margin: '0 0 0.8rem 0' }}>Legal &amp; SPV Governance</p>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>
                Dedicated legal counsel ensuring all SPV equity structures, share capital allotments, and BFIU compliance are flawlessly executed.
              </p>
            </div>

            {/* Placeholder Head 2 */}
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#64748b', marginBottom: '1rem' }}>
                KAM
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: '#f8fafc' }}>Key Account Managers</h3>
              <p style={{ color: '#8b5cf6', fontSize: '0.82rem', fontWeight: '700', margin: '0 0 0.8rem 0' }}>Physical Audit &amp; Operations</p>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>
                On-the-ground team conducting monthly physical POS audits, inventory logs, and cash reconciliation across all active partner outlets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PLATFORM PRODUCTS STRIP */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', textAlign: 'center', marginBottom: '2.5rem' }}>Financial Ecosystem Overview</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <TrendingUp size={24} style={{ color: '#D4AF37', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>SME Yield Investments</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>Co-invest from ৳5L in operating franchise outlets and earn monthly POS revenue share.</p>
              <a href="/showcase" style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Browse Deals <ArrowUpRight size={14} /></a>
            </div>

            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(16,185,129,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <DollarSign size={24} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>Cash Concierge OTC</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>High-Net-Worth advisory pipeline for block allocations over ৳50L with custom terms.</p>
              <a href="/cash-concierge" style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Request OTC Ticket <ArrowUpRight size={14} /></a>
            </div>

            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(139,92,246,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <RefreshCw size={24} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>Secondary P2P Market</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>Buy or sell pre-seasoned, income-generating share positions from existing investors.</p>
              <a href="/secondary-market" style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>View Orderbook <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REBUILT FOOTER */}
      <footer style={{ padding: '4rem 1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#04060d', color: '#64748b', fontSize: '0.85rem' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem', textAlign: 'left' }}>
            {/* Col 1: Brand info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900' }}>G</div>
                <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#fff' }}>GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span></span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                Bangladesh's premier revenue-share co-investment platform. Connecting verified investors with high-performing SME &amp; franchise campaigns.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a href="https://t.me/gro10xmanbot" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.05)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 'bold' }}>
                  Telegram Bot
                </a>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <li><a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none' }}>Deal Showcase</a></li>
                <li><a href="/cash-concierge" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cash Concierge OTC</a></li>
                <li><a href="/secondary-market" style={{ color: '#94a3b8', textDecoration: 'none' }}>Secondary Market</a></li>
                <li><a href="/apply" style={{ color: '#94a3b8', textDecoration: 'none' }}>Apply for Raising</a></li>
              </ul>
            </div>

            {/* Col 3: Investor Portals */}
            <div>
              <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Portals</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <li><a href="/investor" style={{ color: '#94a3b8', textDecoration: 'none' }}>Investor Portfolio</a></li>
                <li><a href="/legal-contracts" style={{ color: '#94a3b8', textDecoration: 'none' }}>Legal Contracts</a></li>
                <li><a href="/payouts" style={{ color: '#94a3b8', textDecoration: 'none' }}>Yield Disbursements</a></li>
                <li><a href="/auth" style={{ color: '#94a3b8', textDecoration: 'none' }}>Member Sign In</a></li>
              </ul>
            </div>

            {/* Col 4: Legal Links */}
            <div>
              <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Legal &amp; Risk</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <li><a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a></li>
                <li><a href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a></li>
                <li><a href="/risk-disclosure" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>Risk Disclosure</a></li>
              </ul>
            </div>
          </div>

          {/* Regulatory Disclaimer Strip */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: '1.6', margin: '0 0 1rem 0', maxWidth: '900px', margin: '0 auto 1rem auto' }}>
              ⚠ <strong>Regulatory Disclaimer:</strong> GRO10X Capital operates as an independent growth management platform under Bangladesh Company Law. Co-investments carry commercial risk; past performance is not a guarantee of future yield. GRO10X is not a bank or BSEC-regulated public fund.
            </p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
              © {new Date().getFullYear()} GRO10X Capital Ltd. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
