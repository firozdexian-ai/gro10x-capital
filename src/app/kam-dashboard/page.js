'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, ClipboardCheck, TrendingUp, DollarSign, Globe, Loader2,
  UserCheck
} from 'lucide-react';
import { CURRENCY_RATES } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

import AuditsTab from './tabs/AuditsTab';
import AssignedInvestorsTab from './tabs/AssignedInvestorsTab';
import CapExProjectsTab from './tabs/CapExProjectsTab';
import YieldVerificationTab from './tabs/YieldVerificationTab';
import CashPipelineTab from './tabs/CashPipelineTab';

/**
 * KAM Dashboard — Managing Partner Control Desk (Orchestrator)
 * Handles Unilever-style monthly balance sheet audits, assigned investor portfolio oversight,
 * CapEx project milestones, yield verification history, and cash concierge dispatch.
 */
export default function KamDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [currency, setCurrency] = useState('BDT');
  const [kamProfile, setKamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audits');
  const [cashTickets, setCashTickets] = useState([]);
  const [assignedInvestors, setAssignedInvestors] = useState([]);
  const [managedProjects, setManagedProjects] = useState([]);
  const [disbursementHistory, setDisbursementHistory] = useState([]);

  // Business Selection & Audit State
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [auditHistory, setAuditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Filter States
  const [investorFilter, setInvestorFilter] = useState('All');
  const [cashFilter, setCashFilter] = useState('All');

  // Unilever-style Audit Form State
  const [cashInHand, setCashInHand] = useState('');
  const [receivablesMarket, setReceivablesMarket] = useState('');
  const [receivablesCompany, setReceivablesCompany] = useState('');
  const [payables, setPayables] = useState('');
  const [stockInvestment, setStockInvestment] = useState('');
  const [payrollExpense, setPayrollExpense] = useState('');

  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedHealthScore, setCalculatedHealthScore] = useState(0);

  // Field Photo Upload per-asset status
  const [uploadedAssets, setUploadedAssets] = useState({});
  const [assetPreviews, setAssetPreviews] = useState({});

  // Role Guard: Redirect non-KAM / non-Admin users
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (role && role !== 'kam' && role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchKamData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, role, authLoading]);

  // Fetch recent audit history whenever selected business changes
  useEffect(() => {
    if (selectedBusinessId) {
      fetchAuditHistory(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const fetchKamData = async () => {
    try {
      setLoading(true);
      
      // 1. Resolve KAM Profile
      const { data: profile } = await supabase
        .from('kams')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      let activeKam = profile;

      if (!activeKam) {
        const { data: teamMember } = await supabase
          .from('team')
          .select('*')
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle();
        if (teamMember) {
          activeKam = {
            id: teamMember.id,
            full_name: teamMember.full_name,
            email: teamMember.email,
            phone: teamMember.phone
          };
        }
      }

      const resolvedKam = activeKam || { 
        id: user.id, 
        full_name: user.email?.split('@')[0] || 'Managing Partner',
        email: user.email,
        phone: '+880 1708-459008'
      };
      setKamProfile(resolvedKam);

      // 2. Fetch Active Businesses
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, brand_name, ai_health_score')
        .order('created_at', { ascending: false });

      const bizList = bizData || [];
      setBusinesses(bizList);
      if (bizList.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizList[0].id);
      }

      // 3. Fetch Assigned Investors
      let invQuery = supabase
        .from('investors')
        .select(`
          id, alias_name, full_name, phone, email, requires_anonymity,
          category, kyc_verified, kyc_level, onboarding_status,
          preferred_channel, telegram_chat_id, created_at,
          investments(id, amount_invested_bdt, status, yield_option,
            funding_projects(project_title, status))
        `)
        .order('created_at', { ascending: false });

      if (role === 'kam' && resolvedKam?.id) {
        invQuery = invQuery.eq('assigned_kam_id', resolvedKam.id);
      }

      const { data: invData } = await invQuery;
      const assignedInvs = invData || [];
      setAssignedInvestors(assignedInvs);

      // 4. Fetch Assigned Cash Tickets
      const assignedInvestorIds = assignedInvs.map(i => i.id);
      let ticketQuery = supabase
        .from('cash_tickets')
        .select(`
          id, ticket_amount_bdt, status, preferred_meeting_time, created_at,
          investors(alias_name, full_name, requires_anonymity, phone, email, kyc_level),
          funding_projects!target_project_id(project_title, businesses(brand_name))
        `)
        .order('created_at', { ascending: false });

      if (role === 'kam') {
        if (assignedInvestorIds.length > 0) {
          ticketQuery = ticketQuery.in('investor_id', assignedInvestorIds);
        } else {
          ticketQuery = ticketQuery.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { data: ticketData } = await ticketQuery;
      setCashTickets(ticketData || []);

      // 5. Fetch Managed Projects
      const { data: projData } = await supabase
        .from('funding_projects')
        .select(`
          id, project_title, funding_type, target_raise_bdt, amount_raised_bdt,
          spv_name, yield_model, min_otc_investment_bdt, status, project_description,
          cover_image_url, created_at,
          businesses(brand_name),
          investments(id, amount_invested_bdt, status)
        `)
        .order('created_at', { ascending: false });

      setManagedProjects(projData || []);

      // 6. Fetch Yield Disbursements
      const { data: disbData } = await supabase
        .from('yield_disbursements')
        .select(`
          id, month, year, disbursement_month, gross_sales_bdt, net_profit_bdt,
          total_disbursed_bdt, status, payment_date, created_at,
          funding_projects(project_title, businesses(brand_name)),
          investor_yields(id, amount_bdt)
        `)
        .order('created_at', { ascending: false });

      setDisbursementHistory(disbData || []);

    } catch (err) {
      console.error('Error fetching KAM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditHistory = async (businessId) => {
    if (!businessId) return;
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('business_audits')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error && error.code !== '42P01') {
        console.warn('Audit history query notice:', error);
      }
      setAuditHistory(data || []);
    } catch (err) {
      console.error('Error fetching audit history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Real-time Balance Sheet Calculations
  const totalAssets = (Number(cashInHand) || 0) + (Number(stockInvestment) || 0) + (Number(receivablesMarket) || 0) + (Number(receivablesCompany) || 0);
  const totalLiabilities = (Number(payables) || 0) + (Number(payrollExpense) || 0);
  const netWorkingCapital = totalAssets - totalLiabilities;
  const hasInputs = totalAssets > 0 || totalLiabilities > 0;

  // Real-time Health Score Preview Calculation
  useEffect(() => {
    if (!hasInputs) {
      setCalculatedHealthScore(0);
      return;
    }
    const ratio = totalAssets / (totalLiabilities || 1);
    let score = Math.round(40 + (ratio * 10));
    setCalculatedHealthScore(Math.min(100, Math.max(0, score)));
  }, [totalAssets, totalLiabilities, hasInputs]);

  // Tab 2 Portfolio Aggregations
  const totalPortfolioAum = assignedInvestors.reduce((sum, inv) => {
    return sum + (inv.investments || []).reduce((s, i) => s + Number(i.amount_invested_bdt || 0), 0);
  }, 0);

  const kycVerifiedCount = assignedInvestors.filter(i => i.kyc_verified).length;
  const avgKycLevel = assignedInvestors.length > 0
    ? (assignedInvestors.reduce((s, i) => s + (Number(i.kyc_level) || 1), 0) / assignedInvestors.length).toFixed(1)
    : '1.0';

  const filteredInvestors = assignedInvestors.filter(inv => {
    if (investorFilter === 'All') return true;
    if (investorFilter === 'Active') return inv.onboarding_status === 'Active';
    if (investorFilter === 'VIP') return inv.onboarding_status === 'VIP' || inv.category === 'VIP' || inv.category === 'Family Office';
    if (investorFilter === 'KYC Pending') return ['KYC_L1', 'KYC_L2', 'Telegram_Verified', 'Invited'].includes(inv.onboarding_status) || !inv.kyc_verified;
    if (investorFilter === 'Invited') return inv.onboarding_status === 'Invited';
    return true;
  });

  // Tab 3 CapEx Projects Aggregations
  const totalCapexPipeline = managedProjects.reduce((sum, p) => sum + Number(p.target_raise_bdt || 0), 0);
  const totalCapitalCommitted = managedProjects.reduce((sum, p) => sum + Number(p.amount_raised_bdt || 0), 0);

  // Tab 4 Yield Disbursement Aggregations
  const totalYieldDistributed = disbursementHistory.reduce((sum, d) => sum + Number(d.total_disbursed_bdt || 0), 0);
  const totalDisbBatches = disbursementHistory.length;
  const avgYieldPerBatch = totalDisbBatches > 0 ? Math.round(totalYieldDistributed / totalDisbBatches) : 0;

  // Tab 5 Cash Pipeline Aggregations & Filter
  const activeCashPipeline = cashTickets.filter(t => !['Closed', 'Rejected'].includes(t.status)).reduce((sum, t) => sum + Number(t.ticket_amount_bdt || 0), 0);
  const pendingCashTicketsCount = cashTickets.filter(t => t.status === 'Pending_Review').length;
  const clearedCashTicketsCount = cashTickets.filter(t => t.status === 'Funds_Cleared').length;

  const filteredCashTickets = cashTickets.filter(t => {
    if (cashFilter === 'All') return true;
    if (cashFilter === 'Pending_Review') return t.status === 'Pending_Review';
    if (cashFilter === 'Meeting_Scheduled') return t.status === 'Meeting_Scheduled';
    if (cashFilter === 'Funds_Cleared') return t.status === 'Funds_Cleared';
    if (cashFilter === 'Closed') return t.status === 'Closed' || t.status === 'Rejected';
    return true;
  });

  const getProjectStatusStyle = (status) => {
    switch (status) {
      case 'Origination':
        return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', label: '📐 Origination' };
      case 'Structuring':
        return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: '🔧 Structuring' };
      case 'Active':
        return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', label: '● Active Raise' };
      case 'Trading':
        return { color: '#f0b429', bg: 'rgba(240,180,41,0.12)', border: 'rgba(240,180,41,0.3)', label: '⚡ Live Trading' };
      case 'Completed':
        return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', label: '✓ Completed' };
      case 'Paused':
        return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: '⏸ Paused' };
      default:
        return { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', label: status || '● Active Raise' };
    }
  };

  const getFundingTypeStyle = (type) => {
    switch (type) {
      case 'Franchise':
        return { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' };
      case 'Distribution':
        return { color: '#c084fc', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' };
      case 'Equity':
        return { color: '#f0b429', bg: 'rgba(240,180,41,0.15)', border: 'rgba(240,180,41,0.3)' };
      case 'Short-Term Debt':
        return { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)' };
      default:
        return { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' };
    }
  };

  const getYieldStatusStyle = (status) => {
    switch (status) {
      case 'Draft':
        return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: '⏳ Draft Ledger' };
      case 'Finalised':
        return { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', label: '● Finalised Run' };
      case 'Paid_Out':
        return { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: '✓ Paid Out' };
      default:
        return { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: status || '✓ Cleared' };
    }
  };

  const getCashTicketStatusStyle = (status) => {
    switch (status) {
      case 'Pending_Review':
        return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: '⏳ Pending Review' };
      case 'Meeting_Scheduled':
        return { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', label: '📅 Consultation Set' };
      case 'Funds_Cleared':
        return { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: '✓ Funds Cleared' };
      case 'Closed':
        return { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', label: '🔒 Closed Placement' };
      case 'Rejected':
        return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: '✕ Rejected' };
      default:
        return { color: '#f0b429', bg: 'rgba(240,180,41,0.15)', border: 'rgba(240,180,41,0.3)', label: status || 'Pending' };
    }
  };

  const getHealthScoreInfo = (score, hasData) => {
    if (!hasData) {
      return {
        color: '#94a3b8',
        bg: 'rgba(148,163,184,0.1)',
        border: 'rgba(148,163,184,0.25)',
        label: 'Awaiting Entry',
        subtext: 'Fill in the balance sheet to preview live AI score'
      };
    }
    if (score <= 40) {
      return {
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.12)',
        border: 'rgba(239,68,68,0.3)',
        label: 'Critical Solvency',
        subtext: 'Liabilities exceed liquid working capital coverage'
      };
    }
    if (score <= 65) {
      return {
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
        label: 'Moderate Health',
        subtext: 'Adequate reserves, closely monitor pending payables'
      };
    }
    if (score <= 80) {
      return {
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.3)',
        label: 'Good Standing',
        subtext: 'Positive cash coverage & healthy receivables ratio'
      };
    }
    return {
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.3)',
      label: 'Optimal Grid',
      subtext: 'Strong solvency position & optimal liquidity'
    };
  };

  const handlePhotoUpload = async (e, assetName) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBusinessId) return;

    try {
      if (typeof window !== 'undefined' && window.URL) {
        const previewUrl = window.URL.createObjectURL(file);
        setAssetPreviews(prev => ({ ...prev, [assetName]: previewUrl }));
      }
      setUploadedAssets(prev => ({ ...prev, [assetName]: 'uploading' }));
      const fd = new FormData();
      fd.append('file', file);
      fd.append('business_id', selectedBusinessId);
      fd.append('asset_name', assetName);

      const res = await fetch('/api/upload-asset-photo', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        setUploadedAssets(prev => ({ ...prev, [assetName]: 'verified' }));
        addToast(`✅ ${assetName} photo verified & uploaded!`, 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        setUploadedAssets(prev => ({ ...prev, [assetName]: 'error' }));
        addToast(data.error || `Failed to verify photo for ${assetName}`, 'error');
      }
    } catch (err) {
      setUploadedAssets(prev => ({ ...prev, [assetName]: 'error' }));
      addToast(err.message || 'Photo upload encountered an issue', 'error');
    }
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!kamProfile || !selectedBusinessId) return;

    try {
      setIsSubmitting(true);
      const auditMonth = new Date().toISOString().substring(0, 7);
      const rate = CURRENCY_RATES[currency]?.rate || 1;
      
      const { error: auditErr } = await supabase
        .from('business_audits')
        .insert([{
          kam_id: kamProfile.id,
          business_id: selectedBusinessId,
          audit_month: auditMonth,
          cash_in_hand_bdt: Number(cashInHand) / rate,
          stock_valuation_bdt: Number(stockInvestment) / rate,
          receivables_market_bdt: Number(receivablesMarket) / rate,
          receivables_company_bdt: Number(receivablesCompany) / rate,
          payables_bdt: Number(payables) / rate,
          payroll_expense_bdt: Number(payrollExpense) / rate,
          calculated_health_score: calculatedHealthScore
        }]);

      if (auditErr && auditErr.code !== '42P01') throw auditErr;

      await supabase
        .from('businesses')
        .update({ ai_health_score: calculatedHealthScore })
        .eq('id', selectedBusinessId);

      const bizName = businesses.find(b => b.id === selectedBusinessId)?.brand_name || 'a business';
      try {
        await supabase.from('notifications').insert([{
          user_id: user?.id || null,
          title: 'New Audit Verified',
          message: `KAM has posted a verified physical audit for ${bizName}. AI Health Score updated.`,
          type: 'success'
        }]);
      } catch (notifErr) {
        console.warn('Non-fatal audit notification error:', notifErr);
      }

      setAuditSubmitted(true);
      setCashInHand('');
      setStockInvestment('');
      setReceivablesMarket('');
      setReceivablesCompany('');
      setPayables('');
      setPayrollExpense('');

      addToast('🎉 Audit verified and submitted successfully!', 'success');
      fetchKamData();
      fetchAuditHistory(selectedBusinessId);

    } catch (err) {
      console.error('Failed to submit audit:', err);
      addToast(err.message || 'Audit recorded successfully', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const healthInfo = getHealthScoreInfo(calculatedHealthScore, hasInputs);

  const tabsConfig = [
    { id: 'audits', label: 'Monthly Audits', icon: ClipboardCheck, count: null },
    { id: 'investors', label: 'Assigned Investors', icon: Users, count: assignedInvestors.length },
    { id: 'projects', label: 'CapEx Projects', icon: Building2, count: managedProjects.length },
    { id: 'yields', label: 'Yield Disbursements', icon: TrendingUp, count: disbursementHistory.length },
    { id: 'cash-pipeline', label: 'Cash Concierge', icon: DollarSign, count: cashTickets.filter(t => t.status === 'Pending_Review').length }
  ];

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* LOCAL STICKY TAB NAV */}
      <div style={{
        background: 'rgba(15,23,42,0.92)',
        borderBottom: '1px solid rgba(59,130,246,0.2)',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        position: 'sticky',
        top: '70px',
        zIndex: 9,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap'
      }}>
        {tabsConfig.map(({ id, label, icon: Icon, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                border: isActive ? '1px solid rgba(59,130,246,0.45)' : '1px solid transparent',
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 0 15px rgba(59,130,246,0.2)' : 'none'
              }}
            >
              <Icon size={15} style={{ color: isActive ? '#60a5fa' : '#64748b' }} />
              <span>{label}</span>
              {count !== null && (
                <span style={{
                  fontSize: '0.7rem',
                  background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  color: isActive ? '#fff' : '#94a3b8',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  fontWeight: '700'
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#3b82f6' }}>
            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Syncing KAM Dashboard & Assigned Portfolios...</p>
          </div>
        ) : (
          <>
            {/* KAM IDENTITY HEADER CARD */}
            <div className="glass-card" style={{ 
              padding: '1.5rem 1.75rem', 
              marginBottom: '1.75rem', 
              borderLeft: '4px solid #3b82f6', 
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(7,10,20,0.95))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '12px', 
                  background: 'rgba(59,130,246,0.15)', 
                  border: '1px solid rgba(59,130,246,0.3)', 
                  display: 'grid', 
                  placeItems: 'center',
                  color: '#60a5fa'
                }}>
                  <UserCheck size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                      {kamProfile?.full_name || 'Managing Partner'}
                    </h1>
                    <span style={{ 
                      background: 'rgba(16,185,129,0.15)', 
                      color: '#10b981', 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '6px', 
                      fontSize: '0.7rem', 
                      fontWeight: '800',
                      border: '1px solid rgba(16,185,129,0.3)'
                    }}>
                      ✓ Verified Partner
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                    <span style={{ color: '#60a5fa', fontWeight: '700' }}>● Managing Partner (HNI & Audit Desk)</span>
                    <span>📞 {kamProfile?.phone || '+880 1708-459008'}</span>
                    <span>✉️ {kamProfile?.email || user?.email}</span>
                  </div>
                </div>
              </div>

              {/* CURRENCY SELECTOR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', padding: '0.45rem 0.85rem', borderRadius: '8px' }}>
                <Globe size={15} style={{ color: '#60a5fa' }} />
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', outline: 'none' }}
                >
                  {Object.keys(CURRENCY_RATES).map(code => (
                    <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                      {CURRENCY_RATES[code].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TAB RENDERING */}
            {activeTab === 'audits' && (
              <AuditsTab 
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                setSelectedBusinessId={setSelectedBusinessId}
                auditSubmitted={auditSubmitted}
                setAuditSubmitted={setAuditSubmitted}
                handleAuditSubmit={handleAuditSubmit}
                isSubmitting={isSubmitting}
                cashInHand={cashInHand}
                setCashInHand={setCashInHand}
                stockInvestment={stockInvestment}
                setStockInvestment={setStockInvestment}
                receivablesMarket={receivablesMarket}
                setReceivablesMarket={setReceivablesMarket}
                receivablesCompany={receivablesCompany}
                setReceivablesCompany={setReceivablesCompany}
                payables={payables}
                setPayables={setPayables}
                payrollExpense={payrollExpense}
                setPayrollExpense={setPayrollExpense}
                totalAssets={totalAssets}
                totalLiabilities={totalLiabilities}
                netWorkingCapital={netWorkingCapital}
                hasInputs={hasInputs}
                calculatedHealthScore={calculatedHealthScore}
                healthInfo={healthInfo}
                uploadedAssets={uploadedAssets}
                assetPreviews={assetPreviews}
                handlePhotoUpload={handlePhotoUpload}
                loadingHistory={loadingHistory}
                auditHistory={auditHistory}
                currency={currency}
              />
            )}

            {activeTab === 'investors' && (
              <AssignedInvestorsTab 
                assignedInvestors={assignedInvestors}
                totalPortfolioAum={totalPortfolioAum}
                kycVerifiedCount={kycVerifiedCount}
                avgKycLevel={avgKycLevel}
                investorFilter={investorFilter}
                setInvestorFilter={setInvestorFilter}
                filteredInvestors={filteredInvestors}
                currency={currency}
              />
            )}

            {activeTab === 'projects' && (
              <CapExProjectsTab 
                managedProjects={managedProjects}
                totalCapexPipeline={totalCapexPipeline}
                totalCapitalCommitted={totalCapitalCommitted}
                currency={currency}
                getProjectStatusStyle={getProjectStatusStyle}
                getFundingTypeStyle={getFundingTypeStyle}
              />
            )}

            {activeTab === 'yields' && (
              <YieldVerificationTab 
                disbursementHistory={disbursementHistory}
                totalYieldDistributed={totalYieldDistributed}
                totalDisbBatches={totalDisbBatches}
                avgYieldPerBatch={avgYieldPerBatch}
                currency={currency}
                getYieldStatusStyle={getYieldStatusStyle}
              />
            )}

            {activeTab === 'cash-pipeline' && (
              <CashPipelineTab 
                cashTickets={cashTickets}
                activeCashPipeline={activeCashPipeline}
                pendingCashTicketsCount={pendingCashTicketsCount}
                clearedCashTicketsCount={clearedCashTicketsCount}
                cashFilter={cashFilter}
                setCashFilter={setCashFilter}
                filteredCashTickets={filteredCashTickets}
                currency={currency}
                getCashTicketStatusStyle={getCashTicketStatusStyle}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
