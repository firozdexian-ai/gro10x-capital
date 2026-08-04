'use client';
import React, { useState } from 'react';
import { 
  Users, TrendingUp, DollarSign, Link2, Copy, CheckCircle2, 
  ArrowUpRight, Award, ChevronRight, Share2, ShieldCheck, UserCheck,
  Lock, Unlock, MessageSquare, Mail, PlusCircle, Globe, Send, Sparkles
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialLeads = [
  { id: 'LD-101', name: 'Tanvir Ahmed (NRB Expatriate)', phone: '+8801711000111', email: 'tanvir.nrb@gmail.com', category: 'NRB Expatriate', interest: 'Franchise Yield (18%)', status: 'Pitched' },
  { id: 'LD-102', name: 'Dr. Kazi Mahbub', phone: '+8801819222333', email: 'dr.mahbub@health.gov.bd', category: 'Local HNI', interest: 'Short-Term Debt (24%)', status: 'Contacted' },
  { id: 'LD-103', name: 'Syed Rahat Kabir', phone: '+8801911444555', email: 'rahat.kabir@dhakatrust.com', category: 'Corporate Executive', interest: 'Equity Stake', status: 'New Lead' },
];

export default function PromoterPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [promoterName, setPromoterName] = useState('Anisur Rahman');
  const [promoterCode, setPromoterCode] = useState('PROMO-ANISUR7');
  const [copied, setCopied] = useState(false);

  // CRM Leads state
  const [leads, setLeads] = useState(initialLeads);
  
  // New Lead Form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCategory, setNewLeadCategory] = useState('NRB Expatriate');
  const [newLeadInterest, setNewLeadInterest] = useState('Franchise Yield (18%)');

  // Pitch script selector state
  const [selectedScript, setSelectedScript] = useState('Franchise');

  const TARGET_LEADS = 50;
  const loggedLeadsCount = 38 + leads.length - initialLeads.length; // Simulated baseline 38 + new ones
  const progressPercent = Math.min(100, Math.round((loggedLeadsCount / TARGET_LEADS) * 100));
  const isUnlocked = loggedLeadsCount >= TARGET_LEADS;

  const referralLink = `http://localhost:3000/showcase?ref=${promoterCode}`;

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;
    const newEntry = {
      id: `LD-${100 + leads.length + 1}`,
      name: newLeadName,
      phone: newLeadPhone,
      email: newLeadEmail || 'lead@example.com',
      category: newLeadCategory,
      interest: newLeadInterest,
      status: 'New Lead'
    };
    setLeads([newEntry, ...leads]);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate WhatsApp pre-filled text
  const getWhatsAppPitch = (lead) => {
    let message = '';
    if (selectedScript === 'Franchise') {
      message = `Hello ${lead.name}, I wanted to share an exclusive high-yield opportunity with GRO10X Capital. ORO Roasters is expanding their Mirpur outlet offering 18% IRR asset-backed yield with 7-month advance rent security. Check out the verified deal here: ${referralLink}`;
    } else if (selectedScript === 'Debt') {
      message = `Hi ${lead.name}, GRO10X Capital just released a short-term coffee bean LC financing round with 24% APR tenor over 6 months backed by stock pledge. Review the audited metrics: ${referralLink}`;
    } else {
      message = `Dear ${lead.name}, GRO10X Capital's Private Cash Concierge handles discreet HNI capital placements with full legal SPV security. Learn more: ${referralLink}`;
    }
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Generate Email mailto link
  const getEmailPitch = (lead) => {
    const subject = encodeURIComponent(`Exclusive Investment Opportunity - GRO10X Capital`);
    const body = encodeURIComponent(`Dear ${lead.name},\n\nI am sharing a verified investment opportunity on GRO10X Capital.\n\nTarget Deal: ${lead.interest}\nReferral Link: ${referralLink}\n\nAll deals are KAM-audited with physical asset backing.\n\nBest regards,\n${promoterName}`);
    return `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f59e0b, #b45309)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            P
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>PROMOTER <span style={{ color: '#f59e0b' }}>CRM & GTM ENGINE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v0.2.4 & v0.2.5 - 50-Lead Portfolio Gateway & Outreach</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            <Globe size={16} style={{ color: '#f59e0b' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>
          <a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Deal Showcase <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* GAMIFIED 50-LEAD PORTFOLIO GATEWAY BANNER */}
        <div className="glass-card" style={{ borderColor: isUnlocked ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)', background: isUnlocked ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(7,10,20,0.8))' : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(7,10,20,0.8))', marginBottom: '2.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {isUnlocked ? (
                  <span className="badge-gold" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', borderColor: 'rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Unlock size={14} /> ACTIVE PROMOTER STATUS
                  </span>
                ) : (
                  <span className="badge-gold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={14} /> SILENT PORTFOLIO BUILDING PHASE
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Goal: 50 Investor Leads</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                {isUnlocked ? '🎉 Deal Promotion Link Unlocked!' : 'Build Your 50-Investor Network to Unlock Deal Links'}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: isUnlocked ? '#10b981' : '#f59e0b' }}>
                {loggedLeadsCount} / {TARGET_LEADS}
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Leads Logged ({progressPercent}%)</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: isUnlocked ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #D4AF37)' }}></div>
          </div>

          {/* LINK SECTION */}
          {isUnlocked ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" readOnly value={referralLink} className="form-input" style={{ fontWeight: '600', color: '#10b981' }} />
              <button onClick={handleCopyLink} className="btn-gold" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0 1.5rem', whiteSpace: 'nowrap', border: 'none', color: '#fff', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {copied ? <CheckCircle2 size= {18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Active Link'}
              </button>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: '#f59e0b' }} /> Log {TARGET_LEADS - loggedLeadsCount} more investor leads below to automatically generate your official 0.5% commission deal link.
            </p>
          )}
        </div>

        {/* TWO COLUMN WORKSPACE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2.5rem' }}>
          
          {/* LEFT: LOG NEW LEAD FORM */}
          <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} style={{ color: '#f59e0b' }} /> Log Investor Lead (Silent Survey)
            </h3>

            <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Investor Full Name / Alias</label>
                <input type="text" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} className="form-input" placeholder="e.g. Engr. Shafiqul Islam" required />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>WhatsApp Phone Number</label>
                <input type="text" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} className="form-input" placeholder="+8801700000000" required />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Email Address (Optional)</label>
                <input type="email" value={newLeadEmail} onChange={(e) => setNewLeadEmail(e.target.value)} className="form-input" placeholder="investor@domain.com" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Category</label>
                  <select value={newLeadCategory} onChange={(e) => setNewLeadCategory(e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }}>
                    <option>NRB Expatriate</option>
                    <option>Local HNI</option>
                    <option>Corporate Executive</option>
                    <option>Real Estate Buyer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Preferred Instrument</label>
                  <select value={newLeadInterest} onChange={(e) => setNewLeadInterest(e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }}>
                    <option>Franchise Yield (18%)</option>
                    <option>Short-Term Debt (24%)</option>
                    <option>Equity Stake</option>
                    <option>Distribution Rights</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070a14', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <UserCheck size={18} /> Save Lead to Personal Portfolio
              </button>
            </form>
          </div>

          {/* RIGHT: LEADS CRM & SEMI-AUTOMATED OUTREACH ENGINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* SCRIPT SELECTOR FOR SEMI-AUTOMATION */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} /> Semi-Automated Outreach Script Selector
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero API Cost Outreach</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'Franchise', label: '18% Franchise Script' },
                  { id: 'Debt', label: '24% Debt LC Script' },
                  { id: 'Concierge', label: 'VIP Concierge Script' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScript(s.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: selectedScript === s.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedScript === s.id ? 'rgba(245,158,11,0.15)' : 'rgba(7,10,20,0.6)',
                      color: selectedScript === s.id ? '#f59e0b' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LEADS LIST WITH WHATSAPP/EMAIL ACTION BUTTONS */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: '#f59e0b' }} /> Logged Investor Portfolio ({leads.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {leads.map((ld) => (
                  <div key={ld.id} style={{ background: 'rgba(7,10,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{ld.name}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {ld.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        {ld.phone} • <span style={{ color: '#D4AF37' }}>{ld.interest}</span>
                      </p>
                    </div>

                    {/* SEMI-AUTOMATED OUTREACH BUTTONS */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* WHATSAPP BUTTON */}
                      <a 
                        href={getWhatsAppPitch(ld)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <MessageSquare size={14} /> WhatsApp Pitch
                      </a>

                      {/* EMAIL BUTTON */}
                      <a 
                        href={getEmailPitch(ld)}
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Mail size={14} /> Mailto
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
