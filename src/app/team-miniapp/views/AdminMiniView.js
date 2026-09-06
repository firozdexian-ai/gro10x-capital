'use client';

import React from 'react';
import { 
  TrendingUp, Users, AlertCircle, PhoneCall, CheckCircle2, ShieldCheck, 
  DollarSign, PlusCircle, CreditCard, Clock
} from 'lucide-react';
import { STYLES, actionCircleStyle, circleIconStyle, circleLabelStyle } from '../styles';

export default function AdminMiniView({
  kpis,
  alerts,
  leadsList = [],
  payoutsList = [],
  kycList = [],
  activeTab,
  setActiveTab,
  handleRequestPinInChat,
  handleApprovePayout,
  handleRejectPayout,
  handleApproveKyc,
  setShowSurveyModal
}) {
  return (
    <div>
      {/* 2x2 KPI GRID CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total AUM Raised</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>
            ৳{(kpis.totalAum / 10000000).toFixed(2)} Cr
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> Platform CapEx
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Active Investors</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
            {kpis.activeInvestors}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Users size={12} /> KYC Verified
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Action Queue</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.amber }}>
            {alerts.kycPending + alerts.payPending + alerts.payoutPending}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.amber, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <AlertCircle size={12} /> Items Pending
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Unworked Leads</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.emerald }}>
            {kpis.unworkedLeads}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.textMuted, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <PhoneCall size={12} /> Inquiry Queue
          </div>
        </div>
      </div>

      {/* CIRCULAR QUICK ACTIONS STRIP */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>
          ⚡ Quick Operational Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <button onClick={() => setActiveTab('leads')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}>
              <Users size={18} />
            </div>
            <div style={circleLabelStyle}>Leads</div>
          </button>

          <button onClick={() => setActiveTab('payouts')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}>
              <DollarSign size={18} />
            </div>
            <div style={circleLabelStyle}>Payouts</div>
          </button>

          <button onClick={() => setActiveTab('kyc')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}>
              <ShieldCheck size={18} />
            </div>
            <div style={circleLabelStyle}>KYC</div>
          </button>

          <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}>
              <ShieldCheck size={18} />
            </div>
            <div style={circleLabelStyle}>Web PIN</div>
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY LIST */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📋 Latest Inquiries Queue</span>
          <span style={{ fontSize: '0.7rem', color: STYLES.gold, cursor: 'pointer' }} onClick={() => setActiveTab('leads')}>View All →</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {leadsList.slice(0, 3).map((lead) => (
            <div key={lead.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{lead.name}</div>
                <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>Range: {lead.investment_range || 'N/A'} • {lead.source_channel || 'Web'}</div>
              </div>
              <span style={{ background: lead.status === 'New' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: lead.status === 'New' ? STYLES.emerald : STYLES.textMuted, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
