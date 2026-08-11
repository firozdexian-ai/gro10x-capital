'use client';
import React from 'react';
import { Globe, PlusCircle, Search, ChevronRight } from 'lucide-react';
import { CURRENCY_RATES } from '../../lib/currency';

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
 * AdminHeader — Sticky top bar for the GRO10X admin panel.
 *
 * Props:
 *   activeTab          (string)   — currently active tab key
 *   setActiveTab       (fn)       — tab setter (used by search results)
 *   currency           (string)   — active currency code
 *   setCurrency        (fn)       — currency setter
 *   searchResults      (array)    — pre-computed results [ { type, title, sub, tab } ]
 *   globalSearchQuery  (string)   — current search text
 *   setGlobalSearchQuery (fn)     — search text setter
 *   showSearchResults  (boolean)  — whether dropdown is visible
 *   setShowSearchResults (fn)     — dropdown visibility setter
 *   onAddProject       (fn)       — callback for "Onboard Project" button (kanban tab)
 */
export default function AdminHeader({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  searchResults = [],
  globalSearchQuery,
  setGlobalSearchQuery,
  showSearchResults,
  setShowSearchResults,
  onAddProject,
}) {
  const meta = TAB_META[activeTab] || { crumb: activeTab, title: activeTab };

  return (
    <header className="admin-header">

      {/* LEFT: Breadcrumb + Page Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '0.2rem' }}>
          <span>GRO10X OS</span>
          <ChevronRight size={12} />
          <span>Admin</span>
          <ChevronRight size={12} />
          <span style={{ color: '#D4AF37' }}>{meta.crumb}</span>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
          {meta.title}
        </h1>
      </div>

      {/* RIGHT: Search + Currency + Contextual Action */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

        {/* GLOBAL IN-MEMORY SEARCH */}
        <div className="admin-search-box">
          <Search
            size={15}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search investors, deals, leads..."
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="admin-search-input"
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="admin-search-results">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="admin-search-item"
                  onClick={() => {
                    setActiveTab(res.tab);
                    setGlobalSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{res.title}</p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{res.sub}</span>
                  </div>
                  <span className={`status-badge ${
                    res.type === 'Investor' ? 'status-badge--gold'
                    : res.type === 'Project' ? 'status-badge--info'
                    : 'status-badge--purple'
                  }`}>
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CURRENCY SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.45rem 0.75rem', borderRadius: '8px' }}>
          <Globe size={16} style={{ color: '#D4AF37' }} />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', outline: 'none' }}
          >
            {Object.keys(CURRENCY_RATES).map(code => (
              <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                {CURRENCY_RATES[code].label}
              </option>
            ))}
          </select>
        </div>

        {/* CONTEXTUAL ACTION — Onboard Project (kanban only) */}
        {activeTab === 'kanban' && (
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
