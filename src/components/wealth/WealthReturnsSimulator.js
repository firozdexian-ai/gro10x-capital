'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, Calculator, ShieldCheck, CheckCircle2, 
  Calendar, Info, ArrowRight, MessageSquare, DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

const PRESET_TICKETS = [
  { label: '৳10 Lakh', value: 1000000 },
  { label: '৳25 Lakh', value: 2500000 },
  { label: '৳50 Lakh', value: 5000000 },
  { label: '৳1.0 Crore', value: 10000000 },
  { label: '৳2.0 Crore', value: 20000000 },
];

const WEALTH_OPTIONS = [
  {
    id: 1,
    title: 'Monthly Cash Flow',
    annualRate: 18,
    frequency: 'Monthly (Paid 7th of every month)',
    description: 'Direct bank transfer every month. Ideal for passive monthly income.',
    accentColor: '#D4AF37',
    badge: 'Most Popular for Cash Flow'
  },
  {
    id: 2,
    title: 'Semi-Annual Distribution',
    annualRate: 20,
    frequency: 'Semi-Annual (Every 6 months)',
    description: 'Bi-annual liquidity payout. Balances compounding with semi-annual liquidity.',
    accentColor: '#10b981',
    badge: 'Optimal Yield & Liquidity'
  },
  {
    id: 3,
    title: 'Annual Maturity Compounding',
    annualRate: 22,
    frequency: 'Annual Lump-Sum Payout',
    description: 'Full annual compounding for 12, 24, or 36 months. Highest total capital growth.',
    accentColor: '#38bdf8',
    badge: 'Maximum Capital Growth'
  }
];

export default function WealthReturnsSimulator({ fundData, onOpenBriefing }) {
  const minTicket = 1000000; // ৳10 Lakh
  const maxTicket = 20000000; // ৳2.0 Cr
  const [ticket, setTicket] = useState(1000000);
  const [selectedOptionId, setSelectedOptionId] = useState(1);
  const durationMonths = 36; // 36-Month Revolving Term

  const selectedOption = WEALTH_OPTIONS.find(o => o.id === selectedOptionId) || WEALTH_OPTIONS[0];

  // Mathematical outputs
  const annualReturn = ticket * (selectedOption.annualRate / 100);
  const monthlyCashFlow = annualReturn / 12;
  const totalDurationEarnings = annualReturn * (durationMonths / 12);
  const totalMaturityValue = ticket + totalDurationEarnings;

  return (
    <div className="glass-card" style={{ 
      padding: '2rem', 
      borderColor: 'rgba(212,175,55,0.35)', 
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(7,10,20,0.98) 100%)'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={22} style={{ color: '#D4AF37' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Private Wealth Returns &amp; Liquidity Simulator
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.3rem 0 0 0', lineHeight: 1.5 }}>
            Simulate your fixed yield distribution based on investment size, monthly deployment results, and your preferred payout schedule.
          </p>
        </div>
        <span style={{ 
          background: 'rgba(16,185,129,0.12)', 
          border: '1px solid rgba(16,185,129,0.3)', 
          color: '#10b981', 
          padding: '0.3rem 0.75rem', 
          borderRadius: '8px', 
          fontSize: '0.78rem', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem' 
        }}>
          <ShieldCheck size={14} /> Ring-Fenced SPV Escrow
        </span>
      </div>

      {/* 1. TICKET SIZING INPUT & PRESETS */}
      <div style={{ 
        background: 'rgba(7,10,20,0.7)', 
        border: '1px solid rgba(255,255,255,0.06)', 
        padding: '1.25rem', 
        borderRadius: '12px', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: '600' }}>
            Subscription Ticket Size:
          </label>
          <div style={{ 
            background: 'rgba(212,175,55,0.12)', 
            border: '1px solid rgba(212,175,55,0.3)', 
            padding: '0.35rem 0.85rem', 
            borderRadius: '8px' 
          }}>
            <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.2rem' }}>
              {formatCurrency(ticket, 'BDT')}
            </span>
          </div>
        </div>

        {/* Preset Chips */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {PRESET_TICKETS.map(preset => {
            const isSelected = ticket === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setTicket(preset.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#D4AF37' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={minTicket}
          max={maxTicket}
          step={250000} // ৳2.5 Lakh steps
          value={ticket}
          onChange={(e) => setTicket(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#D4AF37',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.5rem' }}>
          <span>Minimum Subscription: ৳10,00,000 (৳10 Lakh)</span>
          <span>Maximum OTC Allocation: ৳2,00,00,000 (৳2 Crore)</span>
        </div>
      </div>

      {/* 2. THREE WEALTH RETURN SCHEDULES */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.88rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.75rem' }}>
          Select Preferred Liquidity &amp; Payout Interval:
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          {WEALTH_OPTIONS.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(7,10,20,0.6)',
                  border: isSelected ? `2px solid ${opt.accentColor}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: opt.accentColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Option {opt.id}
                    </span>
                    {isSelected && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.accentColor }} />
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: isSelected ? '#fff' : '#cbd5e1', fontWeight: '800' }}>
                    {opt.title}
                  </h4>

                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: opt.accentColor, margin: '0.2rem 0' }}>
                    {opt.annualRate}% <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>p.a.</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.35rem 0', lineHeight: 1.4 }}>
                    {opt.description}
                  </p>
                </div>

                <div style={{ 
                  marginTop: '0.75rem', 
                  paddingTop: '0.5rem', 
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.72rem',
                  color: opt.accentColor,
                  fontWeight: '700'
                }}>
                  {opt.frequency}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SIMULATED FINANCIAL OUTPUTS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '0.85rem', 
        background: 'rgba(7,10,20,0.85)', 
        border: '1px solid rgba(212,175,55,0.25)', 
        padding: '1.25rem', 
        borderRadius: '12px',
        marginBottom: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
            {selectedOptionId === 1 ? 'Monthly Cash Payout' : 'Effective Monthly Yield'}
          </span>
          <strong style={{ display: 'block', fontSize: '1.4rem', color: '#D4AF37', fontWeight: '800', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(monthlyCashFlow), 'BDT')}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
            {selectedOptionId === 1 ? 'Deposited 7th of every month' : 'Accrues into distribution'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
            Annual Distributed Yield
          </span>
          <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: '800', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(annualReturn), 'BDT')}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {selectedOption.annualRate}% fixed annual target
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
            36-Month Maturity Total
          </span>
          <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8', fontWeight: '800', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(totalMaturityValue), 'BDT')}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
            Principal + {formatCurrency(Math.round(totalDurationEarnings), 'BDT')} Net Earnings
          </span>
        </div>
      </div>

      {/* 4. TRANSPARENCY: PERFORMANCE & INCENTIVE COLLECTION NOTE */}
      <div style={{ 
        background: 'rgba(212,175,55,0.06)', 
        border: '1px solid rgba(212,175,55,0.2)', 
        padding: '1rem 1.25rem', 
        borderRadius: '10px', 
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: '#cbd5e1',
        lineHeight: 1.55
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.35rem' }}>
          <Info size={15} /> How Returns Are Realized &amp; Incentives Collected
        </div>
        <p style={{ margin: 0 }}>
          Capital is deployed strictly into short-term corporate purchase orders (7–10 day turnaround, 12%–18% per-cycle gross margins). Returns are disbursed from settled cash flows. A performance incentive is collected by the fund management on excess returns above benchmark, perfectly aligning fund execution with your steady 18% to 22% annual net target.
        </p>
      </div>

      {/* 5. CTA ACTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          🔒 SPV legal agreement executed directly with Safe Plan SPV-01.
        </span>

        <button
          onClick={() => onOpenBriefing(`Simulator Ticket: ${formatCurrency(ticket, 'BDT')} — Option ${selectedOption.id}`)}
          className="btn-gold"
          style={{
            padding: '0.75rem 1.4rem',
            fontSize: '0.92rem',
            fontWeight: '800',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
            color: '#070a14',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)'
          }}
        >
          <MessageSquare size={16} /> Book Briefing for {formatCurrency(ticket, 'BDT')} Allocation
        </button>
      </div>
    </div>
  );
}
