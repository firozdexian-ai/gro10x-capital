'use client';
import React from 'react';
import { Sparkles, ArrowUpRight, Send } from 'lucide-react';

export default function AiConciergeTab({
  messages = [],
  inputQuery = '',
  setInputQuery,
  handleAiSend
}) {
  const quickPrompts = [
    "What is my expected monthly yield?",
    "How does the SPV structure protect me?",
    "What happens if a business underperforms?",
    "How do I list shares on secondary market?"
  ];

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            GRO10X AI Investment Concierge
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Simulated due diligence assistant trained on Master Growth Agreements & SPV structures
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(212,175,55,0.15)', 
            color: '#D4AF37', 
            border: '1px solid rgba(212,175,55,0.3)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800' 
          }}>
            ● Powered by GRO10X Intelligence
          </span>
        </div>
      </div>

      {/* UPGRADE TO FULL AI INTELLIGENCE DESK BANNER */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.25rem 1.5rem', 
          background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(15,23,42,0.85))', 
          borderColor: 'rgba(212,175,55,0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(212,175,55,0.2)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
              Enterprise AI Intelligence Desk Available
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Access multi-turn deep financial modeling, live deal evaluation, and predictive portfolio forecasting.
            </p>
          </div>
        </div>

        <a 
          href="/ai-assistant" 
          style={{ 
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
            color: '#070a14', 
            padding: '0.5rem 1.15rem', 
            borderRadius: '6px', 
            fontWeight: '800', 
            fontSize: '0.8rem', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 8px rgba(212,175,55,0.2)'
          }}
        >
          Open Full AI Desk <ArrowUpRight size={14} />
        </a>
      </div>

      {/* CHAT CONTAINER */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
        
        {/* MESSAGES LOG */}
        <div style={{ height: '320px', overflowY: 'auto', background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                background: m.sender === 'user' ? 'linear-gradient(135deg, #D4AF37, #B89025)' : 'rgba(15,23,42,0.95)', 
                color: m.sender === 'user' ? '#070a14' : '#f8fafc', 
                padding: '0.85rem 1.15rem', 
                borderRadius: '12px', 
                fontSize: '0.88rem',
                lineHeight: '1.5',
                fontWeight: m.sender === 'user' ? '700' : '400',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* QUICK PROMPT CHIPS */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
            Recommended Questions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {quickPrompts.map((chipText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputQuery(chipText)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                  e.currentTarget.style.color = '#D4AF37';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                {chipText}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT BAR */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            placeholder="Ask any due diligence or structural investment question..." 
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
            className="form-input"
            style={{ fontSize: '0.85rem' }}
          />
          <button onClick={() => handleAiSend()} className="btn-gold" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
            <Send size={16} /> Send
          </button>
        </div>

      </div>
    </div>
  );
}
