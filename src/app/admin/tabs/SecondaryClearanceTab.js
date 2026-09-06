'use client';
import React, { useState } from 'react';
import { 
  ArrowUpRight, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Search, Filter, RefreshCw, UserCheck, DollarSign, Building2, Send, ExternalLink,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { formatCurrency, CURRENCY_RATES } from '../../../lib/currency';

export default function SecondaryClearanceTab({
  secondaryOrders = [],
  allBookings = [],
  allInvestors = [],
  currency = 'BDT',
  onClearOrder,
  onRefresh,
  isClearing = false,
}) {
  const [statusFilter, setStatusFilter] = useState('Pending_Clearance');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { order, action: 'approve' | 'reject' }

  // Metrics
  const pendingOrders = secondaryOrders.filter(o => o.status === 'Pending_Clearance');
  const activeListings = secondaryOrders.filter(o => o.status === 'Active');
  const transferredOrders = secondaryOrders.filter(o => o.status === 'Transferred');
  
  const pendingEscrowBdt = pendingOrders.reduce((sum, o) => sum + Number(o.seller_price_bdt || 0), 0);
  const settledVolumeBdt = transferredOrders.reduce((sum, o) => sum + Number(o.seller_price_bdt || 0), 0);

  // Helper to resolve buyer booking & investor
  const resolveOrderParticipants = (order) => {
    const seller = allInvestors.find(i => i.id === order.seller_investor_id) || {};
    const buyerBooking = allBookings.find(b => b.id === order.buyer_booking_id) || null;
    const buyer = buyerBooking ? allInvestors.find(i => i.id === buyerBooking.investor_id) || {} : null;
    return { seller, buyerBooking, buyer };
  };

  // Filtered orders list
  const filteredOrders = secondaryOrders.filter(order => {
    const matchesFilter = statusFilter === 'All' || order.status === statusFilter;
    if (!matchesFilter) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const { seller, buyer } = resolveOrderParticipants(order);
    const dealTitle = order.investments?.funding_projects?.project_title || '';
    const brandName = order.investments?.funding_projects?.businesses?.brand_name || '';

    return (
      order.id.toLowerCase().includes(q) ||
      dealTitle.toLowerCase().includes(q) ||
      brandName.toLowerCase().includes(q) ||
      (seller.alias_name && seller.alias_name.toLowerCase().includes(q)) ||
      (buyer && buyer.alias_name && buyer.alias_name.toLowerCase().includes(q))
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Transferred':
        return 'status-badge--success';
      case 'Pending_Clearance':
        return 'status-badge--gold';
      case 'Active':
        return 'status-badge--info';
      case 'Cancelled':
      case 'Rejected':
        return 'status-badge--danger';
      default:
        return 'status-badge--gold';
    }
  };

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── HEADER BANNER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowUpRight size={24} style={{ color: '#D4AF37' }} />
            Secondary Market Clearance Desk
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Regulated peer-to-peer share settlement desk. Approve escrow clearance, update investment ownership registry, and disburse receipts.
          </p>
        </div>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="action-btn action-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} /> Refresh Desk
          </button>
        )}
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>
            Pending Clearance
          </p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {pendingOrders.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Escrow Transfer</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>
            Escrow Liquidity Locked
          </p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#60a5fa', margin: 0 }}>
            {formatCurrency(pendingEscrowBdt, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Pending Settlement Total</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>
            Settled Volume (P2P)
          </p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {formatCurrency(settledVolumeBdt, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{transferredOrders.length} Completed Transfers</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #a855f7' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>
            Active Orderbook Listings
          </p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#c084fc', margin: 0 }}>
            {activeListings.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Open for Matching</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Pending_Clearance', 'Active', 'Transferred', 'All'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`action-btn ${statusFilter === tab ? 'action-btn--primary' : 'action-btn--secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              {tab === 'Pending_Clearance' && `Pending Clearance (${pendingOrders.length})`}
              {tab === 'Active' && `Active Orderbook (${activeListings.length})`}
              {tab === 'Transferred' && `Settled (${transferredOrders.length})`}
              {tab === 'All' && `All Orders (${secondaryOrders.length})`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search deal, seller, buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ width: '100%', paddingLeft: '32px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* ── ORDERS QUEUE TABLE ── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <ArrowUpRight size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#94a3b8' }}>
              No secondary market orders match this filter.
            </p>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
              Secondary share sales initiated by investors in the Marketplace will appear here for escrow clearance.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Order ID & Date</th>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Asset & Brand</th>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Seller</th>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Matched Buyer</th>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Original vs Ask</th>
                  <th style={{ padding: '0.9rem 1.1rem' }}>Status</th>
                  <th style={{ padding: '0.9rem 1.1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const { seller, buyerBooking, buyer } = resolveOrderParticipants(order);
                  const dealTitle = order.investments?.funding_projects?.project_title || 'Private Asset';
                  const brandName = order.investments?.funding_projects?.businesses?.brand_name || 'Syndicate Deal';
                  const origPrice = Number(order.original_investment_bdt || 0);
                  const salePrice = Number(order.seller_price_bdt || 0);
                  const spreadPct = origPrice > 0 ? (((salePrice - origPrice) / origPrice) * 100).toFixed(1) : 0;

                  return (
                    <tr 
                      key={order.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}
                    >
                      {/* ID & Date */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: '700', color: '#f8fafc' }}>
                          #{order.id.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Asset & Brand */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: '700', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={13} /> {dealTitle}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {brandName}
                        </div>
                      </td>

                      {/* Seller */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: '600', color: '#e2e8f0' }}>
                          {seller.alias_name || 'Verified Investor'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {seller.phone || 'Phone on file'}
                        </div>
                      </td>

                      {/* Buyer */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        {buyer ? (
                          <>
                            <div style={{ fontWeight: '600', color: '#60a5fa' }}>
                              {buyer.alias_name || 'Matched Investor'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Booking: {buyerBooking?.status || 'Pending'}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                            Unmatched (Open Order)
                          </span>
                        )}
                      </td>

                      {/* Financials */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: '700', color: '#10b981' }}>
                          {formatCurrency(salePrice, currency)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Orig: {formatCurrency(origPrice, currency)} {Number(spreadPct) !== 0 && `(${Number(spreadPct) > 0 ? '+' : ''}${spreadPct}%)`}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '0.72rem' }}>
                          {order.status === 'Pending_Clearance' ? 'Pending Escrow' : order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.9rem 1.1rem', textAlign: 'right' }}>
                        {order.status === 'Pending_Clearance' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setConfirmModal({ order, action: 'approve' })}
                              disabled={isClearing}
                              className="action-btn action-btn--primary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: '#10b981', borderColor: '#10b981' }}
                            >
                              <CheckCircle2 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              Clear Transfer
                            </button>
                            <button
                              onClick={() => setConfirmModal({ order, action: 'reject' })}
                              disabled={isClearing}
                              className="action-btn action-btn--secondary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                            >
                              <XCircle size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              Reject
                            </button>
                          </div>
                        ) : order.status === 'Transferred' ? (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                            <CheckCircle2 size={13} /> Settled & Disbursed
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Listed in Orderbook
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── APPROVE / REJECT SETTLEMENT CONFIRMATION MODAL ── */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              {confirmModal.action === 'approve' ? (
                <CheckCircle2 size={24} style={{ color: '#10b981' }} />
              ) : (
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              )}
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc' }}>
                {confirmModal.action === 'approve' ? 'Approve & Execute Share Transfer' : 'Reject Secondary Order'}
              </h3>
            </div>

            {confirmModal.action === 'approve' ? (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0 }}>
                  You are approving the transfer of shares in <b>{confirmModal.order.investments?.funding_projects?.project_title || 'Deal'}</b>:
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Settlement Value:</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(confirmModal.order.seller_price_bdt, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Seller ID:</span>
                    <span style={{ color: '#e2e8f0' }}>#{confirmModal.order.seller_investor_id.slice(0, 8)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Transfer Action:</span>
                    <span style={{ color: '#D4AF37', fontWeight: '600' }}>Reassign Investment Registry &amp; Notify Both Parties</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                  Once confirmed, the investment record will be transferred to the buyer, and automated Telegram confirmation receipts will be sent to both investors.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
                Are you sure you want to reject this secondary clearance order? The order will be marked as Cancelled and the buyer booking rejected.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setConfirmModal(null)}
                disabled={isClearing}
                className="action-btn action-btn--secondary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { order, action } = confirmModal;
                  setConfirmModal(null);
                  await onClearOrder(order, action === 'approve');
                }}
                disabled={isClearing}
                className="action-btn action-btn--primary"
                style={{
                  background: confirmModal.action === 'approve' ? '#10b981' : '#ef4444',
                  borderColor: confirmModal.action === 'approve' ? '#10b981' : '#ef4444'
                }}
              >
                {confirmModal.action === 'approve' ? 'Confirm Settlement & Transfer' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
