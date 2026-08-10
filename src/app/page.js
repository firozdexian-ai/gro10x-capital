'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Building2, ShieldCheck, RefreshCw, ChevronRight, 
  ArrowUpRight, Users, Lock, Zap, DollarSign, Award, CheckCircle2,
  Calendar, Layers, BarChart3, HelpCircle, Globe, Shield, Info, Check, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../lib/currency';
import { supabase } from '../lib/supabase';
import ProjectCard from '../components/ProjectCard';

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
    fetchFeaturedDeals();
  }, []);

  const fetchFeaturedDeals = async () => {
    try {
      const { data, error } = await supabase
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

      if (!error && data) {
        setFeaturedProjects(data);
      }
    } catch (err) {
      console.error('Error fetching homepage deals:', err);
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
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          <div className="badge-gold" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex' }}>
            <ShieldCheck size={16} /> Asset-Backed Private Equity & Yield Platform
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: '1.15', margin: '0 0 1.25rem 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Invest Smarter.<br />Earn Verified Yields.
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
            Access curated, high-growth SME & Franchise campaigns. Backed by physical collateral, managed via legal SPVs, and audited monthly by Key Account Managers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/showcase" className="btn-gold" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: '800', textDecoration: 'none' }}>
              Explore Live Deals <ArrowUpRight size={18} />
            </a>
            <button onClick={handleOpenBot} className="btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 'bold' }}>
              <MessageSquare size={18} /> Speak to Advisor
            </button>
          </div>

          {/* STATS BAR */}
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

        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(15,23,42,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Institutional Grade Process</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 3rem 0' }}>How GRO10X Protects Your Investment</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'left' }}>
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.2)' }}>
              <div style={{ width: '42px', height: '42px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Physical Due Diligence</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Our Key Account Managers physically inspect equipment, POS sales logs, and bank statements before any business is enlisted.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ width: '42px', height: '42px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Isolated SPV Legal Structure</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Capital goes directly into an isolated SPV entity. Investors hold asset-backed digital share certificates for total legal security.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(139,92,246,0.2)' }}>
              <div style={{ width: '42px', height: '42px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Monthly Automated Payouts</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Yield disbursements are calculated monthly from gross POS sales and transferred straight to your verified investor wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LIVE DEALS */}
      <section style={{ padding: '5rem 1.5rem' }}>
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

      {/* 4. PLATFORM PRODUCTS STRIP */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', textAlign: 'center', marginBottom: '2.5rem' }}>Financial Ecosystem Overview</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <TrendingUp size={24} style={{ color: '#D4AF37', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>SME Yield Investments</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>Co-invest in operating franchise outlets and earn monthly POS revenue share.</p>
              <a href="/showcase" style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Browse Deals <ArrowUpRight size={14} /></a>
            </div>

            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(16,185,129,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <DollarSign size={24} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>Cash Concierge OTC</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>High-Net-Worth advisory pipeline for block allocations over ৳50L.</p>
              <a href="/cash-concierge" style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Request OTC Ticket <ArrowUpRight size={14} /></a>
            </div>

            <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(139,92,246,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
              <RefreshCw size={24} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>Secondary P2P Market</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>Acquire pre-seasoned, income-generating shares from existing investors.</p>
              <a href="/secondary-market" style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>View Orderbook <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ padding: '3rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: '#cbd5e1', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>GRO10X Capital Ecosystem</p>
          <p style={{ margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
            GRO10X operates as an independent private equity and growth management platform. Investments carry risk; past performance is not a guarantee of future yield.
          </p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} GRO10X Capital Ltd. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
