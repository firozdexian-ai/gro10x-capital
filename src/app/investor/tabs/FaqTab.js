'use client';
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const DUE_DILIGENCE_FAQS = [
  {
    q: "Who owns GRO10X, and do any ORO Roasters founders hold equity in GRO10X?",
    a: "GRO10X operates as an independent growth & data management entity (24-Month Master Growth Agreement). GRO10X has zero operational, payroll, or real estate liabilities for ORO Roasters. ORO founders handle culinary execution, payroll, and supply chain logistics, while GRO10X handles digital demand gen, live COGS monitoring, and capital rotation."
  },
  {
    q: "How does GRO10X make money from each outlet?",
    a: "GRO10X charges a 2.5% management fee on monthly gross network sales, clear of all payroll liabilities, plus a 2.5% capital success fee on total raised capital."
  },
  {
    q: "How are coffee roasting equipment and physical fit-outs owned?",
    a: "Physical assets (machinery, civil fit-outs, kitchen equipment) are held directly under the specific outlet SPV entity in which investors hold their yield/partnership agreements, ensuring clear asset-backed claim."
  },
  {
    q: "What is the minimum investment required to participate in a GRO10X funding round?",
    a: "Standard syndicate micro-allocations start from BDT 1,00,000 for retail syndicate investors up to multi-crore private tranches for Level 3 Accredited HNI partners."
  },
  {
    q: "How and when are monthly yield distributions paid?",
    a: "Monthly yields are calculated from daily POS telemetry data recorded in the system and reconciled by the assigned KAM after monthly physical asset audits. Disbursements are credited directly to investor bank accounts by the 10th of each calendar month."
  },
  {
    q: "What is the secondary market exit mechanism and how liquid is it?",
    a: "Level 2+ verified investors can list their SPV shares on the internal GRO10X Secondary P2P Orderbook within a ±10% anti-speculation fair-market-value corridor. Matching buyers can acquire active shares instantly without waiting for project maturity."
  },
  {
    q: "What happens to my investment if a business outlet underperforms or closes?",
    a: "All investments are legally asset-backed. In the event of persistent outlet underperformance, the SPV entity holds direct first-charge claim on physical equipment, fit-outs, and remaining escrow reserves for liquidation recovery."
  },
  {
    q: "Are GRO10X investment distributions subject to tax in Bangladesh?",
    a: "Yield disbursements are treated as partnership profit-share/dividends under Bangladeshi tax law. Investors receive formal annual tax statements from the Document Vault for standard income tax filings."
  },
  {
    q: "What is the difference between Option 1 (Rev-Share) and Option 2 (Growth Yield)?",
    a: "Option 1 provides steady monthly revenue-share yields calculated directly on top-line gross sales. Option 2 provides a blended base return plus an equity upside kicker tied to franchise expansion and secondary valuation growth."
  },
  {
    q: "How does the Progressive KYC verification process work?",
    a: "Level 1 is granted upon registration for browsing deals. Level 2 requires NID/Passport identity submission for Secondary Market trading rights. Level 3 requires Source of Funds declaration for high-ticket Private Cash Concierge deals."
  }
];

export default function FaqTab({
  openFaq,
  setOpenFaq,
  faqs = DUE_DILIGENCE_FAQS
}) {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Investor Due Diligence FAQs
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Common structural, legal, and financial questions answered for prospective and active investors
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(16,185,129,0.15)', 
            color: '#10b981', 
            border: '1px solid rgba(16,185,129,0.3)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800' 
          }}>
            ● {faqs.length} Questions Answered
          </span>
        </div>
      </div>

      {/* ACCORDION LIST */}
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div 
              key={idx} 
              className="glass-card"
              style={{ 
                padding: 0,
                overflow: 'hidden',
                borderColor: isOpen ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)',
                borderLeft: isOpen ? '4px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.2s'
              }}
            >
              <button 
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                style={{ 
                  width: '100%', 
                  padding: '1.15rem 1.35rem', 
                  background: 'transparent', 
                  border: 'none', 
                  color: isOpen ? '#D4AF37' : '#f8fafc', 
                  fontWeight: '800', 
                  fontSize: '0.92rem', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '800' }}>#{idx + 1}</span>
                  {faq.q}
                </span>
                {isOpen ? <ChevronUp size={18} style={{ color: '#D4AF37', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div style={{ 
                  padding: '1rem 1.35rem 1.25rem 1.35rem', 
                  color: '#cbd5e1', 
                  fontSize: '0.85rem', 
                  lineHeight: '1.6', 
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(7,10,20,0.4)'
                }}>
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
