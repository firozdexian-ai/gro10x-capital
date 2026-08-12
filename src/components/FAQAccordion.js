'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

const FAQS = [
  {
    q: 'Is GRO10X Capital independent from the businesses it features?',
    a: "Yes. GRO10X Capital is independently owned and operated. No founders or directors of Oro Roasters or any featured business hold equity or management roles in GRO10X Capital. We operate at arm's length with a formal due diligence and SPV governance process."
  },
  {
    q: 'How does GRO10X Capital earn revenue — and does this create a conflict with investors?',
    a: 'GRO10X Capital earns through two transparent mechanisms: (1) a 10% co-investment stake in every SPV — meaning our capital is at risk alongside yours, and (2) a 5% platform coordination fee from the investor pool distribution. We earn only when investors earn.'
  },
  {
    q: 'Are physical assets (equipment, fit-out) owned by the individual outlet SPV or a central entity?',
    a: 'All capital assets — coffee machinery, equipment, and outlet improvements — are registered exclusively under the SPV entity formed for that specific outlet campaign. As an SPV shareholder, you co-own these assets proportionally. No assets are held by a central parent company.'
  },
  {
    q: 'How is investor principal protected in a downside scenario?',
    a: 'The SPV holds legal title to all physical equipment. In a wind-down scenario, assets are liquidated and proceeds distributed proportionally to all SPV shareholders. Additionally, GRO10X\'s Secondary P2P Market allows investors to exit positions to other buyers before maturity. Monthly KAM audits detect operational variances early.'
  },
  {
    q: 'How do you verify baseline revenue for a new outlet with limited operating history?',
    a: 'For established outlets like Oro Mirpur (18+ months operating), we use audited POS history as our baseline. For newer locations, our KAM team separately tracks launch-period and post-stabilization data to distinguish one-time peaks from steady-state performance. All investor pitch figures reference conservative estimates, not best-case launch figures.'
  },
  {
    q: 'What portion of sales comes from delivery apps (e.g. FoodPanda), and how do platform fees affect yield?',
    a: 'Delivery platform orders represent approximately 30–40% of total outlet revenue. Platform commission fees (typically 15–25%) are factored into our unit economics. For Option 1 and Option 2 investors, yields are calculated from total verified gross sales — the blended revenue across all channels — as reported by our POS system and confirmed by KAM audits each month.'
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', borderColor: 'rgba(212,175,55,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <HelpCircle size={22} style={{ color: '#D4AF37' }} />
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            Frequently Asked Investor Questions
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
            Transparent answers regarding SPV ownership, asset backing, and revenue verification.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
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
                onClick={() => toggle(idx)}
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
                  justify: 'space-between',
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
                <div style={{ padding: '0 1.25rem 1.1rem 1.25rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
