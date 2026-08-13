'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Building2, ShieldCheck, TrendingUp, Share2,
  CheckCircle2, ChevronRight, ExternalLink,
  Lock, AlertCircle, Loader2, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';
import { supabase } from '../../../lib/supabase';
import ROICalculator from '../../../components/ROICalculator';
import FAQAccordion from '../../../components/FAQAccordion';

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

      if (err) { setError(err.message); setProject(null); }
      else      { setProject(data); }
    } catch (e) {
      setError(e.message);
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

  const openLeadBot = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('open-lead-bot', {
      detail: { projectId, projectTitle: project?.project_title, refCode }
    }));
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
            {embedUrl ? (
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

          {/* YIELD OPTIONS */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} /> 3 Investor Yield Structures
            </h3>
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
              {[
                { label: 'Option 1', name: 'Capped Yield', rate: '10%', detail: 'Gross Sales', sub: '22% Max ROI Cap', color: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
                { label: 'Option 2', name: 'Multiplier',   rate: '12%', detail: 'Gross Sales', sub: '1.5X Buyout Exit',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
                { label: 'Option 3', name: 'Partnership',  rate: '35%', detail: 'Net Profit',  sub: '5% Gross Floor',    color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
              ].map(opt => (
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
              💰 All distributions made <strong style={{ color: '#94a3b8' }}>monthly</strong> directly to your registered bank account.
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
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Leadership</span>
                <h4 style={{ margin: '0.2rem 0 0.2rem', color: '#f8fafc', fontSize: '1rem' }}>{founder.full_name || 'GRO10X Partner'}</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.4rem' }}>{biz.industry_sector}</p>
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
              <Lock size={18} /> Legal Protection & Asset Backing
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1rem' }}>
              Capital raised is funneled directly into <strong>{project.spv_name || 'GRO10X SPV Ltd.'}</strong>. All machinery, civil fit-outs, and inventory are held under the SPV — providing asset-backed security to every investor.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> Digital Share Certificates</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> 24-Month Growth Contract</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={14} style={{ color: '#10b981' }} /> Monthly KAM Audits</span>
            </div>
          </div>

          {/* INVESTOR FAQ SECTION */}
          <FAQAccordion />
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
                { label: 'Min Ticket',  value: formatCurrency(project.min_otc_investment_bdt || 500000, 'BDT') },
                { label: 'Target ROI',  value: `${project.yield_percent || 20}% p.a.` },
                { label: 'Duration',    value: `${project.duration_months || 24} Months` },
                { label: 'Sector',      value: biz.industry_sector || 'F&B' },
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
