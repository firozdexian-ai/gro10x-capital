'use client';
import React from 'react';
import {
  Activity, Layers, Building2, Users, TrendingUp, ArrowUpRight, Calculator,
  Award, MessageSquare, FileText, BarChart2, Bot, Sparkles, Wallet, Settings,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

/**
 * AdminSidebar — Collapsible navigation sidebar for the GRO10X admin panel.
 *
 * Props:
 *   activeTab              (string)   — currently active tab key
 *   setActiveTab           (fn)       — tab setter
 *   sidebarCollapsed       (boolean)  — whether sidebar is in icon-rail mode
 *   setSidebarCollapsed    (fn)       — toggle setter
 *   user                   (object)   — Supabase user { email }
 *   signOut                (fn)       — sign-out callback
 *   currency               (string)   — active currency code
 *   totalFeeSpreadCaptured (number)   — dynamic deal spread total in BDT (driven by dealSpreadPct × project targets)
 *   dealSpreadPct          (number)   — deal spread percentage from platform_settings (default: 5)
 *   pendingCounts          (object)   — { kycPayments, cohort, leads }
 */
export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  user,
  signOut,
  currency,
  totalFeeSpreadCaptured,
  dealSpreadPct = 5,
  pendingCounts = {},
}) {
  const { kycPayments = 0, cohort = 0, leads = 0 } = pendingCounts;

  /** Simple nav button factory for single-badge-free tabs */
  const NavBtn = ({ tabKey, label, Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`admin-nav-btn ${activeTab === tabKey ? 'active' : ''}`}
      title={label}
    >
      <Icon size={18} />
      <span className="sidebar-hide-on-collapse">{label}</span>
    </button>
  );

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''}`}>

      {/* ── SIDEBAR HEADER & COLLAPSE TOGGLE ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="sidebar-hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#10b981', boxShadow: '0 0 10px #10b981'
          }} />
          <span style={{ fontWeight: '800', fontSize: '0.82rem', letterSpacing: '0.04em', color: '#cbd5e1', textTransform: 'uppercase' }}>
            Operations Hub <span style={{ color: '#D4AF37' }}>v0.8.3</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="admin-sidebar-toggle"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{ margin: sidebarCollapsed ? '0 auto' : '0' }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── USER AVATAR CARD ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '0.65rem 0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37',
            display: 'grid', placeItems: 'center', color: '#D4AF37',
            fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0,
          }}>
            {(user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div className="sidebar-hide-on-collapse" style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#D4AF37', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
            <span className="status-badge status-badge--success" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
              Director Access
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          title="Sign Out"
          className="sidebar-hide-on-collapse"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* ── GROUPED NAVIGATION ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

        {/* GROUP 1: OVERVIEW */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">OVERVIEW</p>
          <NavBtn tabKey="dashboard" label="Command Center" Icon={Activity} />
        </div>

        {/* GROUP 2: DEAL OPERATIONS */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">DEAL OPERATIONS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <NavBtn tabKey="kanban" label="Deal Pipeline" Icon={Layers} />
            <button
              onClick={() => setActiveTab('business-registry')}
              className={`admin-nav-btn ${activeTab === 'business-registry' ? 'active' : ''}`}
              title="Business Registry"
            >
              <Building2 size={18} />
              <span className="sidebar-hide-on-collapse">Business Registry</span>
              {cohort > 0 && (
                <span className="status-badge status-badge--gold sidebar-hide-on-collapse" style={{ marginLeft: 'auto' }}>
                  {cohort}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('valuation-model')}
              className={`admin-nav-btn ${activeTab === 'valuation-model' ? 'active' : ''}`}
              title="Deal Valuation & DCF Model"
            >
              <Calculator size={18} />
              <span className="sidebar-hide-on-collapse">Valuation Model</span>
            </button>
          </div>
        </div>

        {/* GROUP 3: INVESTOR OPERATIONS */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">INVESTOR OPERATIONS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              onClick={() => setActiveTab('investors')}
              className={`admin-nav-btn ${activeTab === 'investors' ? 'active' : ''}`}
              title="Investor Hub"
            >
              <Users size={18} />
              <span className="sidebar-hide-on-collapse">Investor Hub</span>
              {kycPayments > 0 && (
                <span className="status-badge status-badge--danger sidebar-hide-on-collapse" style={{ marginLeft: 'auto' }}>
                  {kycPayments}
                </span>
              )}
            </button>
            <NavBtn tabKey="dividend" label="Yield Engine" Icon={TrendingUp} />
            <NavBtn tabKey="cash-pipeline" label="Cash Concierge" Icon={Wallet} />
          </div>
        </div>

        {/* GROUP 4: TEAM & GROWTH */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">TEAM &amp; GROWTH</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <NavBtn tabKey="team-promoters" label="Team & Promoters" Icon={Award} />
            <button
              onClick={() => setActiveTab('leads-marketing')}
              className={`admin-nav-btn ${activeTab === 'leads-marketing' ? 'active' : ''}`}
              title="Leads & Marketing"
            >
              <MessageSquare size={18} />
              <span className="sidebar-hide-on-collapse">Leads &amp; Marketing</span>
              {leads > 0 && (
                <span className="status-badge status-badge--info sidebar-hide-on-collapse" style={{ marginLeft: 'auto' }}>
                  {leads}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* GROUP 5: COMPLIANCE */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">COMPLIANCE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <NavBtn tabKey="legal" label="Legal & Compliance" Icon={FileText} />
            <NavBtn tabKey="analytics" label="Analytics" Icon={BarChart2} />
          </div>
        </div>

        {/* GROUP 6: PLATFORM */}
        <div>
          <p className="admin-nav-group-label sidebar-hide-on-collapse">PLATFORM</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <NavBtn tabKey="bot-management" label="Bots & Access Control" Icon={Bot} />
            <NavBtn tabKey="settings" label="Settings" Icon={Settings} />
          </div>
        </div>

      </nav>

      {/* ── BOTTOM SPREAD WIDGET ── */}
      <div
        className="sidebar-hide-on-collapse"
        style={{
          marginTop: 'auto',
          background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
          padding: '0.85rem', borderRadius: '12px', width: '100%',
        }}
      >
        <p style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: '700', margin: '0 0 0.2rem 0' }}>
          {dealSpreadPct}% Deal Spread Target
        </p>
        <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
          {formatCurrency(totalFeeSpreadCaptured, currency)}
        </p>
      </div>

    </aside>
  );
}
