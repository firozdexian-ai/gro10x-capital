'use client';

import React from 'react';
import { Building2, ShieldCheck, TrendingUp, ChevronRight, ArrowUpRight, Lock, Award, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function ProjectCard({ project, currency = 'BDT' }) {
  if (!project) return null;

  const target = Number(project.target_raise_bdt) || 1;
  const raised = Number(project.amount_raised_bdt) || 0;
  const progressPercent = Math.min(100, Math.round((raised / target) * 100));

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
        display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem',
        borderColor: 'rgba(212,175,55,0.2)', transition: 'transform 0.2s, border-color 0.2s',
        position: 'relative'
      }}
    >
      {/* BRAND & SECTOR BADGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span className="badge-gold" style={{ fontSize: '0.75rem' }}>
          <Building2 size={12} /> {project.businesses?.brand_name || 'Verified SME'}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)' }}>
          {project.funding_type || 'Franchise'}
        </span>
      </div>

      {/* PROJECT TITLE */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
        {project.project_title}
      </h3>

      <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 1.25rem 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.project_description || `Structured investment opportunity in ${project.businesses?.brand_name || 'verified outlet'}. Asset-backed SPV structure.`}
      </p>

      {/* RAISE PROGRESS */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
          <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{progressPercent}% Raised</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{formatCurrency(raised, currency)} / {formatCurrency(target, currency)}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)', borderRadius: '4px' }} />
        </div>
      </div>

      {/* FOOTER METRICS & ACTIONS */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Min Ticket</span>
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{formatCurrency(project.min_otc_investment_bdt || 5000000, currency)}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleOpenBot} 
            className="btn-outline" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Inquire
          </button>
          <a 
            href={`/projects/${project.id}`} 
            className="btn-gold" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
          >
            View Deal <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
