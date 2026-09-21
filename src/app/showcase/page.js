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

import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

function BusinessShowcaseContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref');

  const [currency, setCurrency] = useState('BDT');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'yield' | 'funded' | 'ticket'

  useEffect(() => {
    fetchActiveDeals();
    if (refCode && typeof window !== 'undefined') {
      sessionStorage.setItem('gro10x_ref_code', refCode);
      localStorage.setItem('gro10x_ref_code', refCode);

      // Log referral visit attribution asynchronously
      supabase.from('inquiry_leads').insert([{
        full_name: 'Showcase Visitor',
        inquiry_type: 'Investment Diligence',
        notes: `Promoter referral visit for code: ${refCode}`,
        lead_status: 'Referral_Visit',
        referral_code: refCode
      }]).then(() => {}).catch(() => {});
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
        .eq('show_on_showcase', true)
        .order('created_at', { ascending: false });


      if (error) throw error;
      const mappedData = (data || []).map(p => {
        if (p.id === 'c3a2b3c4-d5e6-7890-abcd-ef1234567890' || p.project_title?.includes('National Grid') || p.project_title?.includes('Safe Plan') || p.project_title?.includes('Safe Home')) {
          return {
            ...p,
            project_title: 'Safe Plan Wealth Management Fund — ৳20 Cr Facility',
            funding_type: 'Wealth Management',
            target_raise_bdt: 200000000,
            amount_raised_bdt: 52500000,
            spv_name: 'Safe Plan Wealth Management SPV-01',
            yield_model: '18% p.a. (Monthly) · 20% p.a. (Semi-Annual) · 22% p.a. (Annual) Fixed Returns. Multi-Asset SME Deployments.',
            min_otc_investment_bdt: 1000000,
            project_description: 'GRO10X Safe Plan Wealth Management Fund: A ৳20 Crore institutional credit & private equity facility actively deployed into verified SME work orders, franchise expansion, and collateral-backed credit lines. ৳5+ Crore AUM managed across 50+ private wealth investors.',
            businesses: {
              ...p.businesses,
              brand_name: 'Safe Plan Wealth Management',
              industry_sector: 'Wealth Management',
              ai_health_score: 95
            }
          };
        }
        return p;
      });
      setProjects(mappedData);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const sectors = ['All', 'F&B Franchise', 'Wealth Management', 'Digital Agency & Tech', 'Distribution'];

  const getSectorCount = (sec) => {
    if (sec === 'All') return projects.length;
    return projects.filter(p => p.businesses?.industry_sector === sec).length;
  };

  const filteredProjects = projects
    .filter(p => {
      const matchesSector = filterSector === 'All' || p.businesses?.industry_sector === filterSector;
      const matchesQuery = !searchQuery || 
        p.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.businesses?.brand_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'yield') {
        const yieldA = Number(a.yield_percent) || 18;
        const yieldB = Number(b.yield_percent) || 18;
        return yieldB - yieldA;
      }
      if (sortBy === 'funded') {
        const pctA = (Number(a.amount_raised_bdt) || 0) / (Number(a.target_raise_bdt) || 1);
        const pctB = (Number(b.amount_raised_bdt) || 0) / (Number(b.target_raise_bdt) || 1);
        return pctB - pctA;
      }
      if (sortBy === 'ticket') {
        const ticketA = Number(a.min_otc_investment_bdt) || 500000;
        const ticketB = Number(b.min_otc_investment_bdt) || 500000;
        return ticketA - ticketB;
      }
      return 0; // Default: 'featured' order
    });

  const handleOpenLeadBot = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-bot', { detail: { refCode } }));
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: 'radial-gradient(circle at top center, rgba(212,175,55,0.12) 0%, rgba(15,23,42,0.8) 70%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem 2rem 2.5rem 2rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          {refCode && (
            <div className="badge-gold" style={{ display: 'inline-flex', marginBottom: '1rem', padding: '0.4rem 1rem' }}>
              <Sparkles size={14} /> Referred Opportunity (Code: {refCode})
            </div>
          )}

          <h1 style={{ fontSize: '2.6rem', fontWeight: '900', margin: '0 0 0.75rem 0', color: '#fff', letterSpacing: '-0.02em' }}>
            Live Verified Investment Deals
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
            Browse physical asset-backed franchise &amp; SME campaigns. Every deal is audited monthly by Key Account Managers and ring-fenced under individual SPVs.
          </p>

          {/* SEARCH & FILTER BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(15,23,42,0.95)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search deal or brand name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input" 
                  style={{ paddingLeft: '2.8rem', background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 0.8rem' }}>
                <Filter size={15} style={{ color: '#D4AF37' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', outline: 'none', padding: '0.6rem 0' }}
                >
                  <option value="featured" style={{ background: '#0f172a' }}>Sort: Featured</option>
                  <option value="yield" style={{ background: '#0f172a' }}>Highest Target Yield</option>
                  <option value="funded" style={{ background: '#0f172a' }}>Most Funded</option>
                  <option value="ticket" style={{ background: '#0f172a' }}>Min Ticket (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {sectors.map(cat => {
                const isSelected = filterSector === cat;
                const count = getSectorCount(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterSector(cat)}
                    style={{
                      background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#D4AF37' : '#94a3b8',
                      border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      background: isSelected ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '10px',
                      color: isSelected ? '#fff' : '#64748b'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* DEAL CARDS GRID */}
      <main className="container" style={{ paddingTop: '3rem' }}>
        
        {loading ? (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <CardSkeleton count={3} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState 
            icon={AlertCircle}
            title="No Matching Deals Found"
            description={searchQuery || filterSector !== 'All' 
              ? 'Try clearing your search query or switching category filters.' 
              : 'New investment campaigns are currently undergoing KAM physical due diligence.'}
            actionText="Speak to Advisor / Join Waitlist"
            onAction={handleOpenLeadBot}
            actionIcon={MessageSquare}
            secondaryActionText={searchQuery || filterSector !== 'All' ? 'Reset Filters' : undefined}
            onSecondaryAction={searchQuery || filterSector !== 'All' ? () => { setSearchQuery(''); setFilterSector('All'); } : undefined}
          />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Showing <strong>{filteredProjects.length}</strong> active campaigns</span>
              <button onClick={handleOpenLeadBot} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                <MessageSquare size={14} /> Need Help Choosing? Talk to Us
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
