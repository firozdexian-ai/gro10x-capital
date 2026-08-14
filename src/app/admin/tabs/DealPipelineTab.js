'use client';
import React, { useState } from 'react';
import { 
  MapPin, Search, Layers, Table as TableIcon, Edit, Users, 
  ArrowRight, AlertTriangle, Plus, CheckCircle2 
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/** Stage canonical mapping to support legacy labels and normalized IDs */
export const STAGE_STATUS_MAP = {
  Origination: ['Origination', '1. Origination & Pitch Review', '1. Origination & Review'],
  Diligence: ['Diligence', '2. Diligence & Valuation'],
  Funding: ['Funding', 'Active Capital Raise', '3. Active Capital Raise (90/10)', '3. Active Capital Raise'],
  Active: ['Active', 'Trading', 'Live & Trading', '4. Active National Grid Hub'],
  Closed: ['Closed', 'Matured', '5. Closed / Matured']
};

/** Checks if a project belongs to a given kanban stage ID */
export function isProjectInStage(project, stageId) {
  if (!project || !stageId) return false;
  if (project.status === stageId) return true;
  const aliases = STAGE_STATUS_MAP[stageId];
  return aliases ? aliases.includes(project.status) : false;
}

/** Stage badge and display label styling */
export function getDealStageConfig(status) {
  switch (status) {
    case 'Active':
    case 'Trading':
    case '4. Active National Grid Hub':
    case 'Live & Trading':
      return { id: 'Active', label: 'Live & Trading', badge: 'status-badge--success' };
    case 'Funding':
    case 'Active Capital Raise':
    case '3. Active Capital Raise (90/10)':
    case '3. Active Capital Raise':
      return { id: 'Funding', label: 'Active Capital Raise', badge: 'status-badge--gold' };
    case 'Diligence':
    case '2. Diligence & Valuation':
      return { id: 'Diligence', label: 'Diligence & Valuation', badge: 'status-badge--info' };
    case 'Origination':
    case '1. Origination & Pitch Review':
    case '1. Origination & Review':
      return { id: 'Origination', label: 'Origination & Review', badge: 'status-badge--warning' };
    case 'Closed':
    case 'Matured':
    case '5. Closed / Matured':
      return { id: 'Closed', label: 'Closed / Matured', badge: 'status-badge--danger' };
    default:
      return { id: status || 'Origination', label: status || 'Pipeline Deal', badge: 'status-badge--gold' };
  }
}

/** Stage progression workflow definition */
const STAGE_TRANSITIONS = {
  Origination: { nextStage: 'Diligence', label: '2. Diligence & Valuation', btnLabel: 'Diligence' },
  Diligence: { nextStage: 'Funding', label: '3. Active Capital Raise', btnLabel: 'Capital Raise' },
  Funding: { nextStage: 'Active', label: '4. Active National Grid Hub', btnLabel: 'Live Trading' },
  Active: { nextStage: 'Closed', label: '5. Closed / Matured', btnLabel: 'Close Deal' }
};

function getNextStageInfo(status) {
  const stageConfig = getDealStageConfig(status);
  return STAGE_TRANSITIONS[stageConfig.id] || null;
}

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

  // Compute active pipeline deals count (excluding Closed / Matured)
  const activePipelineDealsCount = projects.filter(
    p => p.status !== 'Closed' && p.status !== 'Matured' && p.status !== '5. Closed / Matured'
  ).length;

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
            {activePipelineDealsCount} Deals
          </span>
        </div>
      </div>

      {/* ── VIEW 1: KANBAN BOARD ── */}
      {pipelineView === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          {kanbanStages.map((stage) => {
            const stageProjects = projects.filter(p => isProjectInStage(p, stage.id));
            return (
              <div key={stage.id} className="pipeline-column">
                
                {/* Column Header with Stage Count & Quick-Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#D4AF37', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {stage.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="status-badge status-badge--gold" style={{ fontSize: '0.72rem', padding: '0.05rem 0.4rem' }}>
                      {stageProjects.length}
                    </span>
                    <button
                      onClick={() => handleOpenProjectModal(null, stage.id)}
                      className="btn-outline"
                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.75rem', borderRadius: '4px', lineHeight: 1, borderColor: 'rgba(255,255,255,0.15)', color: '#D4AF37' }}
                      title={`Add new project directly into ${stage.title}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stageProjects.length === 0 ? (
                    <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: 'rgba(7,10,20,0.4)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                      No deals in {stage.title}
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

                      // Stage Config & Next Transition
                      const stageConfig = getDealStageConfig(p.status);
                      const nextStageInfo = getNextStageInfo(p.status);
                      const isLive = stageConfig.id === 'Active';

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
                              
                              {/* Distinct Status Badges: Live (green) vs Published Showcase (gold) */}
                              {isLive ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }} title="Live & Trading on National Grid">
                                  <span className="activity-dot"></span> Live
                                </span>
                              ) : p.show_on_showcase ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#D4AF37', background: 'rgba(212,175,55,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }} title="Published on public showcase">
                                  <span className="activity-dot" style={{ background: '#D4AF37' }}></span> Published
                                </span>
                              ) : null}
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

                          {/* Metadata Warnings Footer with Clickable Unassigned KAM Shortcut */}
                          <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span>
                              SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>
                                {p.spv_name || 'Not Configured ⚠'}
                              </strong>
                            </span>
                            <span>
                              KAM:{' '}
                              {allKams.find(k => k.id === p.kam_id) ? (
                                <strong style={{ color: '#fff' }}>
                                  {allKams.find(k => k.id === p.kam_id)?.full_name}
                                </strong>
                              ) : (
                                <button
                                  onClick={() => handleOpenProjectModal(p)}
                                  style={{ background: 'transparent', border: 'none', padding: 0, color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.72rem' }}
                                  title="Click to assign KAM in Project Details modal"
                                >
                                  Unassigned ⚠
                                </button>
                              )}
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
                              style={{ flex: 1, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                              title="View Project Investors"
                            >
                              <Users size={13} /> ({projInvsCount})
                            </button>

                            {nextStageInfo && (
                              <button
                                onClick={() => setAdvanceModal({ 
                                  open: true, 
                                  project: p, 
                                  targetStage: nextStageInfo.nextStage, 
                                  targetStageTitle: nextStageInfo.label 
                                })}
                                className="btn-sm"
                                style={{ flex: 1, background: '#D4AF37', color: '#070a14', fontWeight: '700' }}
                                title={`Advance to ${nextStageInfo.label}`}
                              >
                                → {nextStageInfo.btnLabel}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', padding: '0.45rem 0.85rem', borderRadius: '8px', width: '320px' }}>
              <Search size={15} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search project title, brand, SPV..."
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
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(p => {
                    const matchesSearch = !tableSearch || 
                      p.project_title?.toLowerCase().includes(tableSearch.toLowerCase()) || 
                      (p.businesses?.brand_name || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
                      (p.spv_name || '').toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesStage = tableStageFilter === 'All' || isProjectInStage(p, tableStageFilter);
                    return matchesSearch && matchesStage;
                  })
                  .map(p => {
                    const raised = Number(p.amount_raised_bdt || 0);
                    const target = Number(p.target_raise_bdt || 1);
                    const pct = Math.min(100, Math.round((raised / target) * 100));
                    const stageConfig = getDealStageConfig(p.status);
                    const nextStageInfo = getNextStageInfo(p.status);
                    const projInvsCount = activeInvestments.filter(i => i.project_id === p.id).length;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#fff' }}>
                          <div>
                            <span>{p.project_title}</span>
                            {p.show_on_showcase && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#D4AF37', background: 'rgba(212,175,55,0.15)', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                Showcase
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ color: '#D4AF37', fontWeight: 'bold', display: 'block' }}>{p.businesses?.brand_name || 'N/A'}</span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.location_address || 'Address unlisted'}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`status-badge ${stageConfig.badge}`}>
                            {stageConfig.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>{formatCurrency(p.target_raise_bdt, currency)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                              {pct}% ({formatCurrency(raised, currency)})
                            </span>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', width: '100px' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)' }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {allKams.find(k => k.id === p.kam_id) ? (
                            <span>{allKams.find(k => k.id === p.kam_id)?.full_name}</span>
                          ) : (
                            <button
                              onClick={() => handleOpenProjectModal(p)}
                              style={{ background: 'transparent', border: 'none', padding: 0, color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
                              title="Click to assign KAM in Project Details"
                            >
                              Unassigned ⚠
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => setSelectedProjectForInvestors(p)}
                              className="btn-sm"
                              style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}
                              title="View Project Investors"
                            >
                              <Users size={12} /> ({projInvsCount})
                            </button>
                            <button
                              onClick={() => handleOpenProjectModal(p)}
                              className="btn-sm"
                              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.35rem 0.6rem' }}
                            >
                              Edit
                            </button>
                            {nextStageInfo && (
                              <button
                                onClick={() => setAdvanceModal({ 
                                  open: true, 
                                  project: p, 
                                  targetStage: nextStageInfo.nextStage, 
                                  targetStageTitle: nextStageInfo.label 
                                })}
                                className="btn-sm"
                                style={{ background: '#D4AF37', color: '#070a14', fontWeight: '700', padding: '0.35rem 0.6rem' }}
                                title={`Advance to ${nextStageInfo.label}`}
                              >
                                → {nextStageInfo.btnLabel}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
