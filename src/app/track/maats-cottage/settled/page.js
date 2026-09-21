'use client';

import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import WorkOrderCard from '../components/WorkOrderCard';
import OrderSearchFilters from '../components/OrderSearchFilters';
import { CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

export default function SettledLedgerPage() {
  const { orders, metrics, openDocs } = useTracker();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_asc');

  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');

  // Search
  const searched = settledOrders.filter(o => {
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

  const sorted = [...searched].sort((a, b) => {
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
            <CheckCircle2 size={20} style={{ color: '#10b981' }} /> Settled &amp; Repaid Ledger ({settledOrders.length})
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Fully recovered purchase orders verified via dual bank repayment slips and delivery challans. Zero default track record.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Principal Recovered: <strong style={{ color: '#fff' }}>{fmtLakhs(metrics.totalSettledCapital)}</strong>
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>
            Profit Realized: +৳{(metrics.totalSettledProfit / 1000).toFixed(0)}k (14.8%)
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <OrderSearchFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={settledOrders.length}
        filteredCount={sorted.length}
      />

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sorted.map(order => (
          <WorkOrderCard 
            key={order.order_code || order.id}
            order={order}
            onInspectDocs={(ord, tabIdx) => openDocs(ord, tabIdx)}
          />
        ))}
      </div>

    </div>
  );
}
