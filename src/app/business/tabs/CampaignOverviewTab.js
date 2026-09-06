'use client';

import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function CampaignOverviewTab({ fundingProjects = [], currency = 'BDT' }) {
  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Outlet Funding Campaigns
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Live CapEx syndication rounds, legal SPV structures, and investor allocation progress
          </p>
        </div>
        <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
          ● {fundingProjects.length} Campaign{fundingProjects.length !== 1 ? 's' : ''} Managed
        </span>
      </div>

      {fundingProjects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Layers size={44} style={{ color: '#334155', margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff' }}>No Active Funding Rounds</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
            New franchise expansion rounds created by the GRO10X Investment Committee will appear here once originated.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {fundingProjects.map(project => {
            const raised = Number(project.amount_raised_bdt) || 0;
            const target = Number(project.target_raise_bdt) || 1;
            const percent = Math.min(100, (raised / target) * 100);
            const isFunded = percent >= 100;

            return (
              <div 
                key={project.id} 
                className="glass-card" 
                style={{ 
                  borderColor: isFunded ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.3)', 
                  padding: '1.5rem',
                  borderLeft: `4px solid ${isFunded ? '#10b981' : '#D4AF37'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ 
                        background: isFunded ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', 
                        color: isFunded ? '#10b981' : '#D4AF37', 
                        padding: '0.15rem 0.55rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: '800' 
                      }}>
                        {project.status || 'Active'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                        Type: {project.funding_type}
                      </span>
                      {project.yield_model && (
                        <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                          Model: {project.yield_model}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.35rem 0', fontWeight: '800', color: '#fff' }}>
                      {project.project_title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                      SPV Legal Entity: <strong style={{ color: '#cbd5e1' }}>{project.spv_name || 'Pending SPV Formation'}</strong>
                      {project.min_otc_investment_bdt && (
                        <span style={{ marginLeft: '0.6rem', color: '#64748b' }}>
                          • Min Ticket: {formatCurrency(project.min_otc_investment_bdt, currency)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Amount Raised</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#D4AF37', lineHeight: 1.1 }}>
                      {formatCurrency(project.amount_raised_bdt, currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', marginTop: '0.2rem' }}>
                      Target: {formatCurrency(project.target_raise_bdt, currency)}
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8', fontWeight: '700' }}>Campaign Funding Progress</span>
                    <span style={{ color: '#D4AF37', fontWeight: '800' }}>{percent.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${percent}%`, 
                        background: isFunded 
                          ? 'linear-gradient(90deg, #10b981, #34d399)' 
                          : 'linear-gradient(90deg, #D4AF37, #F3E5AB)' 
                      }} 
                    />
                  </div>
                </div>

                {/* ACTIONS ROW */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <a 
                    href={`/projects/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(212,175,55,0.12)',
                      color: '#D4AF37',
                      border: '1px solid rgba(212,175,55,0.3)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    View Public Deal Room <ArrowUpRight size={14} />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
