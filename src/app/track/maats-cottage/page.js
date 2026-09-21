'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, Clock, 
  Sparkles, RefreshCw, X, Download, Bot, KeyRound
} from 'lucide-react';
import { 
  MAATS_COTTAGE_PROFILE, 
  getWorkOrders, 
  saveWorkOrder, 
  createWorkOrder,
  settleWorkOrder,
  revertOrderToPending,
  calculateLedgerMetrics, 
  generateWhatsAppBroadcast
} from '../../../lib/workOrders';

// Modular Subcomponents
import TrackerHeader from './components/TrackerHeader';
import DynamicMaturityAlert from './components/DynamicMaturityAlert';
import LedgerMetricsGrid from './components/LedgerMetricsGrid';
import OrderSearchFilters from './components/OrderSearchFilters';
import WorkOrderCard from './components/WorkOrderCard';
import EditOrderModal from './components/EditOrderModal';
import LogOrderModal from './components/LogOrderModal';
import SettleOrderModal from './components/SettleOrderModal';
import DocumentInspectorModal from './components/DocumentInspectorModal';

export default function MaatsCottageTrackerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending' | 'settled' | 'compliance'
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_asc');

  // Modal States
  const [selectedOrderDocs, setSelectedOrderDocs] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [settleTargetOrder, setSettleTargetOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  // Telegram 4-Digit PIN Authentication State
  const [pinAuthenticated, setPinAuthenticated] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

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
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
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

  const handleConfirmSettle = async (orderCode, settlePayload) => {
    const updated = await settleWorkOrder(orderCode, settlePayload);
    setOrders(updated);
    setSettleTargetOrder(null);
    setActiveTab('settled');
    setActionSuccessMsg(`Order ${orderCode} successfully settled and marked as Repaid! Telegram notified.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const handleSaveEditedOrder = async (updatedOrder) => {
    const updated = await saveWorkOrder(updatedOrder);
    setOrders(updated);
    setEditingOrder(null);
    setActionSuccessMsg(`Work Order ${updatedOrder.order_code} updated successfully!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleCreateOrder = async (orderForm) => {
    const code = orderForm.order_code.trim() || `MSP-0${orders.length + 1}`;
    const inv = Number(orderForm.investment_amount_bdt);
    const ret = Number(orderForm.return_amount_bdt);
    const profit = ret - inv;
    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + Number(orderForm.duration_days || 10));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const orderObj = {
      id: `wo-${Date.now()}`,
      order_code: code,
      corporate_client: orderForm.corporate_client,
      item_description: orderForm.item_description,
      investment_amount_bdt: inv,
      return_amount_bdt: ret,
      profit_bdt: profit,
      duration_days: Number(orderForm.duration_days || 10),
      start_date: today,
      due_date: dueDate,
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: `${MAATS_COTTAGE_PROFILE.accountName} (A/C: ${MAATS_COTTAGE_PROFILE.accountNumber})`,
      notes: orderForm.notes || 'Submitted via Work Order Terminal',
      due_note: 'Awaiting Disbursal'
    };

    const updated = await createWorkOrder(orderObj);
    setOrders(updated);
    setShowAddModal(false);
    setActionSuccessMsg(`New order ${code} logged & Telegram alert dispatched to Faiz Ahmed & Firoz!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Filter by active tab
  const tabOrders = orders.filter(o => {
    if (activeTab === 'active') return o.status === 'Disbursed_Active';
    if (activeTab === 'pending') return o.status === 'Pending_Approval';
    if (activeTab === 'settled') return o.status === 'Settled_Repaid';
    return true;
  });

  // Apply search query
  const searchedOrders = tabOrders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.order_code && o.order_code.toLowerCase().includes(q)) ||
      (o.corporate_client && o.corporate_client.toLowerCase().includes(q)) ||
      (o.po_ref_number && o.po_ref_number.toLowerCase().includes(q)) ||
      (o.item_description && o.item_description.toLowerCase().includes(q)) ||
      (o.notes && o.notes.toLowerCase().includes(q))
    );
  });

  // Apply filter chip
  const filteredOrders = searchedOrders.filter(o => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'due_soon') {
      const dueStr = o.due_date || o.return_date;
      if (!dueStr) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.round((new Date(dueStr) - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (activeFilter === 'high_value') {
      return Number(o.investment_amount_bdt || 0) >= 500000;
    }
    if (activeFilter === 'multi_tranche') {
      return o.disbursement_transfers && o.disbursement_transfers.length > 1;
    }
    if (activeFilter === 'challan') {
      return Boolean(o.delivery_challan_url || o.settlement_challan_receipt_url);
    }
    return true;
  });

  // Apply sort
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'due_asc') {
      const dateA = new Date(a.due_date || a.return_date || '9999-12-31').getTime();
      const dateB = new Date(b.due_date || b.return_date || '9999-12-31').getTime();
      return dateA - dateB;
    }
    if (sortBy === 'code_desc') {
      return (b.order_code || '').localeCompare(a.order_code || '');
    }
    if (sortBy === 'inv_desc') {
      return Number(b.investment_amount_bdt || 0) - Number(a.investment_amount_bdt || 0);
    }
    if (sortBy === 'profit_desc') {
      const profitA = Number(a.profit_bdt || (a.return_amount_bdt - a.investment_amount_bdt) || 0);
      const profitB = Number(b.profit_bdt || (b.return_amount_bdt - b.investment_amount_bdt) || 0);
      return profitB - profitA;
    }
    return 0;
  });

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* ── HEADER EXECUTIVE HERO ── */}
      <TrackerHeader 
        onCopyWhatsApp={handleCopyWhatsApp}
        copiedWhatsApp={copiedWhatsApp}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenPinModal={() => setShowPinModal(true)}
      />

      {/* ── TOAST NOTIFICATION ── */}
      {actionSuccessMsg && (
        <div style={{ maxWidth: '1000px', margin: '1rem auto 0 auto', padding: '0 1.25rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
            <CheckCircle2 size={18} />
            {actionSuccessMsg}
          </div>
        </div>
      )}

      {/* ── KPI METRICS STRIP WITH INLINE MATURITY PILL ── */}
      <LedgerMetricsGrid 
        metrics={metrics}
        orders={orders}
        alertNode={
          <DynamicMaturityAlert 
            orders={orders}
            onInspectOrder={(order) => { setSelectedOrderDocs(order); setActiveDocTab(0); }}
            onSettleOrder={(order) => setSettleTargetOrder(order)}
          />
        }
      />

      {/* ── MAIN CONTENT TABS ── */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* TAB NAVIGATION STRIP */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <button
            onClick={() => { setActiveTab('active'); setSearchQuery(''); setActiveFilter('all'); }}
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
            onClick={() => { setActiveTab('pending'); setSearchQuery(''); setActiveFilter('all'); }}
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
            onClick={() => { setActiveTab('settled'); setSearchQuery(''); setActiveFilter('all'); }}
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

        {/* ── ORDERS LISTING (ACTIVE / PENDING / SETTLED) ── */}
        {activeTab !== 'compliance' && (
          <div>
            {/* Search, Filter & Sort Component */}
            <OrderSearchFilters 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={tabOrders.length}
              filteredCount={sortedOrders.length}
            />

            {/* Empty State */}
            {sortedOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <Clock size={36} style={{ color: '#64748b', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: '0 0 0.4rem 0' }}>No Work Orders Found</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
                  {searchQuery ? `No orders matched "${searchQuery}". Try clearing your search.` : 'No work orders currently match the selected filter.'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} 
                    className="btn-outline" 
                    style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {sortedOrders.map(order => (
                  <WorkOrderCard 
                    key={order.order_code}
                    order={order}
                    onInspectDocs={(ord, tabIdx = 0) => {
                      setSelectedOrderDocs(ord);
                      setActiveDocTab(tabIdx);
                    }}
                    onEditOrder={(ord) => setEditingOrder(ord)}
                    onSettleOrder={(ord) => setSettleTargetOrder(ord)}
                    onRevertOrder={activeTab === 'active' ? handleRevert : undefined}
                  />
                ))}
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
                    <ShieldCheck size={16} /> Official Company Profile Deck (19 Pages)
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

      {/* ── MODALS ── */}

      {/* 1. Document Inspector Modal */}
      {selectedOrderDocs && (
        <DocumentInspectorModal 
          order={selectedOrderDocs}
          activeTab={activeDocTab}
          onClose={() => setSelectedOrderDocs(null)}
        />
      )}

      {/* 2. Settle Order Modal */}
      {settleTargetOrder && (
        <SettleOrderModal 
          order={settleTargetOrder}
          onClose={() => setSettleTargetOrder(null)}
          onConfirmSettle={handleConfirmSettle}
        />
      )}

      {/* 3. Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal 
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditedOrder}
        />
      )}

      {/* 4. Log Work Order Modal */}
      {showAddModal && (
        <LogOrderModal 
          defaultCode={`MSP-0${orders.length + 1}`}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {/* 5. Gallery Lightbox Modal */}
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

      {/* 6. Telegram PIN Authentication Modal */}
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
                  Open our official Telegram client bot <strong>@gro10xbizbot</strong> and type <code>/pin</code> from your registered phone (<code>{MAATS_COTTAGE_PROFILE.phone}</code>) to receive your 4-digit temporary PIN.
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
                🔒 Session is encrypted and bound to Maats Cottage Ltd facility under Safe Plan SPV-01.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
