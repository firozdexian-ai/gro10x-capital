'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, AlertCircle, PhoneCall, CheckCircle, ShieldCheck, 
  Send, Award, DollarSign, FileText, Share2, Copy, RefreshCw, ChevronRight,
  LogOut, Home, Briefcase, PlusCircle, UserCheck, Layers, ArrowUpRight,
  CheckCircle2, XCircle, CreditCard, Shield, Clock, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// bKash-style Design Tokens
const STYLES = {
  bg: '#0f1a2e',
  cardBg: '#1a2d4a',
  cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
  gold: '#f0b429',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  purple: '#a855f7',
  textMuted: '#94a3b8'
};

export default function TeamMiniAppPage() {
  // Authentication & Telegram WebApp State
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  // App Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'leads' | 'payouts' | 'kyc' | 'me'
  
  // Data States
  const [kpis, setKpis] = useState({ totalAum: 0, activeInvestors: 0, activeProjects: 0, unworkedLeads: 0 });
  const [alerts, setAlerts] = useState({ kycPending: 0, payPending: 0, payoutPending: 0 });
  const [leadsList, setLeadsList] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [kycList, setKycList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [commissionsList, setCommissionsList] = useState([]);
  const [kamTicketsList, setKamTicketsList] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Multi-Step Survey State (bKash-style step wizard)
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyForm, setSurveyForm] = useState({
    name: '',
    phone: '',
    investment_range: '৳50L–1Cr',
    target_category: 'Franchise (Coffee)',
    meeting_preference: 'In Person',
    notes: ''
  });
  const [submittingSurvey, setSubmittingSurvey] = useState(false);

  useEffect(() => {
    initTelegramApp();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const initTelegramApp = async () => {
    try {
      setLoading(true);
      let webApp = null;

      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        setTg(webApp);
      }

      const initData = webApp?.initData || '';

      // Validate initData with backend endpoint
      if (initData) {
        const res = await fetch('/api/miniapp-auth/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.user);
          await loadDashboardData(data.user);
        } else if (res.status === 403) {
          setAuthError(data.message || 'Account not registered in public.team');
        } else {
          setAuthError(data.error || 'Authentication failed');
        }
      } else {
        // Fallback for browser preview / local dev testing
        const { data: teamDev } = await supabase.from('team').select('*').limit(1).maybeSingle();
        if (teamDev) {
          const devUser = {
            id: teamDev.id,
            full_name: teamDev.full_name,
            email: teamDev.email,
            phone: teamDev.phone,
            team_type: teamDev.team_type,
            role: teamDev.team_type === 'promoter' ? 'promoter' : 'admin',
            referral_code: teamDev.referral_code || 'GRO-ALI-4892',
            promoter_tier: teamDev.promoter_tier || 'Associate'
          };
          setUser(devUser);
          await loadDashboardData(devUser);
        } else {
          setAuthError('No dev user found in database for preview mode');
        }
      }
    } catch (err) {
      console.error('MiniApp initialization error:', err);
      setAuthError(err.message || 'Failed to initialize Mini App');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (userData) => {
    try {
      // Fetch KPIs & Alerts with proper status inclusions
      const [
        { data: invs }, 
        { count: activeInvestors }, 
        { count: activeProjects }, 
        { data: leads }, 
        { data: kyc }, 
        { data: pay }, 
        { data: payouts }, 
        { data: projs }, 
        { data: comms }
      ] = await Promise.all([
        supabase.from('investments').select('amount_bdt, amount_invested_bdt'),
        supabase.from('investors').select('*', { count: 'exact', head: true }),
        supabase.from('funding_projects').select('*', { count: 'exact', head: true }),
        supabase.from('inquiry_leads').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('kyc_submissions').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(10),
        supabase.from('payment_submissions').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(10),
        supabase.from('payout_requests').select('*, team(full_name), promoters(full_name, phone)').in('status', ['Pending', 'Pending Verification']).order('created_at', { ascending: false }),
        supabase.from('funding_projects').select('*, businesses(brand_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('promoter_commissions').select('*').limit(10)
      ]);

      const totalAum = (invs || []).reduce((sum, i) => sum + Number(i.amount_bdt || i.amount_invested_bdt || 0), 0);
      const unworked = (leads || []).filter(l => l.status === 'New').length;

      setKpis({ totalAum, activeInvestors: activeInvestors || 0, activeProjects: activeProjects || 0, unworkedLeads: unworked });
      setAlerts({ kycPending: kyc?.length || 0, payPending: pay?.length || 0, payoutPending: payouts?.length || 0 });
      setLeadsList(leads || []);
      setKycList(kyc || []);
      setPaymentsList(pay || []);
      setPayoutsList(payouts || []);
      setProjectsList(projs || []);
      setCommissionsList(comms || []);

      // KAM-specific: fetch cash concierge OTC tickets
      if (userData?.team_type === 'kam') {
        const { data: kamTickets } = await supabase
          .from('cash_tickets')
          .select(`
            id, ticket_amount_bdt, status, preferred_meeting_time, created_at,
            investors(alias_name, full_name, requires_anonymity),
            funding_projects!target_project_id(project_title)
          `)
          .not('status', 'eq', 'Closed')
          .order('created_at', { ascending: false })
          .limit(20);
        setKamTicketsList(kamTickets || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Actions
  const handleApprovePayout = async (payoutId) => {
    try {
      const { data: updatedPayout, error } = await supabase
        .from('payout_requests')
        .update({ status: 'Cleared' })
        .eq('id', payoutId)
        .select('*, promoters(full_name, phone)')
        .single();

      if (error) throw error;

      setPayoutsList(prev => prev.filter(p => p.id !== payoutId));
      setAlerts(prev => ({ ...prev, payoutPending: Math.max(0, prev.payoutPending - 1) }));
      showToast('✅ Payout cleared successfully!');
      if (tg) tg.sendData(`payout_approved:${payoutId}`);
    } catch (err) {
      console.error('Approve payout error:', err);
      showToast('❌ Failed to clear payout');
    }
  };

  const handleRejectPayout = async (payoutId) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Rejected' })
        .eq('id', payoutId);

      if (error) throw error;

      setPayoutsList(prev => prev.filter(p => p.id !== payoutId));
      setAlerts(prev => ({ ...prev, payoutPending: Math.max(0, prev.payoutPending - 1) }));
      showToast('❌ Payout rejected');
      if (tg) tg.sendData(`payout_rejected:${payoutId}`);
    } catch (err) {
      console.error('Reject payout error:', err);
      showToast('Failed to reject payout');
    }
  };

  const handleApproveKyc = async (kycId) => {
    try {
      await supabase.from('kyc_submissions').update({ status: 'Verified' }).eq('id', kycId);
      setKycList(prev => prev.filter(k => k.id !== kycId));
      setAlerts(prev => ({ ...prev, kycPending: Math.max(0, prev.kycPending - 1) }));
      showToast('✅ KYC verified successfully!');
    } catch (err) {
      showToast('❌ Failed to verify KYC');
    }
  };

  const handleVerifyPayment = async (payId) => {
    try {
      await supabase.from('payment_submissions').update({ status: 'Verified' }).eq('id', payId);
      setPaymentsList(prev => prev.filter(p => p.id !== payId));
      setAlerts(prev => ({ ...prev, payPending: Math.max(0, prev.payPending - 1) }));
      showToast('✅ Deposit payment verified!');
    } catch (err) {
      showToast('❌ Failed to verify payment');
    }
  };

  const handleRequestPinInChat = async () => {
    try {
      const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await supabase.from('telegram_auth_pins').insert([{
        phone_number: user.phone,
        telegram_chat_id: String(user.telegram_chat_id || user.id),
        user_role: user.role,
        temp_pin: tempPin,
        pin_expires_at: expiresAt,
        is_verified: false,
        linked_entity_id: user.id
      }]);

      showToast(`🔑 PIN Issued: ${tempPin} (Expires in 15m)`);
      if (tg) tg.sendData(`pin_issued:${tempPin}`);
    } catch (err) {
      showToast('Failed to issue PIN');
    }
  };

  const handleSubmitSurvey = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmittingSurvey(true);
      const leadPayload = {
        name: surveyForm.name,
        phone: surveyForm.phone,
        email: `${surveyForm.phone.replace(/[^0-9]/g, '')}@lead.gro10x.com`,
        investment_range: surveyForm.investment_range,
        source_channel: 'Telegram_MiniApp_Survey',
        status: 'New',
        notes: `Interest: ${surveyForm.target_category} | Meeting: ${surveyForm.meeting_preference} | ${surveyForm.notes}`,
        referral_code: user?.referral_code || null
      };

      const { data, error } = await supabase.from('inquiry_leads').insert([leadPayload]).select();
      if (error) throw error;

      showToast('🎉 Investor survey submitted!');
      setShowSurveyModal(false);
      setSurveyStep(1);
      setSurveyForm({ name: '', phone: '', investment_range: '৳50L–1Cr', target_category: 'Franchise (Coffee)', meeting_preference: 'In Person', notes: '' });
      if (tg) tg.sendData(`survey_complete:${data?.[0]?.id || 'new'}`);
      await loadDashboardData(user);
    } catch (err) {
      showToast(`❌ Submission failed: ${err.message}`);
    } finally {
      setSubmittingSurvey(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: STYLES.bg, display: 'grid', placeItems: 'center', color: STYLES.textMuted }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: STYLES.gold, marginBottom: '1rem' }} />
          <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>Loading GRO10X OS Dashboard...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{ minHeight: '100vh', background: STYLES.bg, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: STYLES.rose, marginBottom: '1.5rem' }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Identity Link Required</h2>
        <p style={{ fontSize: '0.85rem', color: STYLES.textMuted, lineHeight: '1.5', marginBottom: '2rem', maxWidth: '320px' }}>
          {authError}
        </p>
        <button 
          onClick={() => tg ? tg.close() : window.location.reload()}
          style={{ width: '100%', maxWidth: '280px', padding: '0.85rem', background: STYLES.gold, color: '#000', fontWeight: '800', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
        >
          Open Bot Chat & Type /start
        </button>
      </div>
    );
  }

  const isPromoter = user?.team_type === 'promoter';
  const isKam = user?.team_type === 'kam';
  const isAdmin = !isPromoter && !isKam;

  return (
    <div style={{ minHeight: '100vh', background: STYLES.bg, paddingBottom: '5.5rem' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #f0b429', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}

      {/* HEADER BAR (FIXED CSS STICKY) */}
      <header style={{ background: 'rgba(26, 45, 74, 0.88)', backdropFilter: 'blur(12px)', padding: '1rem 1.25rem', borderBottom: STYLES.cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #f0b429, #d97706)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#000', fontWeight: '900', fontSize: '1.1rem' }}>
            G
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff', lineHeight: '1.2' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.68rem', color: STYLES.gold, display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
              <ShieldCheck size={12} /> {user?.team_type?.toUpperCase()} | GRO10X OS
            </div>
          </div>
        </div>

        <button onClick={handleRequestPinInChat} style={{ background: 'rgba(240, 180, 41, 0.15)', border: '1px solid rgba(240, 180, 41, 0.3)', color: STYLES.gold, padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          🔑 PIN
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ padding: '1.25rem' }}>

        {/* ---------------------------------------------------- */}
        {/* TAB: HOME (ADMIN / KAM / PROMOTER) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'home' && (
          <div>
            {/* PROMOTER REFERRAL HERO CARD */}
            {isPromoter && (
              <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(240, 180, 41, 0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: STYLES.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                  🎯 Your Growth Referral Code
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                  {user?.referral_code || 'GRO-ALI-4892'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => { navigator.clipboard?.writeText(user?.referral_code || 'GRO-ALI-4892'); showToast('Code copied!'); }}
                    style={{ flex: 1, background: 'rgba(240, 180, 41, 0.15)', border: '1px solid #f0b429', color: STYLES.gold, padding: '0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
                  >
                    <Copy size={14} /> Copy Code
                  </button>
                  <button 
                    onClick={() => setShowSurveyModal(true)}
                    style={{ flex: 1, background: STYLES.gold, border: 'none', color: '#000', padding: '0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}
                  >
                    <PlusCircle size={14} /> Log Survey
                  </button>
                </div>
              </div>
            )}

            {/* GAMIFIED TIER ROADMAP (PROMOTER ONLY) */}
            {isPromoter && (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} style={{ color: STYLES.gold }} /> Gamified Tier Roadmap
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: STYLES.emerald, padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                    {user?.promoter_tier || 'Associate'} Tier
                  </span>
                </div>
                
                {/* Horizontal Step Dots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '1rem 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', top: '50%', left: 0, width: '65%', height: '2px', background: STYLES.gold, zIndex: 1 }}></div>
                  
                  {['Trainee', 'Junior', 'Associate', 'Senior', 'Elite'].map((t, idx) => {
                    const isDone = idx <= 2;
                    return (
                      <div key={t} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDone ? STYLES.gold : '#0f172a', border: isDone ? 'none' : '2px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', color: '#000', fontSize: '0.65rem', fontWeight: '900' }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: isDone ? STYLES.gold : STYLES.textMuted, fontWeight: '700' }}>{t}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ======= KAM HOME: Portfolio KPIs + Quick Actions + Recent Tickets ======= */}
            {isKam && (
              <div>
                {/* KAM Identity Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1a2d4a, #0f172a)', border: '1px solid rgba(240,180,41,0.4)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', color: STYLES.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                    📁 Managing Partner OS
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
                    {user?.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: STYLES.textMuted }}>
                    Key Account Manager · GRO10X Capital
                  </div>
                </div>

                {/* KAM 2x2 KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Active Projects</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>{kpis.activeProjects}</div>
                    <div style={{ fontSize: '0.65rem', color: STYLES.gold, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Briefcase size={12} /> CapEx Pipeline
                    </div>
                  </div>
                  <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>OTC Tickets</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.blue }}>{kamTicketsList.length}</div>
                    <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CreditCard size={12} /> Active Pipeline
                    </div>
                  </div>
                  <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Pending Review</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.amber }}>
                      {kamTicketsList.filter(t => t.status === 'Pending_Review').length}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: STYLES.amber, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> Awaiting Action
                    </div>
                  </div>
                  <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total AUM</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.emerald }}>
                      ৳{(kpis.totalAum / 10000000).toFixed(1)} Cr
                    </div>
                    <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <TrendingUp size={12} /> Platform CapEx
                    </div>
                  </div>
                </div>

                {/* KAM Quick Actions */}
                <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>⚡ Quick Actions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <button onClick={() => setActiveTab('portfolio')} style={actionCircleStyle}>
                      <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}><Briefcase size={18} /></div>
                      <div style={circleLabelStyle}>Portfolio</div>
                    </button>
                    <button onClick={() => setActiveTab('tickets')} style={actionCircleStyle}>
                      <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}><CreditCard size={18} /></div>
                      <div style={circleLabelStyle}>Tickets</div>
                    </button>
                    <button onClick={() => setShowSurveyModal(true)} style={actionCircleStyle}>
                      <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}><PlusCircle size={18} /></div>
                      <div style={circleLabelStyle}>New Lead</div>
                    </button>
                    <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
                      <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}><ShieldCheck size={18} /></div>
                      <div style={circleLabelStyle}>Web PIN</div>
                    </button>
                  </div>
                </div>

                {/* Recent OTC Tickets Preview */}
                <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🎫 Recent OTC Tickets</span>
                    <span style={{ fontSize: '0.7rem', color: STYLES.gold, cursor: 'pointer' }} onClick={() => setActiveTab('tickets')}>View All →</span>
                  </div>
                  {kamTicketsList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: STYLES.textMuted, fontSize: '0.8rem', padding: '1rem 0' }}>No active OTC tickets</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {kamTicketsList.slice(0, 3).map((t) => {
                        const investor = t.investors;
                        const name = investor?.requires_anonymity ? (investor?.alias_name || '🔒 Anonymous') : (investor?.alias_name || investor?.full_name || 'Investor');
                        const statusColor = t.status === 'Pending_Review' ? STYLES.amber : t.status === 'Meeting_Scheduled' ? STYLES.blue : t.status === 'Funds_Cleared' ? STYLES.emerald : STYLES.textMuted;
                        return (
                          <div key={t.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{name}</div>
                              <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>৳{Number(t.ticket_amount_bdt || 0).toLocaleString()} · {t.funding_projects?.project_title || 'CapEx'}</div>
                            </div>
                            <span style={{ background: `${statusColor}22`, color: statusColor, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {t.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======= ADMIN / PROMOTER HOME KPIs + QUICK ACTIONS ======= */}
            {!isKam && (
              <div>
            {/* 2x2 KPI GRID CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Total AUM Raised</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.gold }}>
                  ৳{(kpis.totalAum / 10000000).toFixed(2)} Cr
                </div>
                <div style={{ fontSize: '0.65rem', color: STYLES.emerald, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <TrendingUp size={12} /> Platform CapEx
                </div>
              </div>

              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Active Investors</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
                  {kpis.activeInvestors}
                </div>
                <div style={{ fontSize: '0.65rem', color: STYLES.blue, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Users size={12} /> KYC Verified
                </div>
              </div>

              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Action Queue</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.amber }}>
                  {alerts.kycPending + alerts.payPending + alerts.payoutPending}
                </div>
                <div style={{ fontSize: '0.65rem', color: STYLES.amber, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <AlertCircle size={12} /> Items Pending
                </div>
              </div>

              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: STYLES.textMuted, marginBottom: '0.3rem' }}>Unworked Leads</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: STYLES.emerald }}>
                  {kpis.unworkedLeads}
                </div>
                <div style={{ fontSize: '0.65rem', color: STYLES.textMuted, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <PhoneCall size={12} /> Inquiry Queue
                </div>
              </div>
            </div>

            {/* BKASH-STYLE CIRCULAR QUICK ACTIONS STRIP */}
            <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem' }}>
                ⚡ Quick Operational Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <button onClick={() => setActiveTab('leads')} style={actionCircleStyle}>
                  <div style={{ ...circleIconStyle, background: 'rgba(59, 130, 246, 0.2)', color: STYLES.blue }}>
                    <Users size={18} />
                  </div>
                  <div style={circleLabelStyle}>Leads</div>
                </button>

                <button onClick={() => setActiveTab('payouts')} style={actionCircleStyle}>
                  <div style={{ ...circleIconStyle, background: 'rgba(240, 180, 41, 0.2)', color: STYLES.gold }}>
                    <DollarSign size={18} />
                  </div>
                  <div style={circleLabelStyle}>Payouts</div>
                </button>

                <button onClick={() => setActiveTab('kyc')} style={actionCircleStyle}>
                  <div style={{ ...circleIconStyle, background: 'rgba(16, 185, 129, 0.2)', color: STYLES.emerald }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div style={circleLabelStyle}>KYC</div>
                </button>

                <button onClick={handleRequestPinInChat} style={actionCircleStyle}>
                  <div style={{ ...circleIconStyle, background: 'rgba(168, 85, 247, 0.2)', color: STYLES.purple }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div style={circleLabelStyle}>Web PIN</div>
                </button>
              </div>
            </div>

            {/* RECENT ACTIVITY LIST */}
            <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 Latest Inquiries Queue</span>
                <span style={{ fontSize: '0.7rem', color: STYLES.gold, cursor: 'pointer' }} onClick={() => setActiveTab('leads')}>View All →</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {leadsList.slice(0, 3).map((lead) => (
                  <div key={lead.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{lead.name}</div>
                      <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>Range: {lead.investment_range || 'N/A'} • {lead.source_channel || 'Web'}</div>
                    </div>
                    <span style={{ background: lead.status === 'New' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: lead.status === 'New' ? STYLES.emerald : STYLES.textMuted, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: LEADS QUEUE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>🎯 Inquiry Lead CRM ({leadsList.length})</h3>
              <button onClick={() => setShowSurveyModal(true)} style={{ background: STYLES.gold, color: '#000', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <PlusCircle size={14} /> New Prospect
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leadsList.map((l) => (
                <div key={l.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{l.name}</div>
                      <div style={{ fontSize: '0.75rem', color: STYLES.gold, fontWeight: '600' }}>📞 {l.phone}</div>
                    </div>
                    <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: STYLES.blue, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                      {l.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, marginBottom: '0.5rem' }}>
                    Target Range: <strong style={{ color: '#fff' }}>{l.investment_range || 'N/A'}</strong>
                  </div>
                  {l.notes && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', background: '#0f172a', padding: '0.5rem', borderRadius: '8px', lineHeight: '1.4' }}>
                      {l.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: KAM PORTFOLIO (KAM ONLY) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'portfolio' && isKam && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>📁 CapEx Portfolio ({projectsList.length})</h3>
            </div>
            {projectsList.length === 0 ? (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <Briefcase size={36} color={STYLES.textMuted} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <div style={{ color: STYLES.textMuted, fontSize: '0.85rem' }}>No projects in portfolio yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {projectsList.map((p) => {
                  const target = Number(p.target_raise_bdt || 0);
                  const raised = Number(p.amount_raised_bdt || 0);
                  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                  return (
                    <div key={p.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{p.businesses?.brand_name || 'GRO10X SPV'}</div>
                          <div style={{ fontSize: '0.75rem', color: STYLES.gold, fontWeight: '600' }}>{p.project_title}</div>
                        </div>
                        <span style={{ background: 'rgba(240,180,41,0.15)', color: STYLES.gold, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                          {p.status || 'Origination'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, marginBottom: '0.4rem' }}>
                        ৳{raised.toLocaleString()} / ৳{target.toLocaleString()} raised
                      </div>
                      <div style={{ background: '#0f172a', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? STYLES.emerald : pct >= 40 ? STYLES.gold : STYLES.blue, borderRadius: '6px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: STYLES.textMuted, marginTop: '0.3rem' }}>{pct}% funded · {p.funding_type}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: KAM OTC CASH TICKETS (KAM ONLY) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'tickets' && isKam && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>🎫 Cash Concierge Tickets ({kamTicketsList.length})</h3>
            </div>
            {kamTicketsList.length === 0 ? (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <CreditCard size={36} color={STYLES.textMuted} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <div style={{ color: STYLES.textMuted, fontSize: '0.85rem' }}>No active OTC tickets</div>
                <div style={{ color: STYLES.textMuted, fontSize: '0.75rem', marginTop: '0.3rem' }}>All consultations are complete</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kamTicketsList.map((t) => {
                  const investor = t.investors;
                  const name = investor?.requires_anonymity
                    ? (investor?.alias_name || '🔒 Anonymous OTC')
                    : (investor?.alias_name || investor?.full_name || 'Investor');
                  const statusColor = t.status === 'Pending_Review' ? STYLES.amber : t.status === 'Meeting_Scheduled' ? STYLES.blue : t.status === 'Funds_Cleared' ? STYLES.emerald : STYLES.textMuted;
                  return (
                    <div key={t.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{name}</div>
                          <div style={{ fontSize: '0.7rem', color: STYLES.gold }}>#{t.id.slice(0, 8)}</div>
                        </div>
                        <span style={{ background: `${statusColor}22`, color: statusColor, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {t.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: STYLES.gold, marginBottom: '0.3rem' }}>
                        ৳{Number(t.ticket_amount_bdt || 0).toLocaleString()} BDT
                      </div>
                      <div style={{ fontSize: '0.72rem', color: STYLES.textMuted }}>
                        → {t.funding_projects?.project_title || 'CapEx Target'}
                      </div>
                      {t.preferred_meeting_time && (
                        <div style={{ fontSize: '0.72rem', color: STYLES.blue, marginTop: '0.3rem' }}>
                          📅 Preferred: {t.preferred_meeting_time}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: PAYOUTS APPROVAL QUEUE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'payouts' && (

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>💳 Commission Payout Queue ({payoutsList.length})</h3>
            
            {payoutsList.length === 0 ? (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <CheckCircle2 size={36} color={STYLES.emerald} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.95rem' }}>All Payouts Cleared!</div>
                <p style={{ color: STYLES.textMuted, fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>No pending commission withdrawal requests in queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {payoutsList.map((p) => (
                  <div key={p.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                        {p.promoters?.full_name || p.team?.full_name || 'Capital Promoter'}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: STYLES.gold }}>
                        ৳{Number(p.amount_bdt || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, marginBottom: '0.75rem' }}>
                      Channel: <strong style={{ color: '#cbd5e1' }}>{p.disbursement_channel || 'bKash'}</strong> ({p.account_details || 'N/A'})
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApprovePayout(p.id)} style={{ flex: 1, background: STYLES.emerald, color: '#000', border: 'none', padding: '0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                        ✅ Approve & Disburse
                      </button>
                      <button onClick={() => handleRejectPayout(p.id)} style={{ flex: 1, background: 'rgba(244, 63, 94, 0.2)', color: STYLES.rose, border: '1px solid rgba(244, 63, 94, 0.4)', padding: '0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: KYC REVIEW (ADMIN QUICK ACTION) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'kyc' && (
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>🛡️ KYC Submissions Queue ({kycList.length})</h3>
            
            {kycList.length === 0 ? (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <CheckCircle2 size={36} color={STYLES.emerald} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.95rem' }}>All KYC Submissions Cleared!</div>
                <p style={{ color: STYLES.textMuted, fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>No pending identity verification submissions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kycList.map((k) => (
                  <div key={k.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{k.full_name}</div>
                      <span style={{ background: 'rgba(240, 180, 41, 0.15)', color: STYLES.gold, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                        Pending Review
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, marginBottom: '0.65rem' }}>
                      NID / Passport: <strong style={{ color: '#fff' }}>{k.nid_number || 'Attached'}</strong> • Date: {new Date(k.created_at).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApproveKyc(k.id)} style={{ flex: 1, background: STYLES.emerald, color: '#000', border: 'none', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                        ✓ Verify KYC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: ME & PROFILE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'me' && (
          <div>
            <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '16px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #f0b429, #d97706)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#000', fontWeight: '900', fontSize: '1.8rem', margin: '0 auto 1rem auto' }}>
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{user?.full_name}</h3>
              <div style={{ fontSize: '0.8rem', color: STYLES.gold, fontWeight: '700', marginBottom: '1rem' }}>{user?.team_type?.toUpperCase()} | GRO10X OS</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', background: '#0f172a', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', color: STYLES.textMuted }}>
                <div>📧 Email: <strong style={{ color: '#fff' }}>{user?.email}</strong></div>
                <div>📞 Phone: <strong style={{ color: '#fff' }}>{user?.phone}</strong></div>
                {user?.referral_code && <div>🎯 Code: <strong style={{ color: STYLES.gold }}>{user?.referral_code}</strong></div>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handleRequestPinInChat} style={{ width: '100%', padding: '0.85rem', background: STYLES.gold, color: '#000', fontWeight: '800', border: 'none', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                🔑 Request New Web Login PIN
              </button>
              <button onClick={() => tg ? tg.close() : null} style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.05)', color: STYLES.textMuted, fontWeight: '700', border: STYLES.cardBorder, borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Close Mini App
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MULTI-STEP BKASH-STYLE INVESTOR SURVEY MODAL */}
      {showSurveyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 26, 46, 0.95)', backdropFilter: 'blur(10px)', zIndex: 100, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '20px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: STYLES.gold, textTransform: 'uppercase' }}>
                Step {surveyStep} of 5 — Investor Prospect
              </div>
              <button onClick={() => setShowSurveyModal(false)} style={{ background: 'none', border: 'none', color: STYLES.textMuted, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitSurvey}>
              {surveyStep === 1 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Prospect Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={surveyForm.name} 
                    onChange={(e) => setSurveyForm({ ...surveyForm, name: e.target.value })}
                    placeholder="e.g. Engr. Shafiqul Islam" 
                    style={inputStyle} 
                  />
                  <button type="button" onClick={() => surveyForm.name && setSurveyStep(2)} style={modalNextBtn}>Next → Phone Number</button>
                </div>
              )}

              {surveyStep === 2 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Phone Number (WhatsApp) *</label>
                  <input 
                    type="tel" 
                    required 
                    value={surveyForm.phone} 
                    onChange={(e) => setSurveyForm({ ...surveyForm, phone: e.target.value })}
                    placeholder="01700000000" 
                    style={inputStyle} 
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setSurveyStep(1)} style={modalBackBtn}>← Back</button>
                    <button type="button" onClick={() => surveyForm.phone && setSurveyStep(3)} style={{ ...modalNextBtn, marginTop: 0 }}>Next → Capacity</button>
                  </div>
                </div>
              )}

              {surveyStep === 3 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>Investment Capacity Target</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {['৳5L–25L', '৳25L–50L', '৳50L–1Cr', '৳1Cr+'].map((range) => (
                      <button 
                        key={range} 
                        type="button"
                        onClick={() => setSurveyForm({ ...surveyForm, investment_range: range })}
                        style={{ padding: '0.75rem', borderRadius: '12px', border: surveyForm.investment_range === range ? '2px solid #f0b429' : '1px solid rgba(255,255,255,0.1)', background: surveyForm.investment_range === range ? 'rgba(240, 180, 41, 0.15)' : '#0f172a', color: surveyForm.investment_range === range ? STYLES.gold : '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setSurveyStep(2)} style={modalBackBtn}>← Back</button>
                    <button type="button" onClick={() => setSurveyStep(4)} style={{ ...modalNextBtn, marginTop: 0 }}>Next → Project</button>
                  </div>
                </div>
              )}

              {surveyStep === 4 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>Preferred CapEx Category</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {['Franchise (Coffee / F&B)', 'Direct Short-Term Debt (APR)', 'Equity SPV Block', 'Any / Open to Recommendation'].map((cat) => (
                      <button 
                        key={cat} 
                        type="button"
                        onClick={() => setSurveyForm({ ...surveyForm, target_category: cat })}
                        style={{ padding: '0.75rem', borderRadius: '12px', border: surveyForm.target_category === cat ? '2px solid #f0b429' : '1px solid rgba(255,255,255,0.1)', background: surveyForm.target_category === cat ? 'rgba(240, 180, 41, 0.15)' : '#0f172a', color: surveyForm.target_category === cat ? STYLES.gold : '#fff', fontWeight: '700', fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setSurveyStep(3)} style={modalBackBtn}>← Back</button>
                    <button type="button" onClick={() => setSurveyStep(5)} style={{ ...modalNextBtn, marginTop: 0 }}>Next → Notes</button>
                  </div>
                </div>
              )}

              {surveyStep === 5 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Additional Notes (Optional)</label>
                  <textarea 
                    rows={3} 
                    value={surveyForm.notes} 
                    onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                    placeholder="e.g. Met at Gulshan Club event. Wants meeting next Tuesday." 
                    style={{ ...inputStyle, resize: 'none' }} 
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setSurveyStep(4)} style={modalBackBtn}>← Back</button>
                    <button type="submit" disabled={submittingSurvey} style={{ ...modalNextBtn, marginTop: 0, background: STYLES.gold, color: '#000' }}>
                      {submittingSurvey ? 'Submitting...' : '🚀 Submit Lead'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM FIXED NAVIGATION BAR */}
      {isKam ? (
        /* KAM 4-TAB NAV: Home / Portfolio / Tickets / Me */
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(26, 45, 74, 0.95)', backdropFilter: 'blur(10px)', borderTop: STYLES.cardBorder, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '0.5rem 0', zIndex: 50 }}>
          <button onClick={() => setActiveTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>

          <button onClick={() => setActiveTab('portfolio')} style={navTabStyle(activeTab === 'portfolio')}>
            <Briefcase size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Portfolio</span>
          </button>

          <button onClick={() => setActiveTab('tickets')} style={{ ...navTabStyle(activeTab === 'tickets'), position: 'relative' }}>
            {kamTicketsList.filter(t => t.status === 'Pending_Review').length > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.amber, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {kamTicketsList.filter(t => t.status === 'Pending_Review').length}
              </span>
            )}
            <CreditCard size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Tickets</span>
          </button>

          <button onClick={() => setActiveTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      ) : (
        /* ADMIN / PROMOTER 5-TAB NAV: Home / Leads / Payouts / KYC / Me */
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(26, 45, 74, 0.95)', backdropFilter: 'blur(10px)', borderTop: STYLES.cardBorder, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '0.5rem 0', zIndex: 50 }}>
          <button onClick={() => setActiveTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>

          <button onClick={() => setActiveTab('leads')} style={{ ...navTabStyle(activeTab === 'leads'), position: 'relative' }}>
            {kpis.unworkedLeads > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.emerald, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {kpis.unworkedLeads}
              </span>
            )}
            <Briefcase size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Leads</span>
          </button>

          <button onClick={() => setActiveTab('payouts')} style={{ ...navTabStyle(activeTab === 'payouts'), position: 'relative' }}>
            {alerts.payoutPending > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.gold, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {alerts.payoutPending}
              </span>
            )}
            <DollarSign size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Payouts</span>
          </button>

          <button onClick={() => setActiveTab('kyc')} style={{ ...navTabStyle(activeTab === 'kyc'), position: 'relative' }}>
            {alerts.kycPending > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.amber, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {alerts.kycPending}
              </span>
            )}
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>KYC</span>
          </button>

          <button onClick={() => setActiveTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      )}

    </div>
  );
}

// Sub-component inline styles
const actionCircleStyle = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  padding: 0
};

const circleIconStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  marginBottom: '0.35rem'
};

const circleLabelStyle = {
  fontSize: '0.68rem',
  fontWeight: '700',
  color: '#fff'
};

const navTabStyle = (active) => ({
  background: 'none',
  border: 'none',
  color: active ? STYLES.gold : STYLES.textMuted,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: '0.3rem 0'
});

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const modalNextBtn = {
  width: '100%',
  padding: '0.85rem',
  background: STYLES.blue,
  color: '#fff',
  fontWeight: '800',
  border: 'none',
  borderRadius: '12px',
  fontSize: '0.85rem',
  marginTop: '1rem',
  cursor: 'pointer'
};

const modalBackBtn = {
  flex: 1,
  padding: '0.85rem',
  background: 'rgba(255,255,255,0.05)',
  color: STYLES.textMuted,
  fontWeight: '700',
  border: STYLES.cardBorder,
  borderRadius: '12px',
  fontSize: '0.85rem',
  cursor: 'pointer'
};
