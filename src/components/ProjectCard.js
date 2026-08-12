'use client';

import React from 'react';
import { Building2, ArrowUpRight, Play } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

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
  if (!project) return null;

  const target          = Number(project.target_raise_bdt) || 1;
  const raised          = Number(project.amount_raised_bdt) || 0;
  const progressPercent = Math.min(100, Math.round((raised / target) * 100));
  const hasCover        = !!project.cover_image_url;
  const hasVideo        = !!project.youtube_url;
  const embedUrl        = toEmbedUrl(project.youtube_url);

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
      className="glass-card"
      style={{
        display: 'flex', flexDirection: 'column', height: '100%', padding: 0,
        borderColor: 'rgba(212,175,55,0.2)', transition: 'transform 0.2s, border-color 0.2s',
        position: 'relative', overflow: 'hidden', borderRadius: '16px'
      }}
    >
      {/* ── MEDIA THUMBNAIL ───────────────────────────────────────────────── */}
      {(hasCover || hasVideo) ? (
        <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
          {hasCover ? (
            <img
              src={project.cover_image_url}
              alt={project.project_title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            /* No cover but has video — show gradient with play icon */
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(7,10,20,0.9))', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)', display: 'grid', placeItems: 'center' }}>
                <Play size={22} style={{ color: '#D4AF37', marginLeft: '3px' }} />
              </div>
            </div>
          )}

          {/* Video badge overlay */}
          {hasVideo && (
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Play size={11} style={{ color: '#ef4444', fill: '#ef4444' }} />
              <span style={{ fontSize: '0.7rem', color: '#f1f5f9', fontWeight: '600' }}>Video Available</span>
            </div>
          )}

          {/* Gradient fade to card body */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(13,17,30,0.95))' }} />
        </div>
      ) : (
        /* Placeholder gradient when no media */
        <div style={{ height: '130px', background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(7,10,20,0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={32} style={{ color: 'rgba(212,175,55,0.3)' }} />
        </div>
      )}

      {/* ── CARD BODY ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* BRAND & TYPE BADGES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span className="badge-gold" style={{ fontSize: '0.72rem' }}>
            <Building2 size={11} /> {project.businesses?.brand_name || 'Verified SME'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '0.18rem 0.5rem', borderRadius: '5px', fontWeight: '700', border: '1px solid rgba(16,185,129,0.25)' }}>
            {project.funding_type || 'Franchise'}
          </span>
        </div>

        {/* TITLE */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
          {project.project_title}
        </h3>

        {/* DESCRIPTION */}
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.45', margin: '0 0 1rem 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.project_description || `Structured investment opportunity in ${project.businesses?.brand_name || 'verified outlet'}. Asset-backed SPV structure.`}
        </p>

        {/* RAISE PROGRESS */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', marginBottom: '0.35rem' }}>
            <span style={{ color: '#D4AF37', fontWeight: '700' }}>{progressPercent}% Raised</span>
            <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{formatCurrency(raised, currency)} / {formatCurrency(target, currency)}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent || 1}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)', borderRadius: '4px' }} />
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Min Ticket</span>
            <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{formatCurrency(project.min_otc_investment_bdt || 5000000, currency)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={handleOpenBot} className="btn-outline" style={{ padding: '0.35rem 0.7rem', fontSize: '0.77rem' }}>
              Inquire
            </button>
            <a href={`/projects/${project.id}`} className="btn-gold" style={{ padding: '0.35rem 0.7rem', fontSize: '0.77rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
              View Deal <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
