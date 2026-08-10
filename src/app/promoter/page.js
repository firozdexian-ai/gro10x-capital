'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, DollarSign, Link2, Copy, CheckCircle2, 
  ArrowUpRight, Award, ChevronRight, Share2, ShieldCheck, UserCheck,
  Lock, Unlock, MessageSquare, Mail, PlusCircle, Globe, Send, Sparkles, Loader2, Target, Crosshair
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function PromoterPortal() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  // CRM Leads state
  const [activeTab, setActiveTab] = useState('leads'); // leads, targets
  const [promoterTargets, setPromoterTargets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmittingTarget, setIsSubmittingTarget] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Lead Form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCategory, setNewLeadCategory] = useState('NRB Expatriate');
  const [newLeadInterest, setNewLeadInterest] = useState('Franchise Yield (18%)');

  // Pitch script selector state
  const [selectedScript, setSelectedScript] = useState('Franchise');
  const { addToast } = useToast();

  const TARGET_LEADS = 50;
  
  useEffect(() => {
    if (user) {
      fetchPromoterData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPromoterData = async () => {
    try {
      setLoading(true);
      // Fetch promoter profile
      const { data: profile, error: profErr } = await supabase
        .from('promoters')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profErr) {
        if (profErr.code !== 'PGRST116') throw profErr;
        // Not a promoter yet, or profile not setup
        setLoading(false);
        return;
      }
      
      setPromoterProfile(profile);

      // Fetch leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from('promoter_leads')
        .select('*')
        .eq('promoter_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (leadsErr) throw leadsErr;
      setLeads(leadsData || []);

      // Fetch Targets
      const { data: targetsData } = await supabase
        .from('promoter_targets')
        .select(`*, funding_projects(project_title)`)
        .eq('promoter_id', profile.id)
        .order('created_at', { ascending: false });
      setPromoterTargets(targetsData || []);

      // Fetch Projects
      const { data: projData } = await supabase
        .from('funding_projects')
        .select('*')
        .eq('status', 'Active');
      setProjects(projData || []);

    } catch (err) {
      console.error('Error fetching promoter data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gamification Logic
  const loggedLeadsCount = leads.length;
  const progressPercent = Math.min(100, Math.round((loggedLeadsCount / TARGET_LEADS) * 100));
  const isUnlocked = loggedLeadsCount >= TARGET_LEADS || (promoterProfile && promoterProfile.can_promote_deals);
  const referralLink = promoterProfile ? `http://localhost:3000/showcase?ref=${promoterProfile.referral_code}` : '';

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !targetAmount || !promoterProfile) return;
    try {
      setIsSubmittingTarget(true);
      const { error } = await supabase.from('promoter_targets').insert([{
        promoter_id: promoterProfile.id,
        project_id: selectedProjectId,
        target_raise_bdt: targetAmount
      }]);
      if (error) {
        if (error.code === '23505') throw new Error('You already pledged a target for this project.');
        throw error;
      }
      addToast('Target pledged successfully!', 'success');
      setTargetAmount('');
      setSelectedProjectId('');
      fetchPromoterData();
    } catch (err) {
      addToast(err.message || 'Error saving target.', 'error');
    } finally {
      setIsSubmittingTarget(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone || !promoterProfile) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('promoter_leads')
        .insert([{
          promoter_id: promoterProfile.id,
          name: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail || null,
          category: newLeadCategory,
          interest: newLeadInterest,
          status: 'New Lead'
        }]);
        
      if (error) throw error;

      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      addToast('Lead logged successfully!', 'success');
      fetchPromoterData(); // Refresh list
      
    } catch (err) {
      console.error('Failed to log lead:', err);
      addToast('Failed to log lead to Supabase.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addToast('Referral link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
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
    const promoterName = promoterProfile?.full_name || 'Your Promoter';
    const body = encodeURIComponent(`Dear ${lead.name},\n\nI am sharing a verified investment opportunity on GRO10X Capital.\n\nTarget Deal: ${lead.interest}\nReferral Link: ${referralLink}\n\nAll deals are KAM-audited with physical asset backing.\n\nBest regards,\n${promoterName}`);
    return `mailto:${lead.email || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* LOCAL NAV (Under the global Navigation) */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', position: 'sticky', top: '70px', zIndex: 9, backdropFilter: 'blur(10px)' }}>
        <button onClick={() => setActiveTab('leads')} style={tabBtnStyle(activeTab === 'leads')}>
          <Users size={18} /> CRM & Leads
        </button>
        <button onClick={() => setActiveTab('targets')} style={tabBtnStyle(activeTab === 'targets')}>
          <Crosshair size={18} /> Project Targets
        </button>
        <a href="/payouts" style={{ ...tabBtnStyle(false), textDecoration: 'none' }}>
          <DollarSign size={18} /> Payouts & Commission
        </a>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#f59e0b' }}>
            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#94a3b8' }}>Syncing with GRO10X Promoter Engine...</p>
          </div>
        ) : !promoterProfile ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderColor: 'rgba(245,158,11,0.3)' }}>
             <ShieldCheck size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
             <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Promoter Profile Found</h3>
             <p style={{ color: '#94a3b8' }}>Your account is not configured as a Promoter. Please contact the Admin to register your Referral Code.</p>
          </div>
        ) : activeTab === 'leads' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
          <>
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
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Goal: {TARGET_LEADS} Investor Leads</span>
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
                  <ShieldCheck size={16} style={{ color: '#f59e0b' }} /> Log {Math.max(0, TARGET_LEADS - loggedLeadsCount)} more investor leads below to automatically generate your official 0.5% commission deal link.
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

                  <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070a14', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />} 
                    {isSubmitting ? 'Saving...' : 'Save Lead to Personal Portfolio'}
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

                  {leads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      No leads logged yet. Start building your portfolio!
                    </div>
                  ) : (
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
                            <a 
                              href={getWhatsAppPitch(ld)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: !isUnlocked ? 0.5 : 1, pointerEvents: !isUnlocked ? 'none' : 'auto' }}
                            >
                              <MessageSquare size={14} /> WhatsApp
                            </a>
                            <a 
                              href={getEmailPitch(ld)}
                              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: !isUnlocked ? 0.5 : 1, pointerEvents: !isUnlocked ? 'none' : 'auto' }}
                            >
                              <Mail size={14} /> Mail
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
          </div>
        ) : activeTab === 'targets' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.2rem' }}>Pledged Project Targets</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Pledge to raise capital for specific projects to earn an additional 0.25% retroactive commission bonus!</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(245,158,11,0.3)', background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(7,10,20,0.8))' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} style={{ color: '#f59e0b' }} /> Pledge New Target
              </h3>
              <form onSubmit={handleAddTarget} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Project</label>
                  <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="form-input" required>
                    <option value="">-- Choose a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Raise (BDT)</label>
                  <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="form-input" placeholder="e.g. 5000000" required />
                </div>
                <button type="submit" disabled={isSubmittingTarget} className="btn-gold" style={{ padding: '0.8rem 1.5rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {isSubmittingTarget ? <Loader2 className="animate-spin" size={18} /> : 'Pledge Target'}
                </button>
              </form>
            </div>

            {promoterTargets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>You have not pledged any targets yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {promoterTargets.map(t => {
                  const percent = Math.min(100, (t.amount_raised_bdt / t.target_raise_bdt) * 100);
                  const isHit = t.status === 'Target_Hit' || percent >= 100;
                  return (
                    <div key={t.id} className="glass-card" style={{ padding: '1.5rem', borderColor: isHit ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.funding_projects?.project_title}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pledged: {new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isHit ? '#10b981' : '#f59e0b' }}>
                            {percent.toFixed(1)}% Completed
                          </div>
                          <span style={{ fontSize: '0.75rem', background: isHit ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: isHit ? '#10b981' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {isHit ? 'Bonus Unlocked (0.25%)' : 'Tracking (Base 0.75%)'}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: isHit ? '#10b981' : '#f59e0b' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Raised: ৳{formatCurrency(t.amount_raised_bdt, currency)}</span>
                        <span>Target: ৳{formatCurrency(t.target_raise_bdt, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
    color: active ? '#f59e0b' : '#94a3b8',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
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
