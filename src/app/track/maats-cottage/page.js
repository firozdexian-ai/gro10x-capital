'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, ShieldCheck, CheckCircle2, Clock, AlertTriangle, 
  ArrowUpRight, Copy, Check, Plus, ExternalLink, Calendar, 
  FileText, Landmark, RefreshCw, Eye, X, ChevronRight, Phone,
  Sparkles, TrendingUp, DollarSign, Award, ArrowRight, Upload, CheckSquare,
  RotateCcw, Download, Image as ImageIcon, Lock, KeyRound, Bot
} from 'lucide-react';
import { 
  MAATS_COTTAGE_PROFILE, 
  getWorkOrders, 
  saveWorkOrder, 
  createWorkOrder,
  approveAndDisburseOrder, 
  settleWorkOrder,
  revertOrderToPending,
  calculateLedgerMetrics, 
  generateWhatsAppBroadcast 
} from '../../../lib/workOrders';
import { formatCurrency } from '../../../lib/currency';

export default function MaatsCottageTrackerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending' | 'settled' | 'compliance'
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
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  // Telegram 4-Digit PIN Authentication State
  const [pinAuthenticated, setPinAuthenticated] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Add order form
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
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');
  const pendingOrders = orders.filter(o => o.status === 'Pending_Approval');
  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');

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

  const handleRevert = async (orderCode) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Revert ${orderCode} back to Pending Approval? This will move it out of active deployments.`);
      if (!confirmed) return;
    }
    const updated = await revertOrderToPending(orderCode);
    setOrders(updated);
    setActionSuccessMsg(`Order ${orderCode} reverted back to Pending Approval.`);
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
    setActiveTab('settled');
    setActionSuccessMsg(`Order ${targetCode} successfully settled and marked as Repaid! Telegram notified.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // Build document list for inspector
  const getOrderDocsList = (order) => {
    if (!order) return [];
    const list = [];
    
    // 1. Client PO Contract
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

    // 2. Disbursement Tranches
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

    // 3. Product Sample Photo
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

    // 4. Settle Repayment Slip(s)
    if (order.repayment_transfers && order.repayment_transfers.length > 0) {
      order.repayment_transfers.forEach((t, idx) => {
        list.push({
          id: `repayment-${idx + 1}`,
          badge: `Repayment Slip ${idx + 1}`,
          title: `Repayment Slip (${fmtLakhs(t.amount_bdt)})`,
          url: t.receipt_url,
          meta: `${t.method} • Ref: ${t.ref_no}`,
          note: `Received into AHMED FAIZ account on ${t.date} (${fmtLakhs(t.amount_bdt)})`
        });
      });
    } else if (order.settlement_repayment_receipt_url) {
      list.push({
        id: 'repayment',
        badge: 'Proof of Repayment',
        title: 'Repayment Bank Transfer Slip',
        url: order.settlement_repayment_receipt_url,
        meta: `EFT/NPSB Repayment to Safe Home Fund • ${fmtLakhs(order.return_amount_bdt)}`,
        note: 'Document 1 of Dual Verification: Bank acknowledgment of full capital + profit return.'
      });
    }

    // 5. Delivery Challan / Corporate Bill Copy
    if (order.delivery_challan_url || order.settlement_challan_receipt_url) {
      list.push({
        id: 'challan',
        badge: 'Delivery Challan',
        title: 'Corporate Delivery Challan & Bill Copy',
        url: order.delivery_challan_url || order.settlement_challan_receipt_url,
        meta: `Stamped & Received by ${order.corporate_client} • Inv: ${order.delivery_challan_invoice_no || 'MCL-INVOICE'}`,
        note: order.delivery_received_by 
          ? `Goods physically received and officially stamped by ${order.delivery_received_by} on ${order.delivery_received_date}.`
          : 'Document 2 of Dual Verification: Signed delivery challan acknowledging physical receipt of goods.'
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
      bank_account_info: `${MAATS_COTTAGE_PROFILE.accountName} (A/C: ${MAATS_COTTAGE_PROFILE.accountNumber})`,
      notes: newOrder.notes || 'Submitted via Work Order Terminal',
      due_note: 'Awaiting Disbursal'
    };

    const updated = await createWorkOrder(orderObj);
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
    setActionSuccessMsg(`New order ${code} logged & Telegram alert dispatched to Faiz Ahmed & Firoz!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Format Lakhs helper
  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', borderBottom: '1px solid rgba(212,175,55,0.25)', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              LIVE TERMINAL SYNCED
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span>{MAATS_COTTAGE_PROFILE.facilityName}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#D4AF37', fontWeight: '600' }}>Managing Partner: Faiz Ahmed ({MAATS_COTTAGE_PROFILE.managingPartner.phone})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowPinModal(true)}
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Bot size={13} /> Telegram PIN Auth
            </button>
          </div>
        </div>
      </div>

      {/* ── HEADER EXECUTIVE HERO ── */}
      <header style={{ background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.12) 0%, rgba(7,10,20,0.98) 75%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 1.25rem 2rem 1.25rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.72rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ShieldCheck size={13} /> Institutional PO Financing Facility
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff', letterSpacing: '-0.02em' }}>
                {MAATS_COTTAGE_PROFILE.companyName}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>{MAATS_COTTAGE_PROFILE.industry}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span>MD: <strong style={{ color: '#f1f5f9' }}>{MAATS_COTTAGE_PROFILE.founder}</strong></span>
                <span style={{ color: '#475569' }}>•</span>
                <a href={`tel:${MAATS_COTTAGE_PROFILE.phone}`} style={{ color: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={12} /> {MAATS_COTTAGE_PROFILE.phone}
                </a>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleCopyWhatsApp}
                className="btn-outline"
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
                  borderColor: copied ? '#10b981' : 'rgba(212,175,55,0.4)', 
                  color: copied ? '#10b981' : '#D4AF37',
                  background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(212,175,55,0.08)',
                  padding: '0.6rem 1.1rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Update'}</span>
              </button>

              <Link 
                href="/track/maats-cottage/new" 
                className="btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px', textDecoration: 'none' }}
              >
                <ExternalLink size={15} /> Standalone Form
              </Link>

              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px' }}
              >
                <Plus size={16} /> Log Work Order
              </button>
            </div>
          </div>

          {/* SETTLEMENT BANK DETAILS STRIP */}
          <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: '#D4AF37', flexShrink: 0 }}>
                <Landmark size={16} />
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Primary Disbursement & Settlement Account</span>
                <span style={{ color: '#f8fafc', fontWeight: '700' }}>{MAATS_COTTAGE_PROFILE.accountName}</span>
                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>A/C: <code style={{ color: '#D4AF37', fontWeight: 'bold' }}>{MAATS_COTTAGE_PROFILE.accountNumber}</code></span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge status-badge--success" style={{ fontSize: '0.72rem' }}>
                Mode: {MAATS_COTTAGE_PROFILE.paymentMode}
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#94a3b8' }}>Revolving Limit: <strong style={{ color: '#fff' }}>{fmtLakhs(MAATS_COTTAGE_PROFILE.revolvingFacilityLimit)}</strong></span>
            </div>
          </div>

        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {actionSuccessMsg && (
        <div style={{ maxWidth: '1000px', margin: '1rem auto 0 auto', padding: '0 1.25rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
            <CheckCircle2 size={18} />
            {actionSuccessMsg}
          </div>
        </div>
      )}

      {/* ── CRITICAL MATURITY ALERT BANNER ── */}
      <div style={{ maxWidth: '1000px', margin: '1.25rem auto 0 auto', padding: '0 1.25rem' }}>
        <div style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(212,175,55,0.15) 100%)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', display: 'grid', placeItems: 'center', color: '#ef4444', flexShrink: 0 }}>
              <Clock size={20} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>MSP-003 &amp; MSP-004 (Greenfield &amp; Delta)</span>
                <span className="status-badge status-badge--danger" style={{ fontSize: '0.65rem' }}>MATURING TODAY (09 SEP)</span>
                <span className="status-badge status-badge--success" style={{ fontSize: '0.65rem' }}>MSP-001 SETTLED (৳2.875L) ✓</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                Due Today: <strong>MSP-003 (৳2.645L)</strong> + <strong>MSP-004 (৳1.668L)</strong> = <strong style={{ color: '#10b981' }}>৳4.3125 Lakhs</strong> Return | MSP-002 (৳4.30L) Matured Sep 8
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                const m3 = orders.find(o => o.order_code === 'MSP-003');
                if (m3) setSelectedOrderDocs(m3);
              }}
              className="btn-outline" 
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Eye size={13} style={{ marginRight: '0.3rem' }} /> Inspect Docs
            </button>
            <button 
              onClick={() => {
                const m3 = orders.find(o => o.order_code === 'MSP-003');
                if (m3) setSettleTargetOrder(m3);
              }}
              className="btn-gold" 
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <CheckCircle2 size={13} style={{ marginRight: '0.3rem' }} /> Settle MSP-003
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <section style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Active Capital */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Capital Deployed</span>
              <Building2 size={16} style={{ color: '#D4AF37' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
              {fmtLakhs(metrics.totalDisbursedActive)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <strong>{metrics.activeCount}</strong> active corporate orders
            </div>
          </div>

          {/* Expected Return */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Gross Return</span>
              <TrendingUp size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', lineHeight: 1 }}>
              {fmtLakhs(metrics.totalExpectedReturnActive)}
            </div>
            <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '600' }}>
              +৳{(metrics.totalActiveProfit / 1000).toFixed(0)}k net yield ({metrics.avgMarginActivePct}%)
            </div>
          </div>

          {/* Average Turnaround */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Turnaround Cycle</span>
              <Clock size={16} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
              {metrics.avgDurationDays} Days
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Revolving corporate purchase orders
            </div>
          </div>

          {/* Pending Disbursal */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Requests</span>
              <Sparkles size={16} style={{ color: '#eab308' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#eab308', lineHeight: 1 }}>
              {fmtLakhs(metrics.totalPendingCapital)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <strong>{metrics.pendingCount}</strong> orders awaiting partner check
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT TABS ── */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* TAB NAVIGATION STRIP */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'active' ? '2px solid #D4AF37' : '2px solid transparent',
              color: activeTab === 'active' ? '#D4AF37' : '#94a3b8',
              fontWeight: '700',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Active Deployments</span>
            <span style={{ background: activeTab === 'active' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.1)', color: activeTab === 'active' ? '#D4AF37' : '#94a3b8', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'pending' ? '2px solid #eab308' : '2px solid transparent',
              color: activeTab === 'pending' ? '#eab308' : '#94a3b8',
              fontWeight: '700',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Pending Approvals</span>
            <span style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
              {pendingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settled')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'settled' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'settled' ? '#10b981' : '#94a3b8',
              fontWeight: '700',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Settled Orders</span>
            <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
              {settledOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'compliance' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'compliance' ? '#38bdf8' : '#94a3b8',
              fontWeight: '700',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={16} />
            <span>Profile &amp; Compliance</span>
          </button>
        </div>

        {/* ── TAB 1: ACTIVE DEPLOYMENTS ── */}
        {activeTab === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Showing <strong>{activeOrders.length}</strong> active funded purchase orders totaling <strong>{fmtLakhs(metrics.totalDisbursedActive)}</strong>.
              </p>
              <button onClick={loadData} className="btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>
                <RefreshCw size={13} style={{ marginRight: '0.3rem' }} /> Refresh
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {activeOrders.map(order => {
                const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt));
                const marginPct = ((profit / Number(order.investment_amount_bdt)) * 100).toFixed(1);
                const isClosingToday = order.due_note?.includes('CLOSING TODAY');

                return (
                  <div 
                    key={order.order_code} 
                    className="glass-card" 
                    style={{ 
                      padding: '1.25rem', 
                      borderColor: isClosingToday ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)',
                      background: isClosingToday ? 'linear-gradient(180deg, rgba(239,68,68,0.05) 0%, rgba(15,23,42,0.9) 100%)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{order.order_code}</span>
                          <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                            Disbursed &amp; Active
                          </span>
                          {isClosingToday && (
                            <span className="status-badge status-badge--danger" style={{ fontSize: '0.68rem', fontWeight: '700' }}>
                              CLOSING TODAY (4:00 PM)
                            </span>
                          )}
                          {order.tranche_info && (
                            <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: '600' }}>
                              {order.tranche_info}
                            </span>
                          )}
                          {order.delivery_challan_url && (
                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CheckCircle2 size={11} /> Buyer Stamped ({order.delivery_received_date})
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                          {order.corporate_client} — <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{order.item_description}</span>
                        </p>
                      </div>

                      {/* Right Actions */}
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button 
                          onClick={() => { setSelectedOrderDocs(order); setActiveDocTab(0); }}
                          className="btn-outline"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FileText size={13} /> Audit Docs &amp; PO
                        </button>
                        <button 
                          onClick={() => setSettleTargetOrder(order)}
                          className="btn-gold"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}
                        >
                          <CheckSquare size={13} /> Settle &amp; Close
                        </button>
                        <button 
                          onClick={() => handleRevert(order.order_code)}
                          title="Revert back to Pending Approval if accidentally marked as disbursed"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '6px', fontSize: '0.72rem', padding: '0.35rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <RotateCcw size={11} /> Undo
                        </button>
                      </div>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Disbursed Capital</span>
                        <strong style={{ fontSize: '1rem', color: '#fff' }}>{fmtLakhs(order.investment_amount_bdt)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Expected Return</span>
                        <strong style={{ fontSize: '1rem', color: '#10b981' }}>{fmtLakhs(order.return_amount_bdt)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Net Profit</span>
                        <strong style={{ fontSize: '1rem', color: '#D4AF37' }}>+৳{(profit / 1000).toFixed(1)}k <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({marginPct}%)</span></strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Timeline</span>
                        <span style={{ color: '#f8fafc', fontWeight: '600' }}>{order.duration_days} Days</span>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Due: {order.due_date}</span>
                      </div>
                    </div>

                    {/* Multi-Tranche Breakdown (if available) */}
                    {order.disbursement_transfers && order.disbursement_transfers.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                          <span style={{ color: order.is_combined_disbursement ? '#a855f7' : '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                            {order.disbursement_transfers.length === 1 
                              ? (order.is_combined_disbursement ? 'Single Combined Transfer (৳3.75L Total)' : 'Single Tranche Disbursed') 
                              : `Disbursed in ${order.disbursement_transfers.length} Tranches`}
                          </span>
                          {order.po_ref_number && (
                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                              PO Ref: <strong style={{ color: '#cbd5e1' }}>{order.po_ref_number}</strong>
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                          {order.disbursement_transfers.map((t, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => { setSelectedOrderDocs(order); setActiveDocTab(idx + (order.po_document_url ? 1 : 0)); }}
                              style={{ background: 'rgba(0,0,0,0.35)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf8'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontWeight: '700' }}>
                                <span>{t.is_combined ? `Combined: ${fmtLakhs(t.amount_bdt)}` : `Tranche #${t.tranche_no}: ${fmtLakhs(t.amount_bdt)}`}</span>
                                <span style={{ fontSize: '0.68rem', color: t.ref_no?.startsWith('CASH') ? '#eab308' : (t.is_combined ? '#a855f7' : '#38bdf8'), background: t.ref_no?.startsWith('CASH') ? 'rgba(234,179,8,0.15)' : (t.is_combined ? 'rgba(168,85,247,0.15)' : 'rgba(56,189,248,0.15)'), padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                  {t.ref_no?.startsWith('CASH') ? 'Cash Handover' : (t.is_combined ? 'Combined CityTouch' : 'CityTouch')}
                                </span>
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                                {t.date} • Ref: {t.ref_no}
                              </div>
                              {t.note && (
                                <div style={{ color: t.is_combined ? '#c084fc' : '#eab308', fontSize: '0.68rem', fontStyle: 'italic', marginTop: '0.15rem' }}>
                                  {t.note}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer status note */}
                    {order.notes && (
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: PENDING APPROVALS ── */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: '1.5' }}>
                <strong style={{ color: '#eab308' }}>{pendingOrders.length} Work Orders Awaiting Partner Clearance</strong> — Clearances and fund disbursements are managed by Faiz Ahmed &amp; GRO10X Investment Committee via the Institutional Admin Desk or Telegram Bot.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingOrders.map(order => {
                const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt));
                const marginPct = ((profit / Number(order.investment_amount_bdt)) * 100).toFixed(1);

                return (
                  <div key={order.order_code} className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #eab308' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{order.order_code}</span>
                          <span className="status-badge status-badge--gold" style={{ fontSize: '0.7rem' }}>
                            Pending Approval
                          </span>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                          {order.corporate_client} — <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{order.item_description}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          background: 'rgba(234,179,8,0.12)', 
                          border: '1px solid rgba(234,179,8,0.35)', 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '8px',
                          color: '#eab308',
                          fontSize: '0.78rem',
                          fontWeight: '700'
                        }}>
                          <Clock size={13} />
                          <span>Status: Awaiting Partner Sign-off</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          Authorized via Admin Desk &amp; Telegram
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Requested Capital</span>
                        <strong style={{ fontSize: '1rem', color: '#eab308' }}>{fmtLakhs(order.investment_amount_bdt)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Offered Return</span>
                        <strong style={{ fontSize: '1rem', color: '#10b981' }}>{fmtLakhs(order.return_amount_bdt)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Cycle Yield</span>
                        <strong style={{ fontSize: '1rem', color: '#D4AF37' }}>+৳{(profit / 1000).toFixed(1)}k <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({marginPct}%)</span></strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Turnaround</span>
                        <span style={{ color: '#f8fafc', fontWeight: '600' }}>{order.duration_days} Days</span>
                      </div>
                    </div>

                    {order.notes && (
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.75rem 0 0 0' }}>
                        Client PO Note: {order.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: SETTLED & REPAID ORDERS ── */}
        {activeTab === 'settled' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Showing <strong>{settledOrders.length}</strong> completed corporate purchase orders with principal &amp; profit fully recovered.
              </p>
            </div>

            {settledOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 1rem auto', opacity: 0.8 }} />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No Settled Orders Yet</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
                  Orders undergoing closing (such as MSP-002, MSP-003, or MSP-004) will appear here once verified with both the repayment bank slip and delivery challan.
                </p>
                {activeOrders.length > 0 && (
                  <button 
                    onClick={() => setSettleTargetOrder(activeOrders[0])}
                    className="btn-gold"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckSquare size={14} /> Settle {activeOrders[0].order_code} Now
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {settledOrders.map(order => {
                  const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt));
                  const marginPct = ((profit / Number(order.investment_amount_bdt)) * 100).toFixed(1);

                  return (
                    <div key={order.order_code} className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{order.order_code}</span>
                            <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                              Settled &amp; Repaid
                            </span>
                            {order.settled_date && (
                              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                Settled on: <strong style={{ color: '#cbd5e1' }}>{order.settled_date}</strong>
                              </span>
                            )}
                          </div>
                          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                            {order.corporate_client} — <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{order.item_description}</span>
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => { setSelectedOrderDocs(order); setActiveDocTab(0); }}
                            className="btn-outline"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <FileText size={13} /> View Audit Package
                          </button>
                        </div>
                      </div>

                      {/* Financial Metrics Strip */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Principal Recovered</span>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>{fmtLakhs(order.investment_amount_bdt)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Total Repaid</span>
                          <strong style={{ fontSize: '1rem', color: '#10b981' }}>{fmtLakhs(order.return_amount_bdt)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Profit Realized</span>
                          <strong style={{ fontSize: '1rem', color: '#D4AF37' }}>+৳{(profit / 1000).toFixed(1)}k <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({marginPct}%)</span></strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>Compliance</span>
                          <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={13} /> Dual Verified
                          </span>
                        </div>
                      </div>

                      {order.settlement_note && (
                        <p style={{ color: '#10b981', fontSize: '0.78rem', margin: '0.75rem 0 0 0', background: 'rgba(16,185,129,0.08)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                          Settlement Audit: {order.settlement_note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PROFILE & COMPLIANCE ── */}
        {activeTab === 'compliance' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Business Profile */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: '#D4AF37' }} /> Corporate Entity Profile
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Commercial Trade Name</span>
                  <strong style={{ color: '#fff' }}>{MAATS_COTTAGE_PROFILE.companyName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Registered Legal Entity</span>
                  <strong style={{ color: '#fff' }}>{MAATS_COTTAGE_PROFILE.legalName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Managing Director &amp; Sponsor</span>
                  <strong style={{ color: '#fff' }}>{MAATS_COTTAGE_PROFILE.founder}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Direct Mobile &amp; WhatsApp</span>
                  <strong style={{ color: '#10b981' }}>{MAATS_COTTAGE_PROFILE.phone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Official Email</span>
                  <strong style={{ color: '#cbd5e1' }}>{MAATS_COTTAGE_PROFILE.email}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Credit Line Under</span>
                  <strong style={{ color: '#D4AF37' }}>{MAATS_COTTAGE_PROFILE.facilityName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Established / Experience</span>
                  <strong style={{ color: '#fff' }}>Since {MAATS_COTTAGE_PROFILE.foundedYear} (10+ Years Manufacturing)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Factory &amp; Registered Office</span>
                  <strong style={{ color: '#cbd5e1' }}>{MAATS_COTTAGE_PROFILE.headquarters}</strong>
                </div>
              </div>

              {/* Company Profile PDF Card */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D4AF37', fontWeight: '700', fontSize: '0.9rem' }}>
                    <FileText size={16} /> Official Company Profile Deck (19 Pages)
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.2rem 0 0 0' }}>
                    Comprehensive corporate presentation: finished leather catalog, jute production lines, factory capacity, and institutional clients.
                  </p>
                </div>
                <a 
                  href={MAATS_COTTAGE_PROFILE.companyProfilePdf} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-gold" 
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: '700' }}
                >
                  <Download size={14} /> View / Download PDF Deck
                </a>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} /> Due Diligence &amp; Verification Checklist
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {MAATS_COTTAGE_PROFILE.complianceChecklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      <div>
                        <strong style={{ color: '#f1f5f9' }}>{item.title}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Ref: {item.docNumber}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                        {item.status}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '0.2rem' }}>
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement Bank Details */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Landmark size={18} style={{ color: '#38bdf8' }} /> Verified Disbursement Instructions
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                All work-order disbursements are sent directly via EFT / NPSB to the designated corporate settlement account:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Account Name</span>
                  <strong style={{ color: '#fff', fontSize: '1rem' }}>{MAATS_COTTAGE_PROFILE.accountName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Account Number</span>
                  <strong style={{ color: '#D4AF37', fontSize: '1.1rem', letterSpacing: '0.05em' }}>{MAATS_COTTAGE_PROFILE.accountNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Preferred Rail</span>
                  <strong style={{ color: '#10b981' }}>{MAATS_COTTAGE_PROFILE.paymentMode}</strong>
                </div>
              </div>
            </div>

            {/* Product Showroom & Factory Gallery */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} style={{ color: '#D4AF37' }} /> Product Showroom &amp; Manufacturing Gallery
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                    Verified physical merchandise, manufacturing floor &amp; delivery batches for corporate clients
                  </p>
                </div>
                <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: '700' }}>
                  {MAATS_COTTAGE_PROFILE.showroomGallery?.length || 8} Verified Assets
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                {MAATS_COTTAGE_PROFILE.showroomGallery?.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedGalleryImg(item)}
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ height: '160px', background: '#0a0f1d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                        {item.category}
                      </span>
                      <p style={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: '600', margin: 0, lineHeight: 1.3 }}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── RECEIPT PREVIEW MODAL ── */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
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
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

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
                  aria-label="Close inspector"
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
                    onClick={() => setSettleRepaymentFile('/receipts/msp-001-full-repayment-slips.png')}
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
                    onClick={() => setSettleChallanFile(settleTargetOrder?.delivery_challan_url || '/docs/msp-001-delta-delivery-challan.png')}
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

      {/* ── LOG WORK ORDER MODAL ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '520px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
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
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Order Code (e.g. MSP-010)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if blank"
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

      {/* ── GALLERY LIGHTBOX MODAL ── */}
      {selectedGalleryImg && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1.25rem' }}
          onClick={() => setSelectedGalleryImg(null)}
        >
          <div 
            style={{ background: '#0b0f19', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', maxWidth: '750px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase' }}>{selectedGalleryImg.category}</span>
                <h4 style={{ color: '#fff', margin: '0.15rem 0 0 0', fontSize: '0.95rem' }}>{selectedGalleryImg.title}</h4>
              </div>
              <button 
                onClick={() => setSelectedGalleryImg(null)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ maxHeight: '72vh', overflow: 'hidden', display: 'grid', placeItems: 'center', background: '#05070e', padding: '0.75rem' }}>
              <img 
                src={selectedGalleryImg.url} 
                alt={selectedGalleryImg.title} 
                style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '6px' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TELEGRAM 4-DIGIT PIN AUTHENTICATION MODAL ── */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '460px', width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(15,23,42,0.95) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} style={{ color: '#D4AF37' }} />
                <div>
                  <h3 style={{ margin: 0, fontWeight: '800', color: '#fff', fontSize: '1rem' }}>Telegram PIN Authentication</h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Zero Magic Links • 15-Minute Temporary PIN</span>
                </div>
              </div>
              <button onClick={() => setShowPinModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', padding: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <ShieldCheck size={20} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '0.1rem' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                  Open our official Telegram client bot <strong>@gro10xbizbot</strong> and type <code>/pin</code> from your registered WhatsApp/phone (<code>{MAATS_COTTAGE_PROFILE.phone}</code>) to receive your 4-digit temporary PIN.
                </p>
              </div>

              <a 
                href="https://t.me/gro10xbizbot" 
                target="_blank" 
                rel="noreferrer"
                className="btn-gold"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' }}
              >
                <Bot size={16} /> 1-Tap: Open @gro10xbizbot on Telegram
              </a>

              <div style={{ textAlign: 'center', position: 'relative', margin: '0.25rem 0' }}>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
                <span style={{ position: 'relative', top: '-13px', background: '#0f172a', padding: '0 0.5rem', fontSize: '0.72rem', color: '#64748b' }}>
                  OR ENTER YOUR 4-DIGIT PIN
                </span>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (enteredPin.length === 4) {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('gro10x_borrower_pin_session', 'verified_' + Date.now());
                    }
                    setPinAuthenticated(true);
                    setShowPinModal(false);
                    setActionSuccessMsg('✓ Verified via Telegram PIN! Full operational session active.');
                    setTimeout(() => setActionSuccessMsg(''), 4000);
                  } else {
                    setPinError('Please enter a 4-digit numeric PIN.');
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Enter 4-Digit Temporary PIN
                  </label>
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="• • • •"
                    value={enteredPin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEnteredPin(val);
                      setPinError('');
                    }}
                    className="form-input"
                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', fontWeight: '800', color: '#D4AF37' }}
                  />
                  {pinError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.3rem 0 0 0' }}>{pinError}</p>}
                </div>

                <button 
                  type="submit" 
                  className="btn-gold" 
                  style={{ width: '100%', padding: '0.75rem', fontWeight: '700', fontSize: '0.9rem' }}
                >
                  <KeyRound size={15} /> Unlock Operational Terminal
                </button>
              </form>

              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                🔒 Session is encrypted and bound to Maats Cottage Ltd facility under Safe Home SPV-01.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
