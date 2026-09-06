'use client';
import React from 'react';
import { Users, Filter, Phone, MessageSquare, Mail } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function AssignedInvestorsTab({
  assignedInvestors = [],
  totalPortfolioAum = 0,
  kycVerifiedCount = 0,
  avgKycLevel = '1.0',
  investorFilter = 'All',
  setInvestorFilter,
  filteredInvestors = [],
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
            Assigned Investor Directory & Accounts
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Advisory desk oversight, KYC tier accreditation, and active asset allocations
          </p>
        </div>
      </div>

      {/* 3-CARD TAB-LEVEL PORTFOLIO KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Portfolio Capital (AUM)
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
              {formatCurrency(totalPortfolioAum, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned Capital</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            KYC Verified Accounts
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
              {kycVerifiedCount} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {assignedInvestors.length}</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Verified Status</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avg Accreditation Tier
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
              Tier {avgKycLevel} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 3</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Portfolio Quality</span>
          </div>
        </div>

      </div>

      {/* STATUS FILTER PILLS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'All', label: 'All Accounts', count: assignedInvestors.length },
          { key: 'Active', label: 'Active', count: assignedInvestors.filter(i => i.onboarding_status === 'Active').length },
          { key: 'VIP', label: 'VIP / Family Office', count: assignedInvestors.filter(i => i.onboarding_status === 'VIP' || i.category === 'VIP' || i.category === 'Family Office').length },
          { key: 'KYC Pending', label: 'KYC Pending', count: assignedInvestors.filter(i => ['KYC_L1', 'KYC_L2', 'Telegram_Verified', 'Invited'].includes(i.onboarding_status) || !i.kyc_verified).length },
          { key: 'Invited', label: 'Invited', count: assignedInvestors.filter(i => i.onboarding_status === 'Invited').length }
        ].map(tab => {
          const isSel = investorFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setInvestorFilter(tab.key)}
              style={{
                background: isSel ? 'rgba(59,130,246,0.2)' : 'rgba(15,23,42,0.6)',
                color: isSel ? '#60a5fa' : '#94a3b8',
                border: isSel ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: isSel ? '800' : '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.68rem',
                background: isSel ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                color: isSel ? '#fff' : '#94a3b8',
                padding: '0.05rem 0.4rem',
                borderRadius: '10px',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* INVESTOR CARDS LIST */}
      {assignedInvestors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
          <Users size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
            No investors assigned to your advisory desk yet
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
            Admin assignments will appear here automatically with portfolio breakdowns.
          </p>
        </div>
      ) : filteredInvestors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: '#64748b' }}>
          <Filter size={32} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#94a3b8' }}>
            No investors match the &quot;{investorFilter}&quot; filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredInvestors.map((inv) => {
            const totalAlloc = (inv.investments || []).reduce((s, i) => s + Number(i.amount_invested_bdt || 0), 0);
            const statusColor = inv.onboarding_status === 'VIP' ? '#f0b429' : inv.onboarding_status === 'Active' ? '#10b981' : '#3b82f6';
            const displayName = inv.requires_anonymity ? inv.alias_name : (inv.alias_name || inv.full_name || 'Valued Partner');
            const kycLevel = inv.kyc_level || (inv.kyc_verified ? 2 : 1);
            const activeInvestments = inv.investments || [];

            return (
              <div 
                key={inv.id} 
                className="glass-card"
                style={{ 
                  padding: '1.5rem', 
                  borderLeft: `4px solid ${statusColor}`,
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                }}
              >
                {/* TOP CARD HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                        {displayName}
                      </h3>
                      {inv.requires_anonymity && (
                        <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                          🔒 Anonymous OTC
                        </span>
                      )}
                      <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                        {inv.category || 'HNI Client'}
                      </span>
                      <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}35`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                        ● {inv.onboarding_status || 'Active'}
                      </span>
                    </div>

                    {/* CONTACT & CHANNELS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                      {inv.phone && (
                        <a href={`tel:${inv.phone}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          📞 {inv.phone}
                        </a>
                      )}
                      {inv.email && (
                        <a href={`mailto:${inv.email}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          ✉️ {inv.email}
                        </a>
                      )}
                      <span>
                        Telegram: {inv.telegram_chat_id ? <strong style={{ color: '#60a5fa' }}>Linked ({inv.telegram_chat_id})</strong> : <span style={{ color: '#64748b' }}>Unlinked</span>}
                      </span>
                      {inv.preferred_channel && (
                        <span style={{ color: '#f0b429', fontWeight: '700' }}>
                          Preferred: {inv.preferred_channel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TOTAL ALLOCATION HIGHLIGHT */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Total Allocated
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429' }}>
                      {formatCurrency(totalAlloc, currency)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: inv.kyc_verified ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
                      {inv.kyc_verified ? `✓ KYC Tier ${kycLevel} Verified` : `⏳ KYC Tier ${kycLevel} Pending`}
                    </div>
                  </div>
                </div>

                {/* ACTIVE ALLOCATIONS BREAKDOWN TABLE */}
                {activeInvestments.length > 0 && (
                  <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.85rem 1rem', margin: '0.75rem 0 1rem 0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                      Active Portfolio Holdings ({activeInvestments.length})
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {activeInvestments.map((invItem) => (
                        <div key={invItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#fff', fontWeight: '700' }}>
                              {invItem.funding_projects?.project_title || 'CapEx Outlet SPV'}
                            </span>
                            {invItem.yield_option && (
                              <span style={{ fontSize: '0.68rem', background: 'rgba(240,180,41,0.12)', color: '#f0b429', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                Option {invItem.yield_option}
                              </span>
                            )}
                            <span style={{ fontSize: '0.68rem', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                              {invItem.status || 'Active'}
                            </span>
                          </div>
                          <span style={{ color: '#f0b429', fontWeight: '800' }}>
                            {formatCurrency(Number(invItem.amount_invested_bdt || 0), currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {inv.phone && (
                    <a 
                      href={`tel:${inv.phone}`}
                      style={{ 
                        background: 'rgba(59,130,246,0.15)', 
                        color: '#60a5fa', 
                        border: '1px solid rgba(59,130,246,0.3)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <Phone size={13} /> Direct Call
                    </a>
                  )}
                  {inv.phone && (
                    <a 
                      href={`https://wa.me/${inv.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        background: 'rgba(16,185,129,0.15)', 
                        color: '#10b981', 
                        border: '1px solid rgba(16,185,129,0.3)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  )}
                  {inv.email && (
                    <a 
                      href={`mailto:${inv.email}`}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        color: '#cbd5e1', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <Mail size={13} /> Email
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
