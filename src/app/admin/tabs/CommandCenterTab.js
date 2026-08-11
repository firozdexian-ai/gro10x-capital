'use client';
import React from 'react';
import {
  TrendingUp, Users, Building2, DollarSign, Award, MessageSquare,
  ChevronRight, ShieldCheck, ArrowUpRight, PlusCircle, Activity, Sparkles, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

/**
 * CommandCenterTab — Upgraded Tab 1 Dashboard for GRO10X Admin Portal.
 *
 * Props:
 *   totalAumRaised         (number)
 *   activeInvestorsCount   (number)
 *   activeProjectsCount    (number)
 *   totalYieldDisbursed    (number)
 *   totalFeeSpreadCaptured (number)
 *   inquiryLeads           (array)
 *   pendingKycCount        (number)
 *   pendingPaymentsCount   (number)
 *   pendingLeadsCount      (number)
 *   pendingCashTicketsCount(number)
 *   projects               (array)
 *   allKams                (array)
 *   recentNotifications    (array)
 *   currency               (string)
 *   setActiveTab           (fn)
 *   setInvestorSubTab      (fn)
 *   onOpenProjectModal     (fn)
 */
export default function CommandCenterTab({
  totalAumRaised = 0,
  activeInvestorsCount = 0,
  activeProjectsCount = 0,
  totalYieldDisbursed = 0,
  totalFeeSpreadCaptured = 0,
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
}) {
  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── ZONE 1: KPI STRIP (6 UPGRADED CARDS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Total AUM Raised */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total AUM Raised</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(totalAumRaised, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--success" style={{ padding: '0.05rem 0.4rem' }}>↑ Active CapEx</span>
          </div>
        </div>

        {/* Card 2: Active Investors */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Investors</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
              <Users size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#D4AF37', margin: 0, letterSpacing: '-0.02em' }}>
            {activeInvestorsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--gold" style={{ padding: '0.05rem 0.4rem' }}>KYC Verified</span>
          </div>
        </div>

        {/* Card 3: Active Projects */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Projects</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'grid', placeItems: 'center', color: '#3b82f6' }}>
              <Building2 size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6', margin: 0, letterSpacing: '-0.02em' }}>
            {activeProjectsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--info" style={{ padding: '0.05rem 0.4rem' }}>In Pipeline / Trading</span>
          </div>
        </div>

        {/* Card 4: Total Yield Disbursed */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Yield Disbursed</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'grid', placeItems: 'center', color: '#8b5cf6' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8b5cf6', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(totalYieldDisbursed, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--purple" style={{ padding: '0.05rem 0.4rem' }}>All-Time Ledger</span>
          </div>
        </div>

        {/* Card 5: Platform Revenue (5%) */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform Revenue</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'grid', placeItems: 'center', color: '#f59e0b' }}>
              <Award size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(totalFeeSpreadCaptured, currency)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--warning" style={{ padding: '0.05rem 0.4rem' }}>5% Deal Spread</span>
          </div>
        </div>

        {/* Card 6: New Leads */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Leads</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', display: 'grid', placeItems: 'center', color: '#ec4899' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ec4899', margin: 0, letterSpacing: '-0.02em' }}>
            {inquiryLeads.length}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span className="status-badge status-badge--pink" style={{ padding: '0.05rem 0.4rem' }}>Via LeadBot</span>
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
            </div>
            <button 
              onClick={() => setActiveTab('kanban')} 
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              View All Pipeline <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {projects.slice(0, 4).map(p => {
              const raised = Number(p.amount_raised_bdt || 0);
              const target = Number(p.target_raise_bdt || 1);
              const pct = Math.min(100, Math.round((raised / target) * 100));
              const brandName = p.businesses?.brand_name || 'GRO10X Hub';
              const initial = brandName[0]?.toUpperCase() || 'G';

              return (
                <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Brand & Stage Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', display: 'grid', placeItems: 'center', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {initial}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 'bold' }}>{brandName}</span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                          {p.project_title}
                        </h4>
                      </div>
                    </div>
                    <span className={`status-badge ${p.status === 'Active' ? 'status-badge--success' : 'status-badge--gold'}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Funding Progress</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{pct}% ({formatCurrency(raised, currency)})</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37 0%, #10b981 100%)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* SPV & KAM Metadata Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.65rem' }}>
                    <span>SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</strong></span>
                    <span>KAM: <strong style={{ color: '#fff' }}>{allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned'}</strong></span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ── ZONE 2: PENDING ACTION ALERTS QUEUE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Pending Action Alerts</h3>
          </div>

          {/* Alert 1: KYC Queue */}
          <div 
            onClick={() => { setActiveTab('investors'); setInvestorSubTab('kyc'); }}
            style={{ 
              background: pendingKycCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingKycCount > 0 ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s ease'
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
            onClick={() => { setActiveTab('investors'); setInvestorSubTab('payments'); }}
            style={{ 
              background: pendingPaymentsCount > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)', 
              border: pendingPaymentsCount > 0 ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s ease'
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
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingLeadsCount > 0 ? <span className="activity-dot" style={{ background: '#3b82f6' }}></span> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Inquiry Lead Queue</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{pendingLeadsCount} new website leads</p>
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
              borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s ease'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Activity size={18} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>Platform Activity Stream</h3>
        </div>
        
        {recentNotifications.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No recent platform activity logged.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentNotifications.slice(0, 6).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="activity-dot" style={{ background: n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : '#3b82f6', flexShrink: 0 }}></span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.88rem', color: '#fff' }}>{n.title}</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK ACTION SHORTCUTS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <button onClick={onOpenProjectModal} className="btn-gold" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem' }}>
          <PlusCircle size={18} /> Onboard New Project
        </button>
        <button onClick={() => setActiveTab('dividend')} className="btn-outline" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem' }}>
          <DollarSign size={18} /> Process Yield Disbursement
        </button>
        <button onClick={() => { setActiveTab('investors'); setInvestorSubTab('kyc'); }} className="btn-outline" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem' }}>
          <ShieldCheck size={18} /> Review KYC Submissions
        </button>
      </div>

    </div>
  );
}
