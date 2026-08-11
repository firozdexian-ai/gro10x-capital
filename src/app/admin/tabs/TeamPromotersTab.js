'use client';

import React from 'react';

/**
 * TeamPromotersTab Component (Tab 7)
 * Handles Managing Partners (KAMs), Promoter Network (with gamified tiers & inspector),
 * and Commission Payout Queue.
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
  handlePromoterTierOverride,
  handleClearPayout,
  handleRejectPayout,
  formatCurrency
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPI METRIC STRIP */}
      <div className="kpi-grid">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Managing Partners (KAMs)</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {allKams.filter(k => k.is_active !== false).length} Active
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Client Portfolio Directors</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Promoter Network</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {allPromoters.filter(p => p.is_active !== false).length} Active
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Growth & Referral Partners</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending Payout Requests</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {payoutRequests.filter(p => p.status === 'Pending Verification').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Awaiting Finance Clearance</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Commission Earned</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {formatCurrency(
              promoterCommissions.reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0),
              currency
            )}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Base 0.75% + Bonus 0.25%</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="tab-toggle-group" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setTeamSubTab('kams')}
          className={`tab-toggle-btn ${teamSubTab === 'kams' ? 'active' : ''}`}
        >
          Managing Partners ({allKams.length})
        </button>
        <button 
          onClick={() => setTeamSubTab('promoters')}
          className={`tab-toggle-btn ${teamSubTab === 'promoters' ? 'active' : ''}`}
        >
          Promoter Network ({allPromoters.length})
        </button>
        <button 
          onClick={() => setTeamSubTab('payouts')}
          className={`tab-toggle-btn ${teamSubTab === 'payouts' ? 'active' : ''}`}
        >
          Commission Payout Queue ({payoutRequests.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: MANAGING PARTNERS (KAMs) */}
      {/* ---------------------------------------------------- */}
      {teamSubTab === 'kams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Managing Partners & Portfolio Directors</h3>
            <button 
              onClick={() => setShowKamForm(!showKamForm)}
              className={showKamForm ? 'btn-sm' : 'btn-sm btn-gold'}
              style={{ background: showKamForm ? 'rgba(255,255,255,0.1)' : undefined, color: showKamForm ? '#fff' : undefined }}
            >
              {showKamForm ? '✕ Close Form' : '+ Onboard Managing Partner'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD KAM FORM */}
          {showKamForm && (
            <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Onboard New Managing Partner (KAM)</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '-0.5rem 0 1rem 0' }}>
                Once entered, direct the partner to open the GRO10X Telegram Bot to sync their Chat ID and unlock their Mini App dashboard.
              </p>
              <form onSubmit={handleAddKam} className="form-grid-3col" style={{ fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tanvir Ahmed" 
                    value={kamForm.full_name} 
                    onChange={(e) => setKamForm({ ...kamForm, full_name: e.target.value })} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Managing Partner - Consumer CapEx" 
                    value={kamForm.title} 
                    onChange={(e) => setKamForm({ ...kamForm, title: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Region / Division</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhaka Central" 
                    value={kamForm.region} 
                    onChange={(e) => setKamForm({ ...kamForm, region: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="partner@gro10x.com" 
                    value={kamForm.email} 
                    onChange={(e) => setKamForm({ ...kamForm, email: e.target.value })} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+8801700000000" 
                    value={kamForm.phone} 
                    onChange={(e) => setKamForm({ ...kamForm, phone: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Joining Date</label>
                  <input 
                    type="date" 
                    value={kamForm.joined_at} 
                    onChange={(e) => setKamForm({ ...kamForm, joined_at: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingTeamAction ? 'Saving Partner...' : 'Onboard Partner'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KAM CARDS GRID */}
          {allKams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No Managing Partners registered yet.</div>
          ) : (
            <div className="kam-cards-grid">
              {allKams.map(kam => {
                const assignedInvsCount = allInvestors.filter(i => i.assigned_kam_id === kam.id).length;
                const assignedBizCount = businesses.filter(b => b.kam_id === kam.id).length;
                const auditsCount = (allAppStakeholders || []).filter(s => s.kam_id === kam.id).length;
                const isActive = kam.is_active !== false;

                return (
                  <div key={kam.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isActive ? '4px solid #D4AF37' : '4px solid #64748b', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{kam.full_name}</h4>
                        <p style={{ margin: '0.1rem 0 0 0', color: '#D4AF37', fontSize: '0.8rem' }}>{kam.title || 'Managing Partner'}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📍 {kam.region || 'Dhaka HQ'}</span>
                      </div>

                      <span className={isActive ? 'status-badge status-badge--success' : 'status-badge status-badge--muted'}>
                        {isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>

                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                      <div>📧 {kam.email || 'Email unlisted'}</div>
                      <div>📞 {kam.phone || 'Phone unlisted'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem' }}>Telegram Bot:</span>
                        {kam.telegram_onboarded ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.75rem' }}>✅ Bot Onboarded</span>
                        ) : (
                          <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⏳ Pending Setup</span>
                        )}
                      </div>
                    </div>

                    {/* PORTFOLIO STATS BOX */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Investors</span>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6', fontSize: '1rem' }}>{assignedInvsCount}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Businesses</span>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#D4AF37', fontSize: '1rem' }}>{assignedBizCount}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Audits</span>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>{auditsCount}</p>
                      </div>
                    </div>

                    {/* TOGGLE ACTIVE STATUS */}
                    <button 
                      onClick={() => handleToggleKamActive(kam.id, isActive)}
                      className="btn-sm"
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', marginTop: 'auto' }}
                    >
                      {isActive ? 'Deactivate Partner Access' : 'Activate Partner Access'}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Promoter Network & Gamified Referral Engine</h3>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleAutoCheckPromoterTiers}
                disabled={savingTeamAction}
                className="btn-sm"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.45rem 0.95rem' }}
              >
                {savingTeamAction ? 'Scanning...' : '🔄 Auto-Check All Tiers'}
              </button>
              <button 
                onClick={() => setShowPromoterForm(!showPromoterForm)}
                className={showPromoterForm ? 'btn-sm' : 'btn-sm btn-gold'}
                style={{ background: showPromoterForm ? 'rgba(255,255,255,0.1)' : undefined, color: showPromoterForm ? '#fff' : undefined, padding: '0.45rem 0.95rem' }}
              >
                {showPromoterForm ? '✕ Close Form' : '+ Onboard Promoter'}
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE ADD PROMOTER FORM */}
          {showPromoterForm && (
            <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Onboard New Growth Promoter</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '-0.5rem 0 1rem 0' }}>
                A unique referral code (e.g. <code>GRO-ALI-4892</code>) will be auto-generated. Direct promoter to GRO10X Telegram Bot to complete onboarding.
              </p>
              <form onSubmit={handleAddPromoter} className="form-grid-3col" style={{ fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Legal Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rafiqul Islam" 
                    value={promoterForm.full_name} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, full_name: e.target.value })} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Alias / Brand Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rafiq Finance" 
                    value={promoterForm.alias_name} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, alias_name: e.target.value })} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Tier</label>
                  <select 
                    value={promoterForm.tier} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, tier: e.target.value })} 
                    style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Trainee">Trainee (0-49 Leads) [No Deal Access]</option>
                    <option value="Junior_Associate">Junior Associate (50+ Leads)</option>
                    <option value="Associate">Associate (1st Investment)</option>
                    <option value="Senior_Associate">Senior Associate (5M BDT Raised)</option>
                    <option value="Elite">Elite (20M BDT Raised)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+8801800000000" 
                    value={promoterForm.phone} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, phone: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="promoter@gmail.com" 
                    value={promoterForm.email} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, email: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Joined Date</label>
                  <input 
                    type="date" 
                    value={promoterForm.joined_at} 
                    onChange={(e) => setPromoterForm({ ...promoterForm, joined_at: e.target.value })} 
                    className="form-input" 
                  />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingTeamAction ? 'Saving Promoter...' : 'Onboard Promoter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PROMOTER CARD STACK */}
          {allPromoters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No promoters onboarded in referral network yet.</div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                              ★ {tier.replace('_', ' ')}
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* DEAL ACCESS TOGGLE */}
                        <button
                          onClick={() => handleTogglePromoterDeals(promoter.id, promoter.can_promote_deals, tier)}
                          title={isTrainee ? 'Trainee tier locked: must reach 50 leads first' : 'Toggle deal sharing link access'}
                          className="btn-sm"
                          style={{
                            background: promoter.can_promote_deals ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: promoter.can_promote_deals ? '#10b981' : '#ef4444',
                            border: promoter.can_promote_deals ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                            padding: '0.35rem 0.75rem',
                            cursor: isTrainee ? 'not-allowed' : 'pointer',
                            opacity: isTrainee ? 0.6 : 1
                          }}
                        >
                          {promoter.can_promote_deals ? '🔓 Deals Unlocked' : '🔒 Deals Locked'}
                        </button>

                        {/* INSPECT TOGGLE */}
                        <button
                          onClick={() => setSelectedPromoter(isSelected ? null : promoter)}
                          className="btn-sm"
                          style={{
                            background: 'rgba(212,175,55,0.15)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.3)',
                            padding: '0.4rem 0.85rem'
                          }}
                        >
                          {isSelected ? 'Close File ▲' : 'Inspect File ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DRILLDOWN INSPECTOR */}
                    {isSelected && (
                      <div className="inspector-grid" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px' }}>
                        
                        {/* LEFT PANEL: SCORECARD & TIER MILESTONES */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>📊 Performance Scorecard & Tier Progress</h4>

                          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Milestone Progression Map</span>
                              <span style={{ fontSize: '0.75rem', color: tierBorderColorMap[tier] || '#fff', fontWeight: 'bold' }}>Current: {tier.replace('_', ' ')}</span>
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
                                <span>🎯 <strong>Next Milestone:</strong> Submit <strong>{Math.max(0, 50 - pLeads.length)}</strong> more investor leads to unlock Junior Associate & Deal Promotion links.</span>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Promoter Commission Payout Queue</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Pending Requests: <strong style={{ color: '#f59e0b' }}>{payoutRequests.filter(p => p.status === 'Pending Verification').length}</strong>
            </span>
          </div>

          {payoutRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No payout requests logged in queue.</div>
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

                    return (
                      <tr key={req.id}>
                        <td style={{ color: '#94a3b8' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{req.team?.alias_name || req.team?.full_name || 'Promoter'}</td>
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
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Mark Cleared
                              </button>
                              <button 
                                onClick={() => handleRejectPayout(req.id)}
                                className="btn-sm"
                                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
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
