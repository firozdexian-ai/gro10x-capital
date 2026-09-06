'use client';
import React from 'react';
import { Building2, Users } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function CapExProjectsTab({
  managedProjects = [],
  totalCapexPipeline = 0,
  totalCapitalCommitted = 0,
  currency = 'BDT',
  getProjectStatusStyle,
  getFundingTypeStyle
}) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
            Active CapEx Pipeline & SPV Deal Room
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Track fundraise milestones, SPV legal structuring, and syndicated capital deployment
          </p>
        </div>
      </div>

      {/* 3-CARD TAB-LEVEL CAPEX KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total CapEx Pipeline
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
              {formatCurrency(totalCapexPipeline, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Target Volume</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Capital Committed
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
              {formatCurrency(totalCapitalCommitted, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
              {totalCapexPipeline > 0 ? `${Math.round((totalCapitalCommitted / totalCapexPipeline) * 100)}% Funded` : '0%'}
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Targets
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
              {managedProjects.length}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Live Portfolios</span>
          </div>
        </div>

      </div>

      {/* PROJECT CARDS LIST */}
      {managedProjects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
          <Building2 size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
            No CapEx projects currently active
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
            Deals originated in the Admin Pipeline will automatically appear here for managing partners.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {managedProjects.map((p) => {
            const target = Number(p.target_raise_bdt || 0);
            const raised = Number(p.amount_raised_bdt || 0);
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            const statusStyle = getProjectStatusStyle(p.status);
            const fTypeStyle = getFundingTypeStyle(p.funding_type);
            const investorCount = (p.investments || []).length;

            return (
              <div 
                key={p.id} 
                className="glass-card"
                style={{ 
                  padding: '1.5rem', 
                  borderLeft: `4px solid ${statusStyle.color}`,
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                }}
              >
                {/* CARD HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {p.businesses?.brand_name || 'GRO10X Hub'}
                      </span>
                      {p.funding_type && (
                        <span style={{ background: fTypeStyle.bg, color: fTypeStyle.color, border: `1px solid ${fTypeStyle.border}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {p.funding_type}
                        </span>
                      )}
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: '900', letterSpacing: '-0.01em' }}>
                      {p.project_title}
                    </h3>
                    {p.project_description && (
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                        {p.project_description}
                      </p>
                    )}
                  </div>

                  {/* SPV & YIELD MODEL INFO */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      SPV Legal Structure
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: p.spv_name ? '#cbd5e1' : '#f59e0b' }}>
                      {p.spv_name || '⚠ SPV Structuring In Progress'}
                    </div>
                    {p.yield_model && (
                      <div style={{ fontSize: '0.72rem', color: '#f0b429', fontWeight: '700', marginTop: '0.15rem' }}>
                        Yield Model: {p.yield_model}
                      </div>
                    )}
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', height: '12px', overflow: 'hidden', margin: '1rem 0 0.75rem 0' }}>
                  <div style={{ 
                    width: `${pct}%`, 
                    background: 'linear-gradient(90deg, #f0b429, #10b981)', 
                    height: '100%',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* METRICS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Committed Capital</span>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>
                      {formatCurrency(raised, currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>CapEx Target Raise</span>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#f0b429' }}>
                      {formatCurrency(target, currency)} <span style={{ fontSize: '0.78rem', color: '#10b981' }}>({pct}%)</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Min. OTC Ticket</span>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#cbd5e1' }}>
                      {formatCurrency(Number(p.min_otc_investment_bdt || 5000000), currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Participating Investors</span>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} /> {investorCount} Partner{investorCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
