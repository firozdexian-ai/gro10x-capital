'use client';

import React, { useState } from 'react';
import { Building2, ArrowUpRight, Play, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency, parseAmount } from '../lib/currency';

// Convert any YouTube URL to embed URL
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get('v');
    if (!videoId && u.hostname === 'youtu.be') videoId = u.pathname.slice(1);
    if (!videoId && u.pathname.includes('/embed/')) return url;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch { return null; }
}

export default function ProjectCard({ project, currency = 'BDT' }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!project) return null;

  const target        = parseAmount(project.target_raise_bdt) || 20000000;
  const raised        = parseAmount(project.amount_raised_bdt) || 0;
  // Default booked_amount_bdt to GRO10X 10% co-invest if 0
  const defaultBooked = Math.round(target * 0.10);
  const booked        = Math.max(defaultBooked, parseAmount(project.booked_amount_bdt) || defaultBooked);

  const raisedPct     = Math.min(100, Math.round((raised / target) * 100));
  const bookedPct     = Math.min(100 - raisedPct, Math.round((booked / target) * 100));
  const isOverbooked  = (raised + booked) >= target;

  const hasCover      = !!project.cover_image_url;
  const hasVideo      = !!project.youtube_url;

  const handleOpenBot = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-bot', {
        detail: { projectId: project.id, projectTitle: project.project_title }
      }));
    }
  };

  return (
    <div
      className="glass-card glass-card-interactive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
        borderColor: isHovered ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)',
        boxShadow: isHovered ? '0 16px 36px -10px rgba(212,175,55,0.2)' : '0 4px 20px rgba(0,0,0,0.3)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(7, 10, 20, 0.95) 100%)'
      }}
    >
      {/* ── MEDIA THUMBNAIL ───────────────────────────────────────────────── */}
      {(hasCover || hasVideo) ? (
        <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden', flexShrink: 0 }}>
          {hasCover ? (
            <img
              src={project.cover_image_url}
              alt={project.project_title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(7,10,20,0.95))', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.18)', border: '2px solid rgba(212,175,55,0.5)', display: 'grid', placeItems: 'center', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
                <Play size={22} style={{ color: '#D4AF37', marginLeft: '3px' }} />
              </div>
            </div>
          )}

          {hasVideo && (
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.35rem', zIndex: 2 }}>
              <Play size={11} style={{ color: '#ef4444', fill: '#ef4444' }} />
              <span style={{ fontSize: '0.7rem', color: '#f1f5f9', fontWeight: '600' }}>Video Pitch</span>
            </div>
          )}

          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(7,10,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '6px', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', zIndex: 2 }}>
            <ShieldCheck size={12} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>SPV Secured</span>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(to bottom, transparent, rgba(17,24,39,0.95))' }} />
        </div>
      ) : (
        <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(7,10,20,0.85) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={36} style={{ color: 'rgba(212,175,55,0.4)' }} />
        </div>
      )}

      {/* ── CARD BODY ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* BRAND & TYPE BADGES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span className="badge-gold" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
            <Building2 size={11} /> {project.businesses?.brand_name || 'Verified SME'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '700', border: '1px solid rgba(16,185,129,0.25)' }}>
            {project.funding_type || 'Franchise'}
          </span>
        </div>

        {/* TITLE */}
        <h3 style={{ fontSize: '1.12rem', fontWeight: '800', color: '#fff', margin: '0 0 0.45rem 0', lineHeight: '1.3' }}>
          {project.project_title}
        </h3>

        {/* DESCRIPTION */}
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 1.1rem 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.project_description || `Structured investment opportunity in ${project.businesses?.brand_name || 'verified outlet'}. Asset-backed SPV structure.`}
        </p>

        {/* RAISE & BOOKING PROGRESS BAR */}
        <div style={{ marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', fontWeight: '800' }}>{raisedPct}% Raised</span>
              <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.68rem', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.08rem 0.4rem', borderRadius: '4px' }}>
                +{bookedPct}% Booked
              </span>
            </div>
            <span style={{ color: '#cbd5e1', fontWeight: '700', fontSize: '0.73rem' }}>
              {formatCurrency(raised + booked, currency)} / {formatCurrency(target, currency)}
            </span>
          </div>

          {/* 3-Segment Stacked Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.08)', height: '7px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${raisedPct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #b49127)', transition: 'width 0.4s ease' }} title={`Raised: ${formatCurrency(raised, currency)}`} />
            <div style={{ width: `${bookedPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', transition: 'width 0.4s ease' }} title={`Booked: ${formatCurrency(booked, currency)}`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
            <span>🏢 Incl. 10% GRO10X Co-Invest</span>
            {isOverbooked ? (
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔥 Overbooked</span>
            ) : (
              <span>Avail: {formatCurrency(Math.max(0, target - raised - booked), currency)}</span>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>Min Ticket</span>
            <strong style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '800' }}>
              {formatCurrency(project.min_otc_investment_bdt || 500000, currency)}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={handleOpenBot} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.76rem', borderRadius: '8px' }}>
              Inquire
            </button>
            <a href={`/projects/${project.id}`} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.76rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              View Deal <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
