'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Building2, ShieldCheck, TrendingUp, Share2,
  CheckCircle2, ChevronRight, ExternalLink,
  Lock, AlertCircle, Loader2, MessageSquare,
  FileText, Sparkles, Clock, Briefcase, Layers
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';
import { supabase } from '../../../lib/supabase';
import ROICalculator from '../../../components/ROICalculator';
import FAQAccordion from '../../../components/FAQAccordion';

const SAFE_HOME_PROJECT_DATA = {
  id: 'c3a2b3c4-d5e6-7890-abcd-ef1234567890',
  project_title: 'Safe Home Wealth Management Fund — ৳20 Cr Facility',
  funding_type: 'Wealth Management',
  target_raise_bdt: 200000000,
  amount_raised_bdt: 52500000,
  booked_amount_bdt: 20000000,
  spv_name: 'Safe Home Wealth Management SPV-01',
  yield_model: '18% p.a. (Monthly) · 20% p.a. (Semi-Annual) · 22% p.a. (Annual) Fixed Returns. Multi-Asset SME Deployments.',
  yield_percent: 20,
  duration_months: 36,
  min_otc_investment_bdt: 1000000,
  status: 'Active Capital Raise',
  cover_image_url: null,
  youtube_url: null,
  project_description: 'Safe Home Wealth Management Fund: A ৳20 Crore institutional credit & private equity facility actively deployed across high-turnover SME Work-Order Financing (7–10 day turnaround, 12%–18% per-cycle gross margins), profitable Franchise & Outlet expansion, and strategic growth equity syndicates. Delivers predictable monthly, semi-annual, or annual fixed returns ring-fenced under Safe Home SPV-01.',
  businesses: {
    id: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890',
    brand_name: 'Safe Home Wealth Management',
    industry_sector: 'Wealth Management',
    operational_months: 36,
    ai_health_score: 95,
    is_enlisted: true,
    founders: {
      full_name: 'Faiz Ahmed & GRO10X Investment Committee',
      track_record_score: 98,
      linkedin_url: null
    }
  }
};

// Convert any YouTube URL format to embed URL
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get('v');
    if (!videoId && u.hostname === 'youtu.be') videoId = u.pathname.slice(1).split('?')[0];
    if (!videoId && u.pathname.includes('/embed/')) return url;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch { return null; }
}

// ── Inner component that uses useSearchParams (must be inside Suspense) ───────
function ProjectDetail() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const projectId   = params?.id;
  const refCode     = searchParams?.get('ref');

  const [loading,    setLoading]    = useState(true);
  const [project,    setProject]    = useState(null);
  const [error,      setError]      = useState(null);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);

    const isSafeHomeRoute = 
      projectId === 'c3a2b3c4-d5e6-7890-abcd-ef1234567890' || 
      projectId === 'safe-home' || 
      projectId === 'safe-home-fund';

    try {
      const { data, error: err } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (
            id, brand_name, industry_sector,
            operational_months, ai_health_score, is_enlisted,
            founders ( full_name, track_record_score, linkedin_url )
          )
        `)
        .eq('id', projectId)
        .single();

      if (isSafeHomeRoute || data?.project_title?.includes('National Grid') || data?.project_title?.includes('Safe Home')) {
        setProject({
          ...SAFE_HOME_PROJECT_DATA,
          ...(data || {}),
          id: 'c3a2b3c4-d5e6-7890-abcd-ef1234567890',
          project_title: 'Safe Home Wealth Management Fund — ৳20 Cr Facility',
          funding_type: 'Wealth Management',
          target_raise_bdt: 200000000,
          amount_raised_bdt: 52500000,
          booked_amount_bdt: 20000000,
          spv_name: 'Safe Home Wealth Management SPV-01',
          yield_model: '18% p.a. (Monthly) · 20% p.a. (Semi-Annual) · 22% p.a. (Annual) Fixed Returns. Multi-Asset SME Deployments.',
          yield_percent: 20,
          duration_months: 36,
          min_otc_investment_bdt: 1000000,
          cover_image_url: null,
          youtube_url: null,
          project_description: SAFE_HOME_PROJECT_DATA.project_description,
          businesses: {
            brand_name: 'Safe Home Wealth Management',
            industry_sector: 'Wealth Management',
            operational_months: 36,
            ai_health_score: 95,
            is_enlisted: true,
            founders: {
              full_name: 'Faiz Ahmed & GRO10X Investment Committee',
              track_record_score: 98,
              linkedin_url: null
            }
          }
        });
      } else if (err) {
        setError(err.message);
        setProject(null);
      } else {
        setProject(data);
      }
    } catch (e) {
      if (isSafeHomeRoute) {
        setProject(SAFE_HOME_PROJECT_DATA);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openLeadBot = async () => {
    if (typeof window === 'undefined') return;

    // 1. Dispatch custom event for client LeadBot drawer
    window.dispatchEvent(new CustomEvent('open-lead-bot', {
      detail: { projectId, projectTitle: project?.project_title, refCode }
    }));

    // 2. Log lead record into inquiry_leads
    try {
      await supabase.from('inquiry_leads').insert([{
        full_name: 'Deal Room Prospect',
        inquiry_type: 'Deal Express Interest',
        notes: `Express interest triggered for: ${project?.project_title || projectId}`,
        lead_status: 'New',
        referral_code: refCode || null
      }]);
    } catch (lErr) {
      console.warn('Lead logging skipped:', lErr);
    }

    // 3. Dispatch Telegram alert to Admin
    try {
      await fetch('/api/telegram-notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔥 New Deal Room Interest Clicked',
          message: `An investor clicked 'Express Interest' for: <b>${project?.project_title}</b> (${project?.businesses?.brand_name || 'Syndicate Deal'})\n\nRef Code: <code>${refCode || 'Direct'}</code>`,
          actionUrl: `${window.location.origin}/admin`
        })
      });
    } catch (tErr) {
      console.warn('Admin deal interest alert skipped:', tErr);
    }
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={36} style={{ color: '#D4AF37', margin: '0 auto 1rem', display: 'block', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94a3b8' }}>Loading investment opportunity...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── NOT FOUND / ERROR ─────────────────────────────────────────────────────
  if (error || !project) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
      <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem', display: 'block' }} />
      <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Project Not Found</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        {error || 'This project may have been archived or is temporarily unavailable.'}
      </p>
      <a href="/showcase" className="btn-gold" style={{ display: 'inline-flex', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '700' }}>
        ← Explore All Active Deals
      </a>
    </div>
  );

  const target          = Number(project.target_raise_bdt) || 20000000;
  const raised          = Number(project.amount_raised_bdt) || 0;
  const defaultBooked   = Math.round(target * 0.10);
  const booked          = Math.max(defaultBooked, Number(project.booked_amount_bdt) || defaultBooked);
  const raisedPct       = Math.min(100, Math.round((raised / target) * 100));
  const bookedPct       = Math.min(100 - raisedPct, Math.round((booked / target) * 100));
  const isOverbooked    = (raised + booked) >= target;
  const biz             = project.businesses || {};
  const founder         = biz.founders || {};
  const embedUrl        = toEmbedUrl(project.youtube_url);
  const isWealthManagement = 
    project.funding_type === 'Wealth Management' || 
    project.project_title?.includes('Safe Home') ||
    project.id === 'c3a2b3c4-d5e6-7890-abcd-ef1234567890';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>

      {/* BREADCRUMB */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <a href="/showcase" style={{ color: '#64748b', textDecoration: 'none' }}>Live Deals</a>
          <ChevronRight size={14} />
          <span style={{ color: '#D4AF37' }}>{project.project_title}</span>
        </div>
        <button onClick={handleShare} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Share2 size={14} /> {copied ? '✓ Copied!' : 'Share'}
        </button>
      </div>

      {/* HERO */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.2rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Building2 size={11} /> {biz.brand_name || 'Verified SME'}
          </span>
          <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.2rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
            {project.funding_type} Raise
          </span>
          <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.2rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={11} /> {project.status || 'Active Capital Raise'}
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.75rem 0', lineHeight: 1.2 }}>
          {project.project_title}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.65', maxWidth: '780px', margin: 0 }}>
          {project.project_description || `Structured investment opportunity in ${biz.brand_name || 'a verified SME'}. Asset-backed SPV structure managed exclusively by GRO10X Capital.`}
        </p>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT: YIELD OPTIONS + BUSINESS INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* MEDIA GALLERY / VIDEO PLAYER */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
            {isWealthManagement ? (
              /* Dedicated Safe Home Wealth Management Showcase Banner */
              <div style={{ padding: '2rem 1.75rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(15,23,42,0.95) 100%)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Institutional Credit Facility • Safe Home SPV-01
                    </span>
                    <h3 style={{ margin: '0.35rem 0 0.35rem 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>
                      Safe Home Wealth Management Fund
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', maxWidth: '580px', lineHeight: '1.5' }}>
                      Multi-asset deployment facility actively funding verified corporate SME purchase orders, retail franchise expansion, and collateral-backed credit lines. Managed by Faiz Ahmed (Managing Partner) &amp; GRO10X Investment Committee.
                    </p>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', padding: '0.4rem 0.75rem', borderRadius: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} /> 100% Asset &amp; PO Backed
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Target Facility</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '1.1rem', marginTop: '0.15rem' }}>৳20.0 Cr</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Active Portfolio</span>
                    <strong style={{ display: 'block', color: '#D4AF37', fontSize: '1.1rem', marginTop: '0.15rem' }}>৳5.25+ Cr</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Annual Fixed Yield</span>
                    <strong style={{ display: 'block', color: '#10b981', fontSize: '1.1rem', marginTop: '0.15rem' }}>18% – 22%</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Payout Schedules</span>
                    <strong style={{ display: 'block', color: '#38bdf8', fontSize: '1.1rem', marginTop: '0.15rem' }}>Monthly · Semi · Annual</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a 
                    href="/docs/maats-company-profile.pdf" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-gold" 
                    style={{ fontSize: '0.82rem', padding: '0.55rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', fontWeight: '700' }}
                  >
                    <FileText size={14} /> Download Portfolio &amp; Profile Deck
                  </a>
                  <button 
                    onClick={openLeadBot} 
                    className="btn-outline" 
                    style={{ fontSize: '0.82rem', padding: '0.55rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  >
                    <MessageSquare size={14} /> Inquire Capital Allocation
                  </button>
                </div>
              </div>
            ) : embedUrl ? (
              /* YouTube Embed */
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px' }}>
                <iframe
                  src={embedUrl}
                  title={project.project_title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '16px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : project.cover_image_url ? (
              /* Cover image banner */
              <img
                src={project.cover_image_url}
                alt={project.project_title}
                style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block', borderRadius: '16px' }}
              />
            ) : (
              /* Placeholder */
              <div style={{ height: '260px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(15,23,42,0.9) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', display: 'grid', placeItems: 'center', fontSize: '1.8rem' }}>☕</div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: '800' }}>{biz.brand_name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{biz.industry_sector} · {biz.operational_months}+ months operational</p>
              </div>
            )}
          </div>

          {/* PORTFOLIO DEPLOYMENTS SECTION (Institutional Portfolio Overview for Wealth Management) */}
          {isWealthManagement && (
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={20} style={{ color: '#D4AF37' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                      Active Portfolio Deployments &amp; Asset Allocation
                    </h3>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.3rem 0 0 0', lineHeight: 1.5 }}>
                    The fund deploys strictly into verified institutional receivables, rapid turnover SME purchase orders, and asset-backed retail franchises.
                  </p>
                </div>
                <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} /> Institutional Collateral
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                
                {/* COMPANY 1: MAATS COTTAGE */}
                <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        Portfolio Co. #01
                      </span>
                      <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ● Active Revolving
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
                      Maats Cottage Ltd.
                    </h4>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                      Solmaid, Vatara, Dhaka · Finished Leather Goods &amp; Export Jute Crafts
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Credit Facility</span>
                        <strong style={{ color: '#D4AF37', fontSize: '0.92rem' }}>৳25,00,000</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Settlement History</span>
                        <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>5 Cycles (100% On-Time)</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Avg. Turnaround</span>
                        <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>7 – 10 Days</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Corporate Buyers</span>
                        <strong style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>Delta, Greenfield, Unique</strong>
                      </div>
                    </div>

                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', lineHeight: '1.4' }}>
                      🔒 Backed by audited Purchase Orders, verified Delivery Challans, undated signed security cheques &amp; director CIB.
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Audit Status: Clean (5/5 Settled)</span>
                    <a href="/docs/maats-company-profile.pdf" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Profile Deck <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* COMPANY 2: CYCLE 2 ONBOARDING */}
                <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        Portfolio Co. #02
                      </span>
                      <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ● Onboarding (Cycle 2)
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
                      Institutional SME Supplier
                    </h4>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                      Tejgaon / Gazipur Industrial Zone · Corporate Procurement &amp; Packaging
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Target Facility</span>
                        <strong style={{ color: '#3b82f6', fontSize: '0.92rem' }}>৳50,00,000</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>KYC &amp; Due Diligence</span>
                        <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>In Progress (Stage 3)</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Turnaround Target</span>
                        <strong style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>10 – 14 Days</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Risk Rating</span>
                        <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>Tier-1 Blue Chip POs</strong>
                      </div>
                    </div>

                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', lineHeight: '1.4' }}>
                      🔒 Credit underwriting by Faiz Ahmed &amp; GRO10X Investment Committee. Dedicated tenant tracking being configured.
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Deployment Schedule: Q3 2026</span>
                    <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '700' }}>Ring-Fenced SPV</span>
                  </div>
                </div>

                {/* VEHICLE 3: FRANCHISE RETAIL HUBS */}
                <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        Asset Vehicle #03
                      </span>
                      <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ● Performing Outlets
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
                      Retail Franchise &amp; Asset Outlets
                    </h4>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                      Prime Commercial Hubs · High-Footfall Specialty F&amp;B Hubs
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Asset Backing</span>
                        <strong style={{ color: '#c084fc', fontSize: '0.92rem' }}>100% Machinery Title</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Revenue Tracking</span>
                        <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>Live Cloud POS Synced</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Cash-Flow Flow</span>
                        <strong style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>Daily Audited Audits</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Operational Track</span>
                        <strong style={{ color: '#D4AF37', fontSize: '0.92rem' }}>18+ Months Operating</strong>
                      </div>
                    </div>

                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', lineHeight: '1.4' }}>
                      🔒 Direct asset co-ownership under SPV legal structure. Zero unsecured exposure.
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Model: Franchise Expansion</span>
                    <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: '700' }}>Oro Roasters SPV Co-Op</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* YIELD OPTIONS */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} /> 3 Investor Yield Structures
            </h3>
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
              {(isWealthManagement ? [
                { label: 'Option 1', name: 'Monthly Return', rate: '18% p.a.', detail: 'Monthly Cash Payout', sub: 'Paid 7th of every month directly to bank', color: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
                { label: 'Option 2', name: 'Semi-Annual',   rate: '20% p.a.', detail: 'Semi-Annual Distribution', sub: 'Every 6 months liquidity payout',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
                { label: 'Option 3', name: 'Annual Return', rate: '22% p.a.', detail: 'Annual Lump-Sum Payout', sub: '12-month compounded maturity return', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
              ] : [
                { label: 'Option 1', name: 'Capped Yield', rate: '10%', detail: 'Gross Sales', sub: '22% Max ROI Cap', color: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
                { label: 'Option 2', name: 'Multiplier',   rate: '12%', detail: 'Gross Sales', sub: '1.5X Buyout Exit',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
                { label: 'Option 3', name: 'Partnership',  rate: '35%', detail: 'Net Profit',  sub: '5% Gross Floor',    color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
              ]).map(opt => (
                <div key={opt.label} style={{ background: 'rgba(7,10,20,0.7)', border: `1px solid ${opt.border}`, padding: '1.1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.7rem', color: opt.color, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opt.label}</span>
                  <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '0.95rem', color: '#f8fafc' }}>{opt.name}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: opt.color, margin: '0 0 0.3rem' }}>{opt.rate}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.25rem' }}>{opt.detail}</p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>{opt.sub}</p>
                </div>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', margin: '1rem 0 0' }}>
              💰 {isWealthManagement 
                ? 'All returns distributed directly to investor registered accounts, backed by multi-asset SME cash flows and corporate collection cycles.' 
                : 'All distributions made monthly directly to your registered bank account.'}
            </p>
          </div>

          {/* INTERACTIVE ROI CALCULATOR */}
          <ROICalculator project={project} />

          {/* BUSINESS CREDIBILITY */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} /> Operational Credibility
            </h3>
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>AI Health Score</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', lineHeight: 1.2, margin: '0.2rem 0' }}>
                  {biz.ai_health_score || 85}<span style={{ fontSize: '1rem', color: '#64748b' }}>/100</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Founder Track Record: {founder.track_record_score || 80}/100</p>
              </div>
              <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Leadership &amp; Management</span>
                <h4 style={{ margin: '0.2rem 0 0.2rem', color: '#f8fafc', fontSize: '1rem' }}>{founder.full_name || (isWealthManagement ? 'Faiz Ahmed & GRO10X Committee' : 'GRO10X Partner')}</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.4rem' }}>{isWealthManagement ? 'Institutional Fund Management' : biz.industry_sector}</p>
                {founder.linkedin_url && (
                  <a href={founder.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    LinkedIn <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* SPV & LEGAL */}
          <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} /> Legal Protection &amp; Asset Backing
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1rem' }}>
              {isWealthManagement ? (
                <>Capital is ring-fenced under <strong>Safe Home Wealth Management SPV-01</strong>. All funds are disbursed exclusively against verified corporate purchase orders (Delta Limited, Greenfield Jutex, Unique Group), backed by registered security cheques and dual-document settlement verification (signed delivery challans + bank repayment receipts).</>
              ) : (
                <>Capital raised is funneled directly into <strong>{project.spv_name || 'GRO10X SPV Ltd.'}</strong>. All machinery, civil fit-outs, and inventory are held under the SPV — providing asset-backed security to every investor.</>
              )}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> Digital Share Certificates</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> {isWealthManagement ? '36-Month Revolving Term' : '24-Month Growth Contract'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> {isWealthManagement ? 'Dual Settlement Audit' : 'Monthly KAM Audits'}</span>
            </div>
          </div>

          {/* INVESTOR FAQ SECTION */}
          <FAQAccordion type={isWealthManagement ? 'wealth_management' : 'franchise'} />
        </div>

        {/* RIGHT: STICKY INVESTMENT CARD */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.4)', boxShadow: '0 8px 40px rgba(212,175,55,0.08)' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Campaign Target</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 1.25rem' }}>
              {formatCurrency(target, 'BDT')}
            </h2>

            {/* PROGRESS & BOOKED */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#D4AF37', fontWeight: '700' }}>{raisedPct}% Raised</span>
                  <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.72rem', background: 'rgba(245,158,11,0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    +{bookedPct}% Booked
                  </span>
                </div>
                <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{formatCurrency(raised + booked, 'BDT')} / {formatCurrency(target, 'BDT')}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', height: '9px', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${raisedPct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #b49127)', transition: 'width 0.6s ease' }} title={`Raised: ${formatCurrency(raised, 'BDT')}`} />
                <div style={{ width: `${bookedPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', transition: 'width 0.6s ease' }} title={`Booked: ${formatCurrency(booked, 'BDT')}`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>
                <span>🏢 Incl. 10% GRO10X Stake</span>
                {isOverbooked ? (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔥 Overbooked</span>
                ) : (
                  <span>Avail: {formatCurrency(Math.max(0, target - raised - booked), 'BDT')}</span>
                )}
              </div>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Min Ticket',  value: formatCurrency(project.min_otc_investment_bdt || (isWealthManagement ? 1000000 : 500000), 'BDT') },
                { label: 'Target ROI',  value: isWealthManagement ? '18% – 22% p.a.' : `${project.yield_percent || 20}% p.a.` },
                { label: 'Duration',    value: `${project.duration_months || (isWealthManagement ? 36 : 24)} Months` },
                { label: 'Sector',      value: biz.industry_sector || (isWealthManagement ? 'Wealth Management' : 'F&B') },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(7,10,20,0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{s.label}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{s.value}</strong>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={openLeadBot}
              className="btn-gold"
              style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', fontWeight: '800', justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14' }}
            >
              <MessageSquare size={17} /> Express Interest / Book Call
            </button>
            <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', margin: '0.75rem 0 0' }}>
              🔒 Zero obligation. Speak to a GRO10X advisor or schedule an outlet visit.
            </p>

            {/* SPV BADGE */}
            {project.spv_name && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>SPV Structure</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>{project.spv_name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', borderTop: '1px solid rgba(212,175,55,0.25)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }} className="mobile-cta-bar">
        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Min Ticket</span>
          <strong style={{ color: '#D4AF37' }}>{formatCurrency(project.min_otc_investment_bdt || 500000, 'BDT')}</strong>
        </div>
        <button onClick={openLeadBot} className="btn-gold" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14' }}>
          Express Interest
        </button>
      </div>

      <style>{`
        @media (min-width: 769px) { .mobile-cta-bar { display: none !important; } }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1.75fr"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}

// ── Page export — wraps inner component in Suspense ───────────────────────────
export default function ProjectPage() {
  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      <Suspense fallback={
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={36} style={{ color: '#D4AF37', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#94a3b8' }}>Loading opportunity...</p>
          </div>
        </div>
      }>
        <ProjectDetail />
      </Suspense>
    </div>
  );
}
