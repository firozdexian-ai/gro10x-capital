'use client';
import React from 'react';
import { 
  Building2, TrendingUp, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '../../../lib/currency';
import Skeleton from '../../../components/Skeleton';

export default function PortfolioTab({
  holdings = [],
  totalInvested = 0,
  totalEarned = 0,
  yieldHistory = [],
  pendingBookings = [],
  uploadBookingId,
  setUploadBookingId,
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  setScreenshotFile,
  handlePaymentUpload,
  isUploading,
  loadingData,
  currency = 'BDT',
  kycLevel = 1,
  onOpenSellModal
}) {
  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            My Portfolio & Active Holdings
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Track SPV allocations, live yield distributions, and secondary market exits
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(16,185,129,0.15)', 
            color: '#10b981', 
            border: '1px solid rgba(16,185,129,0.3)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800' 
          }}>
            ● {holdings.filter(h => h.status === 'Active' || !h.status).length} Active Position{holdings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ACTION REQUIRED: PENDING BOOKINGS */}
      {pendingBookings.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.85rem 0', fontWeight: '800' }}>
            <AlertTriangle size={18} /> Action Required: Complete Pending Payments ({pendingBookings.length})
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingBookings.map(booking => (
              <div key={booking.id} className="glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: '800', color: '#fff' }}>
                      {booking.funding_projects?.businesses?.brand_name} - {booking.funding_projects?.project_title}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                      Intent: <strong style={{ color: '#f0b429' }}>{formatCurrency(booking.amount_bdt, currency)}</strong> • Option {booking.yield_option} Yield • Type: {booking.booking_type}
                    </p>
                  </div>
                  {uploadBookingId === booking.id ? (
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#D4AF37', fontWeight: '700' }}>Upload Proof of Transfer</p>
                      <form onSubmit={handlePaymentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <select 
                          value={paymentMethod} 
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.82rem' }}
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="bKash">bKash</option>
                          <option value="Cash Deposit">Cash Deposit</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Transaction Ref / Slip ID" 
                          value={transactionId} 
                          onChange={(e) => setTransactionId(e.target.value)}
                          style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.82rem' }}
                          required
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setScreenshotFile(e.target.files[0])}
                          style={{ fontSize: '0.78rem', color: '#94a3b8' }}
                          required
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button type="submit" disabled={isUploading} className="btn-gold" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', flex: 1 }}>
                            {isUploading ? 'Uploading...' : 'Confirm Upload'}
                          </button>
                          <button type="button" onClick={() => setUploadBookingId(null)} style={{ background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', padding: '0.45rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setUploadBookingId(booking.id)}
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      Upload Payment Proof →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingData ? (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
           {[1,2,3,4].map(i => (
             <div key={i} className="glass-card">
               <Skeleton width="60%" height="16px" className="mb-2" />
               <Skeleton width="80%" height="32px" className="mb-2" />
               <Skeleton width="40%" height="14px" />
             </div>
           ))}
         </div>
      ) : (
        <>
          {/* 4-CARD LIVE KPI STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Capital Invested
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
                  {formatCurrency(totalInvested, currency)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{holdings.length} Positions</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Yield Earned
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                  {formatCurrency(totalEarned, currency)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Lifetime Paid</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Latest Dividend
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                  {yieldHistory.length > 0 ? formatCurrency(yieldHistory[yieldHistory.length - 1]?.payout || 0, currency) : formatCurrency(0, currency)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {yieldHistory.length > 0 ? `${yieldHistory[yieldHistory.length - 1]?.month} Run` : 'No runs yet'}
                </span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Portfolio Distribution
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa', margin: 0 }}>
                  {holdings.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Outlets</span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                  {holdings.length > 0 ? '100% Asset-Backed' : '0 Assets'}
                </span>
              </div>
            </div>

          </div>

          {/* 2-COLUMN MAIN WORKSPACE: CHART + ACTIVE HOLDINGS (FLUID RESPONSIVE) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
            
            {/* PAYOUT HISTORY CHART */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                    Monthly Payout Distributions
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Audited monthly yield disbursements on file
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '700' }}>
                  {yieldHistory.length} Month{yieldHistory.length !== 1 ? 's' : ''} Logged
                </span>
              </div>

              <div style={{ height: '280px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                {yieldHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yieldHistory}>
                      <defs>
                        <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val/1000}k`} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                      <Area type="monotone" dataKey="payout" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPayout)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <TrendingUp size={36} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>No dividend payout history recorded yet.</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Monthly disbursements will chart automatically here upon audit reconciliation.</p>
                  </div>
                )}
              </div>
            </div>

            {/* MY HOLDINGS LIST */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                    Active Outlet Shares & Allocations
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Direct SPV equity & revenue-share investments
                  </p>
                </div>
                <a href="/showcase" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Deal Showcase <ArrowUpRight size={13} />
                </a>
              </div>
              
              {holdings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                  <Building2 size={36} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#94a3b8' }}>No active investments in your portfolio</h4>
                  <p style={{ margin: '0.3rem 0 1rem 0', fontSize: '0.78rem' }}>Explore live CapEx funding rounds and syndicate allocations in the deal room.</p>
                  <a 
                    href="/showcase" 
                    style={{ 
                      background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                      color: '#070a14', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      fontWeight: '800', 
                      fontSize: '0.78rem', 
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Explore Live Rounds →
                  </a>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {holdings.map((h) => {
                    const statusColor = h.status === 'Active' || !h.status ? '#10b981' : h.status === 'Pending' ? '#f59e0b' : '#94a3b8';
                    const statusLabel = h.status === 'Active' || !h.status ? '● Active Allocation' : h.status;
                    const yieldOption = h.yield_option ? `Option ${h.yield_option}` : null;
                    const dateStr = h.created_at ? new Date(h.created_at).toLocaleDateString() : null;

                    return (
                      <div 
                        key={h.id || Math.random()} 
                        style={{ 
                          background: 'rgba(15,23,42,0.7)', 
                          padding: '1.1rem 1.25rem', 
                          borderRadius: '10px', 
                          borderLeft: `4px solid ${statusColor}`,
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'grid',
                          gap: '0.65rem'
                        }}
                      >
                        {/* TOP ROW */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                              <span style={{ color: '#60a5fa', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {h.funding_projects?.businesses?.brand_name || 'GRO10X Network'}
                              </span>
                              {yieldOption && (
                                <span style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                                  {yieldOption}
                                </span>
                              )}
                              <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}35`, padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                                {statusLabel}
                              </span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#fff' }}>
                              {h.funding_projects?.project_title || 'Outlet Franchise SPV'}
                            </h4>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Invested Capital</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#D4AF37' }}>
                              {formatCurrency(h.amount_invested_bdt, currency)}
                            </div>
                          </div>
                        </div>

                        {/* DETAIL & ACTION ROW */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            {h.funding_projects?.yield_model && (
                              <span style={{ color: '#cbd5e1' }}>Model: <strong style={{ color: '#f0b429' }}>{h.funding_projects.yield_model}</strong></span>
                            )}
                            {dateStr && <span style={{ marginLeft: '0.6rem', color: '#64748b' }}>Since: {dateStr}</span>}
                          </div>

                          <button 
                            onClick={() => onOpenSellModal(h)}
                            style={{ 
                              background: 'rgba(212,175,55,0.12)', 
                              color: '#D4AF37', 
                              border: '1px solid rgba(212,175,55,0.3)', 
                              padding: '0.35rem 0.75rem', 
                              borderRadius: '6px', 
                              fontWeight: '800', 
                              cursor: 'pointer', 
                              fontSize: '0.72rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            List on Secondary Market →
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
