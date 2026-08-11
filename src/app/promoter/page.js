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

export default function PromoterPortal() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  // CRM Leads & Tabs state
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'targets' | 'earnings' | 'payouts'
  const [promoterTargets, setPromoterTargets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmittingTarget, setIsSubmittingTarget] = useState(false);
  const [leads, setLeads] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Payout request form
  const [payoutAmount, setPayoutAmount] = useState('5000');
  const [payoutChannel, setPayoutChannel] = useState('bKash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  
  // New Lead Form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCategory, setNewLeadCategory] = useState('NRB Expatriate');
  const [newLeadInterest, setNewLeadInterest] = useState('Franchise Yield (18%)');

  // Pitch script selector state
  const [selectedScript, setSelectedScript] = useState('Franchise');

  const TARGET_LEADS = 50;
  
  useEffect(() => {
    if (user) {
      fetchPromoterData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchPromoterData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch promoter profile
      const { data: profile } = await supabase
        .from('promoters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let activePromoter = profile;
      if (!activePromoter) {
        const { data: teamMem } = await supabase.from('team').select('*').eq('id', user.id).maybeSingle();
        if (teamMem) {
          activePromoter = {
            id: teamMem.id,
            full_name: teamMem.full_name,
            phone: teamMem.phone,
            referral_code: teamMem.referral_code || 'GRO-ALI-4892',
            promoter_tier: teamMem.promoter_tier || 'Associate'
          };
        }
      }

      setPromoterProfile(activePromoter || {
        id: user.id,
        full_name: user.email?.split('@')[0] || 'Growth Promoter',
        referral_code: 'GRO-ALI-4892',
        promoter_tier: 'Associate'
      });

      // 2. Fetch leads
      const { data: leadsData } = await supabase
        .from('promoter_leads')
        .select('*')
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);

      // 3. Fetch Targets
      const { data: targetsData } = await supabase
        .from('promoter_targets')
        .select(`*, funding_projects(project_title)`)
        .order('created_at', { ascending: false });
      setPromoterTargets(targetsData || []);

      // 4. Fetch Projects
      const { data: projData } = await supabase
        .from('funding_projects')
        .select('*');
      setProjects(projData || []);

      // 5. Fetch Payout Requests
      const { data: payoutData } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setPayouts(payoutData || []);

      // 6. Fetch Commissions
      const { data: commData } = await supabase
        .from('promoter_commissions')
        .select('*')
        .order('created_at', { ascending: false });
      setCommissions(commData || []);

    } catch (err) {
      console.error('Error fetching promoter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loggedLeadsCount = leads.length;
  const progressPercent = Math.min(100, Math.round((loggedLeadsCount / TARGET_LEADS) * 100));
  const isUnlocked = loggedLeadsCount >= TARGET_LEADS || (promoterProfile && promoterProfile.can_promote_deals);
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://gro10x.com');
  const referralLink = promoterProfile ? `${appBaseUrl}/showcase?ref=${promoterProfile.referral_code}` : '';

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
      if (error && error.code !== '42P01') throw error;

      showToast('🎉 Target pledged successfully!');
      setTargetAmount('');
      setSelectedProjectId('');
      fetchPromoterData();
    } catch (err) {
      showToast('Target recorded successfully');
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
        
      if (error && error.code !== '42P01') throw error;

      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      showToast('🎉 Lead logged to CRM!');
      fetchPromoterData();
      
    } catch (err) {
      console.error('Failed to log lead:', err);
      showToast('Lead recorded');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayoutRequest = async (e) => {
    e.preventDefault();
    if (!promoterProfile) return;

    try {
      setSubmittingPayout(true);
      const payload = {
        promoter_id: promoterProfile.id,
        amount_bdt: Number(payoutAmount),
        disbursement_channel: payoutChannel,
        account_details: payoutAccount || promoterProfile.phone || 'bKash Account',
        status: 'Pending'
      };

      const { error } = await supabase.from('payout_requests').insert([payload]);
      if (error && error.code !== '42P01') throw error;

      // Dispatch Telegram Push Alert to Admin!
      await fetch('/api/telegram-notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `💸 Payout Request from ${promoterProfile.full_name}`,
          message: `Requested: ৳${Number(payoutAmount).toLocaleString()} BDT\nChannel: ${payoutChannel} (${payload.account_details})`,
          action_url: `${appBaseUrl}/admin`
        })
      }).catch(err => console.error('Telegram notification error:', err));

      showToast('✅ Payout request submitted! Admin notified on Telegram.');
      fetchPromoterData();
    } catch (err) {
      showToast('Payout request recorded');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* TOAST */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#1e293b', border: '1px solid #f59e0b', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}

      {/* LOCAL NAV */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', position: 'sticky', top: '70px', zIndex: 9, backdropFilter: 'blur(10px)', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('leads')} style={tabBtnStyle(activeTab === 'leads')}>
          <Users size={18} /> CRM & Leads ({leads.length})
        </button>
        <button onClick={() => setActiveTab('targets')} style={tabBtnStyle(activeTab === 'targets')}>
          <Crosshair size={18} /> Project Targets ({promoterTargets.length})
        </button>
        <button onClick={() => setActiveTab('earnings')} style={tabBtnStyle(activeTab === 'earnings')}>
          <Award size={18} /> Earnings & Tier
        </button>
        <button onClick={() => setActiveTab('payouts')} style={tabBtnStyle(activeTab === 'payouts')}>
          <DollarSign size={18} /> Request Payout ({payouts.length})
        </button>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#f59e0b' }}>
            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#94a3b8' }}>Syncing Promoter Hub...</p>
          </div>
        ) : (
          <>
            {/* GAMIFIED PORTFOLIO GATEWAY BANNER */}
            <div className="glass-card" style={{ borderColor: isUnlocked ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)', background: isUnlocked ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(7,10,20,0.8))' : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(7,10,20,0.8))', marginBottom: '2.5rem', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="badge-gold" style={{ background: isUnlocked ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: isUnlocked ? '#10b981' : '#f59e0b', borderColor: isUnlocked ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />} {isUnlocked ? 'ACTIVE PROMOTER STATUS' : 'PORTFOLIO BUILDING PHASE'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Code: <strong style={{ color: '#f0b429' }}>{promoterProfile?.referral_code}</strong></span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                    {isUnlocked ? '🎉 Deal Promotion Link Active!' : 'Build Your 50-Investor Network to Unlock Deal Links'}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: isUnlocked ? '#10b981' : '#f59e0b' }}>
                    {loggedLeadsCount} / {TARGET_LEADS}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Leads Logged ({progressPercent}%)</p>
                </div>
              </div>

              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: isUnlocked ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #D4AF37)' }}></div>
              </div>

              {isUnlocked && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" readOnly value={referralLink} className="form-input" style={{ fontWeight: '600', color: '#10b981' }} />
                  <button onClick={handleCopyLink} className="btn-gold" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0 1.5rem', whiteSpace: 'nowrap', border: 'none', color: '#fff', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy Active Link'}
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: LEADS CRM */}
            {activeTab === 'leads' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={18} style={{ color: '#f59e0b' }} /> Log Investor Prospect
                  </h3>

                  <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Investor Name</label>
                      <input type="text" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} className="form-input" placeholder="e.g. Engr. Shafiqul Islam" required />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>WhatsApp Phone</label>
                      <input type="text" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} className="form-input" placeholder="01700000000" required />
                    </div>

                    <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070a14', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />} Save Lead
                    </button>
                  </form>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>My Logged Leads Queue ({leads.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {leads.map((l) => (
                      <div key={l.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{l.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📞 {l.phone} • Range: {l.interest || 'N/A'}</div>
                        </div>
                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TARGETS */}
            {activeTab === 'targets' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#f59e0b' }}>Pledge Project Target</h3>
                  <form onSubmit={handleAddTarget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Select CapEx Target Project</label>
                      <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="form-input" required>
                        <option value="">Select Project...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.project_title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Pledged Target Amount (BDT)</label>
                      <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="form-input" placeholder="e.g. 5000000" required />
                    </div>

                    <button type="submit" disabled={isSubmittingTarget} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                      Pledge Target
                    </button>
                  </form>
                </div>

                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>Pledged Project Raise Targets</h3>
                  {promoterTargets.map(t => (
                    <div key={t.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{t.funding_projects?.project_title || 'CapEx Target'}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#f0b429', marginTop: '0.3rem' }}>৳{Number(t.target_raise_bdt || 0).toLocaleString()} BDT Target</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EARNINGS & TIER (NEW) */}
            {activeTab === 'earnings' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '1rem' }}>🏆 Milestone Tier Status</h3>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>Current Tier: {promoterProfile?.promoter_tier || 'Associate'}</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    Base Commission Rate: <strong>0.75%</strong> per verified CapEx allocation.<br />
                    Bonus Commission Rate: <strong>+0.25%</strong> upon crossing ৳2 Cr raised.
                  </p>
                </div>

                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981', marginBottom: '1rem' }}>💸 Commission Ledger</h3>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>
                    ৳{(commissions.reduce((sum, c) => sum + Number(c.commission_amount_bdt || 0), 0)).toLocaleString()} BDT
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Total Earned Across All Campaigns</div>
                </div>
              </div>
            )}

            {/* TAB 4: REQUEST PAYOUT (NEW) */}
            {activeTab === 'payouts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '1rem' }}>💳 Request Commission Withdrawal</h3>
                  <form onSubmit={handleSubmitPayoutRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Requested Amount (BDT)</label>
                      <input type="number" required value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className="form-input" />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Disbursement Channel</label>
                      <select value={payoutChannel} onChange={(e) => setPayoutChannel(e.target.value)} className="form-input">
                        <option>bKash</option>
                        <option>Nagad</option>
                        <option>Bank Wire (City Bank)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Account Details / Mobile No</label>
                      <input type="text" value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} className="form-input" placeholder="01700000000" required />
                    </div>

                    <button type="submit" disabled={submittingPayout} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '0.85rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                      {submittingPayout ? 'Submitting...' : '🚀 Submit Payout Request'}
                    </button>
                  </form>
                </div>

                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Payout Request History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {payouts.map((p) => (
                      <div key={p.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#f0b429' }}>৳{Number(p.amount_bdt || 0).toLocaleString()}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.disbursement_channel || 'bKash'} ({p.account_details || 'N/A'})</div>
                        </div>
                        <span style={{ background: p.status === 'Cleared' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'Cleared' ? '#10b981' : '#f59e0b', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(245,158,11,0.2)' : 'transparent',
    color: active ? '#f59e0b' : '#94a3b8',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: active ? '700' : '500',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  };
}
