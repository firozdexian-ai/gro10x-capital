'use client';
import React, { useState } from 'react';
import { 
  Sparkles, Send, Bot, User, ArrowUpRight, CheckCircle2, ShieldCheck, 
  HelpCircle, DollarSign, Calendar, Lock, Globe, MessageSquare, ChevronRight
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const promptCategories = [
  { id: 'safety', label: '🛡️ Asset Safety & SPV (60-70% Recovery)', query: 'How does the SPV structure protect 60-70% of my principal asset value?' },
  { id: 'yield', label: '📈 20% ROI Yield Structures', query: 'Compare Option 1 Capped vs Option 2 Multiplier vs Option 3 Partnership payouts.' },
  { id: 'csv', label: '📊 CSV Financial Audit (Mirpur & Banani)', query: 'Why did Mirpur net profit dip in May, and what is Banani launch baseline?' },
  { id: 'cash', label: '🔒 Cash Wealth & NDA Guidance', query: 'How does the Private Cash Concierge handle undisclosed cash wealth confidentially?' },
  { id: 'promoter', label: '🤝 Promoter 0.5% Commissions', query: 'How do freelance brokers earn 0.5% referral commissions on capital raised?' }
];

export default function AiAssistantPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Welcome to GRO10X Capital AI! I am your natural language investment concierge. Ask me about our 20% ROI yield options, audited Mirpur/Banani CSV metrics, SPV 90/10 asset protection, or type a custom calculation like "What is my monthly payout in USD for 20 Lakhs BDT in Option 3?"' 
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSend = (text) => {
    const queryText = text || inputQuery;
    if (!queryText.trim()) return;

    const userMsg = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Natural Language Response Parser
    setTimeout(() => {
      let reply = "GRO10X Capital connects investors with high-margin retail hubs via a 90% Investor / 10% GRO10X SPV structure. How else can I assist your diligence?";
      const lower = queryText.toLowerCase();

      // Check if user is asking for a calculation (e.g., "20 lakhs", "50 lakhs", "10 lakhs")
      const numberMatch = lower.match(/(\d+)\s*(lakh|lakhs|lac|crore|crores|bdt|usd|gbp)/i);
      let calcAmount = 1500000; // Default 15 Lakhs
      if (numberMatch) {
        const val = parseInt(numberMatch[1], 10);
        if (lower.includes('crore')) calcAmount = val * 10000000;
        else if (lower.includes('lakh') || lower.includes('lac')) calcAmount = val * 100000;
      }

      if (lower.includes('option 1') || lower.includes('capped')) {
        const monthly = (3160000 * 0.10) * (calcAmount / 20000000);
        reply = `For an investment of ${formatCurrency(calcAmount, currency)} under Option 1 (Capped Yield - 10% Gross Sales):\n• Projected Monthly Payout: ${formatCurrency(monthly, currency)} / mo (~${formatCurrency(monthly * 12, currency)} / yr).\n• Capped at 22% Max Annual ROI to protect against volatility.`;
      } else if (lower.includes('option 2') || lower.includes('multiplier')) {
        const monthly = (3160000 * 0.12) * (calcAmount / 20000000);
        reply = `For an investment of ${formatCurrency(calcAmount, currency)} under Option 2 (The Multiplier - 12% Gross Sales):\n• Projected Monthly Payout: ${formatCurrency(monthly, currency)} / mo (~${formatCurrency(monthly * 12, currency)} / yr).\n• Ends at 1.5X Total Buyout Target (${formatCurrency(calcAmount * 1.5, currency)} total return).`;
      } else if (lower.includes('option 3') || lower.includes('partnership')) {
        const monthly = ((3160000 * 0.05) + (534000 * 0.35)) * (calcAmount / 20000000);
        reply = `For an investment of ${formatCurrency(calcAmount, currency)} under Option 3 (The Partnership - 5% Floor + 35% Net Profit Share):\n• Projected Monthly Payout: ${formatCurrency(monthly, currency)} / mo (~${formatCurrency(monthly * 12, currency)} / yr).\n• Combines a 5% gross sales floor with 35% net profit participation.`;
      } else if (lower.includes('spv') || lower.includes('asset') || lower.includes('safety') || lower.includes('protect')) {
        reply = "Every hub is structured as an independent SPV (e.g. GRO10X Mirpur SPV Ltd.). The SPV directly holds the 7-month lease contract, specialty coffee machinery (6%), commercial kitchen equipment (11%), and civil fit-outs (59%). Investors hold 90% equity in the SPV and GRO10X holds 10%, ensuring 60-70% asset recovery protection under all scenarios.";
      } else if (lower.includes('mirpur') || lower.includes('may') || lower.includes('bonus')) {
        reply = "Mirpur POS CSV audit shows May net profit was BDT 3.1 Lakhs on BDT 31.1 Lakhs sales due to a one-off Eid Festival Staff Bonus distribution of BDT 1.80 Lakhs. Standard monthly net profit averages BDT 5.34 Lakhs (16.89% verified net margin).";
      } else if (lower.includes('banani') || lower.includes('launch')) {
        reply = "Banani launched in June 2026 generating BDT 30.3 Lakhs in gross sales with BDT 6.01 Lakhs net profit (19.85% verified Day-1 margin). Target sales scale conservatively to BDT 35L by Month 3 and BDT 40L by Month 6.";
      } else if (lower.includes('promoter') || lower.includes('broker') || lower.includes('commission')) {
        reply = "Freelance real estate agents and brokers receive a unique referral link via the Promoter Portal (/promoter). When referred investors commit capital, promoters earn an instant 0.5% referral commission (e.g. BDT 25,000 on a BDT 50 Lakh deal).";
      } else if (lower.includes('cash') || lower.includes('nda') || lower.includes('undisclosed')) {
        reply = "Our Private Cash Concierge (/cash-concierge) provides discrete white-glove advisory for HNIs with undisclosed cash wealth. Clients use pseudonyms, choose encrypted channels (Signal/Telegram), and meet in private suites under strict NDAs.";
      } else if (lower.includes('visit') || lower.includes('tour') || lower.includes('meet')) {
        reply = "Would you like to visit ORO Roasters Mirpur or Banani in person? Click the 'Schedule VIP Tour' button below to pick a date!";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, hasAction: lower.includes('visit') || lower.includes('tour') || lower.includes('meet') }]);
    }, 500);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>ASK GRO10X <span style={{ color: '#D4AF37' }}>AI CONCIERGE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Conversational Financial Simulation & Diligence v0.1.7</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0', maxWidth: '900px' }}>
        
        {/* 5 SMART PROMPT CATEGORIES */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>5 Smart Diligence Prompt Categories:</p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {promptCategories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => handleSend(cat.query)}
                style={{ 
                  background: 'rgba(15,23,42,0.8)', 
                  border: '1px solid rgba(212,175,55,0.3)', 
                  color: '#D4AF37', 
                  padding: '0.4rem 0.85rem', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT MESSAGES DISPLAY */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ height: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ 
                  background: m.sender === 'user' ? '#D4AF37' : 'rgba(7,10,20,0.8)', 
                  color: m.sender === 'user' ? '#070a14' : '#f8fafc', 
                  padding: '1rem 1.25rem', 
                  borderRadius: '16px', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.6',
                  border: m.sender === 'ai' ? '1px solid rgba(212,175,55,0.25)' : 'none', 
                  fontWeight: m.sender === 'user' ? '600' : '400',
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}

                  {m.hasAction && (
                    <button onClick={() => setShowBookingModal(true)} className="btn-gold" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                      <Calendar size={16} /> Schedule VIP Tour Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CHAT INPUT BAR */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <input 
              type="text" 
              placeholder="Ask a question or type a calculation (e.g. 20 Lakhs BDT in Option 3 in USD)..." 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="form-input"
              style={{ padding: '1rem 1.25rem' }}
            />
            <button onClick={() => handleSend()} className="btn-gold" style={{ padding: '0 1.75rem' }}>
              <Send size={18} />
            </button>
          </div>
        </div>

      </main>

      {/* EMBEDDED VIP BOOKING MODAL */}
      {showBookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '92%', borderColor: '#D4AF37' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Schedule VIP Outlet Tour</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Meet GRO10X Managing Directors at ORO Mirpur or Banani.
            </p>

            {bookingSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '1.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={36} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#10b981', fontSize: '1.15rem' }}>VIP Tour Request Logged!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Our Private Advisory team has been notified and will contact you within 24 hours to confirm access.</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const outlet = form.outlet?.value || 'ORO Roasters - Banani';
                const date = form.tour_date?.value || 'Next Available';
                const contact = form.contact?.value || 'Private Investor';

                try {
                  await fetch('/api/telegram-notify-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: '🏢 VIP Outlet Tour Request',
                      message: `An investor requested a VIP Outlet Tour via AI Concierge.\n\n📍 Outlet: <b>${outlet}</b>\n📅 Date: <b>${date}</b>\n👤 Contact/Name: <code>${contact}</code>`,
                      actionUrl: `${window.location.origin}/admin`
                    })
                  });
                } catch (tErr) {
                  console.warn('VIP tour admin alert skipped:', tErr);
                }

                setBookingSuccess(true);
                setTimeout(() => {
                  setBookingSuccess(false);
                  setShowBookingModal(false);
                }, 2200);
              }} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Your Name / Phone Number</label>
                  <input name="contact" type="text" placeholder="e.g. 017XXXXXXXX / Tanvir Ahmed" className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Outlet</label>
                  <select name="outlet" className="form-input">
                    <option value="ORO Roasters - Mirpur (Operational Baseline)">ORO Roasters - Mirpur (Operational Baseline)</option>
                    <option value="ORO Roasters - Banani (Flagship Launch)">ORO Roasters - Banani (Flagship Launch)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Preferred Date</label>
                  <input name="tour_date" type="date" className="form-input" required />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Confirm Booking</button>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
