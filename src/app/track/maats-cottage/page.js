'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, Clock, AlertTriangle, 
  ArrowUpRight, Copy, Check, Plus, ExternalLink, Calendar, 
  FileText, Landmark, RefreshCw, Eye, X, ChevronRight, Phone,
  Sparkles, TrendingUp, DollarSign, Award, ArrowRight
} from 'lucide-react';
import { 
  MAATS_COTTAGE_PROFILE, 
  getWorkOrders, 
  saveWorkOrder, 
  approveAndDisburseOrder, 
  calculateLedgerMetrics, 
  generateWhatsAppBroadcast 
} from '../../../lib/workOrders';
import { formatCurrency } from '../../../lib/currency';

export default function MaatsCottageTrackerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending' | 'compliance'
  const [copied, setCopied] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

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
      notes: newOrder.notes || 'Submitted via Work Order Terminal',
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
    setActionSuccessMsg(`New order ${code} logged under Pending Approvals!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Format Lakhs helper
  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', borderBottom: '1px solid rgba(212,175,55,0.25)', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: '700' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
            LIVE TERMINAL SYNCED
          </span>
          <span style={{ color: '#64748b' }}>•</span>
          <span>{MAATS_COTTAGE_PROFILE.facilityName}</span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#D4AF37', fontWeight: '600' }}>Managing Partner: Faiz Ahmed ({MAATS_COTTAGE_PROFILE.managingPartner.phone})</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>MSP-001: Delta Life (Order 1)</span>
                <span className="status-badge status-badge--danger" style={{ fontSize: '0.65rem' }}>MATURITY TODAY (4:00 PM)</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                Principal Disbursed: <strong>৳2.50 Lakhs</strong> <span style={{ color: '#38bdf8' }}>(Tranche 1: ৳2.00L Advance + Tranche 2: ৳50k Top-up)</span> → Total Repayment Due: <strong style={{ color: '#10b981' }}>৳2.875 Lakhs</strong> (+৳37.5k Profit)
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedReceipt('/receipts/msp-001.png')}
            className="btn-outline" 
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Eye size={13} style={{ marginRight: '0.3rem' }} /> View Transfer Slip
          </button>
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
            onClick={() => setActiveTab('compliance')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'compliance' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'compliance' ? '#10b981' : '#94a3b8',
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
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                          {order.corporate_client} — <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{order.item_description}</span>
                        </p>
                      </div>

                      {/* Right Action */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {order.disbursement_receipt_url && (
                          <button 
                            onClick={() => setSelectedReceipt(order.disbursement_receipt_url)}
                            className="btn-outline"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Eye size={13} /> View Slip
                          </button>
                        )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                <strong>{pendingOrders.length}</strong> new purchase order requests submitted by Maats Cottage awaiting partner clearance.
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

                      <button 
                        onClick={() => handleApprove(order.order_code)}
                        className="btn-gold"
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}
                      >
                        <Check size={14} /> Approve &amp; Disburse
                      </button>
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

        {/* ── TAB 3: PROFILE & COMPLIANCE ── */}
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

    </div>
  );
}
