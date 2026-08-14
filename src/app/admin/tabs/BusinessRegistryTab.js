'use client';
import React, { useState } from 'react';
import { 
  Search, Building2, ExternalLink, FileText, CheckCircle2, 
  Clock, TrendingUp, Copy, Check, Sparkles, ArrowUpRight 
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/** Status filter definitions with human-friendly labels */
const STATUS_OPTIONS = [
  { id: 'All', label: 'All Applications' },
  { id: 'New_Submission', label: 'New Submissions' },
  { id: 'Under_Director_Review', label: 'Under Review' },
  { id: 'KAM_Assigned', label: 'KAM Assigned' },
  { id: 'Diligence_In_Progress', label: 'Diligence In Progress' },
  { id: 'Diligence_Complete', label: 'Diligence Complete' },
  { id: 'Onboarded_To_Pipeline', label: 'Onboarded to Pipeline' },
  { id: 'Rejected', label: 'Rejected' },
];

/** Status badge color & label resolver */
export function getAppStatusConfig(status) {
  switch (status) {
    case 'Onboarded_To_Pipeline':
      return { label: 'Onboarded to Pipeline', badge: 'status-badge--success' };
    case 'Diligence_Complete':
      return { label: 'Diligence Complete', badge: 'status-badge--info' };
    case 'Diligence_In_Progress':
      return { label: 'Diligence In Progress', badge: 'status-badge--purple' };
    case 'KAM_Assigned':
      return { label: 'KAM Assigned', badge: 'status-badge--gold' };
    case 'Under_Director_Review':
      return { label: 'Under Review', badge: 'status-badge--warning' };
    case 'New_Submission':
      return { label: 'New Submission', badge: 'status-badge--gold' };
    case 'Rejected':
      return { label: 'Rejected', badge: 'status-badge--danger' };
    default:
      return { label: (status || 'Unknown').replace(/_/g, ' '), badge: 'status-badge--gold' };
  }
}

/** Formats dates cleanly */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

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
  const [copiedLink, setCopiedLink] = useState(false);

  /** Compute counts per status pill */
  const getCount = (statusId) => {
    if (statusId === 'All') return cohortApplications.length;
    return cohortApplications.filter(a => a.status === statusId).length;
  };

  /** Summary KPI Calculations */
  const totalAppsCount = cohortApplications.length;
  const pendingReviewCount = cohortApplications.filter(a => 
    ['New_Submission', 'Under_Director_Review', 'KAM_Assigned', 'Diligence_In_Progress'].includes(a.status)
  ).length;
  const avgCapitalAsk = totalAppsCount > 0 
    ? Math.round(cohortApplications.reduce((sum, a) => sum + (Number(a.requested_funding_bdt) || 0), 0) / totalAppsCount)
    : 0;
  const scoredApps = cohortApplications.filter(a => Number(a.ai_health_score) > 0);
  const avgAiHealthScore = scoredApps.length > 0
    ? Math.round(scoredApps.reduce((sum, a) => sum + Number(a.ai_health_score), 0) / scoredApps.length)
    : 0;

  /** Copy /apply URL to clipboard */
  const handleCopyApplyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/apply` : 'https://gro10x.com/apply';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  /** Filter application records (includes sector and legal name search) */
  const filteredApps = cohortApplications
    .filter(a => appFilterStatus === 'All' || a.status === appFilterStatus)
    .filter(a => {
      if (!appSearchQuery) return true;
      const q = appSearchQuery.toLowerCase();
      return (
        (a.brand_name || '').toLowerCase().includes(q) ||
        (a.ref_code || '').toLowerCase().includes(q) ||
        (a.lead_founder_name || '').toLowerCase().includes(q) ||
        (a.company_legal_name || '').toLowerCase().includes(q) ||
        (a.industry_sector || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── SUMMARY KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Applications */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37', flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Total Intake</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc' }}>
              {totalAppsCount} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Businesses</span>
            </h4>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'grid', placeItems: 'center', color: '#f59e0b', flexShrink: 0 }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Pending Review</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc' }}>
              {pendingReviewCount} <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '500' }}>Active</span>
            </h4>
          </div>
        </div>

        {/* Card 3: Avg Capital Ask */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', color: '#10b981', flexShrink: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Avg. Capital Ask</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>
              {formatCurrency(avgCapitalAsk, currency)}
            </h4>
          </div>
        </div>

        {/* Card 4: Avg AI Health Score */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'grid', placeItems: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Avg. AI Health</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc' }}>
              {avgAiHealthScore > 0 ? `${avgAiHealthScore}/100` : '—'}
            </h4>
          </div>
        </div>

      </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.45rem 0.85rem', borderRadius: '8px', width: '320px' }}>
          <Search size={15} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search brand, founder, ref code, sector..."
            value={appSearchQuery}
            onChange={(e) => setAppSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>

      </div>

      {/* ── APPLICATIONS TABLE ── */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={48} style={{ color: '#D4AF37', margin: '0 auto', opacity: 0.6 }} />
            <div>
              <h3 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '1.15rem' }}>No Cohort Applications Found</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '480px' }}>
                Founders submitting SME cohort intake applications via <strong>/apply</strong> will automatically appear here in real time.
              </p>
            </div>

            {/* Actionable CTAs in Empty State */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleCopyApplyLink}
                className="btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: '8px', color: '#cbd5e1' }}
              >
                {copiedLink ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                {copiedLink ? 'Link Copied!' : 'Copy /apply Link'}
              </button>

              <a
                href="/apply"
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700' }}
              >
                Open Application Form <ArrowUpRight size={14} />
              </a>
            </div>
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
                <th style={{ padding: '0.85rem 1rem' }}>Submitted</th>
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
                const statusCfg = getAppStatusConfig(app.status);

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
                      <span className={`status-badge ${statusCfg.badge}`}>
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                      {formatDate(app.created_at)}
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
