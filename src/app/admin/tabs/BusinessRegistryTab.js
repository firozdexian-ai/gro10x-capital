'use client';
import React from 'react';
import { Search, Building2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/** Status filter definitions with human-friendly labels */
const STATUS_OPTIONS = [
  { id: 'All', label: 'All Applications' },
  { id: 'New_Submission', label: 'New Submissions' },
  { id: 'KAM_Assigned', label: 'KAM Assigned' },
  { id: 'Diligence_Complete', label: 'Diligence Complete' },
  { id: 'Onboarded_To_Pipeline', label: 'Onboarded to Pipeline' },
  { id: 'Rejected', label: 'Rejected' },
];

/**
 * BusinessRegistryTab — Upgraded Tab 3 Cohort Applications & Business Registry for GRO10X Admin.
 *
 * Props:
 *   cohortApplications     (array)
 *   allKams                (array)
 *   currency               (string)
 *   appFilterStatus        (string)
 *   setAppFilterStatus     (fn)
 *   appSearchQuery         (string)
 *   setAppSearchQuery      (fn)
 *   handleAssignKamToApp   (fn)
 *   setSelectedApplication (fn)
 *   setAppDrawerSubTab     (fn)
 *   setKamAuditForm        (fn)
 */
export default function BusinessRegistryTab({
  cohortApplications = [],
  allKams = [],
  currency = 'BDT',
  appFilterStatus = 'All',
  setAppFilterStatus,
  appSearchQuery = '',
  setAppSearchQuery,
  handleAssignKamToApp,
  setSelectedApplication,
  setAppDrawerSubTab,
  setKamAuditForm,
}) {

  /** Compute counts per status pill */
  const getCount = (statusId) => {
    if (statusId === 'All') return cohortApplications.length;
    return cohortApplications.filter(a => a.status === statusId).length;
  };

  /** Filter application records */
  const filteredApps = cohortApplications
    .filter(a => appFilterStatus === 'All' || a.status === appFilterStatus)
    .filter(a => {
      if (!appSearchQuery) return true;
      const q = appSearchQuery.toLowerCase();
      return (
        (a.brand_name || '').toLowerCase().includes(q) ||
        (a.ref_code || '').toLowerCase().includes(q) ||
        (a.lead_founder_name || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── TOP CONTROL BAR: SEARCH & STATUS FILTER PILLS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Status Filter Pills Strip */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem', maxWidth: '100%' }}>
          {STATUS_OPTIONS.map(opt => {
            const count = getCount(opt.id);
            const isActive = appFilterStatus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAppFilterStatus(opt.id)}
                className={`tab-toggle-btn ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <span>{opt.label}</span>
                <span className={`status-badge ${isActive ? 'status-badge--gold' : 'status-badge--muted'}`} style={{ fontSize: '0.68rem', padding: '0.05rem 0.35rem' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.45rem 0.85rem', borderRadius: '8px', width: '280px' }}>
          <Search size={15} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search brand, founder, ref code..."
            value={appSearchQuery}
            onChange={(e) => setAppSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>

      </div>

      {/* ── APPLICATIONS TABLE ── */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Building2 size={48} style={{ color: '#D4AF37', margin: '0 auto 1rem auto', opacity: 0.6 }} />
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '1.15rem' }}>No Cohort Applications Found</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Founders submitting cohort applications via <strong>/apply</strong> will appear here in real time.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Ref Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Brand &amp; Sector</th>
                <th style={{ padding: '0.85rem 1rem' }}>Lead Founder</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capital Ask</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned KAM</th>
                <th style={{ padding: '0.85rem 1rem' }}>AI Health Score</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const healthScore = app.ai_health_score || 0;
                const scoreColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#D4AF37' : '#ef4444';
                const brandInitial = (app.brand_name || 'B')[0].toUpperCase();

                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    {/* Ref Code */}
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#D4AF37', fontWeight: 'bold' }}>
                      {app.ref_code}
                    </td>

                    {/* Brand & Sector */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', display: 'grid', placeItems: 'center', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0 }}>
                          {brandInitial}
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', display: 'block', color: '#fff' }}>{app.brand_name}</span>
                          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                            {app.industry_sector} ({app.outlet_count || 1} outlets)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Lead Founder */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: '600', display: 'block', color: '#fff' }}>{app.lead_founder_name}</span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{app.lead_founder_phone}</span>
                    </td>

                    {/* Capital Ask */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#10b981', display: 'block' }}>
                        {formatCurrency(app.requested_funding_bdt, currency)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.preferred_funding_type || 'CapEx Share'}</span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`status-badge ${
                        app.status === 'Onboarded_To_Pipeline' ? 'status-badge--success'
                        : app.status === 'Rejected' ? 'status-badge--danger'
                        : app.status === 'Diligence_Complete' ? 'status-badge--info'
                        : 'status-badge--gold'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Assigned KAM */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={app.assigned_kam_id || ''}
                        onChange={(e) => handleAssignKamToApp(app.id, e.target.value)}
                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', outline: 'none' }}
                      >
                        <option value="">-- Assign KAM --</option>
                        {allKams.map(k => (
                          <option key={k.id} value={k.id}>{k.full_name}</option>
                        ))}
                      </select>
                    </td>

                    {/* AI Health Score Bar */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '90px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: '800', color: scoreColor }}>{healthScore}/100</span>
                        </div>
                        <div className="health-score-bar">
                          <div style={{ width: `${Math.min(100, healthScore)}%`, height: '100%', background: scoreColor, borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setAppDrawerSubTab('brand');
                          setKamAuditForm({
                            kam_site_visit_date: app.kam_site_visit_date || '',
                            kam_location_score: app.kam_location_score || 4,
                            kam_equipment_score: app.kam_equipment_score || 4,
                            kam_financial_verification: app.kam_financial_verification || 'Pass',
                            kam_legal_doc_status: app.kam_legal_doc_status || 'Verified',
                            kam_notes: app.kam_notes || '',
                          });
                        }}
                        className="btn-sm"
                        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Inspect Drawer <ExternalLink size={12} />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
