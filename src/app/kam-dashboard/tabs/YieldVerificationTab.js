'use client';
import React from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function YieldVerificationTab({
  disbursementHistory = [],
  totalYieldDistributed = 0,
  totalDisbBatches = 0,
  avgYieldPerBatch = 0,
  currency = 'BDT',
  getYieldStatusStyle
}) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
            Yield Disbursement Audit History & Verified Payouts
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Audit operating distributions, gross sales reconciliation, and syndicate dividend settlement
          </p>
        </div>
      </div>

      {/* 3-CARD TAB-LEVEL YIELD KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Yield Distributed
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
              {formatCurrency(totalYieldDistributed, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● All-Time Payouts</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Verified Batches
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
              {totalDisbBatches}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Settlement Runs</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avg Payout / Batch
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
              {formatCurrency(avgYieldPerBatch, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Mean Cashflow</span>
          </div>
        </div>

      </div>

      {/* YIELD DISBURSEMENTS LIST */}
      {disbursementHistory.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
          <TrendingUp size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
            No yield disbursement history recorded yet
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
            Monthly yield declarations finalised in the Admin Yield Engine will appear here with distribution audits.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {disbursementHistory.map((d) => {
            const statusStyle = getYieldStatusStyle(d.status);
            const period = d.disbursement_month || (d.month && d.year ? `${d.month} ${d.year}` : (d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Monthly Yield'));
            const payeeCount = (d.investor_yields || []).length;
            const projectName = d.funding_projects?.project_title || 'Operating SPV';
            const brandName = d.funding_projects?.businesses?.brand_name || 'GRO10X Hub';

            return (
              <div 
                key={d.id} 
                className="glass-card"
                style={{ 
                  padding: '1.5rem', 
                  borderLeft: `4px solid ${statusStyle.color}`,
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                }}
              >
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {brandName}
                      </span>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '900' }}>
                      {projectName} — <span style={{ color: '#f0b429' }}>{period}</span>
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Verified Run Date: {d.payment_date ? new Date(d.payment_date).toLocaleDateString() : (d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent')}
                    </div>
                  </div>

                  {/* TOTAL DISTRIBUTED HIGHLIGHT */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Total Distributed
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981' }}>
                      {formatCurrency(Number(d.total_disbursed_bdt || 0), currency)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: '700' }}>
                      👥 {payeeCount} Investor Payout{payeeCount !== 1 ? 's' : ''} Processed
                    </div>
                  </div>
                </div>

                {/* FINANCIAL AUDIT BREAKDOWN GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Gross Outlet Sales</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                      {formatCurrency(Number(d.gross_sales_bdt || 0), currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Net Solvency Profit</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#60a5fa' }}>
                      {formatCurrency(Number(d.net_profit_bdt || 0), currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Syndicate Allocation</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#f0b429' }}>
                      {formatCurrency(Number(d.total_disbursed_bdt || 0), currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Settlement Ledger</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={14} /> Reconciled
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
