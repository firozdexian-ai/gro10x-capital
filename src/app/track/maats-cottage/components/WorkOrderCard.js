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
        padding: '1.25rem', 
        borderColor: isUrgent 
          ? 'rgba(239,68,68,0.5)' 
          : (isNearDue 
            ? 'rgba(245,158,11,0.5)' 
            : isSettled 
            ? 'rgba(16,185,129,0.3)' 
            : isPending 
            ? 'rgba(234,179,8,0.3)' 
            : 'rgba(255,255,255,0.08)'),
        background: isUrgent 
          ? 'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(15,23,42,0.92) 100%)' 
          : (isNearDue 
            ? 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(15,23,42,0.92) 100%)' 
            : undefined),
        borderLeft: isSettled 
          ? '4px solid #10b981' 
          : isPending 
          ? '4px solid #eab308' 
          : isUrgent 
          ? '4px solid #ef4444' 
          : isNearDue 
          ? '4px solid #f59e0b' 
          : '4px solid #38bdf8'
      }}
    >
      {/* TOP ROW: Order Code, Badges & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>
              {order.order_code}
            </span>

            {/* Status Badge */}
            {isActive && (
              <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                Disbursed &amp; Active
              </span>
            )}
            {isPending && (
              <span className="status-badge status-badge--gold" style={{ fontSize: '0.7rem' }}>
                Pending Approval
              </span>
            )}
            {isSettled && (
              <span className="status-badge status-badge--success" style={{ fontSize: '0.7rem' }}>
                Settled &amp; Repaid ✓
              </span>
            )}

            {/* Live Due Status Badge */}
            {isActive && liveStatus && (
              <span 
                style={{ 
                  background: isUrgent ? 'rgba(239,68,68,0.2)' : (isNearDue ? 'rgba(245,158,11,0.2)' : 'rgba(56,189,248,0.15)'), 
                  color: isUrgent ? '#ef4444' : (isNearDue ? '#f59e0b' : '#38bdf8'), 
                  border: `1px solid ${isUrgent ? '#ef4444' : (isNearDue ? '#f59e0b' : 'rgba(56,189,248,0.4)')}`, 
                  borderRadius: '6px', 
                  padding: '0.15rem 0.55rem', 
                  fontSize: '0.68rem', 
                  fontWeight: '700', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem' 
                }}
              >
                {isUrgent ? <AlertTriangle size={11} className="animate-pulse" /> : (isNearDue ? <Clock size={11} /> : <Calendar size={11} />)}
                {liveStatus}
              </span>
            )}

            {order.tranche_info && (
              <span style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: '600' }}>
                {order.tranche_info}
              </span>
            )}

            {order.delivery_challan_url && (
              <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={11} /> Challan Stamped ({order.delivery_challan_invoice_no || 'Verified'})
              </span>
            )}

            {isSettled && order.settled_date && (
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Settled on: <strong style={{ color: '#cbd5e1' }}>{formatDisplayDate(order.settled_date)}</strong>
              </span>
            )}
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: 0, fontWeight: '600' }}>
            {order.corporate_client} — <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{order.item_description}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={() => onInspectDocs(order)}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <FileText size={13} /> {isSettled ? 'Audit Package' : 'Audit Docs & PO'}
          </button>
          
          <button 
            onClick={() => onEditOrder(order)}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(212,175,55,0.4)', color: '#D4AF37' }}
          >
            <Edit2 size={13} /> Edit
          </button>

          {isActive && (
            <button 
              onClick={() => onSettleOrder(order)}
              className="btn-gold"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}
            >
              <CheckSquare size={13} /> Settle &amp; Close
            </button>
          )}

          {isActive && onRevertOrder && (
            <button 
              onClick={() => onRevertOrder(order.order_code)}
              title="Revert back to Pending Approval if accidentally marked as disbursed"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '6px', fontSize: '0.72rem', padding: '0.35rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RotateCcw size={11} /> Undo
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE PROGRESS BAR (ACTIVE ORDERS ONLY) */}
      {isActive && order.start_date && (order.due_date || order.return_date) && (
        <div style={{ margin: '0.75rem 0', background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            <span>Disbursed: <strong style={{ color: '#cbd5e1' }}>{formatDisplayDate(order.start_date)}</strong></span>
            <span style={{ color: isUrgent ? '#ef4444' : isNearDue ? '#f59e0b' : '#38bdf8', fontWeight: '700' }}>
              Cycle Elapsed: {progressPct}%
            </span>
            <span>Maturity: <strong style={{ color: isUrgent ? '#ef4444' : '#fff' }}>{formatDisplayDate(order.due_date || order.return_date)}</strong></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
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

      {/* FINANCIAL METRICS STRIP */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>
            {isSettled ? 'Principal Recovered' : isPending ? 'Requested Capital' : 'Disbursed Capital'}
          </span>
          <strong style={{ fontSize: '1.05rem', color: isPending ? '#eab308' : '#fff' }}>
            {fmtLakhs(order.investment_amount_bdt)}
          </strong>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>
            {isSettled ? 'Total Repaid' : isPending ? 'Offered Return' : 'Expected Return'}
          </span>
          <strong style={{ fontSize: '1.05rem', color: '#10b981' }}>
            {fmtLakhs(order.return_amount_bdt)}
          </strong>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>
            {isSettled ? 'Profit Realized' : 'Net Yield'}
          </span>
          <strong style={{ fontSize: '1.05rem', color: '#D4AF37' }}>
            +৳{(profit / 1000).toFixed(1)}k <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({marginPct}%)</span>
          </strong>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isSettled ? 'Verification' : 'Return Date'}
          </span>
          {isSettled ? (
            <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <CheckCircle2 size={14} /> Dual Verified
            </span>
          ) : (
            <>
              <strong style={{ fontSize: '1rem', color: isUrgent ? '#ef4444' : (isNearDue ? '#f59e0b' : '#38bdf8'), display: 'block' }}>
                {formatDisplayDate(order.due_date || order.return_date)}
              </strong>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>
                Tenor: {order.duration_days} Days
              </span>
            </>
          )}
        </div>
      </div>

      {/* MULTI-TRANCHE BREAKDOWN (IF PRESENT) */}
      {order.disbursement_transfers && order.disbursement_transfers.length > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div 
            onClick={() => setShowTrancheDetails(!showTrancheDetails)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={13} style={{ color: '#38bdf8' }} />
              <span style={{ color: order.is_combined_disbursement ? '#a855f7' : '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                {order.disbursement_transfers.length === 1 
                  ? (order.is_combined_disbursement ? 'Single Combined Transfer (৳3.75L Total)' : 'Single Tranche Disbursed') 
                  : `Disbursed in ${order.disbursement_transfers.length} Tranches`}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {order.po_ref_number && (
                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  PO Ref: <strong style={{ color: '#cbd5e1' }}>{order.po_ref_number}</strong>
                </span>
              )}
              {showTrancheDetails ? <ChevronUp size={14} style={{ color: '#94a3b8' }} /> : <ChevronDown size={14} style={{ color: '#94a3b8' }} />}
            </div>
          </div>

          {showTrancheDetails && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {order.disbursement_transfers.map((t, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onInspectDocs(order, idx + (order.po_document_url ? 1 : 0))}
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
          )}
        </div>
      )}

      {/* NOTES STRIP */}
      {order.notes && (
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>
          Note: {order.notes}
        </p>
      )}

      {isSettled && order.settlement_note && (
        <p style={{ color: '#10b981', fontSize: '0.78rem', margin: '0.75rem 0 0 0', background: 'rgba(16,185,129,0.08)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
          Settlement Audit: {order.settlement_note}
        </p>
      )}
    </div>
  );
}
