'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, ShieldCheck, RefreshCw, Briefcase, PlusCircle, CheckCircle2,
  Home, UserCheck, DollarSign, CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  STYLES, navTabStyle, inputStyle, modalNextBtn, modalBackBtn, bottomNavStyle 
} from './styles';

// Role-specific Mini Views
import AdminMiniView from './views/AdminMiniView';
import KamMiniView from './views/KamMiniView';
import PromoterMiniView from './views/PromoterMiniView';
import InvestorMiniView from './views/InvestorMiniView';
import FounderMiniView from './views/FounderMiniView';

export default function TeamMiniAppPage() {
  // Authentication & Telegram WebApp State
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  // App Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'leads' | 'payouts' | 'kyc' | 'portfolio' | 'tickets' | 'me'
  
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
  const [investorData, setInvestorData] = useState({ holdings: [], totalInvested: 0, totalYields: 0 });
  const [founderData, setFounderData] = useState({ businesses: [], totalRaised: 0 });
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

  const triggerHaptic = (type = 'light') => {
    try {
      if (tg?.HapticFeedback) {
        if (type === 'success' || type === 'error' || type === 'warning') {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          tg.HapticFeedback.impactOccurred(type);
        }
      }
    } catch (e) {}
  };

  const switchTab = (tab) => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!tg) return;

    if (showSurveyModal) {
      try { tg.enableClosingConfirmation?.(); } catch (e) {}
    } else {
      try { tg.disableClosingConfirmation?.(); } catch (e) {}
    }

    if (activeTab !== 'home' || showSurveyModal) {
      tg.BackButton?.show();
      const handleBack = () => {
        triggerHaptic('light');
        if (showSurveyModal) {
          setShowSurveyModal(false);
        } else {
          setActiveTab('home');
        }
      };
      tg.BackButton?.onClick(handleBack);
      return () => {
        tg.BackButton?.offClick(handleBack);
      };
    } else {
      tg.BackButton?.hide();
    }
  }, [tg, activeTab, showSurveyModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSurveyModal) {
        setShowSurveyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSurveyModal]);

  const showToast = (msg, hapticType = 'light') => {
    triggerHaptic(hapticType);
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
          setAuthError(data.error || 'Authentication handshake failed');
        }
      } else {
        // Fallback for browser testing
        const { data: testUser } = await supabase
          .from('team')
          .select('*')
          .limit(1)
          .single();

        if (testUser) {
          setUser(testUser);
          await loadDashboardData(testUser);
        } else {
          setAuthError('No active session or mock user available');
        }
      }
    } catch (err) {
      console.error('Telegram init error:', err);
      setAuthError('Network error connecting to Telegram Bot API');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (userData) => {
    try {
      // 1. Fetch High-Level Operational Metrics
      const [
        { count: aumProjects, data: projectsData },
        { count: investorCount },
        { count: unworkedCount },
        { data: leads }
      ] = await Promise.all([
        supabase.from('funding_projects').select('amount_raised_bdt, target_raise_bdt, status, project_title, id, funding_type, businesses(brand_name)'),
        supabase.from('investors').select('id', { count: 'exact', head: true }).eq('kyc_verified', true),
        supabase.from('inquiry_leads').select('id', { count: 'exact', head: true }).eq('status', 'New'),
        supabase.from('inquiry_leads').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      const totalAum = (projectsData || []).reduce((sum, p) => sum + Number(p.amount_raised_bdt || 0), 0);
      const activeProjectsCount = (projectsData || []).filter(p => p.status === 'Active' || p.status === 'Funding').length;

      setKpis({
        totalAum,
        activeInvestors: investorCount || 0,
        activeProjects: activeProjectsCount,
        unworkedLeads: unworkedCount || 0
      });

      setProjectsList(projectsData || []);
      setLeadsList(leads || []);

      // 2. Fetch Pending Action Queues
      const [
        { count: kycCount, data: kycData },
        { count: payCount, data: payData },
        { count: payoutCount, data: payoutData }
      ] = await Promise.all([
        supabase.from('kyc_submissions').select('*').eq('status', 'Pending').limit(5),
        supabase.from('payment_submissions').select('*').limit(5),
        supabase.from('payout_requests').select('*, promoters(full_name)').eq('status', 'Pending').limit(5)
      ]);

      setAlerts({
        kycPending: kycCount || 0,
        payPending: payCount || 0,
        payoutPending: payoutCount || 0
      });

      setKycList(kycData || []);
      setPaymentsList(payData || []);
      setPayoutsList(payoutData || []);

      // 3. KAM-specific data: fetch assigned OTC tickets
      if (userData?.team_type === 'kam') {
        const { data: kamTickets } = await supabase
          .from('cash_tickets')
          .select('*, investors(alias_name, full_name, requires_anonymity), funding_projects!target_project_id(project_title)')
          .or(`kam_id.eq.${userData.id},assigned_kam_id.eq.${userData.id}`)
          .order('created_at', { ascending: false })
          .limit(20);
        setKamTicketsList(kamTickets || []);
      }

      // Promoter-specific: fetch personal commissions & referred leads
      if (userData?.team_type === 'promoter') {
        const { data: pComms } = await supabase
          .from('promoter_commissions')
          .select(`
            id, amount_bdt, commission_type, created_at,
            investments(amount_invested_bdt, funding_projects(project_title))
          `)
          .eq('promoter_id', userData.id)
          .order('created_at', { ascending: false });
        if (pComms) setCommissionsList(pComms);

        if (userData.referral_code) {
          const { data: pLeads } = await supabase
            .from('inquiry_leads')
            .select('*')
            .eq('referral_code', userData.referral_code)
            .order('created_at', { ascending: false });
          if (pLeads && pLeads.length > 0) setLeadsList(pLeads);
        }
      }

      // Investor-specific: fetch holdings and yields
      if (userData?.role === 'investor' || userData?.team_type === 'investor') {
        const [{ data: invHoldings }, { data: invYields }] = await Promise.all([
          supabase
            .from('investments')
            .select('id, amount_invested_bdt, status, created_at, funding_projects(project_title, businesses(brand_name))')
            .eq('investor_id', userData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('investor_yields')
            .select('amount_bdt')
            .eq('investor_id', userData.id)
        ]);

        const totalInvested = (invHoldings || []).reduce((s, h) => s + Number(h.amount_invested_bdt || 0), 0);
        const totalYields = (invYields || []).reduce((s, y) => s + Number(y.amount_bdt || 0), 0);

        setInvestorData({
          holdings: invHoldings || [],
          totalInvested,
          totalYields
        });
      }

      // Founder-specific: fetch business entities & funding projects
      if (userData?.role === 'founder' || userData?.team_type === 'founder') {
        const { data: founderBusinesses } = await supabase
          .from('businesses')
          .select('*, funding_projects(*)')
          .eq('founder_id', userData.id);

        let totalRaised = 0;
        (founderBusinesses || []).forEach(b => {
          (b.funding_projects || []).forEach(p => {
            totalRaised += Number(p.amount_raised_bdt || 0);
          });
        });

        setFounderData({
          businesses: founderBusinesses || [],
          totalRaised
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Actions
  const handleApprovePayout = async (payoutId) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Cleared' })
        .eq('id', payoutId);

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

  const isPromoter = user?.team_type === 'promoter' || user?.role === 'promoter';
  const isKam = user?.team_type === 'kam' || user?.role === 'kam';
  const isAdmin = user?.team_type === 'admin' || user?.team_type === 'manager' || user?.role === 'admin';
  const isInvestor = user?.role === 'investor' || user?.team_type === 'investor';
  const isFounder = user?.role === 'founder' || user?.team_type === 'founder';

  return (
    <div style={{ minHeight: '100vh', background: STYLES.bg, paddingBottom: 'max(5.5rem, calc(4.5rem + env(safe-area-inset-bottom, 0px)))' }}>
      
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

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div>
            {isPromoter && (
              <PromoterMiniView
                user={user}
                commissionsList={commissionsList}
                leadsList={leadsList}
                showToast={showToast}
                setShowSurveyModal={setShowSurveyModal}
                setActiveTab={setActiveTab}
                handleRequestPinInChat={handleRequestPinInChat}
              />
            )}

            {isKam && (
              <KamMiniView
                user={user}
                kpis={kpis}
                kamTicketsList={kamTicketsList}
                projectsList={projectsList}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleRequestPinInChat={handleRequestPinInChat}
                setShowSurveyModal={setShowSurveyModal}
              />
            )}

            {isAdmin && (
              <AdminMiniView
                kpis={kpis}
                alerts={alerts}
                leadsList={leadsList}
                payoutsList={payoutsList}
                kycList={kycList}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleRequestPinInChat={handleRequestPinInChat}
                handleApprovePayout={handleApprovePayout}
                handleRejectPayout={handleRejectPayout}
                handleApproveKyc={handleApproveKyc}
                setShowSurveyModal={setShowSurveyModal}
              />
            )}

            {isInvestor && (
              <InvestorMiniView
                user={user}
                investorData={investorData}
                handleRequestPinInChat={handleRequestPinInChat}
              />
            )}

            {isFounder && (
              <FounderMiniView
                user={user}
                founderData={founderData}
                handleRequestPinInChat={handleRequestPinInChat}
              />
            )}
          </div>
        )}

        {/* TAB: LEADS QUEUE */}
        {activeTab === 'leads' && (isAdmin || isPromoter) && (
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

        {/* TAB: KAM PORTFOLIO */}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{p.businesses?.brand_name || 'GRO10X'}</div>
                          <div style={{ fontSize: '0.75rem', color: STYLES.textMuted }}>{p.project_title}</div>
                        </div>
                        <span style={{ background: 'rgba(240, 180, 41, 0.15)', color: STYLES.gold, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                          {p.funding_type || 'Franchise'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: STYLES.textMuted, marginBottom: '0.4rem' }}>
                        <span>Raised: ৳{raised.toLocaleString()}</span>
                        <span>Target: ৳{target.toLocaleString()}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ background: STYLES.gold, width: `${pct}%`, height: '100%', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: KAM OTC TICKETS */}
        {activeTab === 'tickets' && isKam && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>🎫 Cash Concierge OTC Desk ({kamTicketsList.length})</h3>
            </div>
            {kamTicketsList.length === 0 ? (
              <div style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <CreditCard size={36} color={STYLES.textMuted} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <div style={{ color: STYLES.textMuted, fontSize: '0.85rem' }}>No cash tickets assigned</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kamTicketsList.map((t) => {
                  const inv = t.investors;
                  const name = inv?.requires_anonymity ? (inv?.alias_name || '🔒 Anonymous HNI') : (inv?.alias_name || inv?.full_name || 'HNI Investor');
                  return (
                    <div key={t.id} style={{ background: STYLES.cardBg, border: STYLES.cardBorder, borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{name}</div>
                          <div style={{ fontSize: '0.75rem', color: STYLES.textMuted }}>{t.funding_projects?.project_title || 'CapEx Target'}</div>
                        </div>
                        <span style={{ background: t.status === 'Pending_Review' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: t.status === 'Pending_Review' ? STYLES.amber : STYLES.emerald, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                          {t.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: STYLES.gold, marginBottom: '0.3rem' }}>
                        ৳{Number(t.ticket_amount_bdt || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: STYLES.textMuted }}>
                        Pref. Meeting: {t.preferred_meeting_time || 'TBD'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: PAYOUTS APPROVAL QUEUE */}
        {activeTab === 'payouts' && isAdmin && (
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

        {/* TAB: KYC REVIEW */}
        {activeTab === 'kyc' && isAdmin && (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                        {k.full_name || 'Investor'}
                      </div>
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: STYLES.amber, padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                        Level {k.target_level || 2}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: STYLES.textMuted, marginBottom: '0.75rem' }}>
                      ID Number: <strong style={{ color: '#cbd5e1' }}>{k.id_number || 'Provided in Document'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApproveKyc(k.id)} style={{ flex: 1, background: STYLES.emerald, color: '#000', border: 'none', padding: '0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                        ✅ Verify & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ME & PROFILE */}
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

      {/* MULTI-STEP INVESTOR SURVEY MODAL */}
      {showSurveyModal && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSurveyModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 26, 46, 0.95)', backdropFilter: 'blur(10px)', zIndex: 100, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
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
        <nav style={bottomNavStyle(4)}>
          <button onClick={() => switchTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>

          <button onClick={() => switchTab('portfolio')} style={navTabStyle(activeTab === 'portfolio')}>
            <Briefcase size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Portfolio</span>
          </button>

          <button onClick={() => switchTab('tickets')} style={{ ...navTabStyle(activeTab === 'tickets'), position: 'relative' }}>
            {kamTicketsList.filter(t => t.status === 'Pending_Review').length > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.amber, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {kamTicketsList.filter(t => t.status === 'Pending_Review').length}
              </span>
            )}
            <CreditCard size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Tickets</span>
          </button>

          <button onClick={() => switchTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      ) : isPromoter ? (
        /* PROMOTER 3-TAB NAV: Home / Leads / Me */
        <nav style={bottomNavStyle(3)}>
          <button onClick={() => switchTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>

          <button onClick={() => switchTab('leads')} style={{ ...navTabStyle(activeTab === 'leads'), position: 'relative' }}>
            {leadsList.length > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '28%', background: STYLES.emerald, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {leadsList.length}
              </span>
            )}
            <Briefcase size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>My Leads</span>
          </button>

          <button onClick={() => switchTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      ) : isAdmin ? (
        /* ADMIN 5-TAB NAV: Home / Leads / Payouts / KYC / Me */
        <nav style={bottomNavStyle(5)}>
          <button onClick={() => switchTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>

          <button onClick={() => switchTab('leads')} style={{ ...navTabStyle(activeTab === 'leads'), position: 'relative' }}>
            {kpis.unworkedLeads > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.emerald, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {kpis.unworkedLeads}
              </span>
            )}
            <Briefcase size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Leads</span>
          </button>

          <button onClick={() => switchTab('payouts')} style={{ ...navTabStyle(activeTab === 'payouts'), position: 'relative' }}>
            {alerts.payoutPending > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.gold, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {alerts.payoutPending}
              </span>
            )}
            <DollarSign size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Payouts</span>
          </button>

          <button onClick={() => switchTab('kyc')} style={{ ...navTabStyle(activeTab === 'kyc'), position: 'relative' }}>
            {alerts.kycPending > 0 && (
              <span style={{ position: 'absolute', top: '0.1rem', right: '22%', background: STYLES.amber, color: '#000', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', padding: '0.05rem 0.35rem' }}>
                {alerts.kycPending}
              </span>
            )}
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>KYC</span>
          </button>

          <button onClick={() => switchTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      ) : (
        /* INVESTOR & FOUNDER 2-TAB NAV: Home / Me */
        <nav style={bottomNavStyle(2)}>
          <button onClick={() => switchTab('home')} style={navTabStyle(activeTab === 'home')}>
            <Home size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Home</span>
          </button>
          <button onClick={() => switchTab('me')} style={navTabStyle(activeTab === 'me')}>
            <UserCheck size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.2rem' }}>Me</span>
          </button>
        </nav>
      )}

    </div>
  );
}
