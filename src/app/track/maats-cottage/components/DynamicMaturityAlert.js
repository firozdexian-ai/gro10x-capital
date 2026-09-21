'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Eye, CheckSquare, Calendar, ChevronRight } from 'lucide-react';
import { formatDisplayDate } from '../../../../lib/workOrders';

/**
 * Dynamically computes urgent, maturing, and recently settled work orders
 * to render a high-visibility executive alert banner.
 */
export default function DynamicMaturityAlert({ 
  orders = [], 
  onInspectOrder, 
  onSettleOrder 
}) {
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');
  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');

  // Compute days remaining for each active order
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const analyzedActive = activeOrders.map(order => {
    const dueDateStr = order.due_date || order.return_date;
    let daysRemaining = 999;
    if (dueDateStr) {
      const due = new Date(dueDateStr);
      due.setHours(0, 0, 0, 0);
      daysRemaining = Math.round((due - today) / (1000 * 60 * 60 * 24));
    }
    return {
      ...order,
      daysRemaining
    };
  });

  // Find critical orders (overdue or due within 5 days)
  const urgentOrders = analyzedActive.filter(o => o.daysRemaining <= 1);
  const closingSoonOrders = analyzedActive.filter(o => o.daysRemaining > 1 && o.daysRemaining <= 5);
  
  // Find most recently settled order
  const latestSettled = settledOrders[0];

  // If no urgent or closing soon orders, display a healthy status banner
  const hasUrgent = urgentOrders.length > 0;
  const hasClosingSoon = closingSoonOrders.length > 0;

  const targetAlertOrder = urgentOrders[0] || closingSoonOrders[0];

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ maxWidth: '1000px', margin: '1.25rem auto 0 auto', padding: '0 1.25rem' }}>
      <div 
        style={{ 
          background: hasUrgent
            ? 'linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(15,23,42,0.95) 100%)'
            : hasClosingSoon
            ? 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(15,23,42,0.95) 100%)'
            : 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.95) 100%)',
          border: `1px solid ${hasUrgent ? 'rgba(239,68,68,0.45)' : hasClosingSoon ? 'rgba(245,158,11,0.45)' : 'rgba(16,185,129,0.3)'}`,
          borderRadius: '14px', 
          padding: '1rem 1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1rem',
          boxShadow: '0 8px 24px -6px rgba(0,0,0,0.45)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: hasUrgent ? 'rgba(239,68,68,0.2)' : hasClosingSoon ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', 
              border: `1px solid ${hasUrgent ? '#ef4444' : hasClosingSoon ? '#f59e0b' : '#10b981'}`, 
              display: 'grid', 
              placeItems: 'center', 
              color: hasUrgent ? '#ef4444' : hasClosingSoon ? '#f59e0b' : '#10b981', 
              flexShrink: 0 
            }}
          >
            {hasUrgent ? <AlertTriangle size={22} className="animate-pulse" /> : hasClosingSoon ? <Clock size={22} /> : <CheckCircle2 size={22} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>
                {hasUrgent 
                  ? `Maturity Alert: ${urgentOrders.map(o => o.order_code).join(', ')}`
                  : hasClosingSoon
                  ? `Upcoming Cycle Closings: ${closingSoonOrders.map(o => o.order_code).join(', ')}`
                  : 'Portfolio Revolving Facility: Healthy & Fully Active'}
              </span>

              {hasUrgent && (
                <span className="status-badge status-badge--danger" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                  Action Needed Today
                </span>
              )}
              {hasClosingSoon && (
                <span className="status-badge status-badge--gold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                  Closing in {targetAlertOrder?.daysRemaining} Days
                </span>
              )}
              {latestSettled && (
                <span className="status-badge status-badge--success" style={{ fontSize: '0.68rem' }}>
                  {latestSettled.order_code} Settled ({fmtLakhs(latestSettled.return_amount_bdt)}) ✓
                </span>
              )}
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
              {targetAlertOrder ? (
                <>
                  Next Maturity: <strong style={{ color: '#fff' }}>{targetAlertOrder.order_code}</strong> ({targetAlertOrder.corporate_client}) — Return Due: <strong style={{ color: '#10b981' }}>{fmtLakhs(targetAlertOrder.return_amount_bdt)}</strong> on <strong style={{ color: '#38bdf8' }}>{formatDisplayDate(targetAlertOrder.due_date)}</strong> ({targetAlertOrder.daysRemaining <= 0 ? 'Due Today' : `${targetAlertOrder.daysRemaining} days left`})
                </>
              ) : (
                <>
                  All {activeOrders.length} funded corporate orders are performing within standard delivery windows.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {targetAlertOrder && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onInspectOrder(targetAlertOrder)}
              className="btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', borderColor: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Eye size={14} /> Inspect {targetAlertOrder.order_code}
            </button>
            <button 
              onClick={() => onSettleOrder(targetAlertOrder)}
              className="btn-gold" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}
            >
              <CheckSquare size={14} /> Settle Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
