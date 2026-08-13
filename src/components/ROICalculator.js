'use client';

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calculator, HelpCircle, ShieldCheck, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function ROICalculator({ project, isPreviewMode = false, currency = 'BDT' }) {
  // Deal metrics fallback (e.g. Oro Mirpur baseline data)
  const targetRaise = Number(project?.target_raise_bdt) || 20000000; // 2 Cr
  const minTicket = Number(project?.min_otc_investment_bdt) || 500000; // 5 Lakh
  const maxTicket = Math.min(targetRaise * 0.5, 10000000); // 50% max ticket or 1 Cr

  const avgGross = Number(project?.avg_monthly_gross_sales) || (isPreviewMode ? 3160000 : 0);
  const avgNet = Number(project?.avg_monthly_net_profit) || (isPreviewMode ? 534000 : 0);

  const opt1Rate = Number(project?.yield_option_1_rate) || 10; // 10% Gross
  const opt2Rate = Number(project?.yield_option_2_rate) || 12; // 12% Gross
  const opt3Rate = Number(project?.yield_option_3_rate) || 35; // 35% Net Profit

  const durationMonths = Number(project?.duration_months) || 24;

  // Local interactive state
  const [investment, setInvestment] = useState(Math.max(minTicket, 1000000)); // Default 10L
  const [selectedOption, setSelectedOption] = useState(2); // Option 2 default

  // Mathematical returns calculation
  const poolShare = targetRaise > 0 ? investment / targetRaise : 0;

  // Option 1: Capped Yield (10% Gross)
  const opt1Monthly = poolShare * (avgGross * (opt1Rate / 100));
  const opt1Annual = opt1Monthly * 12;
  const opt1Cap = investment * 1.22; // 22% ROI cap total return
  const opt1Maturity = Math.min(opt1Monthly * durationMonths + investment, opt1Cap + investment);

  // Option 2: Multiplier (12% Gross)
  const opt2Monthly = poolShare * (avgGross * (opt2Rate / 100));
  const opt2Annual = opt2Monthly * 12;
  const opt2Maturity = investment * 1.5; // 1.5X Buyout exit

  // Option 3: Partnership (35% Net Profit Share, 5% Gross floor)
  const opt3GrossFloor = poolShare * (avgGross * 0.05);
  const opt3NetShare = poolShare * (avgNet * (opt3Rate / 100));
  const opt3Monthly = Math.max(opt3GrossFloor, opt3NetShare);
  const opt3Annual = opt3Monthly * 12;
  const opt3Maturity = investment + (opt3Annual * (durationMonths / 12));

  // Determine current active option outputs
  let currentMonthly = opt2Monthly;
  let currentAnnual = opt2Annual;
  let currentMaturity = opt2Maturity;
  let currentSubLabel = '1.5X Guaranteed Buyout Exit';

  if (selectedOption === 1) {
    currentMonthly = opt1Monthly;
    currentAnnual = opt1Annual;
    currentMaturity = opt1Cap;
    currentSubLabel = 'Capped at 22% Total ROI';
  } else if (selectedOption === 3) {
    currentMonthly = opt3Monthly;
    currentAnnual = opt3Annual;
    currentMaturity = opt3Maturity;
    currentSubLabel = 'Net Profit Share + 5% Floor';
  }

  const handleOpenLeadBot = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('open-lead-bot', {
      detail: {
        projectId: project?.id,
        projectTitle: project?.project_title || 'Oro Roasters Deal',
        investmentAmount: investment,
        yieldOption: `Option ${selectedOption}`
      }
    }));
  };

  if (!avgGross && !isPreviewMode) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(255,255,255,0.08)' }}>
        <AlertCircle size={28} style={{ color: '#94a3b8', margin: '0 auto 0.5rem', display: 'block' }} />
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem' }}>
          Historical ROI baseline data is being audited for this campaign. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        borderColor: 'rgba(212,175,55,0.35)',
        boxShadow: '0 8px 32px rgba(212,175,55,0.06)',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(7,10,20,0.98) 100%)'
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} style={{ color: '#D4AF37' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Interactive Investor ROI Calculator
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.2rem 0 0 1.75rem' }}>
            {isPreviewMode
              ? 'Based on Oro Roasters verified ৳31.6L monthly gross revenue'
              : `Based on verified baseline revenue for ${project?.project_title || 'this deal'}`}
          </p>
        </div>
        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ShieldCheck size={12} /> Asset Backed Payouts
        </span>
      </div>

      {/* INPUT SLIDER */}
      <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
            Enter Ticket Size
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
            <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.1rem' }}>
              {formatCurrency(investment, currency)}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={minTicket}
          max={maxTicket}
          step={100000} // 1 Lakh steps
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#D4AF37',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
          <span>Min Ticket: {formatCurrency(minTicket, currency)}</span>
          <span>Max Allocation: {formatCurrency(maxTicket, currency)}</span>
        </div>
      </div>

      {/* YIELD OPTION SELECTOR CARDS */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.75rem' }}>
          Select Return Model:
        </label>
        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { id: 1, label: 'Option 1', title: 'Capped Yield', rate: `${opt1Rate}%`, desc: 'Gross Sales Share', sub: '22% Total ROI Cap', color: '#D4AF37' },
            { id: 2, label: 'Option 2', title: 'Multiplier', rate: `${opt2Rate}%`, desc: 'Gross Sales Share', sub: '1.5X Buyout Exit', color: '#10b981' },
            { id: 3, label: 'Option 3', title: 'Partnership', rate: `${opt3Rate}%`, desc: 'Net Profit Share', sub: '5% Gross Floor', color: '#a855f7' },
          ].map(opt => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(7,10,20,0.6)',
                  border: isSelected ? `2px solid ${opt.color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />
                )}
                <span style={{ fontSize: '0.7rem', color: opt.color, fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>
                  {opt.label}
                </span>
                <h4 style={{ margin: '0.2rem 0', fontSize: '0.92rem', color: isSelected ? '#fff' : '#cbd5e1', fontWeight: '700' }}>
                  {opt.title}
                </h4>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: opt.color, margin: '0.2rem 0' }}>
                  {opt.rate}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{opt.desc}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* OUTPUT METRICS */}
      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.25)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Est. Monthly Payout</span>
          <strong style={{ fontSize: '1.35rem', color: '#D4AF37', fontWeight: '800', display: 'block', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(currentMonthly), currency)}
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Paid 7th of every month</span>
        </div>

        <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Est. Annual Return</span>
          <strong style={{ fontSize: '1.35rem', color: '#10b981', fontWeight: '800', display: 'block', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(currentAnnual), currency)}
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>~{((currentAnnual / investment) * 100).toFixed(1)}% p.a. yield</span>
        </div>

        <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Payout Target</span>
          <strong style={{ fontSize: '1.35rem', color: '#f8fafc', fontWeight: '800', display: 'block', margin: '0.2rem 0' }}>
            {formatCurrency(Math.round(currentMaturity), currency)}
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{currentSubLabel}</span>
        </div>
      </div>

      {/* FOOTER & CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ margin: 0, fontSize: '0.73rem', color: '#64748b', maxWidth: '480px' }}>
          ℹ Calculations use verified baseline monthly revenue ({formatCurrency(avgGross, currency)}/mo). Figures are illustrative; actual yield reflects monthly sales.
        </p>
        <button
          onClick={handleOpenLeadBot}
          className="btn-gold"
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
            color: '#070a14',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <MessageSquare size={15} /> Book Call for {formatCurrency(investment, currency)} Ticket
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
        }
      `}</style>
    </div>
  );
}
