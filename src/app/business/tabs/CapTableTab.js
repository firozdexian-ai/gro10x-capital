'use client';

import React from 'react';
import { Users, Search } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function CapTableTab({
  capTable = [],
  filteredCapTable = [],
  capTableSearch = '',
  setCapTableSearch,
  totalSyndicateCapital = 0,
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Investor Capitalization Table
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Active syndicate shareholders, equity allocations, and ownership distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
            ● {capTable.length} Active Investors
          </span>
          <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
            {formatCurrency(totalSyndicateCapital, currency)} Total Syndicate
          </span>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text"
            placeholder="Search investor alias or project..."
            value={capTableSearch}
            onChange={(e) => setCapTableSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {filteredCapTable.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Users size={44} style={{ color: '#334155', margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff' }}>No Active Syndicate Investors</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
            {capTableSearch ? 'No investors matched your search filter.' : 'When retail and HNI investors complete payments for your rounds, they appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Investor Alias</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Project SPV</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Tier</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Allocation Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Share of Syndicate</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredCapTable.map((inv, idx) => {
                  const amount = Number(inv.amount_invested_bdt) || 0;
                  const sharePercent = totalSyndicateCapital > 0 ? (amount / totalSyndicateCapital) * 100 : 0;

                  return (
                    <tr key={inv.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                        {inv.investors?.alias_name || 'Anonymous Syndicate Member'}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {inv.funding_projects?.project_title || 'General SPV'}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.75rem' }}>
                        <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                          {inv.investors?.category?.includes('HNI') ? 'Accredited HNI' : 'Retail Syndicate'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: '800', textAlign: 'right' }}>
                        {sharePercent.toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.92rem', fontWeight: '900', textAlign: 'right', color: '#D4AF37' }}>
                        {formatCurrency(inv.amount_invested_bdt, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
