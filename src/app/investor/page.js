'use client';
import React, { useState } from 'react';
import { 
  Building2, TrendingUp, ShieldCheck, HelpCircle, MessageSquare, 
  Calendar, CheckCircle, Lock, ArrowUpRight, DollarSign, Send,
  FileText, Award, ChevronDown, ChevronUp, AlertTriangle, Info, Sparkles, Globe,
  UserCheck, Shield, Unlock, RefreshCw
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
    a: "GRO10X charges a 2.5% management fee on monthly gross network sales, clear of all payroll liabilities, plus a 2.5% capital success fee on total raised capital."
  },
  {
    q: "How are coffee roasting equipment and physical fit-outs owned?",
    a: "Physical assets (machinery, civil fit-outs, kitchen equipment) are held directly under the specific outlet SPV entity in which investors hold their yield/partnership agreements, ensuring clear asset-backed claim."
  }
];

export default function InvestorPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [openFaq, setOpenFaq] = useState(null);
  
  // Progressive KYC Verification State
  const [kycLevel, setKycLevel] = useState(2); // Level 1, 2, or 3
  const [nidUploaded, setNidUploaded] = useState(true);
  const [bankStmtUploaded, setBankStmtUploaded] = useState(false);

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
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  const upgradeKyc = () => {
    if (kycLevel < 3) {
      setKycLevel(kycLevel + 1);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* NAVIGATION HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>
            I
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>GRO10X <span style={{ color: '#10b981' }}>INVESTOR SUITE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v0.2.7 Progressive Verification & Multi-Tier Portfolio</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('portfolio')} style={tabBtnStyle(activeTab === 'portfolio')}>
            My Portfolio
          </button>
          <button onClick={() => setActiveTab('kyc')} style={tabBtnStyle(activeTab === 'kyc')}>
            <Shield size={16} style={{ color: '#10b981' }} /> Verification (L{kycLevel})
          </button>
          <button onClick={() => setActiveTab('ai-concierge')} style={tabBtnStyle(activeTab === 'ai-concierge')}>
            <Sparkles size={16} style={{ color: '#D4AF37' }} /> AI Assistant
          </button>
          <button onClick={() => setActiveTab('faq')} style={tabBtnStyle(activeTab === 'faq')}>
            <HelpCircle size={16} /> FAQ
          </button>

          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#10b981' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Showcase <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* PROGRESSIVE KYC LEVEL BANNER */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(7,10,20,0.8))', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Account Verification: Level {kycLevel} / 3</span>
                <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {kycLevel === 1 ? 'Basic Access' : kycLevel === 2 ? 'Secondary Market Unlocked' : 'VIP Concierge Unlocked'}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                {kycLevel === 2 ? 'Level 2 Active: You can trade on the Secondary P2P Orderbook.' : 'Level 3 Active: Unlimited Private Cash Concierge deals.'}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('kyc')} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Unlock size={16} /> Manage Verification
          </button>
        </div>

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

        {/* 2. PROGRESSIVE KYC TAB */}
        {activeTab === 'kyc' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' }}>Progressive Investor Profiling</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Complete higher verification tiers to unlock Secondary Market trading and Private Cash Concierge facilities.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* LEVEL 1 */}
              <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L1</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 1: Basic Investor Registration</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>View public deals & calculate target yields.</p>
                    </div>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={16} /> Verified
                  </span>
                </div>
              </div>

              {/* LEVEL 2 */}
              <div className="glass-card" style={{ borderColor: kycLevel >= 2 ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: kycLevel >= 2 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: kycLevel >= 2 ? '#10b981' : '#94a3b8', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L2</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 2: NID / Passport Verification</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Unlocks Secondary P2P Orderbook share trading.</p>
                    </div>
                  </div>
                  {kycLevel >= 2 ? (
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={16} /> Verified
                    </span>
                  ) : (
                    <button onClick={upgradeKyc} style={{ background: '#10b981', color: '#070a14', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                      Submit NID
                    </button>
                  )}
                </div>
              </div>

              {/* LEVEL 3 */}
              <div className="glass-card" style={{ borderColor: kycLevel >= 3 ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: kycLevel >= 3 ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', color: kycLevel >= 3 ? '#10b981' : '#D4AF37', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L3</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 3: Accredited HNI Accreditation</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Unlocks Private Cash Concierge & BDT 50L+ deals.</p>
                    </div>
                  </div>
                  {kycLevel >= 3 ? (
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={16} /> Accredited HNI
                    </span>
                  ) : (
                    <button onClick={upgradeKyc} style={{ background: '#D4AF37', color: '#070a14', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                      Upgrade to L3 VIP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI CONCIERGE */}
        {activeTab === 'ai-concierge' && (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.15)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>GRO10X AI Investment Concierge</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Trained on Master Agreement & Due Diligence FAQs</p>
              </div>
            </div>

            <div style={{ height: '320px', overflowY: 'auto', background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: m.sender === 'user' ? '#D4AF37' : 'rgba(15,23,42,0.9)', color: m.sender === 'user' ? '#070a14' : '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '14px', fontSize: '0.95rem' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

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

        {/* 4. DUE DILIGENCE FAQ */}
        {activeTab === 'faq' && (
          <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>Investor Due Diligence</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
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

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
    color: active ? '#10b981' : '#94a3b8',
    border: active ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
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
