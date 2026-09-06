'use client';

import React from 'react';
import { 
  TrendingUp, Briefcase, CreditCard, Clock, PlusCircle, ShieldCheck
} from 'lucide-react';
import { STYLES, actionCircleStyle, circleIconStyle, circleLabelStyle } from '../styles';

export default function KamMiniView({
  user,
  kpis,
  kamTicketsList = [],
  projectsList = [],
  activeTab,
  setActiveTab,
  handleRequestPinInChat,
  setShowSurveyModal
}) {
  return (
    <div>
      {/* KAM Identity Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(240,180,41,0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', color: STYLES.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
          📁 Managing Partner OS
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
          {user?.full_name}
        </div>
        <div style={{ fontSize: '0.75rem', color: STYLES.textMuted }}>
          Key Account Manager · GRO10X Capital
        </div>
      </div>

      {/* KAM 2x2 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Active Projects</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>{kpis?.activeProjects || 0}</div>
          <div style={{ fontSize: '0.65rem', color: STYLES.gold, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Briefcase size={12} /> CapEx Pipeline
          </div>
        </div>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>OTC Tickets</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.blue }}>{kamTicketsList.length}</div>
          <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CreditCard size={12} /> Active Pipeline
          </div>
        </div>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Pending Review</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.amber }}>
            {kamTicketsList.filter(t => t.status === 'Pending_Review').length}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.amber, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={12} /> Awaiting Action
          </div>
        </div>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total AUM</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.emerald }}>
            ৳{((kpis?.totalAum || 0) / 10000000).toFixed(1)} Cr
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> Platform CapEx
          </div>
        </div>
      </div>

      {/* KAM Quick Actions */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>⚡ Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <button onClick={() => setActiveTab('portfolio')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}><Briefcase size={18} /></div>
            <div style={circleLabelStyle}>Portfolio</div>
          </button>
          <button onClick={() => setActiveTab('tickets')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}><CreditCard size={18} /></div>
            <div style={circleLabelStyle}>Tickets</div>
          </button>
          <button onClick={() => setShowSurveyModal(true)} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}><PlusCircle size={18} /></div>
            <div style={circleLabelStyle}>New Lead</div>
          </button>
          <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}><ShieldCheck size={18} /></div>
            <div style={circleLabelStyle}>Web PIN</div>
          </button>
        </div>
      </div>

      {/* Recent OTC Tickets Preview */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🎫 Recent OTC Tickets</span>
          <span style={{ fontSize: '0.7rem', color: STYLES.gold, cursor: 'pointer' }} onClick={() => setActiveTab('tickets')}>View All →</span>
        </div>
        {kamTicketsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: STYLES.textMuted, fontSize: '0.8rem', padding: '1rem 0' }}>No active OTC tickets</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {kamTicketsList.slice(0, 3).map((t) => {
              const investor = t.investors;
              const name = investor?.requires_anonymity ? (investor?.alias_name || '🔒 Anonymous') : (investor?.alias_name || investor?.full_name || 'Investor');
              const statusColor = t.status === 'Pending_Review' ? STYLES.amber : t.status === 'Meeting_Scheduled' ? STYLES.blue : t.status === 'Funds_Cleared' ? STYLES.emerald : STYLES.textMuted;
              return (
                <div key={t.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{name}</div>
                    <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>৳{Number(t.ticket_amount_bdt || 0).toLocaleString()} · {t.funding_projects?.project_title || 'CapEx'}</div>
                  </div>
                  <span style={{ background: `${statusColor}22`, color: statusColor, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {t.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
