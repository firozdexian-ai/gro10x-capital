'use client';

import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../../../../lib/workOrders';

/**
 * Simplified maturity alert — renders as a single compact inline pill/bar,
 * not a full-width gradient banner. Integrated into the metrics summary bar.
 */
export default function DynamicMaturityAlert({ 
  orders = [], 
  onInspectOrder, 
  onSettleOrder 
}) {
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');

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
    return { ...order, daysRemaining };
  });

  const urgentOrders = analyzedActive.filter(o => o.daysRemaining <= 1);
  const closingSoonOrders = analyzedActive.filter(o => o.daysRemaining > 1 && o.daysRemaining <= 5);

  const hasUrgent = urgentOrders.length > 0;
  const hasClosingSoon = closingSoonOrders.length > 0;
  const targetAlertOrder = urgentOrders[0] || closingSoonOrders[0];

  if (!targetAlertOrder) {
    // Healthy — show a subtle green pulse dot only
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        color: '#10b981', fontSize: '0.75rem', fontWeight: '600'
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
        All orders on track
      </span>
    );
  }

  const isUrgent = hasUrgent;
  const color = isUrgent ? '#ef4444' : '#f59e0b';
  const Icon = isUrgent ? AlertTriangle : Clock;
  const label = isUrgent
    ? `${targetAlertOrder.order_code} due TODAY`
    : `${targetAlertOrder.order_code} — ${targetAlertOrder.daysRemaining}d left`;

  return (
    <button
      onClick={() => onSettleOrder(targetAlertOrder)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
        background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
        borderRadius: '6px', padding: '0.3rem 0.7rem',
        color, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
      }}
      title={`Due: ${formatDisplayDate(targetAlertOrder.due_date || targetAlertOrder.return_date)} — click to settle`}
    >
      <Icon size={13} className={isUrgent ? 'animate-pulse' : ''} />
      {label}
    </button>
  );
}
