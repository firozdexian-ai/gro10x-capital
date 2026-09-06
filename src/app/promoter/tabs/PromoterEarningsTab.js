'use client';
import React from 'react';
import { Award, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function PromoterEarningsTab({
  promoterProfile,
  totalCommissionsEarnedBdt = 0,
  totalClearedPayoutBdt = 0,
  availableBalanceBdt = 0,
  commissions = [],
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* TIER STATUS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#D4AF37" /> Milestone Tier Status
          </h3>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#D4AF37', marginBottom: '0.5rem' }}>
            {promoterProfile?.promoter_tier || 'Associate Partner'}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            • <strong>Base Commission:</strong> 0.75% per verified allocation<br />
            • <strong>Target Milestone Bonus:</strong> +0.25% upon hitting pledged campaign targets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} color="#10b981" /> Commission Earnings Summary
          </h3>
          <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#10b981', marginBottom: '0.2rem' }}>
            {formatCurrency(totalCommissionsEarnedBdt, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Cleared Payouts: <strong style={{ color: '#cbd5e1' }}>{formatCurrency(totalClearedPayoutBdt, currency)}</strong> • Available: <strong style={{ color: '#10b981' }}>{formatCurrency(availableBalanceBdt, currency)}</strong>
          </div>
        </div>
      </div>

      {/* DETAILED COMMISSIONS TABLE */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
            Individual Commission Allocation Ledger ({commissions.length})
          </h3>
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
            {formatCurrency(totalCommissionsEarnedBdt, currency)} Total
          </span>
        </div>

        {commissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <DollarSign size={40} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              No commissions registered on the ledger yet. Commissions are automatically credited when referred investors complete verified allocations.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Campaign / SPV</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Investment Size</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, idx) => (
                  <tr key={c.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                      {c.investments?.funding_projects?.project_title || 'CapEx Allocation'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem' }}>
                      <span style={{ 
                        background: c.commission_type === 'Target_0.25' ? 'rgba(212,175,55,0.15)' : 'rgba(16,185,129,0.15)', 
                        color: c.commission_type === 'Target_0.25' ? '#D4AF37' : '#10b981', 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '4px', 
                        fontWeight: '800' 
                      }}>
                        {c.commission_type === 'Target_0.25' ? 'Bonus (0.25%)' : 'Base (0.75%)'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: '#cbd5e1', textAlign: 'right' }}>
                      {c.investments?.amount_invested_bdt ? formatCurrency(c.investments.amount_invested_bdt, currency) : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.92rem', fontWeight: '900', color: '#10b981', textAlign: 'right' }}>
                      {formatCurrency(c.amount_bdt, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
