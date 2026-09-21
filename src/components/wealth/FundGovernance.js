'use client';

import React, { useState } from 'react';
import { 
  UserCheck, Phone, ChevronDown, HelpCircle, 
  Calendar, ShieldCheck, Mail, MessageSquare, ExternalLink 
} from 'lucide-react';

const WEALTH_FAQS = [
  {
    q: 'How does Safe Plan Wealth Management differ from franchise revenue-share deals on GRO10X?',
    a: 'Franchise deals (like ORO Roasters) provide a direct percentage of monthly outlet retail sales. Safe Plan Wealth Management is a dedicated Private Credit & Wealth Fund. Instead of retail sales, your capital is deployed into verified corporate work orders (7–10 day cash-flow cycles) and collateralized credit lines, delivering a steady target ROI of 18% to 22% p.a. with predictable liquidity.'
  },
  {
    q: 'What causes the yield to range between 18% and 22% p.a., and how are incentives collected?',
    a: 'The baseline target depends on your chosen payout schedule: 18% for Monthly cash payouts, 20% for Semi-Annual distributions, and 22% for Annual compounded maturity. Monthly distributions reflect the realized profits of work orders settled that month. The fund management collects a performance incentive on excess returns above benchmark, perfectly aligning fund execution with your steady returns.'
  },
  {
    q: 'How is investor principal secured against borrower default?',
    a: 'Capital is ring-fenced under Safe Plan SPV-01. Work orders are disbursed strictly against audited corporate purchase orders (e.g. Delta Ltd, Greenfield Jutex). Counterparties deposit undated signed security cheques, director personal guarantees, and Bangladesh Bank CIB clearances before any disbursement. All payments are verified with signed delivery challans.'
  },
  {
    q: 'When and how are distributions credited to my bank account?',
    a: 'For Option 1 (Monthly), cash yields are disbursed on the 7th of every month via direct BEFTN/NPSB bank transfer to your registered corporate or personal bank account. Option 2 distributions occur every 6 months, and Option 3 compiles at annual maturity.'
  },
  {
    q: 'What is the minimum ticket size and term of the facility?',
    a: 'The minimum subscription ticket is ৳10,00,000 (৳10 Lakh). The standard facility tenure is 36 months of revolving capital deployment, with flexible early redemption corridors available through the GRO10X Secondary OTC Desk.'
  },
  {
    q: 'Who oversees the due diligence and approval of work orders?',
    a: 'All deployments are independently evaluated and approved by Managing Partner Faiz Ahmed and the GRO10X Investment Committee. Counterparties undergo 5-point corporate vetting including Trade License, e-TIN, BIN/VAT, Director CIB clearance, and verified historical buyer repayment records.'
  }
];

export default function FundGovernance({ onOpenBriefing }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* 1. LEADERSHIP & GOVERNANCE CARD */}
      <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(212,175,55,0.3)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={22} style={{ color: '#D4AF37' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                Fund Leadership &amp; Governance
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
              Directly managed by seasoned entrepreneurs and institutional credit analysts.
            </p>
          </div>

          <span style={{ 
            background: 'rgba(212,175,55,0.12)', 
            border: '1px solid rgba(212,175,55,0.3)', 
            color: '#D4AF37', 
            padding: '0.3rem 0.75rem', 
            borderRadius: '8px', 
            fontSize: '0.78rem', 
            fontWeight: '700' 
          }}>
            Managing Partner Direct Oversight
          </span>
        </div>

        {/* Managing Partner Profile Box */}
        <div style={{ 
          background: 'rgba(7,10,20,0.7)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
              display: 'grid', 
              placeItems: 'center',
              color: '#070a14',
              fontWeight: '900',
              fontSize: '1.6rem',
              flexShrink: 0
            }}>
              FA
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.2rem 0', color: '#fff', fontSize: '1.15rem', fontWeight: '800' }}>
                Faiz Ahmed
              </h4>
              <p style={{ margin: '0 0 0.35rem 0', color: '#D4AF37', fontSize: '0.82rem', fontWeight: '700' }}>
                Managing Partner &amp; Fund Director · Safe Plan SPV-01
              </p>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', maxWidth: '480px', lineHeight: 1.45 }}>
                Oversees credit underwriting, facility deployment, counterparty due diligence, and quarterly investor distributions for Safe Plan Wealth Management.
              </p>
            </div>
          </div>

          {/* Contact & Briefing Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <Phone size={14} style={{ color: '#10b981' }} />
              <span>Direct: <strong>+880 1784-397960</strong></span>
            </div>

            <button
              onClick={() => onOpenBriefing('Leadership Profile CTA')}
              className="btn-gold"
              style={{
                padding: '0.6rem 1.15rem',
                fontSize: '0.84rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
                color: '#070a14',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Calendar size={15} /> Book 1-on-1 Briefing
            </button>
          </div>
        </div>
      </div>

      {/* 2. FREQUENTLY ASKED QUESTIONS */}
      <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(212,175,55,0.25)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <HelpCircle size={22} style={{ color: '#D4AF37' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Institutional Investor Questions
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
              Due diligence, liquidity schedules, collateral mechanics, and incentive governance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {WEALTH_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isOpen ? 'rgba(212,175,55,0.06)' : 'rgba(7,10,20,0.6)',
                  border: isOpen ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.25rem',
                    background: 'none',
                    border: 'none',
                    color: isOpen ? '#D4AF37' : '#f8fafc',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: isOpen ? '#D4AF37' : '#64748b',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ 
                    padding: '0 1.25rem 1.1rem 1.25rem', 
                    color: '#cbd5e1', 
                    fontSize: '0.88rem', 
                    lineHeight: '1.6', 
                    borderTop: '1px solid rgba(255,255,255,0.04)' 
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
