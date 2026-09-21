'use client';

import React, { useState } from 'react';
import { Search, X, Filter, ArrowUpDown, Clock, Layers, CheckCircle2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);

  const filterChips = [
    { id: 'all', label: 'All Orders' },
    { id: 'due_soon', label: 'Due This Week', icon: Clock },
    { id: 'high_value', label: 'High Value (> ৳5L)', icon: DollarSign },
    { id: 'multi_tranche', label: 'Multi-Tranche', icon: Layers },
    { id: 'challan', label: 'Challan Stamped', icon: CheckCircle2 }
  ];

  const hasActiveFilter = activeFilter !== 'all';
  const activeFilterObj = filterChips.find(c => c.id === activeFilter);

  return (
    <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      
      {/* SINGLE COMPACT TOOLBAR ROW */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search 
            size={15} 
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} 
          />
          <input 
            type="text"
            placeholder={`Search ${totalCount} orders by code, client, PO...`}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="form-input"
            style={{ 
              paddingLeft: '2.2rem', 
              paddingRight: searchQuery ? '2.2rem' : '0.75rem',
              fontSize: '0.82rem',
              height: '36px',
              borderRadius: '7px',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
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
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{
            height: '36px',
            padding: '0 0.75rem',
            borderRadius: '7px',
            background: hasActiveFilter ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.85)',
            border: hasActiveFilter ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
            color: hasActiveFilter ? '#D4AF37' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Filter size={13} />
          <span>{hasActiveFilter ? activeFilterObj?.label : 'Filter'}</span>
          {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '0 0.65rem', height: '36px' }}>
          <ArrowUpDown size={13} style={{ color: '#D4AF37' }} />
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="due_asc" style={{ background: '#0f172a' }}>Due Date</option>
            <option value="code_desc" style={{ background: '#0f172a' }}>Newest Code</option>
            <option value="inv_desc" style={{ background: '#0f172a' }}>Highest Capital</option>
            <option value="profit_desc" style={{ background: '#0f172a' }}>Highest Profit</option>
          </select>
        </div>

      </div>

      {/* FILTER CHIPS (Toggled Open on Demand) */}
      {(showFilters || hasActiveFilter) && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.25rem' }}>
          {filterChips.map(chip => {
            const isSelected = activeFilter === chip.id;
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  onFilterChange(chip.id);
                  if (chip.id === 'all') setShowFilters(false);
                }}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.06)',
                  color: isSelected ? '#D4AF37' : '#94a3b8',
                  borderRadius: '5px',
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s'
                }}
              >
                {Icon && <Icon size={11} />}
                <span>{chip.label}</span>
              </button>
            );
          })}

          {hasActiveFilter && (
            <button
              onClick={() => { onFilterChange('all'); setShowFilters(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.7rem',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                textDecoration: 'underline'
              }}
            >
              Reset filter
            </button>
          )}

          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
            {filteredCount} of {totalCount}
          </span>
        </div>
      )}

    </div>
  );
}
