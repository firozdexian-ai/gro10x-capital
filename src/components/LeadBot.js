'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle2, User, Phone, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LeadBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [investmentRange, setInvestmentRange] = useState('৳5L – ৳25L');
  const [meetingPref, setMeetingPref] = useState('Online Call');
  const [projectContext, setProjectContext] = useState(null);
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    // Listen for custom event to open bot from buttons
    const handleOpen = (e) => {
      if (e.detail) {
        setProjectContext(e.detail);
        if (e.detail.refCode) setRefCode(e.detail.refCode);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-lead-bot', handleOpen);
    return () => window.removeEventListener('open-lead-bot', handleOpen);
  }, []);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      const sourcePage = typeof window !== 'undefined' ? window.location.pathname : 'Unknown';

      // 1. Save to Supabase
      const { data, error } = await supabase
        .from('inquiry_leads')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          investment_range: investmentRange,
          meeting_preference: meetingPref,
          source_page: projectContext?.projectTitle ? `${sourcePage} (${projectContext.projectTitle})` : sourcePage,
          referral_code: refCode || null,
          status: 'New'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Trigger Telegram API Endpoint (fire & forget or wait)
      fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: data.id,
          name,
          phone,
          investmentRange,
          meetingPref,
          sourcePage: projectContext?.projectTitle ? `${projectContext.projectTitle}` : sourcePage
        })
      }).catch(err => console.error('Telegram notification error:', err));

      setIsCompleted(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setPhone('');
    setIsCompleted(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* FLOATING BOT BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #D4AF37, #b49127)',
            color: '#070a14',
            border: 'none',
            borderRadius: '30px',
            padding: '0.85rem 1.4rem',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(212,175,55,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 9999,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <MessageSquare size={20} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '2px solid #070a14' }} />
          </div>
          <span>Talk to Advisor</span>
        </button>
      )}

      {/* CHAT WIDGET WINDOW */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '560px',
            background: '#0f172a',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 10000,
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          {/* BOT HEADER */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', background: 'rgba(212,175,55,0.15)', borderRadius: '50%', border: '1px solid rgba(212,175,55,0.4)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>GRO10X Advisor Assistant</h4>
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Online & Ready
                </span>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
              <X size={20} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#070a14' }}>
            
            {/* INTRO MSG */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 2px', padding: '0.85rem 1rem', maxWidth: '88%', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              👋 Welcome to <strong>GRO10X Capital</strong>! 
              {projectContext?.projectTitle && (
                <div style={{ marginTop: '0.4rem', color: '#D4AF37', fontWeight: 'bold' }}>
                  Interested in: {projectContext.projectTitle}
                </div>
              )}
              We facilitate physical asset-backed SME investments. Let us know how to connect with you!
            </div>

            {/* SUCCESS STATE */}
            {isCompleted ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '1.5rem', borderRadius: '14px', textAlign: 'center', margin: 'auto 0' }}>
                <CheckCircle2 size={44} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#10b981', margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>Inquiry Registered!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                  Thank you, <strong>{name}</strong>. A GRO10X Investment Advisor will reach out via <strong>{phone}</strong> to confirm your {meetingPref.toLowerCase()}.
                </p>
                <button onClick={resetForm} className="btn-gold" style={{ width: '100%', fontSize: '0.85rem', justifyContent: 'center' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: NAME */}
                {step >= 1 && (
                  <div>
                    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 2px', padding: '0.85rem 1rem', maxWidth: '88%', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>
                      May I have your full name?
                    </div>

                    {step === 1 && (
                      <form onSubmit={handleStep1Submit} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="form-input"
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn-gold" style={{ padding: '0.6rem 1rem' }}>
                          <Send size={16} />
                        </button>
                      </form>
                    )}

                    {step > 1 && (
                      <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: '12px 12px 2px 12px', padding: '0.6rem 1rem', marginLeft: 'auto', maxWidth: '80%', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {name}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: PHONE */}
                {step >= 2 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 2px', padding: '0.85rem 1rem', maxWidth: '88%', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>
                      Great to meet you, {name}! What is your preferred contact number?
                    </div>

                    {step === 2 && (
                      <form onSubmit={handleStep2Submit} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="tel"
                          placeholder="+880 1700-000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="form-input"
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn-gold" style={{ padding: '0.6rem 1rem' }}>
                          <Send size={16} />
                        </button>
                      </form>
                    )}

                    {step > 2 && (
                      <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: '12px 12px 2px 12px', padding: '0.6rem 1rem', marginLeft: 'auto', maxWidth: '80%', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {phone}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: RANGE & MEETING PREF */}
                {step >= 3 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 2px', padding: '0.85rem 1rem', maxWidth: '90%', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      Almost done! Select your intended investment budget & preferred consultation method:
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Investment Budget Range:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                        {['৳5L – ৳25L', '৳25L – ৳1Cr', '৳1Cr+'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setInvestmentRange(val)}
                            style={{
                              background: investmentRange === val ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.8)',
                              border: investmentRange === val ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                              color: investmentRange === val ? '#D4AF37' : '#cbd5e1',
                              padding: '0.5rem 0.25rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Consultation Preference:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {['Online Call', 'Property Visit'].map(pref => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => setMeetingPref(pref)}
                            style={{
                              background: meetingPref === pref ? 'rgba(16,185,129,0.2)' : 'rgba(15,23,42,0.8)',
                              border: meetingPref === pref ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                              color: meetingPref === pref ? '#10b981' : '#cbd5e1',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="btn-gold"
                      style={{ marginTop: '0.5rem', padding: '0.8rem', justifyContent: 'center', fontSize: '0.9rem', width: '100%' }}
                    >
                      {isSubmitting ? 'Submitting Inquiry...' : 'Submit & Connect with Advisor'}
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
