'use client';

import React from 'react';
import { 
  Briefcase, TrendingUp, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { STYLES, actionCircleStyle, circleIconStyle, circleLabelStyle } from '../styles';

export default function FounderMiniView({
  user,
  founderData = { businesses: [], totalRaised: 0 },
  handleRequestPinInChat
}) {
  return (
    <div>
      {/* Founder Identity Hero Card */}
      <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '0.7rem', color: STYLES.purple, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
          🏢 SME Founder Command Center
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.3rem' }}>
          {user?.brand_name || user?.full_name || 'Business Partner'}
        </div>
        <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} style={{ color: STYLES.purple }} /> Verified Growth Partner · GRO10X
        </div>
      </div>

      {/* Founder 2x2 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Outlets</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
            {founderData.businesses?.length || 1}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.purple, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Briefcase size={12} /> Active Locations
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Raised Capital</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>
            ৳{(Number(founderData.totalRaised || 0) / 100000).toFixed(1)} L
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.gold, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> Growth Raised
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>POS Telemetry</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: STYLES.emerald }}>
            Synchronized
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CheckCircle2 size={12} /> Daily Telemetry
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Field Audits</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: STYLES.blue }}>
            KAM Monthly
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.textMuted, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <ShieldCheck size={12} /> Physical Audit
          </div>
        </div>
      </div>

      {/* Quick Actions for Founder */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>⚡ Founder Portals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <a href="/business" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', ...actionCircleStyle }}>
            <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}><Briefcase size={18} /></div>
            <div style={circleLabelStyle}>Command Center</div>
          </a>
          <a href="/pos-sync" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', ...actionCircleStyle }}>
            <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}><TrendingUp size={18} /></div>
            <div style={circleLabelStyle}>POS Sync</div>
          </a>
          <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}><ShieldCheck size={18} /></div>
            <div style={circleLabelStyle}>Web PIN</div>
          </button>
        </div>
      </div>
    </div>
  );
}
