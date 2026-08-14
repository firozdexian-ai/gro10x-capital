'use client';
import React from 'react';
import { PlusCircle, ChevronRight, RefreshCw } from 'lucide-react';

/** Tab metadata map — single source of truth for breadcrumb + title */
const TAB_META = {
  dashboard:          { crumb: 'Command Center',    title: 'Command Center Overview' },
  kanban:             { crumb: 'Deal Pipeline',     title: '100-Project Onboarding Pipeline' },
  'business-registry':{ crumb: 'Business Registry', title: 'Business Registry & Cohort Applications' },
  investors:          { crumb: 'Investor Hub',      title: 'Investor Operations Hub' },
  dividend:           { crumb: 'Yield Engine',      title: 'Dividend & Yield Distribution Engine' },
  'cash-pipeline':    { crumb: 'Cash Concierge',    title: 'Restricted Cash Concierge Advisory Pipeline' },
  'team-promoters':   { crumb: 'Team & Promoters',  title: 'Team & Promoter Operations' },
  'leads-marketing':  { crumb: 'Leads & Marketing', title: 'Public Prospective Lead Center' },
  legal:              { crumb: 'Legal & Compliance', title: 'SPV Legal Contracts & Compliance' },
  analytics:          { crumb: 'Analytics',         title: 'Platform Analytics & Growth' },
  'bot-management':   { crumb: 'Bots & Access',     title: 'Telegram Bot Ecosystem & Access Control' },
  settings:           { crumb: 'Settings',          title: 'Platform Settings & Telegram Integration' },
};

/**
 * AdminHeader — Clean top breadcrumb & title bar for the GRO10X admin panel.
 * Search & currency are centrally housed in the global navigation bar.
 */
export default function AdminHeader({
  activeTab,
  onAddProject,
  onRefresh,
  isRefreshing = false,
}) {
  const meta = TAB_META[activeTab] || { crumb: activeTab, title: activeTab };

  return (
    <header className="admin-header">

      {/* LEFT: Breadcrumb + Page Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
          <span>GRO10X OS</span>
          <ChevronRight size={12} />
          <span>Admin Command Center</span>
          <ChevronRight size={12} />
          <span style={{ color: '#D4AF37', fontWeight: '700' }}>{meta.crumb}</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          {meta.title}
        </h1>
      </div>

      {/* RIGHT: Contextual Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn-outline"
            title="Refresh Platform Live Data"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', cursor: isRefreshing ? 'wait' : 'pointer' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span style={{ display: 'inline' }}>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        )}

        {(activeTab === 'kanban' || activeTab === 'dashboard') && (
          <button
            onClick={onAddProject}
            className="btn-gold"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
          >
            <PlusCircle size={16} /> Onboard Project
          </button>
        )}
      </div>
    </header>
  );
}
