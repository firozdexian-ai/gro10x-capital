'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar, FileText, 
  Edit2, CheckSquare, RotateCcw, ChevronDown, ChevronUp, 
  Layers, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { formatDisplayDate, computeDueStatus } from '../../../../lib/workOrders';

export default function WorkOrderCard({
  order,
  onInspectDocs,
  onEditOrder,
  onSettleOrder,
  onRevertOrder
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrancheDetails, setShowTrancheDetails] = useState(false);

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt) || 0);
  const marginPct = order.investment_amount_bdt > 0 
    ? ((profit / Number(order.investment_amount_bdt)) * 100).toFixed(1) 
    : '0.0';

  const liveStatus = computeDueStatus(order);
  const isOverdue = liveStatus.includes('Overdue');
  const isClosingToday = liveStatus.includes('DUE TODAY');
  const isUrgent = isOverdue || isClosingToday;
  const isNearDue = liveStatus.includes('Due Tomorrow') || (liveStatus.includes('days left') && liveStatus.includes('⚠️'));

  // Calculate timeline progress
  let progressPct = 0;
  if (order.start_date && (order.due_date || order.return_date)) {
    const start = new Date(order.start_date).getTime();
    const due = new Date(order.due_date || order.return_date).getTime();
    const now = Date.now();
    if (due > start) {
      progressPct = Math.min(100, Math.max(0, Math.round(((now - start) / (due - start)) * 100)));
    }
  }

  const isSettled = order.status === 'Settled_Repaid';
  const isPending = order.status === 'Pending_Approval';
  const isActive = order.status === 'Disbursed_Active';

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1rem 1.25rem', 
        borderColor: isUrgent 
          ? 'rgba(239,68,68,0.45)' 
          : (isNearDue 
            ? 'rgba(245,158,11,0.45)' 
            : isSettled 
            ? 'rgba(16,185,129,0.25)' 
            : isPending 
            ? 'rgba(234,179,8,0.25)' 
            : 'rgba(255,255,255,0.07)'),
        background: isUrgent 
          ? 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(15,23,42,0.95) 100%)' 
          : (isNearDue 
            ? 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(15,23,42,0.95) 100%)' 
            : 'rgba(15,23,42,0.7)'),
        borderLeft: isSettled 
          ? '4px solid #10b981' 
          : isPending 
          ? '4px solid #eab308' 
          : isUrgent 
          ? '4px solid #ef4444' 
          : isNearDue 
          ? '4px solid #f59e0b' 
          : '4px solid #38bdf8',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* ── COMPACT HEADER ROW: Code, Status, Client, Key Figures, Primary Action ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Left: Code, Status & Client/Item */}
        <div style={{ minWidth: '240px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>
              {order.order_code}
            </span>

            {/* Single Core Status Badge */}
            {isActive && (
              <span className="status-badge status-badge--success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Active
              </span>
            )}
            {isPending && (
              <span className="status-badge status-badge--gold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Pending
              </span>
            )}
            {isSettled && (
              <span className="status-badge status-badge--success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Settled ✓
              </span>
            )}

            {/* Live Due Status Badge (active only) */}
            {isActive && liveStatus && (
              <span 
                style={{ 
                  background: isUrgent ? 'rgba(239,68,68,0.15)' : (isNearDue ? 'rgba(245,158,11,0.15)' : 'rgba(56,189,248,0.12)'), 
                  color: isUrgent ? '#ef4444' : (isNearDue ? '#f59e0b' : '#38bdf8'), 
                  border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : (isNearDue ? 'rgba(245,158,11,0.4)' : 'rgba(56,189,248,0.3)')}`, 
                  borderRadius: '5px', 
                  padding: '0.15rem 0.45rem', 
                  fontSize: '0.68rem', 
                  fontWeight: '700', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem' 
                }}
              >
                {isUrgent ? <AlertTriangle size={11} className="animate-pulse" /> : (isNearDue ? <Clock size={11} /> : <Calendar size={11} />)}
                {liveStatus}
              </span>
            )}
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, fontWeight: '600' }}>
            {order.corporate_client} <span style={{ color: '#64748b', fontWeight: 'normal' }}>— {order.item_description}</span>
          </p>
        </div>

        {/* Right: Key Figures + Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* 2 Core Numbers Inline: Capital & Return */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>
              {fmtLakhs(order.investment_amount_bdt)}
            </div>
            <div style={{ fontSize: '0.72rem', color: isSettled ? '#10b981' : '#D4AF37', fontWeight: '600' }}>
              {isSettled ? `+৳${(profit / 1000).toFixed(0)}k profit` : `Ret: ${fmtLakhs(order.return_amount_bdt)} (+৳${(profit / 1000).toFixed(0)}k)`}
            </div>
          </div>

          {/* Primary Action Button (Only 1 button in compact mode) */}
          {isActive && (
            <button 
              onClick={() => onSettleOrder(order)}
              className="btn-gold"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700', borderRadius: '7px' }}
            >
              <CheckSquare size={13} /> Settle
            </button>
          )}

          {isPending && (
            <button 
              onClick={() => onEditOrder(order)}
              className="btn-gold"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700', borderRadius: '7px' }}
            >
              <Edit2 size={13} /> Review &amp; Edit
            </button>
          )}

          {isSettled && (
            <button 
              onClick={() => onInspectDocs(order)}
              className="btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderRadius: '7px' }}
            >
              <FileText size={13} /> Audit
            </button>
          )}

          {/* Details toggle chevron */}
          <button
            onClick={() => setIsExpanded(v => !v)}
            style={{
              background: isExpanded ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '0.35rem 0.55rem',
              color: isExpanded ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.72rem',
              fontWeight: '600'
            }}
            title={isExpanded ? 'Collapse details' : 'Expand full details'}
          >
            <span>{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

        </div>
      </div>

      {/* ── EXPANDED DETAILS (Progressive Disclosure) ── */}
      {isExpanded && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* Meta badges row (Challan, Tranche, Settled date) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {order.tranche_info && (
              <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '5px', padding: '0.15rem 0.45rem', fontSize: '0.68rem', fontWeight: '600' }}>
                {order.tranche_info}
              </span>
            )}

            {order.delivery_challan_url && (
              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '5px', padding: '0.15rem 0.45rem', fontSize: '0.68rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={11} /> Challan Stamped ({order.delivery_challan_invoice_no || 'Verified'})
              </span>
            )}

            {isSettled && order.settled_date && (
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Settled: <strong style={{ color: '#cbd5e1' }}>{formatDisplayDate(order.settled_date)}</strong>
              </span>
            )}
          </div>

          {/* Timeline progress bar (Active Orders) */}
          {isActive && order.start_date && (order.due_date || order.return_date) && (
            <div style={{ marginBottom: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                <span>Disbursed: <strong style={{ color: '#cbd5e1' }}>{formatDisplayDate(order.start_date)}</strong></span>
                <span style={{ color: isUrgent ? '#ef4444' : isNearDue ? '#f59e0b' : '#38bdf8', fontWeight: '700' }}>
                  Elapsed: {progressPct}%
                </span>
                <span>Maturity: <strong style={{ color: isUrgent ? '#ef4444' : '#fff' }}>{formatDisplayDate(order.due_date || order.return_date)}</strong></span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progressPct}%`, 
                    background: isUrgent 
                      ? '#ef4444' 
                      : isNearDue 
                      ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)' 
                      : 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)', 
                    height: '100%',
                    borderRadius: '999px'
                  }} 
                />
              </div>
            </div>
          )}

          {/* 4-Column Financial Breakdown */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '7px', padding: '0.65rem 0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.65rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
                {isSettled ? 'Principal Recovered' : isPending ? 'Requested Capital' : 'Disbursed Capital'}
              </span>
              <strong style={{ fontSize: '0.95rem', color: isPending ? '#eab308' : '#fff' }}>
                {fmtLakhs(order.investment_amount_bdt)}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
                {isSettled ? 'Total Repaid' : isPending ? 'Offered Return' : 'Expected Return'}
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>
                {fmtLakhs(order.return_amount_bdt)}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
                {isSettled ? 'Profit Realized' : 'Net Yield'}
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#D4AF37' }}>
                +৳{(profit / 1000).toFixed(1)}k <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({marginPct}%)</span>
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
                {isSettled ? 'Verification' : 'Return Date'}
              </span>
              {isSettled ? (
                <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                  <CheckCircle2 size={13} /> Dual Verified
                </span>
              ) : (
                <>
                  <strong style={{ fontSize: '0.9rem', color: isUrgent ? '#ef4444' : (isNearDue ? '#f59e0b' : '#38bdf8'), display: 'block' }}>
                    {formatDisplayDate(order.due_date || order.return_date)}
                  </strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block' }}>
                    Tenor: {order.duration_days} Days
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Multi-tranche details */}
          {order.disbursement_transfers && order.disbursement_transfers.length > 0 && (
            <div style={{ marginTop: '0.65rem', padding: '0.55rem 0.75rem', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '7px', fontSize: '0.75rem' }}>
              <div 
                onClick={() => setShowTrancheDetails(!showTrancheDetails)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={12} style={{ color: '#38bdf8' }} />
                  <span style={{ color: order.is_combined_disbursement ? '#a855f7' : '#38bdf8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    {order.disbursement_transfers.length === 1 
                      ? (order.is_combined_disbursement ? 'Single Combined Transfer (৳3.75L Total)' : 'Single Tranche Disbursed') 
                      : `Disbursed in ${order.disbursement_transfers.length} Tranches`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {order.po_ref_number && (
                    <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                      PO: <strong style={{ color: '#cbd5e1' }}>{order.po_ref_number}</strong>
                    </span>
                  )}
                  {showTrancheDetails ? <ChevronUp size={13} style={{ color: '#94a3b8' }} /> : <ChevronDown size={13} style={{ color: '#94a3b8' }} />}
                </div>
              </div>

              {showTrancheDetails && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {order.disbursement_transfers.map((t, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onInspectDocs(order, idx + (order.po_document_url ? 1 : 0))}
                      style={{ background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.6rem', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontWeight: '700', fontSize: '0.72rem' }}>
                        <span>{t.is_combined ? `Combined: ${fmtLakhs(t.amount_bdt)}` : `#${t.tranche_no}: ${fmtLakhs(t.amount_bdt)}`}</span>
                        <span style={{ fontSize: '0.65rem', color: t.ref_no?.startsWith('CASH') ? '#eab308' : '#38bdf8' }}>
                          {t.ref_no?.startsWith('CASH') ? 'Cash' : 'CityTouch'}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '0.15rem' }}>
                        {t.date} • {t.ref_no}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <p style={{ color: '#94a3b8', fontSize: '0.74rem', margin: '0.65rem 0 0 0', fontStyle: 'italic' }}>
              Note: {order.notes}
            </p>
          )}

          {isSettled && order.settlement_note && (
            <p style={{ color: '#10b981', fontSize: '0.74rem', margin: '0.65rem 0 0 0', background: 'rgba(16,185,129,0.06)', padding: '0.35rem 0.55rem', borderRadius: '5px' }}>
              Settlement Audit: {order.settlement_note}
            </p>
          )}

          {/* Secondary Action Toolbar in Expanded Mode */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button 
              onClick={() => onInspectDocs(order)}
              className="btn-outline"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <FileText size={12} /> {isSettled ? 'Audit Package' : 'Audit Docs & PO'}
            </button>
            
            <button 
              onClick={() => onEditOrder(order)}
              className="btn-outline"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', borderColor: 'rgba(212,175,55,0.3)', color: '#D4AF37' }}
            >
              <Edit2 size={12} /> Edit Order
            </button>

            {isActive && onRevertOrder && (
              <button 
                onClick={() => onRevertOrder(order.order_code)}
                title="Revert back to Pending Approval"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: '5px', fontSize: '0.7rem', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <RotateCcw size={11} /> Undo to Pending
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
