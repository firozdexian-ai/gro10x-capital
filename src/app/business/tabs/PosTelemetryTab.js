'use client';

import React from 'react';
import { Database, List, Search } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function PosTelemetryTab({
  posHistory = [],
  filteredPosHistory = [],
  posSyncDate,
  setPosSyncDate,
  grossSales,
  setGrossSales,
  netProfit,
  setNetProfit,
  transactionCount,
  setTransactionCount,
  liveGross = 0,
  liveNet = 0,
  liveMargin = 0,
  isSyncing = false,
  handlePosSync,
  posSearch = '',
  setPosSearch,
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Point of Sale (POS) Telemetry Engine
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Verifiable daily sales reporting used by GRO10X for automated investor yield reconciliation
          </p>
        </div>
        <span style={{ 
          background: 'rgba(16,185,129,0.15)', 
          color: '#10b981', 
          border: '1px solid rgba(16,185,129,0.3)', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          {posHistory.length} Days Logged (Live)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* SYNC FORM PANEL */}
        <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.35)', padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="#10b981" /> Manual Daily Revenue Entry
            </span>
            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              POS Sync Active
            </span>
          </h3>
          
          <form onSubmit={handlePosSync} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                Business Date *
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={posSyncDate}
                onChange={(e) => setPosSyncDate(e.target.value)}
                style={{ fontSize: '0.82rem' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Daily Gross Sales (BDT) *
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 150000"
                  value={grossSales}
                  onChange={(e) => setGrossSales(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Daily Net Profit (BDT) *
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 45000"
                  value={netProfit}
                  onChange={(e) => setNetProfit(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                Daily Invoice / Order Count (Optional)
              </label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 185"
                value={transactionCount}
                onChange={(e) => setTransactionCount(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            {/* LIVE SOLVENCY PREVIEW */}
            {(liveGross > 0 || liveNet > 0) && (
              <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Computed Solvency Preview
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#cbd5e1' }}>Gross Revenue:</span>
                  <strong style={{ color: '#D4AF37' }}>৳{liveGross.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  <span style={{ color: '#cbd5e1' }}>Net Profit:</span>
                  <strong style={{ color: '#10b981' }}>৳{liveNet.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.2rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#cbd5e1' }}>Net Profit Margin:</span>
                  <strong style={{ color: liveMargin >= 20 ? '#10b981' : liveMargin >= 10 ? '#f0b429' : '#ef4444' }}>
                    {liveMargin.toFixed(1)}%
                  </strong>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSyncing} 
              className="btn-gold" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSyncing ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
            >
              {isSyncing ? 'Syncing to Ledger...' : 'Sync POS Telemetry to Ledger →'}
            </button>
          </form>
        </div>

        {/* 30-DAY SYNC LEDGER */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <List size={18} color="#D4AF37" /> Historical Sync Ledger
            </h3>
            <div style={{ position: 'relative', width: '160px' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text"
                placeholder="Filter date..."
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.72rem' }}
              />
            </div>
          </div>

          {filteredPosHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Database size={36} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>No POS entries recorded for this date range.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '440px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {filteredPosHistory.map(log => {
                const gross = Number(log.gross_sales_bdt) || 0;
                const net = Number(log.net_profit_bdt) || 0;
                const margin = gross > 0 ? (net / gross) * 100 : 0;

                return (
                  <div 
                    key={log.id} 
                    style={{ 
                      background: 'rgba(7,10,20,0.6)', 
                      padding: '0.85rem 1rem', 
                      borderRadius: '8px', 
                      borderLeft: '3px solid #10b981',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderLeftWidth: '3px',
                      borderLeftColor: '#10b981'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#fff' }}>
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {log.transaction_count > 0 && (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {log.transaction_count} txns
                          </span>
                        )}
                      </div>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.68rem', fontWeight: '800', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {margin.toFixed(1)}% margin
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <span>Gross: <strong style={{ color: '#D4AF37' }}>{formatCurrency(log.gross_sales_bdt, currency)}</strong></span>
                      <span>Net: <strong style={{ color: '#10b981' }}>{formatCurrency(log.net_profit_bdt, currency)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
