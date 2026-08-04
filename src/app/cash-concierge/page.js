'use client';
import React, { useState } from 'react';
import { 
  Lock, ShieldCheck, UserCheck, Calendar, ArrowUpRight, DollarSign, 
  Send, CheckCircle2, ChevronRight, MessageSquare, Building2, Globe
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function CashConciergePortal() {
  const [currency, setCurrency] = useState('BDT');
  const [aliasName, setAliasName] = useState('');
  const [category, setCategory] = useState('High Net Worth Individual (HNI)');
  const [contactChannel, setContactChannel] = useState('Signal / Telegram (Encrypted)');
  const [contactDetails, setContactDetails] = useState('');
  const [targetAmount, setTargetAmount] = useState('BDT 50 Lakhs - BDT 1 Crore');
  const [meetingVenue, setMeetingVenue] = useState('GRO10X Managing Partner Suite (Dhaka)');
  const [payoutPref, setPayoutPref] = useState('Monthly Cash Pickup');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    if (!aliasName || !contactDetails) return;

    const ticket = {
      id: `CASH-CONF-${Math.floor(1000 + Math.random() * 9000)}`,
      aliasName,
      category,
      contactChannel,
      targetAmount,
      meetingVenue,
      payoutPref,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setSubmittedTicket(ticket);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            <Lock size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>PRIVATE WEALTH <span style={{ color: '#D4AF37' }}>CASH CONCIERGE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Strict NDA & Discrete Settlement Advisory v0.1.5</p>
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

      <main className="container" style={{ padding: '3.5rem 0' }}>
        
        {/* HERO HEADER */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          <div className="badge-gold" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={16} /> 100% Confidential • End-to-End Encrypted • SPV Asset-Backed
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
            Discrete Cash Wealth Deployment & Advisory
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Designed exclusively for High-Net-Worth Individuals (HNIs) and Non-Resident Bangladeshis (NRBs) with undisclosed cash wealth seeking structured, high-yield deployments without public exposure.
          </p>
        </div>

        {/* 3 GUARANTEE CARDS */}
        <div className="grid-3" style={{ marginBottom: '3.5rem' }}>
          <div className="glass-card">
            <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.15)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#D4AF37', marginBottom: '1rem' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Strict Pseudonym Privacy</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              No real names required during initial consultation. You choose your preferred pseudonym and encrypted communication line.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.15)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#D4AF37', marginBottom: '1rem' }}>
              <Building2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>SPV Asset Protection</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Cash deposits are secured directly into the hub SPV entity (*GRO10X SPV Ltd.*), protecting 60-70% asset recovery value.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.15)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#D4AF37', marginBottom: '1rem' }}>
              <UserCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Managing Partner Service</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Handled directly by a GRO10X Managing Director in private suites or VIP outlet lounges with custom payout terms.
            </p>
          </div>
        </div>

        {/* INQUIRY FORM OR SUBMITTED TICKET */}
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.4)', padding: '3rem' }}>
            
            {submittedTicket ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={56} style={{ color: '#10b981', marginBottom: '1rem' }} />
                <span className="badge-gold" style={{ marginBottom: '1rem' }}>Confidential Ticket Created</span>
                
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {submittedTicket.id}
                </h2>
                
                <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '550px', margin: '0 auto 2rem auto' }}>
                  Your inquiry has been routed directly to the encrypted portal of the GRO10X Managing Directors. We will reach out via <strong>{submittedTicket.contactChannel}</strong> within 12 hours.
                </p>

                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', display: 'grid', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Client Pseudonym:</span>
                    <span style={{ color: '#D4AF37', fontWeight: '700' }}>{submittedTicket.aliasName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Target Commitment:</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{submittedTicket.targetAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Meeting Venue:</span>
                    <span style={{ fontWeight: '600' }}>{submittedTicket.meetingVenue}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Payout Preference:</span>
                    <span style={{ fontWeight: '600' }}>{submittedTicket.payoutPref}</span>
                  </div>
                </div>

                <button onClick={() => setSubmittedTicket(null)} className="btn-gold" style={{ fontSize: '0.95rem' }}>
                  Submit Another Consultation Request
                </button>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Request Private Cash Consultation</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                    Complete the encrypted form below. No public logs will ever be generated.
                  </p>
                </div>

                <form onSubmit={handleSubmitInquiry} style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Client Alias / Pseudonym</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Director_X" 
                        value={aliasName}
                        onChange={(e) => setAliasName(e.target.value)}
                        className="form-input" 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Investor Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                        <option>High Net Worth Individual (HNI)</option>
                        <option>NRB Expatriate (UK / USA / UAE)</option>
                        <option>Corporate Partner / Syndicate</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Preferred Encrypted Channel</label>
                      <select value={contactChannel} onChange={(e) => setContactChannel(e.target.value)} className="form-input">
                        <option>Signal / Telegram (Encrypted)</option>
                        <option>WhatsApp Private Messaging</option>
                        <option>Private In-Person Meeting Only</option>
                        <option>Confidential Email</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Contact Info (Handle / Number)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. @alias_handle or +880..." 
                        value={contactDetails}
                        onChange={(e) => setContactDetails(e.target.value)}
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Cash Deployment Size</label>
                      <select value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="form-input">
                        <option>BDT 25 Lakhs - BDT 50 Lakhs</option>
                        <option>BDT 50 Lakhs - BDT 1 Crore</option>
                        <option>BDT 1 Crore - BDT 2 Crores (Full Outlet SPV)</option>
                        <option>BDT 2 Crores+ (Multi-Outlet Portfolio)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Preferred Meeting Location</label>
                      <select value={meetingVenue} onChange={(e) => setMeetingVenue(e.target.value)} className="form-input">
                        <option>GRO10X Managing Partner Suite (Dhaka)</option>
                        <option>ORO Roasters Banani VIP Suite</option>
                        <option>Private Residence / Investor Office</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Monthly Yield Distribution Preference</label>
                    <select value={payoutPref} onChange={(e) => setPayoutPref(e.target.value)} className="form-input">
                      <option>Monthly Cash Pickup (In-Person Collection)</option>
                      <option>Direct Bank Wire Payout</option>
                      <option>Offshore / Expatriate Account Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Special Terms & Confidential Instructions</label>
                    <textarea 
                      rows={3} 
                      placeholder="e.g. Prefer Option 3 Partnership model, require physical NDA document before meeting..." 
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="form-input" 
                      style={{ resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}>
                    Generate Encrypted Consultation Ticket <ChevronRight size={20} />
                  </button>

                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                    🔒 Protected under GRO10X Institutional Non-Disclosure Standards.
                  </p>
                </form>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
