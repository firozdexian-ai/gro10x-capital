'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, Clock, AlertTriangle, 
  ArrowUpRight, Copy, Check, Plus, ExternalLink, Calendar, 
  FileText, Landmark, RefreshCw, Eye, X, ChevronRight, Phone,
  Sparkles, TrendingUp, DollarSign, Award, Briefcase, Filter, Search, CheckSquare
} from 'lucide-react';
import { 
  MAATS_COTTAGE_PROFILE, 
  getWorkOrders, 
  saveWorkOrder, 
  approveAndDisburseOrder, 
  settleWorkOrder,
  calculateLedgerMetrics, 
  generateWhatsAppBroadcast 
} from '../../../lib/workOrders';
import { formatCurrency } from '../../../lib/currency';

export default function WorkOrdersTab({ currency = 'BDT' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedOrderDocs, setSelectedOrderDocs] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [settleTargetOrder, setSettleTargetOrder] = useState(null);
  const [settleRepaymentFile, setSettleRepaymentFile] = useState(null);
  const [settleChallanFile, setSettleChallanFile] = useState(null);
  const [settleNote, setSettleNote] = useState('');
  const [settling, setSettling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Add order state
  const [newOrder, setNewOrder] = useState({
    order_code: '',
    corporate_client: '',
    item_description: '',
    investment_amount_bdt: '',
    return_amount_bdt: '',
    duration_days: 10,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getWorkOrders();
    setOrders(data);
    setLoading(false);
  };

  const metrics = calculateLedgerMetrics(orders);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppBroadcast(orders);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApprove = async (orderCode) => {
    const updated = await approveAndDisburseOrder(orderCode);
    setOrders(updated);
    setActionSuccessMsg(`Order ${orderCode} approved & marked as Disbursed!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleSettle = async (orderCode) => {
    const existing = await getWorkOrders();
    const order = existing.find(o => o.order_code === orderCode);
    if (!order) return;

    const today = new Date().toISOString().split('T')[0];
    const updated = await saveWorkOrder({
      ...order,
      status: 'Settled_Repaid',
      settled_date: today,
      due_note: 'Settled & Repaid'
    });
    setOrders(updated);
    setActionSuccessMsg(`Order ${orderCode} marked as Settled and Repaid!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleConfirmSettle = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!settleTargetOrder) return;
    const targetCode = settleTargetOrder.order_code;
    setSettling(true);
    const updated = await settleWorkOrder(targetCode, {
      repayment_receipt_url: settleRepaymentFile || '/receipts/msp-001-tranche-1.png',
      challan_receipt_url: settleChallanFile || '/docs/msp-001-delta-po.png',
      note: settleNote
    });
    setOrders(updated);
    setSettling(false);
    setSettleTargetOrder(null);
    setSettleRepaymentFile(null);
    setSettleChallanFile(null);
    setSettleNote('');
    setActionSuccessMsg(`Order ${targetCode} dual-verified & settled! Telegram notification sent.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const getOrderDocsList = (order) => {
    if (!order) return [];
    const list = [];
    
    if (order.po_document_url || order.po_ref_number) {
      list.push({
        id: 'po',
        badge: 'Contract PO',
        title: 'Client Purchase Order (PO)',
        url: order.po_document_url || '/docs/msp-001-delta-po.png',
        pdfUrl: order.po_document_pdf,
        meta: `Ref: ${order.po_ref_number || 'DL/PO/2026'} • Client: ${order.corporate_client}`,
        note: `PO Value: ${fmtLakhs(order.po_value_bdt || order.return_amount_bdt)} • Officially signed purchase contract.`
      });
    }

    if (order.disbursement_transfers && order.disbursement_transfers.length > 0) {
      order.disbursement_transfers.forEach((t) => {
        list.push({
          id: `tranche-${t.tranche_no}`,
          badge: t.is_combined ? 'Combined Transfer' : `Tranche ${t.tranche_no}`,
          title: t.is_combined ? `Combined Transfer Slip (${fmtLakhs(t.amount_bdt)})` : `Tranche #${t.tranche_no} — ${fmtLakhs(t.amount_bdt)}`,
          url: t.receipt_url,
          meta: `${t.method} • Ref: ${t.ref_no}`,
          note: t.note || `Date: ${t.date} • Sent to ${MAATS_COTTAGE_PROFILE.accountName} (${MAATS_COTTAGE_PROFILE.accountNumber})`
        });
      });
    } else if (order.disbursement_receipt_url) {
      list.push({
        id: 'disbursement-slip',
        badge: 'Disbursement',
        title: `Transfer Slip (${fmtLakhs(order.investment_amount_bdt)})`,
        url: order.disbursement_receipt_url,
        meta: `Verified Bank Transfer • Ref: CityTouch`,
        note: `Disbursed to ${order.bank_account_info}`
      });
    }

    if (order.product_sample_photo_url || (order.reference_photos && order.reference_photos.length > 0)) {
      list.push({
        id: 'sample',
        badge: 'Sample Spec',
        title: 'Product Reference Sample',
        url: order.product_sample_photo_url || order.reference_photos[0],
        meta: `Item: ${order.item_description}`,
        note: 'Physical merchandise sample approved by corporate buyer.'
      });
    }

    if (order.settlement_repayment_receipt_url) {
      list.push({
        id: 'repayment',
        badge: 'Proof of Repayment',
        title: 'Repayment Bank Transfer Slip',
        url: order.settlement_repayment_receipt_url,
        meta: `EFT/NPSB Repayment to Safe Home Fund • ${fmtLakhs(order.return_amount_bdt)}`,
        note: 'Document 1 of Dual Verification: Bank acknowledgment of full capital + profit return.'
      });
    }

    if (order.settlement_challan_receipt_url) {
      list.push({
        id: 'challan',
        badge: 'Delivery Proof',
        title: 'Corporate Delivery Challan',
        url: order.settlement_challan_receipt_url,
        meta: `Goods Delivered to Mohakhali Warehouse`,
        note: 'Document 2 of Dual Verification: Signed delivery challan acknowledging physical receipt of goods.'
      });
    }

    return list;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.corporate_client || !newOrder.item_description || !newOrder.investment_amount_bdt || !newOrder.return_amount_bdt) {
      alert('Please fill all required fields');
      return;
    }

    const code = newOrder.order_code.trim() || `MSP-0${orders.length + 1}`;
    const inv = Number(newOrder.investment_amount_bdt);
    const ret = Number(newOrder.return_amount_bdt);
    const profit = ret - inv;
    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + Number(newOrder.duration_days || 10));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const orderObj = {
      id: `wo-${Date.now()}`,
      order_code: code,
      corporate_client: newOrder.corporate_client,
      item_description: newOrder.item_description,
      investment_amount_bdt: inv,
      return_amount_bdt: ret,
      profit_bdt: profit,
      duration_days: Number(newOrder.duration_days || 10),
      start_date: today,
      due_date: dueDate,
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: newOrder.notes || 'Logged via Admin Desk',
      due_note: 'Awaiting Disbursal'
    };

    const updated = await saveWorkOrder(orderObj);
    setOrders(updated);
    setShowAddModal(false);
    setNewOrder({
      order_code: '',
      corporate_client: '',
      item_description: '',
      investment_amount_bdt: '',
      return_amount_bdt: '',
      duration_days: 10,
      notes: ''
    });
    setActionSuccessMsg(`Work Order ${code} added to pipeline!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesQuery = !searchQuery || 
      o.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.corporate_client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.item_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;
  const facilityLimit = MAATS_COTTAGE_PROFILE.revolvingFacilityLimit;
  const facilityUtilizationPct = Math.min(100, Math.round((metrics.totalDisbursedActive / facilityLimit) * 100));
  const availableFacilityHeadroom = Math.max(0, facilityLimit - metrics.totalDisbursedActive);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── MANAGING PARTNER & SPV CO-SIGN STRIP ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', background: 'radial-gradient(ellipse at top left, rgba(212,175,55,0.12) 0%, rgba(15,23,42,0.95) 100%)', border: '1px solid rgba(212,175,55,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="status-badge status-badge--gold" style={{ fontSize: '0.72rem' }}>
                SAFE HOME WEALTH MANAGEMENT FUND
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>৳20 Crore Facility</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '0 0 0.25rem 0' }}>
              Corporate Work-Order Financing Desk
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Anchor Borrower: <strong style={{ color: '#fff' }}>{MAATS_COTTAGE_PROFILE.companyName}</strong> (Aysha Siddika) | Managing Partner: <strong style={{ color: '#D4AF37' }}>Faiz Ahmed ({MAATS_COTTAGE_PROFILE.managingPartner.phone})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a 
              href="/track/maats-cottage" 
              target="_blank" 
              rel="noreferrer"
              className="btn-outline" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.55rem 0.95rem' }}
            >
              <ExternalLink size={14} /> Open Live Mobile Tracker
            </a>

            <button 
              onClick={handleCopyWhatsApp}
              className="btn-outline" 
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.55rem 0.95rem',
                borderColor: copied ? '#10b981' : 'rgba(212,175,55,0.4)',
                color: copied ? '#10b981' : '#D4AF37'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied WhatsApp!' : 'Copy WhatsApp Broadcast'}
            </button>

            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-gold" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.55rem 1rem', fontWeight: '700' }}
            >
              <Plus size={14} /> Log Work Order
            </button>
          </div>
        </div>
      </div>

      {/* ── TOAST ALERT ── */}
      {actionSuccessMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
          <CheckCircle2 size={18} />
          {actionSuccessMsg}
        </div>
      )}

      {/* ── TOP KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Active Disbursed */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Capital Deployed</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '0.25rem' }}>
            {fmtLakhs(metrics.totalDisbursedActive)}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.4rem 0 0 0' }}>
            {metrics.activeCount} active revolving orders
          </p>
        </div>

        {/* Expected Returns */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Gross Return</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginTop: '0.25rem' }}>
            {fmtLakhs(metrics.totalExpectedReturnActive)}
          </div>
          <p style={{ color: '#10b981', fontSize: '0.75rem', margin: '0.4rem 0 0 0', fontWeight: '600' }}>
            +৳{(metrics.totalActiveProfit / 1000).toFixed(0)}k gross cycle yield ({metrics.avgMarginActivePct}%)
          </p>
        </div>

        {/* Facility Utilization */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Facility Utilization</span>
            <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '700' }}>{facilityUtilizationPct}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '0.75rem 0 0.5rem 0', overflow: 'hidden' }}>
            <div style={{ width: `${facilityUtilizationPct}%`, height: '100%', background: '#D4AF37', borderRadius: '3px' }}></div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
            Limit: {fmtLakhs(facilityLimit)} | Headroom: <strong style={{ color: '#10b981' }}>{fmtLakhs(availableFacilityHeadroom)}</strong>
          </p>
        </div>

        {/* Pending Clearance */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Approvals</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#eab308', marginTop: '0.25rem' }}>
            {fmtLakhs(metrics.totalPendingCapital)}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.4rem 0 0 0' }}>
            {metrics.pendingCount} purchase orders awaiting partner sign-off
          </p>
        </div>

      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Disbursed_Active', 'Pending_Approval', 'Settled_Repaid'].map(status => {
            const label = status === 'All' ? 'All Orders' : status.replace('_', ' ');
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background: isActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#D4AF37' : '#94a3b8',
                  border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text"
            placeholder="Search order or client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.82rem', padding: '0.45rem 0.45rem 0.45rem 2.25rem' }}
          />
        </div>
      </div>

      {/* ── WORK ORDERS TABLE ── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Corporate Buyer &amp; Description</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capital Disbursed</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gross Return</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net Profit / Yield</th>
                <th style={{ padding: '0.85rem 1rem' }}>Cycle Timeline</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No work orders found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt));
                  const marginPct = ((profit / Number(order.investment_amount_bdt)) * 100).toFixed(1);
                  const isClosingToday = order.due_note?.includes('CLOSING TODAY');

                  return (
                    <tr 
                      key={order.order_code} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isClosingToday ? 'rgba(239,68,68,0.04)' : undefined
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#fff' }}>
                        <div>{order.order_code}</div>
                        {order.tranche_info && (
                          <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '500', marginTop: '0.2rem' }}>
                            {order.tranche_info}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>{order.corporate_client}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.item_description}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#fff' }}>
                        {fmtLakhs(order.investment_amount_bdt)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#10b981' }}>
                        {fmtLakhs(order.return_amount_bdt)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ color: '#D4AF37', fontWeight: '700' }}>+৳{(profit / 1000).toFixed(1)}k</span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.35rem' }}>({marginPct}%)</span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: '#cbd5e1' }}>{order.duration_days} Days</div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Due: {order.due_date}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {order.status === 'Disbursed_Active' && (
                          <span className={`status-badge ${isClosingToday ? 'status-badge--danger' : 'status-badge--success'}`} style={{ fontSize: '0.7rem' }}>
                            {isClosingToday ? 'CLOSING TODAY (4PM)' : 'Active'}
                          </span>
                        )}
                        {order.status === 'Pending_Approval' && (
                          <span className="status-badge status-badge--gold" style={{ fontSize: '0.7rem' }}>
                            Pending Approval
                          </span>
                        )}
                        {order.status === 'Settled_Repaid' && (
                          <span className="status-badge status-badge--info" style={{ fontSize: '0.7rem' }}>
                            Settled &amp; Repaid
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            onClick={() => { setSelectedOrderDocs(order); setActiveDocTab(0); }}
                            className="btn-outline"
                            title="Inspect Documents &amp; PO Contract"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FileText size={12} /> Docs
                          </button>

                          {order.status === 'Pending_Approval' && (
                            <button 
                              onClick={() => handleApprove(order.order_code)}
                              className="btn-gold"
                              title="Approve &amp; Disburse"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '700' }}
                            >
                              Disburse
                            </button>
                          )}

                          {order.status === 'Disbursed_Active' && (
                            <button 
                              onClick={() => setSettleTargetOrder(order)}
                              className="btn-outline"
                              title="Dual-Document Settlement"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderColor: 'rgba(16,185,129,0.5)', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <CheckSquare size={12} /> Settle
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TABBED MULTI-DOCUMENT INSPECTOR MODAL ── */}
      {selectedOrderDocs && (() => {
        const docList = getOrderDocsList(selectedOrderDocs);
        const currentDoc = docList[activeDocTab] || docList[0];

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '640px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0b1120' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>{selectedOrderDocs.order_code}</span>
                    <span className="status-badge status-badge--gold" style={{ fontSize: '0.7rem' }}>
                      Document Audit Package
                    </span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                    {selectedOrderDocs.corporate_client} — {selectedOrderDocs.item_description}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedOrderDocs(null)} 
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Document Tabs Strip */}
              {docList.length > 0 && (
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.65rem 1rem', background: '#070a14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {docList.map((doc, idx) => {
                    const isSelected = activeDocTab === idx;
                    return (
                      <button
                        key={doc.id || idx}
                        onClick={() => setActiveDocTab(idx)}
                        style={{
                          background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                          border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                          color: isSelected ? '#D4AF37' : '#94a3b8',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? '700' : '500',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>{doc.badge || doc.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Document Body */}
              <div style={{ padding: '1rem', overflowY: 'auto', textAlign: 'center', background: '#05070f', flex: 1 }}>
                {currentDoc ? (
                  <div>
                    <div style={{ marginBottom: '0.75rem', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{currentDoc.title}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {currentDoc.meta}
                        </span>
                      </div>
                      {currentDoc.note && (
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.35rem 0 0 0' }}>
                          {currentDoc.note}
                        </p>
                      )}
                    </div>

                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                      <img 
                        src={currentDoc.url} 
                        alt={currentDoc.title} 
                        style={{ maxWidth: '100%', maxHeight: '48vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <a 
                        href={currentDoc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} /> View Full Image
                      </a>
                      {currentDoc.pdfUrl && (
                        <a 
                          href={currentDoc.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: '#38bdf8', color: '#38bdf8', textDecoration: 'none' }}
                        >
                          <FileText size={13} /> View / Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No documents attached to this order.</p>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '0.75rem 1.25rem', background: '#0b1120', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  Institutional Audit Trail • Safe Home Wealth Management Fund
                </span>
                <button 
                  onClick={() => setSelectedOrderDocs(null)} 
                  className="btn-outline" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                >
                  Close Audit Package
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── DUAL-DOCUMENT SETTLEMENT MODAL ── */}
      {settleTargetOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.5)', borderRadius: '16px', maxWidth: '540px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.9) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={18} style={{ color: '#10b981' }} />
                <div>
                  <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>Dual-Document Settlement &amp; Close</span>
                  <span style={{ color: '#10b981', fontSize: '0.72rem', display: 'block', fontWeight: '600' }}>
                    {settleTargetOrder.order_code} — {settleTargetOrder.corporate_client}
                  </span>
                </div>
              </div>
              <button onClick={() => setSettleTargetOrder(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Financial Summary Card */}
            <div style={{ padding: '1rem 1.25rem', background: '#070a14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Disbursed Principal</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{fmtLakhs(settleTargetOrder.investment_amount_bdt)}</strong>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.08)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ color: '#10b981', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>Full Return Due</span>
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{fmtLakhs(settleTargetOrder.return_amount_bdt)}</strong>
                </div>
                <div style={{ background: 'rgba(212,175,55,0.08)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <span style={{ color: '#D4AF37', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>Fund Net Profit</span>
                  <strong style={{ color: '#D4AF37', fontSize: '0.95rem' }}>
                    +৳{((settleTargetOrder.profit_bdt || (settleTargetOrder.return_amount_bdt - settleTargetOrder.investment_amount_bdt)) / 1000).toFixed(1)}k
                  </strong>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmSettle} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Document 1: Repayment Transfer Slip */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Landmark size={15} style={{ color: '#10b981' }} /> Document 1: Proof of Repayment Bank Transfer *
                </label>
                <p style={{ color: '#94a3b8', fontSize: '0.73rem', margin: '0 0 0.5rem 0' }}>
                  EFT/NPSB slip from Aysha Siddika returning <strong>{fmtLakhs(settleTargetOrder.return_amount_bdt)}</strong> to Safe Home account.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setSettleRepaymentFile(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    style={{ fontSize: '0.78rem', color: '#94a3b8' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setSettleRepaymentFile('/receipts/msp-001-tranche-1.png')}
                    className="btn-outline" 
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                  >
                    Quick Attach Verified CityTouch Slip
                  </button>
                </div>
                {settleRepaymentFile && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                    <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Repayment Slip Attached &amp; Ready</span>
                  </div>
                )}
              </div>

              {/* Document 2: Delivery Challan / Invoice */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <FileText size={15} style={{ color: '#38bdf8' }} /> Document 2: Corporate Delivery Challan / Invoice *
                </label>
                <p style={{ color: '#94a3b8', fontSize: '0.73rem', margin: '0 0 0.5rem 0' }}>
                  Signed acknowledgment of delivery from {settleTargetOrder.corporate_client} Mohakhali warehouse.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setSettleChallanFile(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    style={{ fontSize: '0.78rem', color: '#94a3b8' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setSettleChallanFile('/docs/msp-001-delta-po.png')}
                    className="btn-outline" 
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                  >
                    Quick Attach Verified Delivery Challan
                  </button>
                </div>
                {settleChallanFile && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,189,248,0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                    <CheckCircle2 size={14} style={{ color: '#38bdf8' }} />
                    <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '600' }}>Delivery Challan Attached &amp; Ready</span>
                  </div>
                )}
              </div>

              {/* Settlement Note */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Settlement Verification Note
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Full repayment received via NPSB; delivery confirmed at Mohakhali"
                  value={settleNote}
                  onChange={e => setSettleNote(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem', padding: '0.5rem' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSettleTargetOrder(null)} 
                  className="btn-outline" 
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmSettle}
                  disabled={settling}
                  className="btn-gold" 
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem', fontWeight: '700', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
                >
                  {settling ? 'Settling & Notifying...' : 'Confirm Settlement & Notify Telegram'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── RECEIPT PREVIEW MODAL ── */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>Disbursement Transfer Slip</span>
              </div>
              <button onClick={() => setSelectedReceipt(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1rem', textAlign: 'center', background: '#070a14' }}>
              <img 
                src={selectedReceipt} 
                alt="Transfer Receipt" 
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                Verified EFT/NPSB Bank Transfer to AYSHA SIDDIKA (A/C: 2621519538001)
              </p>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(15,23,42,0.9)', textAlign: 'right' }}>
              <button onClick={() => setSelectedReceipt(null)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOG WORK ORDER MODAL ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '520px', width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} style={{ color: '#D4AF37' }} />
                <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>Log New Work Order</span>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Order Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MSP-010"
                    value={newOrder.order_code}
                    onChange={e => setNewOrder({ ...newOrder, order_code: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Turnaround Days *</label>
                  <input 
                    type="number" 
                    required
                    value={newOrder.duration_days}
                    onChange={e => setNewOrder({ ...newOrder, duration_days: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Corporate Buyer / Client *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Delta Life Insurance, Unique Group"
                  value={newOrder.corporate_client}
                  onChange={e => setNewOrder({ ...newOrder, corporate_client: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Item Description *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jute shopping bags, Executive leather wallets"
                  value={newOrder.item_description}
                  onChange={e => setNewOrder({ ...newOrder, item_description: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Required Capital (BDT) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 250000"
                    value={newOrder.investment_amount_bdt}
                    onChange={e => setNewOrder({ ...newOrder, investment_amount_bdt: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Return Amount (BDT) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 287500"
                    value={newOrder.return_amount_bdt}
                    onChange={e => setNewOrder({ ...newOrder, return_amount_bdt: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Notes / PO Verification</label>
                <input 
                  type="text" 
                  placeholder="e.g. Verified client purchase order received"
                  value={newOrder.notes}
                  onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', fontWeight: '700' }}>
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
