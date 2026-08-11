'use client';
import React, { useState } from 'react';
import { MapPin, Search, Layers, Table as TableIcon, Edit, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/**
 * DealPipelineTab — Upgraded Tab 2 Deal Operations Kanban & Table view for GRO10X Admin.
 *
 * Props:
 *   projects                        (array)
 *   kanbanStages                    (array)
 *   activeInvestments               (array)
 *   allKams                         (array)
 *   currency                        (string)
 *   pipelineView                    (string)  — 'kanban' | 'table'
 *   setPipelineView                 (fn)
 *   handleOpenProjectModal          (fn)
 *   setSelectedProjectForInvestors  (fn)
 *   setAdvanceModal                 (fn)
 */
export default function DealPipelineTab({
  projects = [],
  kanbanStages = [],
  activeInvestments = [],
  allKams = [],
  currency = 'BDT',
  pipelineView = 'kanban',
  setPipelineView,
  handleOpenProjectModal,
  setSelectedProjectForInvestors,
  setAdvanceModal,
}) {
  // Local Table Search & Filter state
  const [tableSearch, setTableSearch] = useState('');
  const [tableStageFilter, setTableStageFilter] = useState('All');

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── TOP CONTROL BAR: VIEW MODE TOGGLE & PIPELINE COUNT ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="tab-toggle-group">
          <button
            onClick={() => setPipelineView('kanban')}
            className={`tab-toggle-btn ${pipelineView === 'kanban' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Layers size={15} /> Kanban Board
          </button>
          <button
            onClick={() => setPipelineView('table')}
            className={`tab-toggle-btn ${pipelineView === 'table' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <TableIcon size={15} /> Table View
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          <span>Active Pipeline Projects:</span>
          <span className="status-badge status-badge--gold" style={{ fontSize: '0.8rem', padding: '0.15rem 0.5rem' }}>
            {projects.length} Deals
          </span>
        </div>
      </div>

      {/* ── VIEW 1: KANBAN BOARD ── */}
      {pipelineView === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          {kanbanStages.map((stage) => {
            const stageProjects = projects.filter(p => p.status === stage.id);
            return (
              <div key={stage.id} className="pipeline-column">
                
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#D4AF37', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {stage.title}
                  </h4>
                  <span className="status-badge status-badge--gold" style={{ fontSize: '0.72rem', padding: '0.05rem 0.4rem' }}>
                    {stageProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stageProjects.length === 0 ? (
                    <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: 'rgba(7,10,20,0.4)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                      No deals in {stage.id}
                    </div>
                  ) : (
                    stageProjects.map((p) => {
                      const raised = Number(p.amount_raised_bdt || 0);
                      const target = Number(p.target_raise_bdt || 1);
                      const pct = Math.min(100, Math.round((raised / target) * 100));
                      const brandName = p.businesses?.brand_name || 'GRO10X Hub';
                      const initial = brandName[0]?.toUpperCase() || 'G';

                      // Per-project investors count
                      const projInvsCount = activeInvestments.filter(i => i.project_id === p.id).length;

                      // Next stage transition target
                      let nextStage = null;
                      if (p.status === 'Origination') nextStage = 'Diligence';
                      else if (p.status === 'Diligence') nextStage = 'Funding';
                      else if (p.status === 'Funding') nextStage = 'Active';
                      else if (p.status === 'Active') nextStage = 'Closed';

                      return (
                        <div key={p.id} className="deal-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          
                          {/* Brand Avatar + Title Header */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', display: 'grid', placeItems: 'center', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.65rem' }}>
                                  {initial}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: '700' }}>{brandName}</span>
                              </div>
                              {p.show_on_showcase && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                  <span className="activity-dot"></span> Live
                                </span>
                              )}
                            </div>
                            <p style={{ fontWeight: '700', margin: '0.15rem 0 0.2rem 0', fontSize: '0.9rem', color: '#f8fafc' }}>
                              {p.project_title}
                            </p>
                            {p.location_address && (
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={11} style={{ color: '#D4AF37' }} /> {p.location_address}
                              </p>
                            )}
                          </div>

                          {/* CapEx & Progress Sub-panel */}
                          <div style={{ background: 'rgba(7,10,20,0.7)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>CapEx Target:</span>
                              <span style={{ fontWeight: '700', color: '#fff' }}>{formatCurrency(p.target_raise_bdt, currency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Amount Raised:</span>
                              <span style={{ color: '#10b981', fontWeight: '700' }}>{pct}% ({formatCurrency(raised, currency)})</span>
                            </div>
                            {/* Gradient Progress Bar */}
                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.1rem' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)', borderRadius: '3px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                              <span style={{ color: '#94a3b8' }}>Yield Rates:</span>
                              <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                {p.yield_option_1_rate || 10}% / {p.yield_option_2_rate || 12}% / {p.yield_option_3_rate || 35}%
                              </span>
                            </div>
                          </div>

                          {/* Metadata Warnings Footer */}
                          <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span>
                              SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>
                                {p.spv_name || 'Not Configured ⚠'}
                              </strong>
                            </span>
                            <span>
                              KAM: <strong style={{ color: allKams.find(k => k.id === p.kam_id) ? '#fff' : '#ef4444' }}>
                                {allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned ⚠'}
                              </strong>
                            </span>
                          </div>

                          {/* Action Buttons Row */}
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <button
                              onClick={() => handleOpenProjectModal(p)}
                              className="btn-sm"
                              style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                              title="Edit Project Details"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setSelectedProjectForInvestors(p)}
                              className="btn-sm"
                              style={{ flex: 1, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                              title="View Project Investors"
                            >
                              👥 ({projInvsCount})
                            </button>

                            {nextStage && (
                              <button
                                onClick={() => setAdvanceModal({ open: true, project: p, targetStage: nextStage })}
                                className="btn-sm"
                                style={{ flex: 1, background: '#D4AF37', color: '#070a14' }}
                                title={`Advance to ${nextStage}`}
                              >
                                → {nextStage}
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── VIEW 2: TABLE VIEW ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Table Search & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '0.85rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', padding: '0.45rem 0.85rem', borderRadius: '8px', width: '300px' }}>
              <Search size={15} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search project title or brand..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Stage Filter:</span>
              <select
                value={tableStageFilter}
                onChange={(e) => setTableStageFilter(e.target.value)}
                style={{ background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <option value="All">All Pipeline Stages</option>
                {kanbanStages.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Project Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Brand &amp; Location</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Stage</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Target CapEx</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount Raised</th>
                  <th style={{ padding: '0.85rem 1rem' }}>SPV Legal Entity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned KAM</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(p => {
                    const matchesSearch = !tableSearch || p.project_title.toLowerCase().includes(tableSearch.toLowerCase()) || (p.businesses?.brand_name || '').toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesStage = tableStageFilter === 'All' || p.status === tableStageFilter;
                    return matchesSearch && matchesStage;
                  })
                  .map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#fff' }}>{p.project_title}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ color: '#D4AF37', fontWeight: 'bold', display: 'block' }}>{p.businesses?.brand_name || 'N/A'}</span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.location_address || 'Address unlisted'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="status-badge status-badge--gold">
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>{formatCurrency(p.target_raise_bdt, currency)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(p.amount_raised_bdt || 0, currency)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned'}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenProjectModal(p)}
                          className="btn-sm"
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
