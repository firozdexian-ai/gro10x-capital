'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Building2, ShieldCheck, TrendingUp, DollarSign, Calendar, MapPin, 
  Share2, CheckCircle2, ChevronRight, Play, ExternalLink, ArrowUpRight, 
  Lock, Award, Shield, FileText, Info, AlertCircle, Loader2, MessageSquare
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../../lib/currency';
import { supabase } from '../../../lib/supabase';

import { Suspense } from 'react';

function ProjectProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.id;
  const refCode = searchParams?.get('ref');

  const [currency, setCurrency] = useState('BDT');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // Fetch project details with business & founder
      const { data, error } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (
            id,
            brand_name,
            industry_sector,
            operational_months,
            ai_health_score,
            is_enlisted,
            founders (
              full_name,
              track_record_score,
              linkedin_url
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);

      // Fetch project media
      const { data: media, error: mediaErr } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (!mediaErr && media) {
        setMediaList(media);
      }
    } catch (err) {
      console.error('Error fetching project profile:', err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenLeadBot = () => {
    // Trigger global LeadBot event or dispatch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-bot', { detail: { projectId, projectTitle: project?.project_title, refCode } }));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', color: '#f8fafc', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#94a3b8' }}>Loading Verified Project Opportunity...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', color: '#f8fafc' }}>
        <div style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center', padding: '2rem' }} className="glass-card">
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem auto' }} />
          <h2>Project Opportunity Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>The requested project profile may have been archived or is temporarily unavailable.</p>
          <a href="/showcase" className="btn-gold" style={{ display: 'inline-flex' }}>Explore Active Deals</a>
        </div>
      </div>
    );
  }

  const raisePercentage = Math.min(100, Math.round(((Number(project.amount_raised_bdt) || 0) / Number(project.target_raise_bdt)) * 100));

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>

      {/* TOP HEADER / BREADCRUMB */}
      <div style={{ background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1rem 2rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none' }}>Live Deals</a>
            <ChevronRight size={14} />
            <span style={{ color: '#D4AF37' }}>{project.project_title}</span>
          </div>

          <button 
            onClick={handleShare}
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Share2 size={16} />
            {copiedLink ? 'Link Copied!' : 'Share Opportunity'}
          </button>
        </div>
      </div>

      <main className="container" style={{ paddingTop: '2.5rem' }}>
        
        {/* HERO HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge-gold">
              <Building2 size={12} /> {project.businesses?.brand_name}
            </span>
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(59,130,246,0.3)' }}>
              {project.funding_type} Raise
            </span>
            {project.spv_name && (
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)' }}>
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                SPV: {project.spv_name}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#fff' }}>
            {project.project_title}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', lineHeight: '1.6', margin: 0 }}>
            {project.project_description || `Structured SME investment campaign for ${project.businesses?.brand_name}. Backed by physical assets and monitored via KAM monthly audits.`}
          </p>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN — MAIN CONTENT & MEDIA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. MEDIA GALLERY / VIDEO PLAYER */}
            <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
              {mediaList.length > 0 ? (
                <div>
                  <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                    {mediaList[activeMediaIndex].media_type === 'video_link' ? (
                      <iframe 
                        src={(mediaList[activeMediaIndex].media_url || mediaList[activeMediaIndex].url || '').replace('watch?v=', 'embed/')} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen 
                      />
                    ) : (
                      <img 
                        src={mediaList[activeMediaIndex].media_url || mediaList[activeMediaIndex].url} 
                        alt={mediaList[activeMediaIndex].caption || project.project_title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {mediaList.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {mediaList.map((m, idx) => (
                        <button
                          key={m.id || idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          style={{
                            width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: activeMediaIndex === idx ? '2px solid #D4AF37' : '2px solid transparent',
                            cursor: 'pointer', padding: 0, background: '#000', flexShrink: 0
                          }}
                        >
                          {m.media_type === 'video_link' ? (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#D4AF37', background: 'rgba(15,23,42,0.9)' }}>
                              <Play size={20} />
                            </div>
                          ) : (
                            <img src={m.media_url || m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback Image Banner when no media uploaded */
                <div style={{ height: '320px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(15,23,42,0.8))', border: '1px border rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                  <Building2 size={56} style={{ color: '#D4AF37', marginBottom: '1rem', opacity: 0.6 }} />
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{project.businesses?.brand_name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', marginTop: '0.5rem' }}>
                    {project.location_address ? `Location: ${project.location_address}` : 'Verified Franchise & SME Expansion Campaign'}
                  </p>
                </div>
              )}
            </div>

            {/* 2. YIELD STRUCTURE & OPTIONS */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#D4AF37', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} /> Structured Yield Models
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' }}>Option 1</span>
                  <h4 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.1rem' }}>Capped Fixed Yield</h4>
                  <p style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{project.yield_option_1_rate || 10}% Gross Sales</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Prioritised payout from monthly gross revenue pool until return cap is met.</p>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(16,185,129,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Option 2</span>
                  <h4 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.1rem' }}>Growth Multiplier</h4>
                  <p style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{project.yield_option_2_rate || 12}% Gross Sales</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Higher gross revenue share for investors seeking accelerated cash recovery.</p>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(139,92,246,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 'bold', textTransform: 'uppercase' }}>Option 3</span>
                  <h4 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.1rem' }}>Net Profit Share</h4>
                  <p style={{ color: '#8b5cf6', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{project.yield_option_3_rate || 35}% Net Profit</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Direct equity-style participation in declared monthly net outlet profit.</p>
                </div>
              </div>
            </div>


            {/* 3. BUSINESS & FOUNDER CREDIBILITY */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#10b981' }} /> Business & Operational Integrity
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Operational Health Score</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                      {project.businesses?.ai_health_score || 85}/100
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Verified Healthy</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>
                    Combines Founder Track Record ({project.businesses?.founders?.track_record_score || 80}/100) with physical KAM monthly audits.
                  </p>
                </div>

                <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Founder & Leadership</span>
                  <h4 style={{ fontSize: '1.1rem', margin: '0.3rem 0 0.2rem 0' }}>{project.businesses?.founders?.full_name || 'Founder Assigned'}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Sector: {project.businesses?.industry_sector || 'F&B Franchise'}</p>
                  {project.businesses?.founders?.linkedin_url && (
                    <a href={project.businesses.founders.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      View Verified Profile <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 4. SPV & LEGAL PROTECTION */}
            <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(212,175,55,0.2)' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#D4AF37', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} /> Legal Protection & Asset Backing
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                Capital raised for this campaign is funneled directly into <strong>{project.spv_name || 'GRO10X SPV Ltd.'}</strong>. All machinery, civil fit-outs, and inventory are held directly under the SPV, providing asset-backed security to every investor.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Digital Share Certificates Issued
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> 24-Month Master Growth Contract
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — INVESTMENT CARD & ACTION (STICKY) */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="glass-card" style={{ padding: '2rem', borderColor: '#D4AF37', boxShadow: '0 10px 40px rgba(212,175,55,0.1)' }}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Campaign Target</span>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0.2rem 0 1rem 0' }}>
                  {formatCurrency(project.target_raise_bdt, currency)}
                </h2>

                {/* Progress Bar */}
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div style={{ width: `${raisePercentage}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #f59e0b)', borderRadius: '5px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{raisePercentage}% Funded</span>
                  <span style={{ color: '#94a3b8' }}>{formatCurrency(project.amount_raised_bdt || 0, currency)} raised</span>
                </div>
              </div>

              {/* STATS STRIP */}
              <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Min Investment</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatCurrency(project.min_otc_investment_bdt || 5000000, currency)}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Status</span>
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{project.status || 'Active Raise'}</strong>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON — TRIGGERS LEAD BOT */}
              <button 
                onClick={handleOpenLeadBot}
                className="btn-gold" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: '800', justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
              >
                <MessageSquare size={18} /> Express Interest / Book Call
              </button>

              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', margin: '1rem 0 0 0' }}>
                🔒 Zero obligation. Speak to a GRO10X advisor or schedule an outlet visit.
              </p>

            </div>
          </div>

        </div>

      </main>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div 
        className="mobile-only-sticky-bar"
        style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', borderTop: '1px solid rgba(212,175,55,0.3)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100
        }}
      >
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Min Ticket</span>
          <strong style={{ color: '#D4AF37', fontSize: '1rem' }}>{formatCurrency(project.min_otc_investment_bdt || 5000000, currency)}</strong>
        </div>

        <button 
          onClick={handleOpenLeadBot}
          className="btn-gold" 
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}
        >
          Express Interest
        </button>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .mobile-only-sticky-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function ProjectProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center', color: '#D4AF37' }}>Loading project opportunity...</div>}>
      <ProjectProfileContent />
    </Suspense>
  );
}
