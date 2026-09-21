'use client';

import React from 'react';
import { Search, X, Filter, ArrowUpDown, Clock, Layers, CheckCircle2, DollarSign } from 'lucide-react';

export default function OrderSearchFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount
}) {
  const filterChips = [
    { id: 'all', label: 'All Orders' },
    { id: 'due_soon', label: 'Due This Week', icon: Clock },
    { id: 'high_value', label: 'High Value (> ৳5L)', icon: DollarSign },
    { id: 'multi_tranche', label: 'Multi-Tranche', icon: Layers },
    { id: 'challan', label: 'Challan Stamped', icon: CheckCircle2 }
  ];

  return (
    <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {/* Search Input + Sort Dropdown */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search 
            size={16} 
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} 
          />
          <input 
            type="text"
            placeholder="Search by code (e.g. MSP-014), client (Delta), PO ref, or items..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="form-input"
            style={{ 
              paddingLeft: '2.4rem', 
              paddingRight: searchQuery ? '2.4rem' : '0.85rem',
              fontSize: '0.85rem',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 0.75rem', height: '40px' }}>
          <ArrowUpDown size={14} style={{ color: '#D4AF37' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f1f5f9',
              fontSize: '0.8rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="due_asc" style={{ background: '#0f172a' }}>Due Date (Soonest)</option>
            <option value="code_desc" style={{ background: '#0f172a' }}>Order Code (Newest)</option>
            <option value="inv_desc" style={{ background: '#0f172a' }}>Capital (Highest)</option>
            <option value="profit_desc" style={{ background: '#0f172a' }}>Profit (Highest)</option>
          </select>
        </div>

      </div>

      {/* Filter Chips Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {filterChips.map(chip => {
            const isSelected = activeFilter === chip.id;
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange(chip.id)}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                  color: isSelected ? '#D4AF37' : '#94a3b8',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s'
                }}
              >
                {Icon && <Icon size={12} />}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Count summary */}
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> orders
        </span>
      </div>

    </div>
  );
}
