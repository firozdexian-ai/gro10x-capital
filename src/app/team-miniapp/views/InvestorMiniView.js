'use client';

import React from 'react';
import { 
  TrendingUp, CheckCircle2, Briefcase, Shield, ShieldCheck
} from 'lucide-react';
import { STYLES, actionCircleStyle, circleIconStyle, circleLabelStyle } from '../styles';

export default function InvestorMiniView({
  user,
  investorData = { holdings: [], totalInvested: 0, totalYields: 0 },
  handleRequestPinInChat
}) {
  return (
    <div>
      {/* Investor Identity Hero Card */}
      <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '0.7rem', color: STYLES.emerald, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
          💼 Private Investor Portfolio
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.3rem' }}>
          {user?.full_name || 'Valued Investor'}
        </div>
        <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} style={{ color: STYLES.emerald }} /> {user?.kyc_verified ? 'Level 3 Verified HNI' : 'Level 1 Investor'}
        </div>
      </div>

      {/* Investor 2x2 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total Invested</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>
            ৳{(Number(investorData.totalInvested || 0) / 100000).toFixed(1)} L
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> Active Capital
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Yields Earned</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.emerald }}>
            ৳{Number(investorData.totalYields || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CheckCircle2 size={12} /> Disbursed Yield
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Holdings</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
            {investorData.holdings?.length || 0}
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Briefcase size={12} /> SPV Positions
          </div>
        </div>

        <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Protection</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: STYLES.gold }}>
            Asset-Backed
          </div>
          <div style={{ fontSize: '0.65rem', color: STYLES.textMuted, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Shield size={12} /> Physical SPV
          </div>
        </div>
      </div>

      {/* Quick Actions for Investor */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>⚡ Investor Portals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <a href="/investor" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', ...actionCircleStyle }}>
            <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}><Briefcase size={18} /></div>
            <div style={circleLabelStyle}>Web Portfolio</div>
          </a>
          <a href="/secondary-market" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', ...actionCircleStyle }}>
            <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}><TrendingUp size={18} /></div>
            <div style={circleLabelStyle}>Secondary P2P</div>
          </a>
          <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}><ShieldCheck size={18} /></div>
            <div style={circleLabelStyle}>Web PIN</div>
          </button>
        </div>
      </div>

      {/* Holdings List */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>
          📋 Your Active Holdings ({investorData.holdings?.length || 0})
        </div>
        {(!investorData.holdings || investorData.holdings.length === 0) ? (
          <div style={{ textAlign: 'center', color: STYLES.textMuted, fontSize: '0.8rem', padding: '1.5rem 0' }}>
            No active investments found. Browse open deals on the web portal.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {investorData.holdings.map((h) => (
              <div key={h.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{h.funding_projects?.businesses?.brand_name || 'GRO10X SPV'}</div>
                  <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>{h.funding_projects?.project_title || 'CapEx Share'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '900', color: STYLES.gold }}>৳{Number(h.amount_invested_bdt || 0).toLocaleString()}</div>
                  <span style={{ fontSize: '0.65rem', color: STYLES.emerald, fontWeight: '700' }}>Active Yield</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
