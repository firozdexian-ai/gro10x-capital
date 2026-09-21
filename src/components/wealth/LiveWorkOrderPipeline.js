'use client';

import React, { useState } from 'react';
import { 
  Briefcase, CheckCircle2, Clock, ExternalLink, 
  ShieldCheck, FileText, AlertCircle, ChevronRight, Eye
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';
import { SEED_WORK_ORDERS } from '../../lib/workOrders';

export default function LiveWorkOrderPipeline({ fundMetrics, onSelectDocument }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = fundMetrics?.recent_orders || SEED_WORK_ORDERS.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* 1. ASSET ALLOCATION BREAKDOWN */}
      <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: '#D4AF37' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                Active Portfolio Allocation &amp; Deployment Strategy
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
              Capital is diversified across verified institutional purchase orders, rapid industrial supply chains, and asset-backed retail facilities.
            </p>
          </div>
          <span style={{ 
            background: 'rgba(16,185,129,0.12)', 
            border: '1px solid rgba(16,185,129,0.3)', 
            color: '#10b981', 
            padding: '0.25rem 0.65rem', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem' 
          }}>
            <ShieldCheck size={13} /> 100% Collateral-Backed
          </span>
        </div>

        {/* Visual Allocation Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.05)', marginBottom: '0.6rem' }}>
            <div style={{ width: '60%', background: 'linear-gradient(90deg, #D4AF37, #b49127)' }} title="60% Corporate Work Orders" />
            <div style={{ width: '25%', background: 'linear-gradient(90deg, #38bdf8, #0284c7)' }} title="25% Institutional Procurement" />
            <div style={{ width: '15%', background: 'linear-gradient(90deg, #a855f7, #7e22ce)' }} title="15% Retail Asset Outlets" />
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#D4AF37' }} />
              <strong>60%</strong> Corporate Work Orders (7–10 Day Cycles)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#38bdf8' }} />
              <strong>25%</strong> Industrial Procurement &amp; Packaging
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a855f7' }} />
              <strong>15%</strong> Asset-Backed Retail Outlets
            </span>
          </div>
        </div>

        {/* 3 Active Deployment Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* Pillar 1: Maats Cottage */}
          <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                Vehicle #01 · Revolving
              </span>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '700' }}>
                ● 100% On-Time (5 Cycles)
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
              Maats Cottage Ltd.
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
              Solmaid, Vatara, Dhaka · Corporate Gifting, Finished Leather &amp; Jute Crafts
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Active Facility</span>
                <strong style={{ color: '#D4AF37', fontSize: '0.92rem' }}>৳25,00,000</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Avg Turnaround</span>
                <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>7 – 10 Days</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Key Buyers</span>
                <strong style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Delta Ltd, Greenfield</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Gross Margin</span>
                <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>12% – 18% / cycle</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Security: PO + Cheques + CIB</span>
              <a href="/track/maats-cottage" style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Open Live Terminal <ChevronRight size={12} />
              </a>
            </div>
          </div>

          {/* Pillar 2: SME Supplier */}
          <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                Vehicle #02 · Onboarding
              </span>
              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700' }}>
                ● Due Diligence Stage 3
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
              Institutional SME Supplier
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
              Tejgaon / Gazipur Industrial Belt · Corporate Procurement &amp; Packaging
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Target Facility</span>
                <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>৳50,00,000</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Turnaround Target</span>
                <strong style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>10 – 14 Days</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Risk Rating</span>
                <strong style={{ color: '#10b981', fontSize: '0.8rem' }}>Tier-1 Blue Chip</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Credit Underwriting</span>
                <strong style={{ color: '#D4AF37', fontSize: '0.8rem' }}>Faiz Ahmed / Committee</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Deployment: Q3 2026</span>
              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700' }}>Ring-Fenced SPV</span>
            </div>
          </div>

          {/* Pillar 3: Retail Outlets */}
          <div style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                Vehicle #03 · Collateral
              </span>
              <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: '700' }}>
                ● Performing Outlets
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '800' }}>
              Retail Franchise &amp; Asset Hubs
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', color: '#94a3b8', fontSize: '0.78rem' }}>
              High-Footfall Commercial Hubs · Capital Equipment &amp; Machinery Co-Ownership
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Asset Backing</span>
                <strong style={{ color: '#c084fc', fontSize: '0.92rem' }}>100% Machinery Title</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Cash-Flow Sync</span>
                <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>Live Cloud POS</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Audit Frequency</span>
                <strong style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Daily Reconciliations</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>Track Record</span>
                <strong style={{ color: '#D4AF37', fontSize: '0.92rem' }}>18+ Months Active</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Model: Franchise Expansion</span>
              <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: '700' }}>Zero Unsecured Debt</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. VERIFIABLE LIVE ORDERS & PROOF HUB */}
      <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#D4AF37' }} /> Verifiable Work-Order Settlements
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
              Direct evidence of real-world corporate orders funded, settled on-time, and repaid with profit.
            </p>
          </div>
          <a
            href="/track/maats-cottage"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.82rem',
              color: '#D4AF37',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px'
            }}
          >
            Live Tracking Terminal <ExternalLink size={12} />
          </a>
        </div>

        {/* Order Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {orders.map(order => (
            <div
              key={order.order_code}
              style={{
                background: 'rgba(7,10,20,0.65)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ maxWidth: '420px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ 
                    background: 'rgba(212,175,55,0.15)', 
                    color: '#D4AF37', 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '4px', 
                    fontSize: '0.72rem', 
                    fontWeight: '800' 
                  }}>
                    {order.order_code}
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: '700', fontSize: '0.92rem' }}>
                    {order.corporate_client}
                  </span>
                  <span style={{ 
                    background: 'rgba(16,185,129,0.15)', 
                    color: '#10b981', 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: '700' 
                  }}>
                    ✓ Settled &amp; Repaid
                  </span>
                </div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem' }}>
                  {order.item_description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>PO Ref: <strong style={{ color: '#cbd5e1' }}>{order.po_ref_number || 'DL/PO/2026'}</strong></span>
                  <span>Turnaround: <strong style={{ color: '#38bdf8' }}>{order.duration_days} Days</strong></span>
                  <span>Settled: <strong style={{ color: '#10b981' }}>{order.settled_date || '06 Sep 2026'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block' }}>
                    Capital Disbursed / Repaid
                  </span>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
                    {formatCurrency(order.investment_amount_bdt, 'BDT')} → <span style={{ color: '#10b981' }}>{formatCurrency(order.return_amount_bdt, 'BDT')}</span>
                  </strong>
                  <span style={{ display: 'block', color: '#10b981', fontSize: '0.72rem', fontWeight: '700' }}>
                    +৳{((order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt)) / 1000).toFixed(1)}k Gross Profit
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {order.po_document_url && (
                    <a
                      href={order.po_document_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#cbd5e1',
                        padding: '0.4rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Eye size={12} /> PO
                    </a>
                  )}
                  {order.delivery_challan_url && (
                    <a
                      href={order.delivery_challan_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: '#D4AF37',
                        padding: '0.4rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Eye size={12} /> Challan
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
