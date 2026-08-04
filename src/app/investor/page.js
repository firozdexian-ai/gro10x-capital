'use client';
import React, { useState } from 'react';
import { 
  Building2, TrendingUp, ShieldCheck, HelpCircle, MessageSquare, 
  Calendar, CheckCircle, Lock, ArrowUpRight, DollarSign, Send,
  FileText, Award, ChevronDown, ChevronUp, AlertTriangle, Info, Sparkles, Globe
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const portfolioHistory = [
  { month: 'Jan', payout: 2.85 },
  { month: 'Feb', payout: 3.10 },
  { month: 'Mar', payout: 3.85 },
  { month: 'Apr', payout: 3.40 },
  { month: 'May', payout: 3.25 },
  { month: 'Jun', payout: 3.85 },
];

const dueDiligenceFAQs = [
  {
    q: "Who owns GRO10X, and do any ORO Roasters founders hold equity in GRO10X?",
    a: "GRO10X operates as an independent growth & data management entity (24-Month Master Growth Agreement). GRO10X has zero operational, payroll, or real estate liabilities for ORO Roasters. ORO founders handle culinary execution, payroll, and supply chain logistics, while GRO10X handles digital demand gen, live COGS monitoring, and capital rotation."
  },
  {
    q: "How does GRO10X make money from each outlet?",
    a: "GRO10X charges a 2.5% management fee on monthly gross network sales, clear of all payroll liabilities, plus a 2.5% capital success fee on total raised capital (e.g. BDT 50 Lakhs on the BDT 20 Crore raise across 10 hubs)."
  },
  {
    q: "How are coffee roasting equipment and physical fit-outs owned?",
    a: "Physical assets (machinery, civil fit-outs, kitchen equipment) are held directly under the specific outlet SPV entity in which investors hold their yield/partnership agreements, ensuring clear asset-backed claim."
  },
  {
    q: "How is investor principal secured beyond the 6% (BDT 12L) coffee machinery if fit-outs cannot be liquidated?",
    a: "80% of CapEx is deployed into physical assets. In addition to specialty coffee machinery (6%) and commercial kitchen setups (11%), the premium civil fit-out (59%) creates substantial leasehold key-money value that remains attached to the prime location. Furthermore, GRO10X's Secondary Marketplace allows investors to transfer shares to new buyers based on real-time earnings, providing liquidity without needing physical liquidation."
  },
  {
    q: "In Mirpur, why did net profit dip to BDT 3.1 Lakhs in May despite high sales of BDT 31.1 Lakhs?",
    a: "Verified Mirpur POS data shows that May included a one-off Festival Staff Bonus distribution of BDT 1.80 Lakhs, alongside peak summer utility expenses. Without the seasonal staff bonus, net profit remained at its steady ~BDT 5 Lakhs run-rate."
  },
  {
    q: "Why use Banani's single 'launch month' (June) as baseline metrics?",
    a: "June was the verified Day-1 launch month showing BDT 30.3L sales with a 19.85% margin (BDT 6.01L net profit). We present June as initial proof of concept; projected run-rates scale conservatively to BDT 35L (Month 3) and BDT 40L (Month 6)."
  },
  {
    q: "What is your FoodPanda delivery vs. direct dine-in sales ratio and commission impact?",
    a: "Dine-in accounts for ~85-90% of revenue, with FoodPanda contributing ~10-15%. Platform commissions are offset by our Cloud Kitchen Stacking strategy (running 3 virtual delivery-only brands during off-peak hours), monetizing dead kitchen capacity to protect net margins."
  }
];

export default function InvestorPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [openFaq, setOpenFaq] = useState(null);
  
  // AI Concierge State
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your GRO10X AI Investment Concierge. Ask me anything about our 20% ROI yield structures, Mirpur & Banani outlet data, or due diligence FAQs.' }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Booking State
  const [bookingHub, setBookingHub] = useState('ORO Roasters - Mirpur');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleAiSend = (query) => {
    const qText = query || inputQuery;
    if (!qText.trim()) return;

    const userMsg = { sender: 'user', text: qText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      let reply = "GRO10X targets a 20% annual ROI across 3 structures: Option 1 Capped Yield (10% sales), Option 2 Multiplier (12% sales), and Option 3 Partnership (5% floor + 35% profit). How else can I assist your due diligence?";
      const lower = qText.toLowerCase();

      if (lower.includes('mirpur') || lower.includes('may') || lower.includes('profit')) {
        reply = "In Mirpur, May's net profit of BDT 3.1L reflected a seasonal Eid staff bonus payment of BDT 1.80 Lakhs. Standard monthly net profit averages BDT 5.34 Lakhs on BDT 31.6 Lakhs sales (16.89% net margin).";
      } else if (lower.includes('banani') || lower.includes('launch')) {
        reply = "Banani launched in June 2026 with BDT 30.3 Lakhs in gross sales and BDT 6.01 Lakhs net profit (19.85% margin). Target sales scale to BDT 35L by Month 3.";
      } else if (lower.includes('cash') || lower.includes('undisclosed') || lower.includes('confidential')) {
        reply = "We offer a Private Wealth Advisory for HNIs seeking confidential cash settlement & custom agreement terms. You can request a private consultation via our Concierge tab.";
      } else if (lower.includes('fee') || lower.includes('gro10x')) {
        reply = "GRO10X charges a 2.5% management fee on monthly gross network sales + a 2.5% capital success fee on total raised funds. GRO10X carries zero payroll or real estate liability.";
      } else if (lower.includes('resell') || lower.includes('market')) {
        reply = "Our Secondary Marketplace allows investors to sell shares after 6 months. Share prices are algorithmically calculated based on real-time ROI, with a ±10% seller price corridor.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* NAVIGATION HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            I
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>GRO10X <span style={{ color: '#D4AF37' }}>INVESTOR PORTAL</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Accredited & NRB Investor Dashboard</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('portfolio')} style={tabBtnStyle(activeTab === 'portfolio')}>
            My Portfolio
          </button>
          <button onClick={() => setActiveTab('ai-concierge')} style={tabBtnStyle(activeTab === 'ai-concierge')}>
            <Sparkles size={16} style={{ color: '#D4AF37' }} /> Ask AI Concierge
          </button>
          <button onClick={() => setActiveTab('faq')} style={tabBtnStyle(activeTab === 'faq')}>
            <HelpCircle size={16} /> Due Diligence FAQ
          </button>
          <button onClick={() => setActiveTab('book-visit')} style={tabBtnStyle(activeTab === 'book-visit')}>
            <Calendar size={16} /> Book Outlet Tour
          </button>

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

          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Exit <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* 1. PORTFOLIO DASHBOARD */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
              <div className="glass-card">
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Capital Invested</p>
                <h2 style={{ fontSize: '2rem', color: '#D4AF37', fontWeight: '800' }}>
                  {formatCurrency(2500000, currency)}
                </h2>
                <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>2 Active Hub Shares</p>
              </div>

              <div className="glass-card">
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Monthly Cash Payout</p>
                <h2 style={{ fontSize: '2rem', color: '#10b981', fontWeight: '800' }}>
                  {formatCurrency(385000, currency)}
                </h2>
                <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>Distributed 5th of every month</p>
              </div>

              <div className="glass-card">
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Cumulative Profits Received</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>
                  {formatCurrency(1730000, currency)}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>Over 6 Months</p>
              </div>

              <div className="glass-card">
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Portfolio Net Yield</p>
                <h2 style={{ fontSize: '2rem', color: '#D4AF37', fontWeight: '800' }}>18.48%</h2>
                <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>Target: 20.00%</p>
              </div>
            </div>

            {/* PAYOUT HISTORY CHART */}
            <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Monthly Payout Distributions</h3>
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioHistory}>
                      <defs>
                        <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #10b981' }} />
                      <Area type="monotone" dataKey="payout" stroke="#10b981" fillOpacity={1} fill="url(#payoutGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MY HOLDINGS LIST */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Active Outlet Shares</h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#D4AF37' }}>ORO Roasters - Mirpur</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Option 3: Partnership (5% + 35% Profit Share)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(316000, currency)} / mo</span>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatCurrency(1500000, currency)} Invested</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#3b82f6' }}>ORO Roasters - Banani</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Option 2: Multiplier (12% Gross Sales)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(69000, currency)} / mo</span>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatCurrency(1000000, currency)} Invested</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. AI INVESTMENT CONCIERGE */}
        {activeTab === 'ai-concierge' && (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.15)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>GRO10X AI Investment Concierge</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Trained on Master Agreement, CSV data & Due Diligence FAQs</p>
              </div>
            </div>

            {/* PRE-SET QUESTION CHIPS */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button onClick={() => handleAiSend("Why did Mirpur net profit dip in May?")} style={chipBtnStyle}>
                Mirpur May Profit Drop?
              </button>
              <button onClick={() => handleAiSend("How does GRO10X make money?")} style={chipBtnStyle}>
                GRO10X Fees & Revenue Model?
              </button>
              <button onClick={() => handleAiSend("How is my principal secured beyond coffee machinery?")} style={chipBtnStyle}>
                Principal Asset Security?
              </button>
              <button onClick={() => handleAiSend("Tell me about Banani launch baseline")} style={chipBtnStyle}>
                Banani Launch Metrics?
              </button>
            </div>

            {/* CHAT MESSAGES */}
            <div style={{ height: '320px', overflowY: 'auto', background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: m.sender === 'user' ? '#D4AF37' : 'rgba(15,23,42,0.9)', color: m.sender === 'user' ? '#070a14' : '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '14px', fontSize: '0.95rem', border: m.sender === 'ai' ? '1px solid rgba(212,175,55,0.2)' : 'none', fontWeight: m.sender === 'user' ? '600' : '400' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* CHAT INPUT */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Ask any due diligence question..." 
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                className="form-input"
              />
              <button onClick={() => handleAiSend()} className="btn-gold" style={{ padding: '0 1.5rem' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 3. DUE DILIGENCE FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>Investor Due Diligence</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Direct answers to prospective investor inquiries regarding equity, assets, and historical performance.</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {dueDiligenceFAQs.map((faq, idx) => (
                <div key={idx} style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '1.25rem', background: 'transparent', border: 'none', color: '#f8fafc', fontWeight: '700', fontSize: '1.05rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>Q: {faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={20} style={{ color: '#D4AF37' }} /> : <ChevronDown size={20} style={{ color: '#94a3b8' }} />}
                  </button>

                  {openFaq === idx && (
                    <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BOOK VIP OUTLET VISIT */}
        {activeTab === 'book-visit' && (
          <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Schedule VIP Outlet Visit</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Experience the ORO Roasters and Segreto operations firsthand. Meet our managing team, tour the specialty coffee machinery, and audit POS operations.
            </p>

            {bookingSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '2rem', borderRadius: '14px', textAlign: 'center' }}>
                <CheckCircle size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                <h4 style={{ color: '#10b981', fontSize: '1.3rem' }}>VIP Visit Request Confirmed!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Our Director of Investor Relations will contact you on WhatsApp to confirm your private host details.
                </p>
                <button onClick={() => setBookingSuccess(false)} className="btn-gold" style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
                  Book Another Visit
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Target Outlet</label>
                  <select value={bookingHub} onChange={(e) => setBookingHub(e.target.value)} className="form-input">
                    <option>ORO Roasters - Mirpur (Operational Baseline)</option>
                    <option>ORO Roasters - Banani (Flagship Launch)</option>
                    <option>Segreto Hub - Dhanmondi</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Preferred Visit Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="form-input" required />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Special Requests / Focus Areas</label>
                  <textarea rows={3} placeholder="e.g. Audit POS system, inspect coffee roasting setup, discuss cash settlement options..." className="form-input" style={{ resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '0.85rem' }}>
                  Confirm VIP Tour Schedule
                </button>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    color: active ? '#D4AF37' : '#94a3b8',
    border: active ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: active ? '700' : '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s'
  };
}

function chipBtnStyle() {
  return {
    background: 'rgba(255,255,255,0.06)',
    color: '#D4AF37',
    border: '1px solid rgba(212,175,55,0.2)',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  };
}
