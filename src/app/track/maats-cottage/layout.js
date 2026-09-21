'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import TrackerHeader from './components/TrackerHeader';
import LogOrderModal from './components/LogOrderModal';
import EditOrderModal from './components/EditOrderModal';
import SettleOrderModal from './components/SettleOrderModal';
import DocumentInspectorModal from './components/DocumentInspectorModal';
import { CheckCircle2, ShieldCheck, X, Bot, KeyRound } from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../lib/workOrders';

function TrackerShell({ children }) {
  const pathname = usePathname();
  const { 
    metrics,
    copiedWhatsApp,
    actionSuccessMsg,
    handleCopyWhatsApp,
    handleSaveEditedOrder,
    handleConfirmSettle,
    handleCreateOrder,
    selectedOrderDocs,
    setSelectedOrderDocs,
    activeDocTab,
    setActiveDocTab,
    docInspectorFullscreen,
    setDocInspectorFullscreen,
    editingOrder,
    setEditingOrder,
    settleTargetOrder,
    setSettleTargetOrder,
    showAddModal,
    setShowAddModal,
    showPinModal,
    setShowPinModal
  } = useTracker();

  // PIN authentication state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // If this is the standalone form page /track/maats-cottage/new, render without chrome
  if (pathname === '/track/maats-cottage/new') {
    return <>{children}</>;
  }

  const navTabs = [
    { href: '/track/maats-cottage', label: '📊 Overview & Impact', exact: true },
    { href: '/track/maats-cottage/active', label: `⚡ Active Deployments (${metrics.activeCount})` },
    { href: '/track/maats-cottage/pending', label: `⏳ Pending Clearances (${metrics.pendingCount})` },
    { href: '/track/maats-cottage/settled', label: `✓ Settled & Repaid (${metrics.settledCount})` },
    { href: '/track/maats-cottage/compliance', label: '🛡️ Compliance Vault (6)' }
  ];

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

      {/* ── UNIFIED ROUTE NAVIGATION TAB BAR ── */}
      <nav style={{ maxWidth: '1000px', margin: '1.25rem auto 0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {navTabs.map(tab => {
            const isActive = tab.exact 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  background: 'transparent',
                  borderBottom: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                  color: isActive ? '#D4AF37' : '#94a3b8',
                  fontWeight: '700',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.25rem' }}>
        {children}
      </main>

      {/* ── SHARED MODALS ── */}
      {/* 1. Log Order Modal */}
      {showAddModal && (
        <LogOrderModal 
          onClose={() => setShowAddModal(false)}
          onCreateOrder={handleCreateOrder}
          totalOrders={metrics.totalOrdersCount}
        />
      )}

      {/* 2. Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal 
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditedOrder}
        />
      )}

      {/* 3. Settle Order Modal */}
      {settleTargetOrder && (
        <SettleOrderModal 
          order={settleTargetOrder}
          onClose={() => setSettleTargetOrder(null)}
          onConfirmSettle={handleConfirmSettle}
        />
      )}

      {/* 4. Document Inspector Modal */}
      {selectedOrderDocs && (
        <DocumentInspectorModal 
          order={selectedOrderDocs}
          activeTab={activeDocTab}
          isFullscreen={docInspectorFullscreen}
          onClose={() => setSelectedOrderDocs(null)}
          onTabChange={setActiveDocTab}
          onToggleFullscreen={() => setDocInspectorFullscreen(v => !v)}
        />
      )}

      {/* 5. Telegram PIN Modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Telegram PIN Verification</h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Institutional Session Security</span>
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
                    setShowPinModal(false);
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TrackerLayout({ children }) {
  return (
    <TrackerProvider>
      <TrackerShell>{children}</TrackerShell>
    </TrackerProvider>
  );
}
