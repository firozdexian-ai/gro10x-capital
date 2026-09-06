'use client';

import React from 'react';
import { 
  Award, Copy, PlusCircle, DollarSign, Users, Share2, ShieldCheck
} from 'lucide-react';
import { STYLES, actionCircleStyle, circleIconStyle, circleLabelStyle } from '../styles';

export default function PromoterMiniView({
  user,
  commissionsList = [],
  leadsList = [],
  showToast,
  setShowSurveyModal,
  setActiveTab,
  handleRequestPinInChat
}) {
  return (
    <div>
      {/* PROMOTER REFERRAL HERO CARD */}
      <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(240, 180, 41, 0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '0.7rem', color: STYLES.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
          🎯 Your Growth Referral Code
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
          {user?.referral_code || '—'}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => { 
              if (user?.referral_code) {
                navigator.clipboard?.writeText(user.referral_code); 
                showToast('Referral code copied!'); 
              } else {
                showToast('No referral code assigned yet.');
              }
            }}
            style={{ flex: 1, background: 'rgba(240, 180, 41, 0.15)', border: '1px solid #f0b429', color: STYLES.gold, padding: '0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <Copy size={14} /> Copy Code
          </button>
          <button 
            onClick={() => setShowSurveyModal(true)}
            style={{ flex: 1, background: STYLES.gold, border: 'none', color: '#000', padding: '0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <PlusCircle size={14} /> Log Survey
          </button>
        </div>
      </div>

      {/* GAMIFIED TIER ROADMAP (PROMOTER ONLY - DYNAMIC PROGRESS) */}
      {(() => {
        const TIERS = ['Trainee', 'Junior', 'Associate', 'Senior', 'Elite'];
        const userTierRaw = user?.promoter_tier || user?.tier || 'Associate';
        const currentTierIdx = TIERS.findIndex(t => t.toLowerCase() === userTierRaw.toLowerCase().replace('_', ' ')) >= 0
          ? TIERS.findIndex(t => t.toLowerCase() === userTierRaw.toLowerCase().replace('_', ' '))
          : (userTierRaw.toLowerCase().includes('junior') ? 1 : userTierRaw.toLowerCase().includes('senior') ? 3 : userTierRaw.toLowerCase().includes('elite') ? 4 : userTierRaw.toLowerCase().includes('associate') ? 2 : 0);
        const progressPct = Math.min(100, Math.round((currentTierIdx / 4) * 100));

        return (
          <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} style={{ color: STYLES.gold }} /> Gamified Tier Roadmap
              </div>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: STYLES.emerald, padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                {userTierRaw.replace('_', ' ')} Tier
              </span>
            </div>
            
            {/* Horizontal Step Dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '1rem 0' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', top: '50%', left: 0, width: `${progressPct}%`, height: '2px', background: STYLES.gold, zIndex: 1, transition: 'width 0.3s' }}></div>
              
              {TIERS.map((t, idx) => {
                const isDone = idx <= currentTierIdx;
                return (
                  <div key={t} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDone ? STYLES.gold : '#0f172a', border: isDone ? 'none' : '2px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', color: '#000', fontSize: '0.65rem', fontWeight: '900' }}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: isDone ? STYLES.gold : STYLES.textMuted, fontWeight: '700' }}>{t}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* PROMOTER COMMISSIONS SUMMARY CARD */}
      {(() => {
        const totalEarned = commissionsList.reduce((sum, c) => sum + Number(c.amount_bdt || c.commission_amount_bdt || 0), 0);
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total Commission</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>
                ৳{totalEarned >= 100000 ? `${(totalEarned / 100000).toFixed(2)}L` : totalEarned.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <DollarSign size={12} /> {commissionsList.length} Deals Credited
              </div>
            </div>
            <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Referred Leads</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
                {leadsList.length}
              </div>
              <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Users size={12} /> Prospects Logged
              </div>
            </div>
          </div>
        );
      })()}

      {/* PROMOTER QUICK ACTIONS */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>⚡ Promoter Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <button onClick={() => setShowSurveyModal(true)} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}><PlusCircle size={18} /></div>
            <div style={circleLabelStyle}>Log Survey</div>
          </button>
          <button onClick={() => setActiveTab('leads')} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}><Users size={18} /></div>
            <div style={circleLabelStyle}>My Leads</div>
          </button>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/showcase?ref=${user?.referral_code || ''}`;
              navigator.clipboard?.writeText(url);
              showToast('Showcase link copied!');
            }} 
            style={actionCircleStyle}
          >
            <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}><Share2 size={18} /></div>
            <div style={circleLabelStyle}>Share Link</div>
          </button>
          <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
            <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}><ShieldCheck size={18} /></div>
            <div style={circleLabelStyle}>Web PIN</div>
          </button>
        </div>
      </div>

      {/* RECENT LEADS PREVIEW */}
      <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📋 My Recent Prospects</span>
          <span style={{ fontSize: '0.7rem', color: STYLES.gold, cursor: 'pointer' }} onClick={() => setActiveTab('leads')}>View All →</span>
        </div>
        {leadsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: STYLES.textMuted, fontSize: '0.8rem', padding: '1rem 0' }}>No leads logged yet. Tap "Log Survey" to add your first prospect!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {leadsList.slice(0, 3).map((lead) => (
              <div key={lead.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>Range: {lead.investment_range || 'N/A'}</div>
                </div>
                <span style={{ background: lead.status === 'New' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: lead.status === 'New' ? STYLES.emerald : STYLES.textMuted, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
