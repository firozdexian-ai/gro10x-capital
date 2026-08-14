'use client';

import React from 'react';
import { UserCheck, Users, Shield, Receipt, Briefcase, PlusCircle, RotateCw, CheckCircle2, Award, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { formatCurrency, CURRENCY_RATES } from '../../../lib/currency';

/** Shorthand currency formatting helper */
function formatShorthand(val, curr = 'BDT') {
  const num = Number(val) || 0;
  const rate = CURRENCY_RATES[curr]?.rate || 1;
  const symbol = CURRENCY_RATES[curr]?.symbol || '৳';
  const converted = num * rate;

  if (curr === 'BDT') {
    if (converted >= 10000000) {
      return `${symbol}${(converted / 10000000).toFixed(2)} Crore`;
    }
    if (converted >= 100000) {
      return `${symbol}${(converted / 100000).toFixed(1)} Lakhs`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  }

  if (converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(2)}M`;
  }
  if (converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * TeamPromotersTab Component (Tab 7) — Production Standard
 * Handles Directors, Managing Partners, Key Account Managers (KAMs),
 * Growth Promoter Network (with gamified tiers & CRM drilldown), and Commission Payouts.
 */
export default function TeamPromotersTab({
  allKams = [],
  allPromoters = [],
  payoutRequests = [],
  promoterCommissions = [],
  promoterLeads = [],
  promoterTargets = [],
  activeInvestments = [],
  allInvestors = [],
  businesses = [],
  allAppStakeholders = [],
  currency = 'BDT',
  teamSubTab = 'kams',
  setTeamSubTab,
  showKamForm = false,
  setShowKamForm,
  kamForm,
  setKamForm,
  showPromoterForm = false,
  setShowPromoterForm,
  promoterForm,
  setPromoterForm,
  selectedPromoter = null,
  setSelectedPromoter,
  savingTeamAction = false,
  handleAddKam,
  handleToggleKamActive,
  handleAutoCheckPromoterTiers,
  handleAddPromoter,
  handleTogglePromoterDeals,
  handleTogglePromoterActive,
  handlePromoterTierOverride,
  handleClearPayout,
  handleRejectPayout
}) {
  const totalCommissionVal = promoterCommissions.reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0);

  // Role Metadata Config for Team
  const roleConfigMap = {
    admin: {
      label: 'Director / Principal',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(168,85,247,0.15)',
      badgeBorder: 'rgba(168,85,247,0.3)',
      borderColor: '#c084fc',
      icon: '🟣'
    },
    manager: {
      label: 'Managing Partner',
      badgeColor: '#D4AF37',
      badgeBg: 'rgba(212,175,55,0.15)',
      badgeBorder: 'rgba(212,175,55,0.3)',
      borderColor: '#D4AF37',
      icon: '🟡'
    },
    kam: {
      label: 'Key Account Manager',
      badgeColor: '#60a5fa',
      badgeBg: 'rgba(59,130,246,0.15)',
      badgeBorder: 'rgba(59,130,246,0.3)',
      borderColor: '#3b82f6',
      icon: '🔵'
    },
    support: {
      label: 'Operations Support',
      badgeColor: '#94a3b8',
      badgeBg: 'rgba(148,163,184,0.15)',
      badgeBorder: 'rgba(148,163,184,0.3)',
      borderColor: '#64748b',
      icon: '⚪'
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── KPI METRIC STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Managing Partners & KAMs */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Managing Partners &amp; KAMs
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {allKams.filter(k => k.is_active !== false).length} Active
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Client Portfolio &amp; Operations</span>
        </div>

        {/* Card 2: Promoter Network */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Promoter Network
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {allPromoters.filter(p => p.is_active !== false).length} Active
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#3b82f6' }}>Growth &amp; Referral Partners</span>
        </div>

        {/* Card 3: Pending Payout Requests */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(245,158,11,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Payout Requests
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {payoutRequests.filter(p => p.status === 'Pending Verification').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Awaiting Finance Clearance</span>
        </div>

        {/* Card 4: Total Commission Earned */}
        <div className="glass-card-premium" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Commission Earned
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {formatShorthand(totalCommissionVal, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
            Exact: {formatCurrency(totalCommissionVal, currency)}
          </span>
        </div>
      </div>

      {/* ── SUB-TABS SELECTOR ── */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        <button 
          onClick={() => setTeamSubTab('kams')}
          className={`tab-toggle-btn ${teamSubTab === 'kams' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Users size={15} /> Team &amp; Managing Partners ({allKams.length})
        </button>
        <button 
          onClick={() => setTeamSubTab('promoters')}
          className={`tab-toggle-btn ${teamSubTab === 'promoters' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Briefcase size={15} /> Promoter Network ({allPromoters.length})
        </button>
        <button 
          onClick={() => setTeamSubTab('payouts')}
          className={`tab-toggle-btn ${teamSubTab === 'payouts' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Receipt size={15} /> Commission Payout Queue ({payoutRequests.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: MANAGING PARTNERS & KAMS */}
      {/* ---------------------------------------------------- */}
      {teamSubTab === 'kams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
                Directors, Managing Partners &amp; Account Managers
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                Manage internal leadership, HNI relationship directors, and field operations account managers.
              </p>
            </div>
            
            <button 
              onClick={() => setShowKamForm(!showKamForm)}
              className={showKamForm ? 'btn-sm' : 'btn-sm btn-gold'}
              style={{
                background: showKamForm ? 'rgba(255,255,255,0.1)' : undefined,
                color: showKamForm ? '#fff' : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {showKamForm ? '✕ Close Form' : '+ Onboard Team Member'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD TEAM MEMBER FORM */}
          {showKamForm && (
            <div className="glass-card-premium" style={{ padding: '1.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={18} /> Onboard New Team Member
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
                Enter partner or account manager details. Once recorded, they can link their Telegram account to sync alerts and access their management dashboard.
              </p>
              
              <form onSubmit={handleAddKam} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                
                {/* Role / Team Type Selector */}
                <div>
                  <label style={{ display: 'block', color: '#D4AF37', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Role &amp; Responsibility *
                  </label>
                  <select 
                    value={kamForm.team_type || 'kam'} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const defaultTitles = {
                        admin: 'Director / Principal Partner',
                        manager: 'Managing Partner - Client Advisory',
                        kam: 'Key Account Manager (KAM)',
                        support: 'Operations & Compliance Specialist'
                      };
                      setKamForm({ ...kamForm, team_type: val, title: defaultTitles[val] || kamForm.title });
                    }} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', fontWeight: '600' }}
                  >
                    <option value="admin">🟣 Director / Principal Partner (Governance &amp; Strategy)</option>
                    <option value="manager">🟡 Managing Partner (HNI Advisory &amp; Portfolio)</option>
                    <option value="kam">🔵 Key Account Manager (Field Audits &amp; Operations)</option>
                    <option value="support">⚪ Operations Support (BackOps &amp; Compliance)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Full Legal Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tanvir Ahmed" 
                    value={kamForm.full_name} 
                    onChange={(e) => setKamForm({ ...kamForm, full_name: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Designation / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Managing Partner - Consumer CapEx" 
                    value={kamForm.title || kamForm.designation} 
                    onChange={(e) => setKamForm({ ...kamForm, title: e.target.value, designation: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Region / Operating Base</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhaka HQ / Chittagong Hub" 
                    value={kamForm.region} 
                    onChange={(e) => setKamForm({ ...kamForm, region: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="partner@gro10x.com" 
                    value={kamForm.email} 
                    onChange={(e) => setKamForm({ ...kamForm, email: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Phone Number *</label>
                  <input 
                    type="text" 
                    placeholder="+8801700000000" 
                    value={kamForm.phone} 
                    onChange={(e) => setKamForm({ ...kamForm, phone: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Joining Date</label>
                  <input 
                    type="date" 
                    value={kamForm.joined_at} 
                    onChange={(e) => setKamForm({ ...kamForm, joined_at: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.75rem 1.75rem', fontWeight: '700', borderRadius: '6px' }}>
                    {savingTeamAction ? 'Registering Team Member...' : 'Register Team Member'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TEAM CARDS GRID */}
          {allKams.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Users size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Team Members Registered Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                  Onboard Directors, Managing Partners, and Key Account Managers to manage portfolio businesses, investor relations, and operational audits.
                </p>
              </div>
              <button
                onClick={() => setShowKamForm(true)}
                className="btn-gold"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
              >
                <PlusCircle size={16} /> Onboard First Member
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {allKams.map(kam => {
                const assignedInvsCount = allInvestors.filter(i => i.assigned_kam_id === kam.id).length;
                const assignedBizCount = businesses.filter(b => b.kam_id === kam.id).length;
                const auditsCount = (allAppStakeholders || []).filter(s => s.kam_id === kam.id).length;
                const isActive = kam.is_active !== false;

                const roleType = kam.team_type || (kam.full_name?.toLowerCase().includes('firoz') ? 'admin' : 'kam');
                const roleMeta = roleConfigMap[roleType] || roleConfigMap.kam;

                return (
                  <div 
                    key={kam.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '1.35rem', 
                      borderLeft: `4px solid ${roleMeta.borderColor}`, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1rem',
                      background: 'rgba(15, 23, 42, 0.65)'
                    }}
                  >
                    {/* Header: Name + Role Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: '800' }}>
                          {kam.full_name}
                        </h4>
                        <p style={{ margin: '0.15rem 0 0 0', color: roleMeta.badgeColor, fontSize: '0.82rem', fontWeight: '600' }}>
                          {kam.title || kam.designation || roleMeta.label}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📍 {kam.region || 'Dhaka HQ'}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                        {/* Role Badge */}
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: roleMeta.badgeBg,
                          color: roleMeta.badgeColor,
                          border: `1px solid ${roleMeta.badgeBorder}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {roleMeta.icon} {roleMeta.label}
                        </span>

                        {/* Active Status Badge */}
                        <span className={isActive ? 'status-badge status-badge--success' : 'status-badge status-badge--muted'} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          {isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Telegram Details */}
                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>📧 {kam.email || 'Email unlisted'}</div>
                      <div>📞 {kam.phone || 'Phone unlisted'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Telegram Bot:</span>
                        {kam.telegram_onboarded ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.75rem' }}>✅ Bot Onboarded</span>
                        ) : (
                          <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⏳ Pending Setup</span>
                        )}
                      </div>
                    </div>

                    {/* Portfolio Stats Box */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Investors</span>
                        <p style={{ margin: 0, fontWeight: '800', color: '#3b82f6', fontSize: '1.1rem' }}>{assignedInvsCount}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Businesses</span>
                        <p style={{ margin: 0, fontWeight: '800', color: '#D4AF37', fontSize: '1.1rem' }}>{assignedBizCount}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audits</span>
                        <p style={{ margin: 0, fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>{auditsCount}</p>
                      </div>
                    </div>

                    {/* Toggle Active Status */}
                    <button 
                      onClick={() => handleToggleKamActive(kam.id, isActive)}
                      className="btn-sm"
                      style={{ 
                        background: isActive ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', 
                        border: isActive ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(16,185,129,0.25)', 
                        color: isActive ? '#f87171' : '#34d399', 
                        marginTop: 'auto',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {isActive ? 'Deactivate Access' : 'Activate Access'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: PROMOTER NETWORK */}
      {/* ---------------------------------------------------- */}
      {teamSubTab === 'promoters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
                Promoter Network &amp; Gamified Referral Engine
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                Commission-based growth partners. Promoters receive 0.75% base + 0.25% milestone bonus for capital deployed.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAutoCheckPromoterTiers}
                disabled={savingTeamAction}
                className="btn-sm"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCw size={14} /> {savingTeamAction ? 'Scanning...' : 'Auto-Check All Tiers'}
              </button>
              <button 
                onClick={() => setShowPromoterForm(!showPromoterForm)}
                className={showPromoterForm ? 'btn-sm' : 'btn-sm btn-gold'}
                style={{ background: showPromoterForm ? 'rgba(255,255,255,0.1)' : undefined, color: showPromoterForm ? '#fff' : undefined, padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                {showPromoterForm ? '✕ Close Form' : '+ Onboard Promoter'}
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE ADD PROMOTER FORM */}
          {showPromoterForm && (
            <div className="glass-card-premium" style={{ padding: '1.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={18} /> Onboard New Growth Promoter
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
                A unique referral code (e.g. <code>GRO-ALI-4892</code>) will be auto-generated. Direct promoter to GRO10X Telegram Bot to complete onboarding.
              </p>
              <form onSubmit={handleAddPromoter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Full Legal Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rafiqul Islam" 
                    value={promoterForm.full_name} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, full_name: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Alias / Brand Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rafiq Finance" 
                    value={promoterForm.alias_name} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, alias_name: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Initial Tier</label>
                  <select 
                    value={promoterForm.tier} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, tier: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Trainee">Trainee (0-49 Leads) [No Usual Access]</option>
                    <option value="Junior_Associate">Junior Associate (50+ Leads)</option>
                    <option value="Associate">Associate (1st Investment)</option>
                    <option value="Senior_Associate">Senior Associate (5M BDT Raised)</option>
                    <option value="Elite">Elite (20M BDT Raised)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+8801800000000" 
                    value={promoterForm.phone} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, phone: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="promoter@gmail.com" 
                    value={promoterForm.email} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, email: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Joined Date</label>
                  <input 
                    type="date" 
                    value={promoterForm.joined_at} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, joined_at: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.75rem 1.75rem', fontWeight: '700', borderRadius: '6px' }}>
                    {savingTeamAction ? 'Saving Promoter...' : 'Onboard Promoter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PROMOTER CARD STACK */}
          {allPromoters.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', display: 'grid', placeItems: 'center', color: '#3b82f6' }}>
                <Briefcase size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Growth Promoters Onboarded Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                  Onboard referral partners, content creators, and growth agents with unique referral tracking codes to scale deal distribution.
                </p>
              </div>
              <button
                onClick={() => setShowPromoterForm(true)}
                className="btn-gold"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
              >
                <PlusCircle size={16} /> Onboard First Promoter
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allPromoters.map(promoter => {
                const isSelected = selectedPromoter?.id === promoter.id;
                const pLeads = promoterLeads.filter(l => l.promoter_id === promoter.id);
                const pInvs = activeInvestments.filter(inv => inv.investors?.origin_promoter_id === promoter.id);
                const pComms = promoterCommissions.filter(c => c.promoter_id === promoter.id);
                
                const totalBaseComm = pComms.filter(c => c.commission_type === 'Base_0.75').reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0);
                const totalBonusComm = pComms.filter(c => c.commission_type === 'Target_0.25').reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0);
                const totalRaised = pInvs.reduce((sum, i) => sum + Number(i.amount_invested_bdt || 0), 0);

                const tier = promoter.tier || 'Trainee';
                const isTrainee = tier === 'Trainee';
                const isPromActive = promoter.is_active !== false;

                const tierBadgeClassMap = {
                  Trainee: 'status-badge status-badge--muted',
                  Junior_Associate: 'status-badge status-badge--warning',
                  Associate: 'status-badge status-badge--success',
                  Senior_Associate: 'status-badge status-badge--info',
                  Elite: 'status-badge status-badge--gold'
                };
                const tierBorderColorMap = {
                  Trainee: '#64748b',
                  Junior_Associate: '#f59e0b',
                  Associate: '#10b981',
                  Senior_Associate: '#3b82f6',
                  Elite: '#D4AF37'
                };

                return (
                  <div key={promoter.id} className="deal-card" style={{ borderLeft: `4px solid ${tierBorderColorMap[tier] || '#fff'}`, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Alias / Brand Name</span>
                          <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.15rem', color: '#fff', fontWeight: 'bold' }}>{promoter.alias_name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({promoter.full_name})</span>
                        </div>

                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Referral Code</span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.9rem', color: '#D4AF37', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {promoter.referral_code}
                          </p>
                        </div>

                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Promoter Tier</span>
                          <div style={{ marginTop: '0.2rem' }}>
                            <span className={tierBadgeClassMap[tier] || 'status-badge'}>
                              ★ {tier.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Raised</span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.95rem', color: '#10b981', fontWeight: 'bold' }}>
                            {formatCurrency(totalRaised, currency)}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* DEAL ACCESS TOGGLE */}
                        <button
                          onClick={() => handleTogglePromoterDeals(promoter.id, promoter.can_promote_deals, tier)}
                          title={isTrainee ? 'Trainee tier locked: must reach 50 leads first' : 'Toggle deal sharing link access'}
                          className="btn-sm"
                          style={{
                            background: promoter.can_promote_deals ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: promoter.can_promote_deals ? '#10b981' : '#ef4444',
                            border: promoter.can_promote_deals ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                            padding: '0.4rem 0.75rem',
                            cursor: isTrainee ? 'not-allowed' : 'pointer',
                            opacity: isTrainee ? 0.6 : 1,
                            borderRadius: '6px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {promoter.can_promote_deals ? <><Unlock size={13} /> Deals Unlocked</> : <><Lock size={13} /> Deals Locked</>}
                        </button>

                        {/* ACTIVE STATUS TOGGLE */}
                        {handleTogglePromoterActive && (
                          <button
                            onClick={() => handleTogglePromoterActive(promoter.id, isPromActive)}
                            className="btn-sm"
                            style={{
                              background: isPromActive ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.15)',
                              color: isPromActive ? '#cbd5e1' : '#ef4444',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {isPromActive ? 'Active' : 'Inactive'}
                          </button>
                        )}

                        {/* INSPECT TOGGLE */}
                        <button
                          onClick={() => setSelectedPromoter(isSelected ? null : promoter)}
                          className="btn-sm"
                          style={{
                            background: 'rgba(212,175,55,0.15)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.3)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected ? 'Close File ▲' : 'Inspect File ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DRILLDOWN INSPECTOR */}
                    {isSelected && (
                      <div className="inspector-grid" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                        
                        {/* LEFT PANEL: SCORECARD & TIER MILESTONES */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>📊 Performance Scorecard &amp; Tier Progress</h4>

                          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Milestone Progression Map</span>
                              <span style={{ fontSize: '0.75rem', color: tierBorderColorMap[tier] || '#fff', fontWeight: 'bold' }}>Current: {tier.replace(/_/g, ' ')}</span>
                            </div>

                            {/* MILESTONE MAP */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                              <div style={{ color: tier === 'Trainee' ? '#D4AF37' : '#10b981', fontWeight: 'bold' }}>
                                🔵 Trainee<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>0-49 Leads</span>
                              </div>
                              <span style={{ color: '#64748b' }}>→</span>
                              <div style={{ color: ['Junior_Associate', 'Associate', 'Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                🟡 Junior Assoc<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>50 Leads</span>
                              </div>
                              <span style={{ color: '#64748b' }}>→</span>
                              <div style={{ color: ['Associate', 'Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                🟢 Associate<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>1st Raise</span>
                              </div>
                              <span style={{ color: '#64748b' }}>→</span>
                              <div style={{ color: ['Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                🔷 Senior Assoc<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>5M BDT</span>
                              </div>
                              <span style={{ color: '#64748b' }}>→</span>
                              <div style={{ color: tier === 'Elite' ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                ⭐ Elite<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>20M BDT</span>
                              </div>
                            </div>

                            {/* PROGRESS HINT */}
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                              {isTrainee && (
                                <span>🎯 <strong>Next Milestone:</strong> Submit <strong>{Math.max(0, 50 - pLeads.length)}</strong> more investor leads to unlock Junior Associate &amp; Deal Promotion links.</span>
                              )}
                              {tier === 'Junior_Associate' && (
                                <span>🎯 <strong>Next Milestone:</strong> Secure <strong>1st active investment</strong> via referral link to reach Associate tier.</span>
                              )}
                              {tier === 'Associate' && (
                                <span>🎯 <strong>Next Milestone:</strong> Reach <strong>৳5,000,000 BDT</strong> total raised to reach Senior Associate tier.</span>
                              )}
                              {tier === 'Senior_Associate' && (
                                <span>🎯 <strong>Next Milestone:</strong> Reach <strong>৳20,000,000 BDT</strong> total raised to reach Elite tier.</span>
                              )}
                              {tier === 'Elite' && (
                                <span style={{ color: '#D4AF37' }}>🏆 <strong>Top Tier Achieved:</strong> Highest tier unlocked! Maximized bonus tier commission eligible.</span>
                              )}
                            </div>
                          </div>

                          {/* SCORECARD METRICS */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.8rem' }}>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Total Leads</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{pLeads.length}</p>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Conversions</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>{pInvs.length}</p>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Base 0.75%</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6' }}>{formatCurrency(totalBaseComm, currency)}</p>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Bonus 0.25%</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#D4AF37' }}>{formatCurrency(totalBonusComm, currency)}</p>
                            </div>
                          </div>

                          {/* GAMIFIED TARGETS FOR PROMOTER */}
                          <div>
                            <h5 style={{ margin: '0 0 0.4rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Gamified Campaign Targets (0.25% Bonus Tier)</h5>
                            {promoterTargets.filter(t => t.promoter_id === promoter.id).length === 0 ? (
                              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No active project target goals assigned.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {promoterTargets.filter(t => t.promoter_id === promoter.id).map(tgt => {
                                  const pct = Math.min(100, Math.round((Number(tgt.amount_raised_bdt || 0) / Number(tgt.target_raise_bdt || 1)) * 100));
                                  return (
                                    <div key={tgt.id} style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{tgt.funding_projects?.project_title}</span>
                                        <span style={{ color: tgt.status === 'Target_Hit' ? '#10b981' : '#D4AF37', fontWeight: 'bold' }}>
                                          {pct}% ({formatCurrency(tgt.amount_raised_bdt, currency)} / {formatCurrency(tgt.target_raise_bdt, currency)})
                                        </span>
                                      </div>
                                      <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: tgt.status === 'Target_Hit' ? '#10b981' : '#D4AF37' }}></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* MANUAL TIER OVERRIDE DROPDOWN */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Admin Tier Override:</span>
                            <select 
                              value={tier}
                              onChange={(e) => handlePromoterTierOverride(promoter.id, e.target.value)}
                              style={{ padding: '0.4rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                              <option value="Trainee">Trainee</option>
                              <option value="Junior_Associate">Junior Associate</option>
                              <option value="Associate">Associate</option>
                              <option value="Senior_Associate">Senior Associate</option>
                              <option value="Elite">Elite</option>
                            </select>
                          </div>

                        </div>

                        {/* RIGHT PANEL: COMMISSION LEDGER & CRM LEADS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                          
                          {/* COMMISSION LEDGER */}
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>💰 Commission Earnings Ledger</h4>
                            {pComms.length === 0 ? (
                              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No commission records logged for this promoter.</p>
                            ) : (
                              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Type</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pComms.map(c => (
                                      <tr key={c.id}>
                                        <td style={{ color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td>
                                          <span style={{ color: c.commission_type === 'Base_0.75' ? '#3b82f6' : '#D4AF37', fontWeight: 'bold' }}>
                                            {c.commission_type.replace('_', ' ')}
                                          </span>
                                        </td>
                                        <td style={{ color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(c.amount_bdt, currency)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* CRM LEADS LIST */}
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '0.95rem' }}>👥 Submitted Leads ({pLeads.length})</h4>
                            {pLeads.length === 0 ? (
                              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No leads submitted via referral code yet.</p>
                            ) : (
                              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {pLeads.map(l => (
                                  <div key={l.id} style={{ background: '#0f172a', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{l.name}</span>
                                      <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.75rem' }}>{l.phone}</span>
                                    </div>
                                    <span className={l.status === 'Converted' ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>
                                      {l.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: COMMISSION PAYOUT QUEUE */}
      {/* ---------------------------------------------------- */}
      {teamSubTab === 'payouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* PAYROLL ALERT NOTE */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #D4AF37', background: 'rgba(212,175,55,0.05)' }}>
            <h4 style={{ margin: '0 0 0.2rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>💳 Commission Clearance Note</h4>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem' }}>
              Clearing a payout request marks the funds as transferred in the promoter ledger. For salary disbursements to Managing Partners, use the financial disbursement engine in Tab 5.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
              Promoter Commission Payout Queue
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Pending Requests: <strong style={{ color: '#f59e0b' }}>{payoutRequests.filter(p => p.status === 'Pending Verification').length}</strong>
            </span>
          </div>

          {payoutRequests.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                <Receipt size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Commission Payout Requests Pending
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                  Promoter commission withdrawal requests for converted investors and milestone bonuses will appear here for finance verification and clearance.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Request Date</th>
                    <th>Promoter</th>
                    <th>Disbursement Channel</th>
                    <th>Account Details</th>
                    <th>Amount BDT</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutRequests.map(req => {
                    const isPending = req.status === 'Pending Verification';
                    const isCleared = req.status === 'Cleared' || req.status === 'Approved';
                    const isRejected = req.status === 'Rejected';
                    const promoterName = req.team?.alias_name || req.promoters?.alias_name || req.team?.full_name || req.promoter_name || 'Promoter';

                    return (
                      <tr key={req.id}>
                        <td style={{ color: '#94a3b8' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{promoterName}</td>
                        <td style={{ color: '#D4AF37' }}>{req.disbursement_channel || 'bKash'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{req.account_details || req.phone}</td>
                        <td style={{ fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(req.amount_bdt, currency)}</td>
                        <td>
                          <span className={
                            isCleared ? 'status-badge status-badge--success' :
                            isRejected ? 'status-badge status-badge--danger' :
                            'status-badge status-badge--warning'
                          }>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isPending && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button 
                                onClick={() => handleClearPayout(req.id)}
                                className="btn-sm btn-gold"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '700' }}
                              >
                                Mark Cleared
                              </button>
                              <button 
                                onClick={() => handleRejectPayout(req.id)}
                                className="btn-sm"
                                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '700' }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {isCleared && (
                            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Cleared on {req.cleared_at ? new Date(req.cleared_at).toLocaleDateString() : 'N/A'}</span>
                          )}
                          {isRejected && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Rejected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
