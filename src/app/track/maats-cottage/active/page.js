'use client';

import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import WorkOrderCard from '../components/WorkOrderCard';
import OrderSearchFilters from '../components/OrderSearchFilters';
import { Zap, Clock, ShieldCheck } from 'lucide-react';

export default function ActiveDeploymentsPage() {
  const { 
    orders, 
    metrics, 
    handleRevert, 
    openDocs, 
    setEditingOrder, 
    setSettleTargetOrder 
  } = useTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_asc');

  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');

  // Search filter
  const searched = activeOrders.filter(o => {
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

  // Filter chips
  const filtered = searched.filter(o => {
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

  // Sort
  const sorted = [...filtered].sort((a, b) => {
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

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} style={{ color: '#10b981' }} /> Active Deployments ({activeOrders.length})
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Funded purchase orders currently in procurement, manufacturing, or delivery execution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Active: <strong style={{ color: '#fff' }}>{fmtLakhs(metrics.totalDisbursedActive)}</strong>
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>
            Return: {fmtLakhs(metrics.totalExpectedReturnActive)} (+৳{(metrics.totalActiveProfit / 1000).toFixed(0)}k)
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <OrderSearchFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={activeOrders.length}
        filteredCount={sorted.length}
      />

      {/* Orders Grid / List */}
      {sorted.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '0.95rem', margin: 0 }}>No active work orders match your search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sorted.map(order => (
            <WorkOrderCard 
              key={order.order_code || order.id}
              order={order}
              onInspectDocs={(ord, tabIdx) => openDocs(ord, tabIdx)}
              onEditOrder={(ord) => setEditingOrder(ord)}
              onSettleOrder={(ord) => setSettleTargetOrder(ord)}
              onRevertOrder={handleRevert}
            />
          ))}
        </div>
      )}

    </div>
  );
}
