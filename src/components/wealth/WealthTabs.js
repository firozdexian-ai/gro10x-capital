'use client';

import React from 'react';
import { Briefcase, TrendingUp, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export const WEALTH_TABS = [
  { id: 'overview',   label: 'Overview & Strategy', icon: Briefcase },
  { id: 'returns',    label: 'Returns & Simulator',  icon: TrendingUp },
  { id: 'portfolio',  label: 'Live Portfolio',      icon: Layers },
  { id: 'security',   label: 'Security & SPV-01',   icon: ShieldCheck },
  { id: 'governance', label: 'Governance & FAQs',   icon: HelpCircle }
];

export default function WealthTabs({ activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: '0.75rem',
      marginBottom: '2rem',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none'
    }}>
      {WEALTH_TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              fontSize: '0.88rem',
              fontWeight: isActive ? '800' : '600',
              borderRadius: '10px',
              border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)' 
                : 'rgba(255,255,255,0.02)',
              color: isActive ? '#D4AF37' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Icon size={16} style={{ color: isActive ? '#D4AF37' : '#64748b' }} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
