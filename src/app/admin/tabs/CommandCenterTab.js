'use client';
import React from 'react';
import {
  TrendingUp, Users, Building2, DollarSign, Award, MessageSquare,
  ChevronRight, ShieldCheck, PlusCircle, Activity, Sparkles, CheckCircle2,
  RefreshCw, Inbox, Clock
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/**
 * Helper to normalize and style deal status badges consistently
 */
function getDealStageConfig(status) {
  switch (status) {
    case 'Active':
    case 'Trading':
      return { label: 'Live & Trading', badge: 'status-badge--success' };
    case 'Funding':
    case 'Active Capital Raise':
      return { label: 'Active Capital Raise', badge: 'status-badge--gold' };
    case 'Diligence':
      return { label: 'Diligence & Valuation', badge: 'status-badge--info' };
    case 'Origination':
      return { label: 'Origination & Review', badge: 'status-badge--warning' };
    case 'Closed':
      return { label: 'Closed / Matured', badge: 'status-badge--danger' };
    default:
      return { label: status || 'Pipeline Deal', badge: 'status-badge--gold' };
  }
}

/**
 * CommandCenterTab — Tab 1 Dashboard for GRO10X Admin Portal.
 */
export default function CommandCenterTab({
  totalAumRaised = 0,
  activeInvestorsCount = 0,
  activeProjectsCount = 0,
  totalYieldDisbursed = 0,
  totalFeeSpreadCaptured = 0,
  totalPipelineSpreadTarget = 0,
  inquiryLeads = [],
  pendingKycCount = 0,
  pendingPaymentsCount = 0,
  pendingLeadsCount = 0,
  pendingCashTicketsCount = 0,
  projects = [],
  allKams = [],
  recentNotifications = [],
  currency = 'BDT',
  setActiveTab,
  setInvestorSubTab,
  onOpenProjectModal,
  onRefresh,
  isRefreshing = false,
}) {
  const activeCampaigns = projects.filter(p => p.status !== 'Closed');
  const unworkedLeadsCount = inquiryLeads.filter(l => l.status === 'New').length;

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── ZONE 1: KPI STRIP (6 INTERACTIVE CONNECTED CARDS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Total AUM Raised */}
        <div 
          onClick={() => setActiveTab('investors')}
          className="glass-card glass-card-interactive" 
          title="Click to view Active Investor Portfolios & CapEx"
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total AUM Raised</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(totalAumRaised, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--success" style={{ padding: '0.05rem 0.4rem' }}>↑ Active CapEx</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>View Hub →</span>
          </div>
        </div>

        {/* Card 2: Active Investors */}
        <div 
          onClick={() => { setActiveTab('investors'); setInvestorSubTab?.('all-investors'); }}
          className="glass-card glass-card-interactive" 
          title="Click to inspect all KYC-Verified Investors"
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Investors</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
              <Users size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#D4AF37', margin: 0, letterSpacing: '-0.02em' }}>
            {activeInvestorsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--gold" style={{ padding: '0.05rem 0.4rem' }}>KYC Verified</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Inspect →</span>
          </div>
        </div>

        {/* Card 3: Active Projects */}
        <div 
          onClick={() => setActiveTab('kanban')}
          className="glass-card glass-card-interactive" 
          title="Click to open 100-Project Onboarding Pipeline"
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Projects</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'grid', placeItems: 'center', color: '#3b82f6' }}>
              <Building2 size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6', margin: 0, letterSpacing: '-0.02em' }}>
            {activeProjectsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--info" style={{ padding: '0.05rem 0.4rem' }}>In Pipeline / Trading</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Pipeline →</span>
          </div>
        </div>

        {/* Card 4: Total Yield Disbursed */}
        <div 
          onClick={() => setActiveTab('dividend')}
          className="glass-card glass-card-interactive" 
          title="Click to open Yield Engine & Disbursement Batches"
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Yield Disbursed</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'grid', placeItems: 'center', color: '#8b5cf6' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8b5cf6', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(totalYieldDisbursed, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--purple" style={{ padding: '0.05rem 0.4rem' }}>All-Time Ledger</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Ledger →</span>
          </div>
        </div>

        {/* Card 5: Platform Revenue (5%) */}
        <div 
          onClick={() => setActiveTab('analytics')}
          className="glass-card glass-card-interactive" 
          title={`5% Earned on Active AUM: ${formatCurrency(totalFeeSpreadCaptured, currency)} | Pipeline Target: ${formatCurrency(totalPipelineSpreadTarget, currency)}`}
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform Revenue</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'grid', placeItems: 'center', color: '#f59e0b' }}>
              <Award size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b', margin: 0, letterSpacing: '-0.02em' }}>
            {totalFeeSpreadCaptured > 0 ? formatCurrency(totalFeeSpreadCaptured, currency) : formatCurrency(totalPipelineSpreadTarget, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--warning" style={{ padding: '0.05rem 0.4rem' }}>
              {totalFeeSpreadCaptured > 0 ? '5% On Active AUM' : '5% Pipeline Spread'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Analytics →</span>
          </div>
        </div>

        {/* Card 6: New Leads */}
        <div 
          onClick={() => setActiveTab('leads-marketing')}
          className="glass-card glass-card-interactive" 
          title="Click to manage Public Inquiry Lead Pipeline"
          style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Leads</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', display: 'grid', placeItems: 'center', color: '#ec4899' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ec4899', margin: 0, letterSpacing: '-0.02em' }}>
            {unworkedLeadsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--pink" style={{ padding: '0.05rem 0.4rem' }}>
              {unworkedLeadsCount > 0 ? `${unworkedLeadsCount} Unworked` : 'All Worked'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{inquiryLeads.length} Total →</span>
          </div>
        </div>

      </div>

      {/* ── ZONE 2 & 3: MAIN GRID (ACTIVE CAMPAIGN HEALTH + ACTION ALERTS QUEUE) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>
        
        {/* ── ZONE 3: ACTIVE CAMPAIGN HEALTH GRID ── */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={20} style={{ color: '#D4AF37' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Active Campaign Health</h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#94a3b8' }}>
                {activeCampaigns.length} in progress
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('kanban')} 
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              View All Pipeline <ChevronRight size={16} />
            </button>
          </div>

          {activeCampaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Inbox size={32} style={{ color: '#64748b', margin: '0 auto 0.75rem auto' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>No active campaigns in progress.</p>
              <button onClick={onOpenProjectModal} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                + Onboard First Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {activeCampaigns.slice(0, 4).map(p => {
                const raised = Number(p.amount_raised_bdt || 0);
                const target = Number(p.target_raise_bdt || 1);
                const pct = Math.min(100, Math.round((raised / target) * 100));
                const brandName = p.businesses?.brand_name || 'GRO10X Hub';
                const initial = brandName[0]?.toUpperCase() || 'G';
                const stageCfg = getDealStageConfig(p.status);
                const assignedKam = allKams.find(k => k.id === p.kam_id);

                return (
                  <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    
                    {/* Brand & Stage Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', display: 'grid', placeItems: 'center', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                          {initial}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 'bold', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandName}</span>
                          <h4 
                            title={p.project_title}
                            style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}
                          >
                            {p.project_title}
                          </h4>
                        </div>
                      </div>
                      <span className={`status-badge ${stageCfg.badge}`} style={{ flexShrink: 0, fontSize: '0.7rem' }}>
                        {stageCfg.label}
                      </span>
                    </div>

                    {/* Gradient Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#94a3b8' }}>Funding Progress</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{pct}% ({formatCurrency(raised, currency)})</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37 0%, #10b981 100%)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>

                    {/* SPV & KAM Metadata Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.65rem' }}>
                      <span title={p.spv_name || 'Not Configured'}>
                        SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name ? (p.spv_name.length > 22 ? p.spv_name.slice(0, 20) + '...' : p.spv_name) : 'Pending'}</strong>
                      </span>
                      <div>
                        {assignedKam ? (
                          <span>KAM: <strong style={{ color: '#fff' }}>{assignedKam.full_name}</strong></span>
                        ) : (
                          <button 
                            onClick={() => setActiveTab('kanban')}
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                            title="Assign a Key Account Manager in Deal Pipeline"
                          >
                            Assign KAM →
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ZONE 2: PENDING ACTION ALERTS QUEUE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Action Alerts</h3>
            </div>
            {(pendingKycCount + pendingPaymentsCount + pendingLeadsCount + pendingCashTicketsCount) > 0 && (
              <span className="status-badge status-badge--danger" style={{ fontSize: '0.7rem' }}>
                {pendingKycCount + pendingPaymentsCount + pendingLeadsCount + pendingCashTicketsCount} Urgent
              </span>
            )}
          </div>

          {/* Alert 1: KYC Queue */}
          <div 
            onClick={() => { setActiveTab('investors'); setInvestorSubTab?.('kyc'); }}
            style={{ 
              background: pendingKycCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingKycCount > 0 ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingKycCount > 0 ? <span className="activity-dot" style={{ background: '#ef4444' }}></span> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>KYC Clearance Queue</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{pendingKycCount} identity verification pending</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </div>
          </div>

          {/* Alert 2: Payment Clearances */}
          <div 
            onClick={() => { setActiveTab('investors'); setInvestorSubTab?.('payments'); }}
            style={{ 
              background: pendingPaymentsCount > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingPaymentsCount > 0 ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingPaymentsCount > 0 ? <span className="activity-dot" style={{ background: '#D4AF37' }}></span> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Payment Clearances</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{pendingPaymentsCount} bank proof awaiting review</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </div>
          </div>

          {/* Alert 3: Inquiry Lead Queue */}
          <div 
            onClick={() => setActiveTab('leads-marketing')}
            style={{ 
              background: pendingLeadsCount > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingLeadsCount > 0 ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingLeadsCount > 0 ? <span className="activity-dot" style={{ background: '#3b82f6' }}></span> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Inquiry Lead Queue</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{pendingLeadsCount} unworked website leads</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </div>
          </div>

          {/* Alert 4: Cash Concierge Tickets */}
          <div 
            onClick={() => setActiveTab('cash-pipeline')}
            style={{ 
              background: pendingCashTicketsCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingCashTicketsCount > 0 ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingCashTicketsCount > 0 ? <span className="activity-dot" style={{ background: '#f59e0b' }}></span> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Cash Concierge Tickets</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{pendingCashTicketsCount} confidential inquiries</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </div>
          </div>

        </div>

      </div>

      {/* ── ZONE 4: RECENT PLATFORM ACTIVITY STREAM ── */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>Platform Activity Stream</h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
              Live Telemetry
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>
          )}
        </div>
        
        {recentNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Clock size={28} style={{ color: '#64748b', margin: '0 auto 0.5rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No recent platform activity logged yet.</p>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Admin reviews, lead intakes, and yield allocations will stream here automatically.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentNotifications.slice(0, 7).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="activity-dot" style={{ background: n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : '#3b82f6', flexShrink: 0 }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>
                  {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK ACTION SHORTCUTS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <button onClick={onOpenProjectModal} className="btn-gold" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem', borderRadius: '10px' }}>
          <PlusCircle size={18} /> Onboard New Project
        </button>
        <button onClick={() => setActiveTab('dividend')} className="btn-outline" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem', borderRadius: '10px', color: '#cbd5e1' }}>
          <DollarSign size={18} /> Process Yield Disbursement
        </button>
        <button onClick={() => { setActiveTab('investors'); setInvestorSubTab?.('kyc'); }} className="btn-outline" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem', borderRadius: '10px', color: '#cbd5e1' }}>
          <ShieldCheck size={18} /> Review KYC Submissions
        </button>
      </div>

    </div>
  );
}
