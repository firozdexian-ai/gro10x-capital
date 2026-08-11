'use client';
import React from 'react';
import { Search, PlusCircle, Lock, CheckCircle, ShieldAlert, CreditCard, Users, FileText } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/**
 * InvestorHubTab — Upgraded Tab 4 Investor Hub & Operations for GRO10X Admin.
 *
 * Sub-tabs:
 *   1. 'all-investors' — Searchable investor table with lifecycle status and KAM assignment
 *   2. 'bookings'      — Investment bookings queue with status updater
 *   3. 'kyc'           — KYC clearance verification queue
 *   4. 'payments'      — Payment proof clearance queue
 */
export default function InvestorHubTab({
  // KPI data
  allInvestors = [],
  totalAumRaised = 0,
  pendingKycCount = 0,
  pendingPaymentsCount = 0,
  // Sub-tab control
  investorSubTab = 'all-investors',
  setInvestorSubTab,
  // Sub-tab 1: All Investors
  activeInvestments = [],
  allKams = [],
  investorSearch = '',
  setInvestorSearch,
  investorStatusFilter = 'All',
  setInvestorStatusFilter,
  setShowAddInvestorModal,
  handleAssignKamToInvestor,
  setSelectedInvestor,
  setInvestorDrawerTab,
  // Sub-tab 2: Bookings
  allBookings = [],
  bookingStatusFilter = 'All',
  setBookingStatusFilter,
  handleUpdateBookingStatus,
  // Sub-tab 3: KYC Queue
  kycSubmissions = [],
  handleKycReview,
  // Sub-tab 4: Payment Queue
  paymentSubmissions = [],
  handlePaymentReview,
  // Shared
  currency = 'BDT',
}) {
  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── KPI METRIC STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Investors</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>{allInvestors.length}</h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Platform Total</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>KYC Verified (Active+)</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {allInvestors.filter(i => i.kyc_verified || ['KYC_L2','KYC_L3','Active','VIP'].includes(i.onboarding_status)).length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Clearance Passed</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total AUM Raised</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {formatCurrency(totalAumRaised, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Settled Capital</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>KYC Queue</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: pendingKycCount > 0 ? '#ef4444' : '#10b981', margin: 0 }}>{pendingKycCount}</h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Review</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Payment Queue</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: pendingPaymentsCount > 0 ? '#f59e0b' : '#10b981', margin: 0 }}>{pendingPaymentsCount}</h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Proof Clearance</span>
        </div>
      </div>

      {/* ── 4 SUB-TABS SELECTOR STRIP ── */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        <button
          onClick={() => setInvestorSubTab('all-investors')}
          className={`tab-toggle-btn ${investorSubTab === 'all-investors' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Users size={15} /> All Investors ({allInvestors.length})
        </button>

        <button
          onClick={() => setInvestorSubTab('bookings')}
          className={`tab-toggle-btn ${investorSubTab === 'bookings' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileText size={15} /> Investment Bookings ({allBookings.length})
          {allBookings.filter(b => b.status === 'Proof_Submitted').length > 0 && (
            <span className="status-badge status-badge--info" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
              {allBookings.filter(b => b.status === 'Proof_Submitted').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setInvestorSubTab('kyc')}
          className={`tab-toggle-btn ${investorSubTab === 'kyc' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ShieldAlert size={15} /> KYC Queue
          {pendingKycCount > 0 && (
            <span className="status-badge status-badge--danger" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setInvestorSubTab('payments')}
          className={`tab-toggle-btn ${investorSubTab === 'payments' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <CreditCard size={15} /> Payment Queue
          {pendingPaymentsCount > 0 && (
            <span className="status-badge status-badge--warning" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
              {pendingPaymentsCount}
            </span>
          )}
        </button>
      </div>

      {/* ── SUB-TAB 1: ALL INVESTORS ── */}
      {investorSubTab === 'all-investors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '0.85rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center', minWidth: '280px' }}>
              
              {/* Search */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search investor alias or contact..."
                  value={investorSearch}
                  onChange={(e) => setInvestorSearch(e.target.value)}
                  style={{ width: '100%', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Lifecycle Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status:</span>
                <select
                  value={investorStatusFilter}
                  onChange={(e) => setInvestorStatusFilter(e.target.value)}
                  style={{ background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="All">All Lifecycle Statuses</option>
                  <option value="Invited">Invited</option>
                  <option value="Telegram_Verified">Telegram Verified</option>
                  <option value="KYC_L1">KYC Level 1</option>
                  <option value="KYC_L2">KYC Level 2</option>
                  <option value="KYC_L3">KYC Level 3</option>
                  <option value="Active">Active Investor</option>
                  <option value="VIP">VIP Investor</option>
                </select>
              </div>

            </div>

            {/* Onboard Button */}
            <button
              onClick={() => setShowAddInvestorModal(true)}
              className="btn-gold"
              style={{ padding: '0.65rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
            >
              <PlusCircle size={18} /> Onboard Investor
            </button>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Investor Alias</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Lifecycle Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>KYC Level</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Invested</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Origin Source</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned KAM</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allInvestors
                  .filter(inv => {
                    const matchesSearch = !investorSearch ||
                      (inv.alias_name && inv.alias_name.toLowerCase().includes(investorSearch.toLowerCase())) ||
                      (inv.phone && inv.phone.includes(investorSearch)) ||
                      (inv.email && inv.email.toLowerCase().includes(investorSearch.toLowerCase()));
                    const matchesStatus = investorStatusFilter === 'All' || (inv.onboarding_status || 'Invited') === investorStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map(inv => {
                    const invInvestments = activeInvestments.filter(i => i.investor_id === inv.id);
                    const totalInvAmt = invInvestments.reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                    const status = inv.onboarding_status || (inv.kyc_verified ? 'Active' : 'Invited');

                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        
                        {/* Alias + Privacy Badge */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#D4AF37' }}>{inv.alias_name}</span>
                            {inv.requires_anonymity && (
                              <span title="Privacy Coverage Enabled (Alias Only)" className="status-badge status-badge--purple" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                                <Lock size={10} /> Anon
                              </span>
                            )}
                          </div>
                          {!inv.requires_anonymity && (inv.phone || inv.email) && (
                            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                              {inv.phone} {inv.email ? `| ${inv.email}` : ''}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {inv.investor_category || 'HNI'}
                          </span>
                        </td>

                        {/* Lifecycle Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`status-badge ${
                            ['Active','VIP'].includes(status) ? 'status-badge--success' :
                            ['KYC_L2','KYC_L3'].includes(status) ? 'status-badge--info' : 'status-badge--gold'
                          }`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* KYC Level */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ color: inv.kyc_verified ? '#10b981' : '#94a3b8', fontWeight: 'bold' }}>
                            Level {inv.kyc_level || 1}
                          </span>
                        </td>

                        {/* Total Invested */}
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: totalInvAmt > 0 ? '#10b981' : '#64748b' }}>
                          {formatCurrency(totalInvAmt, currency)}
                        </td>

                        {/* Origin Source */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {inv.origin_source === 'Promoter' || inv.promoters?.full_name || inv.promoters?.alias_name ? (
                            <span className="status-badge status-badge--warning">
                              Promoter: {inv.promoters?.alias_name || inv.promoters?.full_name || 'Tagged'}
                            </span>
                          ) : inv.origin_source === 'Public_Page' ? (
                            <span className="status-badge status-badge--info">
                              Public Web Lead
                            </span>
                          ) : (
                            <span className="status-badge status-badge--muted">
                              Direct Admin
                            </span>
                          )}
                        </td>

                        {/* Assigned KAM */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            value={inv.assigned_kam_id || ''}
                            onChange={(e) => handleAssignKamToInvestor(inv.id, e.target.value)}
                            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '0.35rem', borderRadius: '4px', fontSize: '0.78rem' }}
                          >
                            <option value="">-- Unassigned --</option>
                            {allKams.map(k => (
                              <option key={k.id} value={k.id}>{k.full_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedInvestor(inv);
                              setInvestorDrawerTab('profile');
                            }}
                            className="btn-sm"
                            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                          >
                            Inspect Profile
                          </button>
                        </td>

                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: BOOKINGS QUEUE ── */}
      {investorSubTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Status Filter Toggle */}
          <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
            {['All', 'Pending_Proof', 'Proof_Submitted', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setBookingStatusFilter(st)}
                className={`tab-toggle-btn ${bookingStatusFilter === st ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="glass-card">
            {allBookings.filter(b => bookingStatusFilter === 'All' || b.status === bookingStatusFilter).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                No investment bookings found for this filter.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Investor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Target Campaign</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Booking Amount</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Yield Option</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings
                    .filter(b => bookingStatusFilter === 'All' || b.status === bookingStatusFilter)
                    .map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                          {b.investors?.alias_name || 'Anonymous Investor'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ color: '#fff', fontWeight: '600' }}>{b.funding_projects?.businesses?.brand_name}</span> - {b.funding_projects?.project_title}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#10b981' }}>
                          {formatCurrency(b.amount_bdt, currency)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          Option {b.yield_option}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className="status-badge status-badge--muted">
                            {b.booking_type || 'Primary'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            style={{
                              background: b.status === 'Approved' ? 'rgba(16,185,129,0.2)' : b.status === 'Proof_Submitted' ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.8)',
                              color: b.status === 'Approved' ? '#10b981' : b.status === 'Proof_Submitted' ? '#D4AF37' : '#fff',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="Pending_Proof">Pending Proof</option>
                            <option value="Proof_Submitted">Proof Submitted</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {b.status === 'Proof_Submitted' && (
                            <button
                              onClick={() => setInvestorSubTab('payments')}
                              className="btn-sm"
                              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                            >
                              Review Proof →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ── SUB-TAB 3: KYC QUEUE ── */}
      {investorSubTab === 'kyc' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {kycSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>All Clear!</h3>
              <p style={{ color: '#94a3b8' }}>No pending KYC submissions await verification.</p>
            </div>
          ) : (
            kycSubmissions.map(sub => {
              const isPending = sub.status === 'Pending';
              return (
                <div key={sub.id} className="glass-card-premium" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : sub.status === 'Approved' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span className={`status-badge ${isPending ? 'status-badge--gold' : sub.status === 'Approved' ? 'status-badge--success' : 'status-badge--danger'}`}>
                        {sub.status}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#fff' }}>{sub.investors?.alias_name}</h4>
                    <p style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '1rem' }}>Requesting Clearance: Level {sub.target_level}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px' }}>
                      {sub.target_level === 2 && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.25rem' }}>NID Front</p>
                            {sub.nid_front_url ? <a href={sub.nid_front_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.88rem' }}>View NID Front Image</a> : 'N/A'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.25rem' }}>NID Back</p>
                            {sub.nid_back_url ? <a href={sub.nid_back_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.88rem' }}>View NID Back Image</a> : 'N/A'}
                          </div>
                        </div>
                      )}
                      {sub.target_level === 3 && (
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.25rem' }}>Source of Funds Declaration</p>
                          <p style={{ fontSize: '0.92rem', color: '#f8fafc', fontStyle: 'italic' }}>"{sub.source_of_funds}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleKycReview(sub.id, sub.investor_id, sub.target_level, true)}
                          style={{ background: '#10b981', color: '#000', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                        >
                          Approve Level {sub.target_level}
                        </button>
                        <button
                          onClick={() => handleKycReview(sub.id, sub.investor_id, sub.target_level, false)}
                          style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.85rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                        >
                          Reject Verification
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={32} style={{ color: sub.status === 'Approved' ? '#10b981' : '#ef4444', margin: '0 auto 0.5rem auto' }} />
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Reviewed at {new Date(sub.reviewed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: PAYMENT QUEUE ── */}
      {investorSubTab === 'payments' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {paymentSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>All Clear!</h3>
              <p style={{ color: '#94a3b8' }}>No pending payment proofs await verification.</p>
            </div>
          ) : (
            paymentSubmissions.map(sub => {
              const booking = sub.investment_bookings;
              const isPending = booking?.status === 'Proof_Submitted';
              
              return (
                <div key={sub.id} className="glass-card-premium" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : '4px solid #334155' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span className={`status-badge ${isPending ? 'status-badge--gold' : 'status-badge--muted'}`}>
                        {booking?.status.replace('_', ' ')}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#fff' }}>{booking?.investors?.alias_name}</h4>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{booking?.funding_projects?.businesses?.brand_name} - {booking?.funding_projects?.project_title}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px' }}>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Amount</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>{formatCurrency(booking?.amount_bdt, currency)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Yield Option</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>Option {booking?.yield_option}</p>
                      </div>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Method &amp; TXN ID</p>
                        <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0 }}>{sub.payment_method} | <span style={{ fontFamily: 'monospace', color: '#D4AF37' }}>{sub.transaction_id}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ flex: 1, background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
                      {sub.screenshot_url ? (
                        <a href={sub.screenshot_url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                          <img src={sub.screenshot_url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                        </a>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>No Proof Image Uploaded</p>
                      )}
                    </div>
                    
                    {isPending && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handlePaymentReview(sub.id, sub.booking_id, booking.investor_id, true)}
                          style={{ flex: 1, background: '#10b981', color: '#000', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePaymentReview(sub.id, sub.booking_id, booking.investor_id, false)}
                          style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
