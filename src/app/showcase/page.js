'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Building2, ShieldCheck, TrendingUp, Filter, Search, CheckCircle2, 
  ArrowUpRight, DollarSign, MessageSquare, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import ProjectCard from '../../components/ProjectCard';

import { Suspense } from 'react';

function BusinessShowcaseContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref');

  const [currency, setCurrency] = useState('BDT');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActiveDeals();
    if (refCode && typeof window !== 'undefined') {
      sessionStorage.setItem('gro10x_ref_code', refCode);
    }
  }, [refCode]);

  const fetchActiveDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (
            brand_name,
            industry_sector,
            ai_health_score,
            operational_months,
            founders (
              full_name,
              track_record_score
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSector = filterSector === 'All' || p.businesses?.industry_sector === filterSector;
    const matchesQuery = !searchQuery || p.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.businesses?.brand_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery;
  });

  const handleOpenLeadBot = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-bot', { detail: { refCode } }));
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: 'radial-gradient(circle at top center, rgba(212,175,55,0.1) 0%, rgba(15,23,42,0.8) 70%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem 2rem 2.5rem 2rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          {refCode && (
            <div className="badge-gold" style={{ display: 'inline-flex', marginBottom: '1rem', padding: '0.4rem 1rem' }}>
              <Sparkles size={14} /> Referred Opportunity (Code: {refCode})
            </div>
          )}

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.75rem 0', color: '#fff' }}>
            Live Verified Investment Deals
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
            Browse physical asset-backed franchise & SME campaigns. Every deal is monitored by Key Account Managers and secured under individual SPVs.
          </p>

          {/* SEARCH & FILTER BAR */}
          <div style={{ display: 'flex', gap: '1rem', background: 'rgba(15,23,42,0.9)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search deal or brand name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.8rem', background: 'rgba(7,10,20,0.6)', border: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {['All', 'F&B Franchise', 'Digital Agency & Tech', 'Distribution'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterSector(cat)}
                  style={{
                    background: filterSector === cat ? 'rgba(212,175,55,0.2)' : 'transparent',
                    color: filterSector === cat ? '#D4AF37' : '#94a3b8',
                    border: filterSector === cat ? '1px solid #D4AF37' : '1px solid transparent',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* DEAL CARDS GRID */}
      <main className="container" style={{ paddingTop: '3rem' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#D4AF37' }}>
            <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#94a3b8' }}>Fetching Active Investment Opportunities...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
            <AlertCircle size={44} style={{ color: '#D4AF37', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>No Matching Deals Found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {searchQuery || filterSector !== 'All' ? 'Try adjusting your search query or category filter.' : 'New investment campaigns are currently undergoing KAM due diligence.'}
            </p>
            <button onClick={handleOpenLeadBot} className="btn-gold" style={{ display: 'inline-flex' }}>
              <MessageSquare size={16} /> Speak to Advisor / Join Waitlist
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Showing <strong>{filteredProjects.length}</strong> active campaigns</span>
              <button onClick={handleOpenLeadBot} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                <MessageSquare size={14} /> Need Help Choosing? Talk to Us
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} currency={currency} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function BusinessShowcase() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center', color: '#D4AF37' }}>Loading deals...</div>}>
      <BusinessShowcaseContent />
    </Suspense>
  );
}
