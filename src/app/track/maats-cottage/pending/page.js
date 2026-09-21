'use client';

import React from 'react';
import { useTracker } from '../context/TrackerContext';
import WorkOrderCard from '../components/WorkOrderCard';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';

export default function PendingClearancesPage() {
  const { 
    orders, 
    metrics, 
    openDocs, 
    setEditingOrder, 
    setShowAddModal 
  } = useTracker();

  const pendingOrders = orders.filter(o => o.status === 'Pending_Approval');
  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#eab308' }} /> Pending Clearances ({pendingOrders.length})
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            New corporate purchase orders submitted by Maats Cottage awaiting partner review and capital disbursal.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-gold"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: '700', borderRadius: '7px' }}
        >
          <Plus size={15} /> Log Work Order
        </button>
      </div>

      {/* Orders List / Empty state */}
      {pendingOrders.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'grid', placeItems: 'center', color: '#10b981', margin: '0 auto 1rem auto' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: '0 0 0.35rem 0' }}>
            All Clear — No Orders Awaiting Review
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0 0 1.25rem 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Every submitted corporate purchase order has been reviewed, approved, and disbursed into active execution.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <Plus size={14} /> Submit New Order
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pendingOrders.map(order => (
            <WorkOrderCard 
              key={order.order_code || order.id}
              order={order}
              onInspectDocs={(ord, tabIdx) => openDocs(ord, tabIdx)}
              onEditOrder={(ord) => setEditingOrder(ord)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
