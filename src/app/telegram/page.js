'use client';
import React, { useState } from 'react';
import { 
  Send, MessageSquare, ShieldCheck, Phone, CheckCircle2, ChevronRight, 
  Bot, Smartphone, Globe, Sparkles, Building2, Copy, Users
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function TelegramEcosystemPage() {
  const [activeTab, setActiveTab] = useState('kam'); // 'kam' | 'promoter' | 'investor'
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Welcome to GRO10X Capital Telegram Bot Ecosystem.\n\nSelect a quick command to begin:', time: '10:00 AM' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text) return;

    const userMsg = { sender: 'user', text, time: '10:02 AM' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      let responseText = 'Command recognized. Processing with GRO10X Supabase backend...';
      if (text.includes('/audit') || text.toLowerCase().includes('audit')) {
        responseText = '📊 **KAM Field Audit Report**\n\nOutlet: ORO Roasters (Mirpur)\nCash in Hand: ৳45,000\nStock Value: ৳250,000\nAI Health Score: **88/100 (Verified)**';
      } else if (text.includes('/lead') || text.toLowerCase().includes('lead')) {
        responseText = '🤝 **New Investor Lead Logged**\n\nName: Engr. Shafiqul Islam\nWhatsApp: +8801700000000\nStatus: 39/50 Leads (78% Progress)';
      } else if (text.includes('/deals') || text.toLowerCase().includes('deals')) {
        responseText = '🔥 **Active Investment Deals**\n\n1. ORO Roasters - 18% Franchise Yield\n2. Coffee Bean LC - 24% APR Short-Term Debt\n\nTap below to open Telegram Mini App!';
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: responseText, time: '10:02 AM' }]);
    }, 600);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(0,136,204,0.3)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #0088cc, #005588)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Send size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>TELEGRAM <span style={{ color: '#0088cc' }}>MINI APP & BOT ECOSYSTEM</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v0.2.6 Encrypted Field Operations & Mini App Interface</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/promoter" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Promoter CRM</a>
          <a href="/kam-dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>KAM Portal</a>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'center' }}>
        
        {/* LEFT: INFORMATION & ROLE SWITCHER */}
        <div>
          <span className="badge-gold" style={{ background: 'rgba(0,136,204,0.15)', color: '#0088cc', borderColor: 'rgba(0,136,204,0.3)', marginBottom: '0.5rem' }}>
            Zero Friction Messaging
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 1rem 0' }}>Telegram Native Bot & Mini Apps</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Reps and investors in Bangladesh operate primarily on mobile chat. Our Telegram integration allows KAMs to log physical audits, Promoters to capture silent leads, and HNIs to execute cash tickets natively inside Telegram.
          </p>

          {/* ROLE SWITCHER BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { id: 'kam', title: '👨‍💼 Key Account Manager (KAM) Bot', desc: 'Log monthly balance sheets & physical asset photos in seconds.' },
              { id: 'promoter', title: '🤝 Promoter Lead Bot', desc: 'Instantly save WhatsApp investor contacts on the go.' },
              { id: 'investor', title: '🔒 Private Cash Concierge Bot', desc: 'Encrypted Telegram channel for high-ticket HNI transactions.' }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: activeTab === role.id ? '1px solid #0088cc' : '1px solid rgba(255,255,255,0.08)',
                  background: activeTab === role.id ? 'rgba(0,136,204,0.12)' : 'rgba(7,10,20,0.6)',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: activeTab === role.id ? '#0088cc' : '#fff', marginBottom: '0.2rem' }}>
                  {role.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{role.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} style={{ color: '#10b981', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Connected via <strong>Webhook API</strong> to Supabase PostgreSQL database.
            </p>
          </div>
        </div>

        {/* RIGHT: TELEGRAM SMARTPHONE MOCKUP */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '340px', height: '620px', background: '#0e1621', borderRadius: '36px', border: '8px solid #242f3d', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* TELEGRAM HEADER */}
            <div style={{ background: '#17212b', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #0e1621' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0088cc, #005588)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>
                <Bot size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  {activeTab === 'kam' && 'GRO10X Managing Partner Bot'}
                  {activeTab === 'promoter' && 'GRO10X Growth Promoter Bot'}
                  {activeTab === 'investor' && 'GRO10X Private Investor Bot'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#0088cc' }}>
                  {activeTab === 'investor' ? '@gro10xcapbot • online' : '@gro10xmanbot • online'}
                </div>
              </div>
            </div>

            {/* CHAT MESSAGES AREA */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#0e1621' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: m.sender === 'user' ? '#2b5278' : '#182533', padding: '0.65rem 0.85rem', borderRadius: '12px', color: '#fff', fontSize: '0.82rem', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#6c7883', textAlign: m.sender === 'user' ? 'right' : 'left', marginTop: '0.2rem' }}>
                    {m.time}
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK COMMAND ACTION CHIPS (ROLE-ADAPTIVE) */}
            <div style={{ background: '#17212b', padding: '0.5rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid #0e1621' }}>
              {activeTab === 'kam' && (
                <>
                  <button onClick={() => handleSendMessage('/portfolio')} style={chipStyle}>/portfolio</button>
                  <button onClick={() => handleSendMessage('/tickets')} style={chipStyle}>/tickets</button>
                  <button onClick={() => handleSendMessage('/audit ORO Roasters')} style={chipStyle}>/audit</button>
                </>
              )}
              {activeTab === 'promoter' && (
                <>
                  <button onClick={() => handleSendMessage('/mycode')} style={chipStyle}>/mycode</button>
                  <button onClick={() => handleSendMessage('/tier')} style={chipStyle}>/tier</button>
                  <button onClick={() => handleSendMessage('/earnings')} style={chipStyle}>/earnings</button>
                  <button onClick={() => handleSendMessage('/payout')} style={chipStyle}>/payout</button>
                </>
              )}
              {activeTab === 'investor' && (
                <>
                  <button onClick={() => handleSendMessage('/portfolio')} style={chipStyle}>/portfolio</button>
                  <button onClick={() => handleSendMessage('/yields')} style={chipStyle}>/yields</button>
                  <button onClick={() => handleSendMessage('/kyc')} style={chipStyle}>/kyc</button>
                  <button onClick={() => handleSendMessage('/documents')} style={chipStyle}>/documents</button>
                </>
              )}
            </div>

            {/* CHAT INPUT BAR */}
            <div style={{ background: '#17212b', padding: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputVal} 
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type command..." 
                style={{ flex: 1, background: '#0e1621', border: 'none', outline: 'none', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '18px', fontSize: '0.8rem' }} 
              />
              <button onClick={() => handleSendMessage()} style={{ width: '32px', height: '32px', background: '#0088cc', border: 'none', borderRadius: '50%', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

const chipStyle = {
  background: '#242f3d',
  color: '#0088cc',
  border: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};
