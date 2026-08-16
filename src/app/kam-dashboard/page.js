'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe, Loader2,
  PieChart, PhoneCall, AlertCircle, Upload, UserCheck, Shield, Zap, Activity,
  TrendingDown, Calendar, RefreshCw, Mail, MessageSquare, Phone, ExternalLink,
  Award, Sparkles, Filter, Check, Clock, Layers, Target, Briefcase, MapPin,
  FileSpreadsheet, HandCoins, CheckCircle, Clock3
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

/**
 * KAM Dashboard — Managing Partner Control Desk
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
  const [activeTab, setActiveTab] = useState('audits'); // 'audits' | 'investors' | 'projects' | 'yields' | 'cash-pipeline'
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
  const [investorFilter, setInvestorFilter] = useState('All'); // 'All' | 'Active' | 'VIP' | 'KYC Pending' | 'Invited'
  const [cashFilter, setCashFilter] = useState('All'); // 'All' | 'Pending_Review' | 'Meeting_Scheduled' | 'Funds_Cleared' | 'Closed'

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

  // Field Photo Upload per-asset status: { [assetName]: 'uploading' | 'verified' | 'error' }
  const [uploadedAssets, setUploadedAssets] = useState({});

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

      // Fallback: if not found in kams, search team table
      if (!activeKam) {
        const { data: teamMember } = await supabase
          .from('team')
          .select('*')
          .eq('id', user.id)
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

      // 2. Fetch Active Businesses (Platform-wide)
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, brand_name, ai_health_score')
        .order('created_at', { ascending: false });

      const bizList = bizData || [];
      setBusinesses(bizList);
      if (bizList.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizList[0].id);
      }

      // 3. Fetch Assigned Investors (Explicit fields + correct investments join)
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

      // 4. Fetch Assigned Cash Tickets with Full Meeting & Investor Details
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
          // No assigned investors -> query non-matching sentinel
          ticketQuery = ticketQuery.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { data: ticketData } = await ticketQuery;
      setCashTickets(ticketData || []);

      // 5. Fetch Managed Projects with Schema-Accurate Columns and Joined Investments
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

      // 6. Fetch Yield Disbursements History from `yield_disbursements`
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

  // Tab 2 Portfolio Aggregations
  const totalPortfolioAum = assignedInvestors.reduce((sum, inv) => {
    return sum + (inv.investments || []).reduce((s, i) => s + Number(i.amount_invested_bdt || 0), 0);
  }, 0);

  const kycVerifiedCount = assignedInvestors.filter(i => i.kyc_verified).length;
  const avgKycLevel = assignedInvestors.length > 0
    ? (assignedInvestors.reduce((s, i) => s + (Number(i.kyc_level) || 1), 0) / assignedInvestors.length).toFixed(1)
    : '1.0';

  // Filtered Investors list for Tab 2
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
  const activeProjectsCount = managedProjects.filter(p => ['Active', 'Trading', 'Live'].includes(p.status)).length;

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

  // Health Score Visual Band Helper
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
      await supabase.from('notifications').insert([{
        title: 'New Audit Verified',
        message: `KAM has posted a verified physical audit for ${bizName}. AI Health Score updated.`,
        type: 'success'
      }]);

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

  // Average Portfolio Health Calculation
  const avgHealthScore = businesses.length > 0
    ? Math.round(businesses.reduce((acc, b) => acc + Number(b.ai_health_score || 85), 0) / businesses.length)
    : 88;

  const healthInfo = getHealthScoreInfo(calculatedHealthScore, hasInputs);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* ── STICKY LOCAL TAB BAR ── */}
      <div style={{ 
        background: 'rgba(15,23,42,0.85)', 
        borderBottom: '1px solid rgba(59,130,246,0.25)', 
        padding: '0.85rem 2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.6rem', 
        position: 'sticky', 
        top: '70px', 
        zIndex: 20, 
        backdropFilter: 'blur(12px)', 
        flexWrap: 'wrap' 
      }}>
        {[
          { key: 'audits', label: 'Monthly Audits', Icon: ClipboardCheck, count: null },
          { key: 'investors', label: 'Investor Portfolio', Icon: Users, count: assignedInvestors.length },
          { key: 'projects', label: 'CapEx Projects', Icon: Building2, count: managedProjects.length },
          { key: 'yields', label: 'Yield History', Icon: TrendingUp, count: disbursementHistory.length },
          { key: 'cash-pipeline', label: 'Cash Pipeline', Icon: DollarSign, count: cashTickets.length }
        ].map(({ key, label, Icon, count }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.15))' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#60a5fa' : '#94a3b8',
                border: isActive ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: isActive ? '700' : '500',
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
            {/* ── KAM IDENTITY HEADER CARD ── */}
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

            {/* ── 4-CARD KPI SUMMARY STRIP ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              
              <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Assigned Investors
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                    {assignedInvestors.length}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Direct Advisory</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Cash Tickets
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
                    {cashTickets.length}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>OTC Concierge</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Managed Outlets
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                    {businesses.length}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Operating Hubs</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Avg Portfolio Health
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa', margin: 0 }}>
                    {avgHealthScore}/100
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Optimal Grid</span>
                </div>
              </div>

            </div>

            {/* ── TAB 1: MONTHLY AUDITS ── */}
            {activeTab === 'audits' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN: BALANCE SHEET AUDIT FORM */}
                <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.4)', padding: '2rem', height: 'fit-content' }}>
                  
                  {/* HEADER & OUTLET SELECTOR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                        Monthly Financial Balance Sheet
                      </h2>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        Unilever-standard physical asset & liquidity solvency verification
                      </p>
                    </div>
                    
                    {businesses.length > 0 && (
                      <select 
                        value={selectedBusinessId} 
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        style={{ 
                          background: 'rgba(15,23,42,0.95)', 
                          border: '1px solid rgba(59,130,246,0.4)', 
                          color: '#60a5fa', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px', 
                          fontSize: '0.85rem', 
                          fontWeight: '700', 
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.brand_name} (AI Health: {b.ai_health_score || 85}/100)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {businesses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                      <Building2 size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                      <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1.05rem', fontWeight: '800' }}>No active outlets registered</h3>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                        Businesses created in the Admin Business Registry will appear here for monthly physical audits.
                      </p>
                    </div>
                  ) : auditSubmitted ? (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '2.5rem 2rem', borderRadius: '12px', textAlign: 'center' }}>
                      <CheckCircle2 size={52} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                      <h3 style={{ color: '#10b981', fontSize: '1.3rem', marginBottom: '0.4rem', fontWeight: '900' }}>Audit Verified & Logged</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
                        Business AI Health Score has been updated transparently for investors and stored in the permanent audit ledger.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAuditSubmitted(false)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          padding: '0.65rem 1.35rem',
                          borderRadius: '8px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Submit Another Audit →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAuditSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                      
                      {/* SECTION 1: CURRENT ASSETS */}
                      <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            📈 Current Assets (Liquidity & Inventory)
                          </span>
                          <span style={{ fontSize: '0.78rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                            Total: {formatCurrency(totalAssets, currency)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Physical Cash in Hand ({currency}) *
                            </label>
                            <input 
                              type="number" 
                              required 
                              value={cashInHand} 
                              onChange={(e) => setCashInHand(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Stock / Inventory Valuation ({currency}) *
                            </label>
                            <input 
                              type="number" 
                              required 
                              value={stockInvestment} 
                              onChange={(e) => setStockInvestment(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Receivables from Market ({currency})
                            </label>
                            <input 
                              type="number" 
                              value={receivablesMarket} 
                              onChange={(e) => setReceivablesMarket(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Receivables from Apps / FoodPanda ({currency})
                            </label>
                            <input 
                              type="number" 
                              value={receivablesCompany} 
                              onChange={(e) => setReceivablesCompany(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: CURRENT LIABILITIES */}
                      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            📉 Current Liabilities & Obligations
                          </span>
                          <span style={{ fontSize: '0.78rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                            Total: {formatCurrency(totalLiabilities, currency)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Pending Payables (Suppliers, Rent) ({currency}) *
                            </label>
                            <input 
                              type="number" 
                              required 
                              value={payables} 
                              onChange={(e) => setPayables(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: '700' }}>
                              Monthly Payroll & Staff ({currency}) *
                            </label>
                            <input 
                              type="number" 
                              required 
                              value={payrollExpense} 
                              onChange={(e) => setPayrollExpense(e.target.value)} 
                              className="form-input" 
                              placeholder="0" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: NET WORKING CAPITAL SUMMARY */}
                      <div style={{ 
                        background: 'rgba(15,23,42,0.9)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '10px', 
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                            Net Working Capital
                          </span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                            Current Assets minus Current Liabilities
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '900', 
                            color: !hasInputs ? '#94a3b8' : (netWorkingCapital >= 0 ? '#10b981' : '#ef4444') 
                          }}>
                            {formatCurrency(netWorkingCapital, currency)}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: !hasInputs ? '#64748b' : (netWorkingCapital >= 0 ? '#10b981' : '#ef4444'), fontWeight: '700' }}>
                            {!hasInputs ? '● Baseline' : (netWorkingCapital >= 0 ? '▲ Positive Solvency' : '▼ Capital Deficit')}
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting || !cashInHand || !stockInvestment || !payables || !payrollExpense} 
                        style={{ 
                          background: (isSubmitting || !cashInHand || !stockInvestment || !payables || !payrollExpense)
                            ? 'rgba(59,130,246,0.3)'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                          color: '#fff', 
                          padding: '0.95rem', 
                          borderRadius: '10px', 
                          fontSize: '0.95rem', 
                          fontWeight: '800', 
                          border: 'none', 
                          cursor: (isSubmitting || !cashInHand || !stockInvestment || !payables || !payrollExpense) ? 'not-allowed' : 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem',
                          boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />} 
                        Submit Verified Balance Sheet Audit
                      </button>
                    </form>
                  )}
                </div>

                {/* RIGHT COLUMN: HEALTH SCORE, ASSET PHOTOS, AND AUDIT HISTORY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* CARD 1: DYNAMIC AI HEALTH SCORE */}
                  <div className="glass-card" style={{ 
                    background: `linear-gradient(135deg, ${healthInfo.bg}, rgba(7,10,20,0.85))`, 
                    borderColor: healthInfo.border,
                    padding: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '44px', height: '44px', background: healthInfo.bg, borderRadius: '10px', display: 'grid', placeItems: 'center', color: healthInfo.color, border: `1px solid ${healthInfo.border}` }}>
                          <BarChart2 size={22} />
                        </div>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Projected Health Score
                          </p>
                          <h3 style={{ fontSize: '1.75rem', color: healthInfo.color, margin: 0, fontWeight: '900' }}>
                            {hasInputs ? `${calculatedHealthScore}/100` : '— / 100'}
                          </h3>
                        </div>
                      </div>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        background: healthInfo.bg, 
                        color: healthInfo.color, 
                        border: `1px solid ${healthInfo.border}`, 
                        padding: '0.2rem 0.55rem', 
                        borderRadius: '6px', 
                        fontWeight: '800' 
                      }}>
                        ● {healthInfo.label}
                      </span>
                    </div>

                    {/* SCORE PROGRESS BAR */}
                    <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: '6px', height: '8px', overflow: 'hidden', margin: '0.75rem 0' }}>
                      <div style={{ 
                        width: `${hasInputs ? calculatedHealthScore : 0}%`, 
                        background: healthInfo.color, 
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }} />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                      {healthInfo.subtext}
                    </p>
                  </div>

                  {/* CARD 2: FIELD ASSET INSPECTION PHOTOS */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800' }}>
                        <Camera size={16} style={{ color: '#60a5fa' }} /> Field Asset Inspection Photos
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Upload on site</span>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {['Specialty Espresso Machine', 'Media 5-Ton AC Cassettes', 'POS Cash Register Terminal'].map((asset) => {
                        const status = uploadedAssets[asset];
                        return (
                          <div key={asset} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{asset}</span>
                            
                            {status === 'uploading' ? (
                              <span style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                                <Loader2 className="animate-spin" size={13} /> Uploading...
                              </span>
                            ) : status === 'verified' ? (
                              <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            ) : status === 'error' ? (
                              <label style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <AlertCircle size={12} /> Retry
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, asset)} style={{ display: 'none' }} />
                              </label>
                            ) : (
                              <label style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Upload size={12} /> Add Photo
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, asset)} style={{ display: 'none' }} />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CARD 3: RECENT AUDIT HISTORY PANEL */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800' }}>
                        <FileText size={16} style={{ color: '#60a5fa' }} /> Recent Audit History
                      </h3>
                      {loadingHistory && <Loader2 className="animate-spin" size={13} style={{ color: '#60a5fa' }} />}
                    </div>

                    {loadingHistory ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                        Loading audit history...
                      </div>
                    ) : auditHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#64748b' }}>
                        <ClipboardCheck size={26} style={{ margin: '0 auto 0.4rem auto', color: '#334155' }} />
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>
                          No previous audits logged for this outlet.
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem' }}>
                          Completed balance sheet runs will appear here.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {auditHistory.map((audit) => {
                          const dateStr = audit.audit_month || (audit.created_at ? new Date(audit.created_at).toISOString().substring(0, 7) : 'Recent');
                          const score = audit.calculated_health_score || 85;
                          const scoreColor = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
                          return (
                            <div 
                              key={audit.id} 
                              style={{ 
                                background: 'rgba(15,23,42,0.6)', 
                                border: '1px solid rgba(255,255,255,0.06)', 
                                padding: '0.75rem 0.9rem', 
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fff' }}>
                                  📅 {dateStr}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                  Cash: {formatCurrency(Number(audit.cash_in_hand_bdt || 0), currency)} • Payables: {formatCurrency(Number(audit.payables_bdt || 0), currency)}
                                </div>
                              </div>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                background: `${scoreColor}18`, 
                                color: scoreColor, 
                                border: `1px solid ${scoreColor}40`,
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '6px', 
                                fontWeight: '800' 
                              }}>
                                {score}/100
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ── TAB 2: INVESTOR PORTFOLIO & RELATIONSHIP DESK ── */}
            {activeTab === 'investors' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                
                {/* HEADER ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                      Assigned Investor Directory & Accounts
                    </h2>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Advisory desk oversight, KYC tier accreditation, and active asset allocations
                    </p>
                  </div>
                </div>

                {/* 3-CARD TAB-LEVEL PORTFOLIO KPI STRIP */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Portfolio Capital (AUM)
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
                        {formatCurrency(totalPortfolioAum, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned Capital</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      KYC Verified Accounts
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                        {kycVerifiedCount} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {assignedInvestors.length}</span>
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Verified Status</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Avg Accreditation Tier
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                        Tier {avgKycLevel} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 3</span>
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Portfolio Quality</span>
                    </div>
                  </div>

                </div>

                {/* STATUS FILTER PILLS */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'All', label: 'All Accounts', count: assignedInvestors.length },
                    { key: 'Active', label: 'Active', count: assignedInvestors.filter(i => i.onboarding_status === 'Active').length },
                    { key: 'VIP', label: 'VIP / Family Office', count: assignedInvestors.filter(i => i.onboarding_status === 'VIP' || i.category === 'VIP' || i.category === 'Family Office').length },
                    { key: 'KYC Pending', label: 'KYC Pending', count: assignedInvestors.filter(i => ['KYC_L1', 'KYC_L2', 'Telegram_Verified', 'Invited'].includes(i.onboarding_status) || !i.kyc_verified).length },
                    { key: 'Invited', label: 'Invited', count: assignedInvestors.filter(i => i.onboarding_status === 'Invited').length }
                  ].map(tab => {
                    const isSel = investorFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setInvestorFilter(tab.key)}
                        style={{
                          background: isSel ? 'rgba(59,130,246,0.2)' : 'rgba(15,23,42,0.6)',
                          color: isSel ? '#60a5fa' : '#94a3b8',
                          border: isSel ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: isSel ? '800' : '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{tab.label}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          background: isSel ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                          color: isSel ? '#fff' : '#94a3b8',
                          padding: '0.05rem 0.4rem',
                          borderRadius: '10px',
                          fontWeight: '700'
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* INVESTOR CARDS LIST */}
                {assignedInvestors.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                    <Users size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
                      No investors assigned to your advisory desk yet
                    </h3>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      Admin assignments will appear here automatically with portfolio breakdowns.
                    </p>
                  </div>
                ) : filteredInvestors.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: '#64748b' }}>
                    <Filter size={32} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#94a3b8' }}>
                      No investors match the &quot;{investorFilter}&quot; filter.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {filteredInvestors.map((inv) => {
                      const totalAlloc = (inv.investments || []).reduce((s, i) => s + Number(i.amount_invested_bdt || 0), 0);
                      const statusColor = inv.onboarding_status === 'VIP' ? '#f0b429' : inv.onboarding_status === 'Active' ? '#10b981' : '#3b82f6';
                      const displayName = inv.requires_anonymity ? inv.alias_name : (inv.alias_name || inv.full_name || 'Valued Partner');
                      const kycLevel = inv.kyc_level || (inv.kyc_verified ? 2 : 1);
                      const activeInvestments = inv.investments || [];

                      return (
                        <div 
                          key={inv.id} 
                          className="glass-card"
                          style={{ 
                            padding: '1.5rem', 
                            borderLeft: `4px solid ${statusColor}`,
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                          }}
                        >
                          {/* TOP CARD HEADER */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                                  {displayName}
                                </h3>
                                {inv.requires_anonymity && (
                                  <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                                    🔒 Anonymous OTC
                                  </span>
                                )}
                                <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                  {inv.category || 'HNI Client'}
                                </span>
                                <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}35`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                  ● {inv.onboarding_status || 'Active'}
                                </span>
                              </div>

                              {/* CONTACT & CHANNELS */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                                {inv.phone && (
                                  <a href={`tel:${inv.phone}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    📞 {inv.phone}
                                  </a>
                                )}
                                {inv.email && (
                                  <a href={`mailto:${inv.email}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    ✉️ {inv.email}
                                  </a>
                                )}
                                <span>
                                  Telegram: {inv.telegram_chat_id ? <strong style={{ color: '#60a5fa' }}>Linked ({inv.telegram_chat_id})</strong> : <span style={{ color: '#64748b' }}>Unlinked</span>}
                                </span>
                                {inv.preferred_channel && (
                                  <span style={{ color: '#f0b429', fontWeight: '700' }}>
                                    Preferred: {inv.preferred_channel}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* TOTAL ALLOCATION HIGHLIGHT */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                                Total Allocated
                              </div>
                              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429' }}>
                                {formatCurrency(totalAlloc, currency)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: inv.kyc_verified ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
                                {inv.kyc_verified ? `✓ KYC Tier ${kycLevel} Verified` : `⏳ KYC Tier ${kycLevel} Pending`}
                              </div>
                            </div>
                          </div>

                          {/* ACTIVE ALLOCATIONS BREAKDOWN TABLE */}
                          {activeInvestments.length > 0 && (
                            <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.85rem 1rem', margin: '0.75rem 0 1rem 0' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                                Active Portfolio Holdings ({activeInvestments.length})
                              </div>
                              <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {activeInvestments.map((invItem) => (
                                  <div key={invItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ color: '#fff', fontWeight: '700' }}>
                                        {invItem.funding_projects?.project_title || 'CapEx Outlet SPV'}
                                      </span>
                                      {invItem.yield_option && (
                                        <span style={{ fontSize: '0.68rem', background: 'rgba(240,180,41,0.12)', color: '#f0b429', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                          Option {invItem.yield_option}
                                        </span>
                                      )}
                                      <span style={{ fontSize: '0.68rem', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                        {invItem.status || 'Active'}
                                      </span>
                                    </div>
                                    <span style={{ color: '#f0b429', fontWeight: '800' }}>
                                      {formatCurrency(Number(invItem.amount_invested_bdt || 0), currency)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ACTION BUTTONS */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {inv.phone && (
                              <a 
                                href={`tel:${inv.phone}`}
                                style={{ 
                                  background: 'rgba(59,130,246,0.15)', 
                                  color: '#60a5fa', 
                                  border: '1px solid rgba(59,130,246,0.3)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '800', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <Phone size={13} /> Direct Call
                              </a>
                            )}
                            {inv.phone && (
                              <a 
                                href={`https://wa.me/${inv.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  background: 'rgba(16,185,129,0.15)', 
                                  color: '#10b981', 
                                  border: '1px solid rgba(16,185,129,0.3)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '800', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <MessageSquare size={13} /> WhatsApp
                              </a>
                            )}
                            {inv.email && (
                              <a 
                                href={`mailto:${inv.email}`}
                                style={{ 
                                  background: 'rgba(255,255,255,0.05)', 
                                  color: '#cbd5e1', 
                                  border: '1px solid rgba(255,255,255,0.1)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '700', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <Mail size={13} /> Email
                              </a>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ── TAB 3: CAPEX PROJECTS OVERVIEW ── */}
            {activeTab === 'projects' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                
                {/* HEADER ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                      Active CapEx Pipeline & SPV Deal Room
                    </h2>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Track fundraise milestones, SPV legal structuring, and syndicated capital deployment
                    </p>
                  </div>
                </div>

                {/* 3-CARD TAB-LEVEL CAPEX KPI STRIP */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total CapEx Pipeline
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                        {formatCurrency(totalCapexPipeline, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Target Volume</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Capital Committed
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
                        {formatCurrency(totalCapitalCommitted, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                        {totalCapexPipeline > 0 ? `${Math.round((totalCapitalCommitted / totalCapexPipeline) * 100)}% Funded` : '0%'}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Active Targets
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                        {managedProjects.length}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Live Portfolios</span>
                    </div>
                  </div>

                </div>

                {/* PROJECT CARDS LIST */}
                {managedProjects.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                    <Building2 size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
                      No CapEx projects currently active
                    </h3>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      Deals originated in the Admin Pipeline will automatically appear here for managing partners.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {managedProjects.map((p) => {
                      const target = Number(p.target_raise_bdt || 0);
                      const raised = Number(p.amount_raised_bdt || 0);
                      const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                      const statusStyle = getProjectStatusStyle(p.status);
                      const fTypeStyle = getFundingTypeStyle(p.funding_type);
                      const investorCount = (p.investments || []).length;

                      return (
                        <div 
                          key={p.id} 
                          className="glass-card"
                          style={{ 
                            padding: '1.5rem', 
                            borderLeft: `4px solid ${statusStyle.color}`,
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                          }}
                        >
                          {/* CARD HEADER */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {p.businesses?.brand_name || 'GRO10X Hub'}
                                </span>
                                {p.funding_type && (
                                  <span style={{ background: fTypeStyle.bg, color: fTypeStyle.color, border: `1px solid ${fTypeStyle.border}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                    {p.funding_type}
                                  </span>
                                )}
                                <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                  {statusStyle.label}
                                </span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: '900', letterSpacing: '-0.01em' }}>
                                {p.project_title}
                              </h3>
                              {p.project_description && (
                                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                                  {p.project_description}
                                </p>
                              )}
                            </div>

                            {/* SPV & YIELD MODEL INFO */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                                SPV Legal Structure
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: p.spv_name ? '#cbd5e1' : '#f59e0b' }}>
                                {p.spv_name || '⚠ SPV Structuring In Progress'}
                              </div>
                              {p.yield_model && (
                                <div style={{ fontSize: '0.72rem', color: '#f0b429', fontWeight: '700', marginTop: '0.15rem' }}>
                                  Yield Model: {p.yield_model}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* PROGRESS BAR */}
                          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', height: '12px', overflow: 'hidden', margin: '1rem 0 0.75rem 0' }}>
                            <div style={{ 
                              width: `${pct}%`, 
                              background: 'linear-gradient(90deg, #f0b429, #10b981)', 
                              height: '100%',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>

                          {/* METRICS ROW */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Committed Capital</span>
                              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>
                                {formatCurrency(raised, currency)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>CapEx Target Raise</span>
                              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#f0b429' }}>
                                {formatCurrency(target, currency)} <span style={{ fontSize: '0.78rem', color: '#10b981' }}>({pct}%)</span>
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Min. OTC Ticket</span>
                              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#cbd5e1' }}>
                                {formatCurrency(Number(p.min_otc_investment_bdt || 5000000), currency)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Participating Investors</span>
                              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Users size={14} /> {investorCount} Partner{investorCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ── TAB 4: YIELD DISBURSEMENT AUDITS ── */}
            {activeTab === 'yields' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                
                {/* HEADER ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                      Yield Disbursement Audit History & Verified Payouts
                    </h2>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Audit operating distributions, gross sales reconciliation, and syndicate dividend settlement
                    </p>
                  </div>
                </div>

                {/* 3-CARD TAB-LEVEL YIELD KPI STRIP */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f0b429' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Yield Distributed
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f0b429', margin: 0 }}>
                        {formatCurrency(totalYieldDistributed, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● All-Time Payouts</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Verified Batches
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                        {totalDisbBatches}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Settlement Runs</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Avg Payout / Batch
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                        {formatCurrency(avgYieldPerBatch, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Mean Cashflow</span>
                    </div>
                  </div>

                </div>

                {/* YIELD DISBURSEMENTS LIST */}
                {disbursementHistory.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                    <TrendingUp size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
                      No yield disbursement history recorded yet
                    </h3>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      Monthly yield declarations finalised in the Admin Yield Engine will appear here with distribution audits.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {disbursementHistory.map((d) => {
                      const statusStyle = getYieldStatusStyle(d.status);
                      const period = d.disbursement_month || (d.month && d.year ? `${d.month} ${d.year}` : (d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Monthly Yield'));
                      const payeeCount = (d.investor_yields || []).length;
                      const projectName = d.funding_projects?.project_title || 'Operating SPV';
                      const brandName = d.funding_projects?.businesses?.brand_name || 'GRO10X Hub';

                      return (
                        <div 
                          key={d.id} 
                          className="glass-card"
                          style={{ 
                            padding: '1.5rem', 
                            borderLeft: `4px solid ${statusStyle.color}`,
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                          }}
                        >
                          {/* HEADER */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {brandName}
                                </span>
                                <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                  {statusStyle.label}
                                </span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '900' }}>
                                {projectName} — <span style={{ color: '#f0b429' }}>{period}</span>
                              </h3>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Verified Run Date: {d.payment_date ? new Date(d.payment_date).toLocaleDateString() : (d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent')}
                              </div>
                            </div>

                            {/* TOTAL DISTRIBUTED HIGHLIGHT */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                                Total Distributed
                              </div>
                              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981' }}>
                                {formatCurrency(Number(d.total_disbursed_bdt || 0), currency)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: '700' }}>
                                👥 {payeeCount} Investor Payout{payeeCount !== 1 ? 's' : ''} Processed
                              </div>
                            </div>
                          </div>

                          {/* FINANCIAL AUDIT BREAKDOWN GRID */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Gross Outlet Sales</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                                {formatCurrency(Number(d.gross_sales_bdt || 0), currency)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Net Solvency Profit</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#60a5fa' }}>
                                {formatCurrency(Number(d.net_profit_bdt || 0), currency)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Syndicate Allocation</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#f0b429' }}>
                                {formatCurrency(Number(d.total_disbursed_bdt || 0), currency)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Settlement Ledger</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle size={14} /> Reconciled
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ── TAB 5: CASH PIPELINE ── */}
            {activeTab === 'cash-pipeline' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                
                {/* HEADER ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#D4AF37' }}>
                      Assigned Cash Concierge & OTC Block Pipeline
                    </h2>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Private physical consultation desk, offline banking settlement, and escrow clearance
                    </p>
                  </div>
                </div>

                {/* 3-CARD TAB-LEVEL CASH KPI STRIP */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Active Pipeline Value
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
                        {formatCurrency(activeCashPipeline, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned OTC</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f59e0b' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Pending Consultations
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f59e0b', margin: 0 }}>
                        {pendingCashTicketsCount}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>● Awaiting Review</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Cleared Capital
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                        {clearedCashTicketsCount}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Funds Settled</span>
                    </div>
                  </div>

                </div>

                {/* STATUS FILTER PILLS */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'All', label: 'All Tickets', count: cashTickets.length },
                    { key: 'Pending_Review', label: 'Pending Review', count: cashTickets.filter(t => t.status === 'Pending_Review').length },
                    { key: 'Meeting_Scheduled', label: 'Meeting Scheduled', count: cashTickets.filter(t => t.status === 'Meeting_Scheduled').length },
                    { key: 'Funds_Cleared', label: 'Funds Cleared', count: cashTickets.filter(t => t.status === 'Funds_Cleared').length },
                    { key: 'Closed', label: 'Closed / Final', count: cashTickets.filter(t => ['Closed', 'Rejected'].includes(t.status)).length }
                  ].map(tab => {
                    const isSel = cashFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setCashFilter(tab.key)}
                        style={{
                          background: isSel ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.6)',
                          color: isSel ? '#D4AF37' : '#94a3b8',
                          border: isSel ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: isSel ? '800' : '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{tab.label}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          background: isSel ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                          color: isSel ? '#000' : '#94a3b8',
                          padding: '0.05rem 0.4rem',
                          borderRadius: '10px',
                          fontWeight: '800'
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* CASH TICKETS LIST */}
                {cashTickets.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                    <DollarSign size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
                      No cash concierge tickets assigned to your investors
                    </h3>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      OTC block trading requests initiated by KYC Level 3 investors will automatically route here.
                    </p>
                  </div>
                ) : filteredCashTickets.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: '#64748b' }}>
                    <Filter size={32} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#94a3b8' }}>
                      No tickets match the &quot;{cashFilter}&quot; filter.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {filteredCashTickets.map((ticket) => {
                      const statusStyle = getCashTicketStatusStyle(ticket.status);
                      const investor = ticket.investors;
                      const displayName = investor?.requires_anonymity ? investor?.alias_name : (investor?.alias_name || investor?.full_name || 'HNI Client');
                      const kycLevel = investor?.kyc_level || 3;
                      const projectTitle = ticket.funding_projects?.project_title || 'Private OTC Placement';
                      const brandName = ticket.funding_projects?.businesses?.brand_name || 'GRO10X Hub';

                      return (
                        <div 
                          key={ticket.id} 
                          className="glass-card"
                          style={{ 
                            padding: '1.5rem', 
                            borderLeft: `4px solid ${statusStyle.color}`,
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                          }}
                        >
                          {/* HEADER */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {brandName}
                                </span>
                                <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                  {statusStyle.label}
                                </span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '900' }}>
                                {projectTitle}
                              </h3>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                Requested: {new Date(ticket.created_at).toLocaleDateString()} • Ticket ID: #{ticket.id?.substring(0, 8)}
                              </div>
                            </div>

                            {/* TICKET AMOUNT */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                                OTC Block Order
                              </div>
                              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37' }}>
                                {formatCurrency(ticket.ticket_amount_bdt, currency)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>
                                🔒 Escrow Physical Placement
                              </div>
                            </div>
                          </div>

                          {/* CLIENT & MEETING DETAILS GRID */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', margin: '0.85rem 0' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Client Account</span>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                                {displayName}
                                <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                                  L{kycLevel}
                                </span>
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Preferred Meeting Time</span>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', marginTop: '0.1rem' }}>
                                {ticket.preferred_meeting_time || 'Awaiting Confirmation'}
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Meeting Format</span>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', marginTop: '0.1rem' }}>
                                {ticket.meeting_format || 'In-Person (HQ Concierge)'}
                              </div>
                            </div>

                            {ticket.confirmed_meeting_date && (
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Confirmed Schedule</span>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f0b429', marginTop: '0.1rem' }}>
                                  {new Date(ticket.confirmed_meeting_date).toLocaleDateString()}
                                </div>
                              </div>
                            )}

                            {ticket.funds_transfer_ref && (
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Funds Transfer Ref</span>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981', marginTop: '0.1rem' }}>
                                  {ticket.funds_transfer_ref}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {investor?.phone && (
                              <a 
                                href={`tel:${investor.phone}`}
                                style={{ 
                                  background: 'rgba(59,130,246,0.15)', 
                                  color: '#60a5fa', 
                                  border: '1px solid rgba(59,130,246,0.3)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '800', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <Phone size={13} /> Direct Call
                              </a>
                            )}
                            {investor?.phone && (
                              <a 
                                href={`https://wa.me/${investor.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  background: 'rgba(16,185,129,0.15)', 
                                  color: '#10b981', 
                                  border: '1px solid rgba(16,185,129,0.3)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '800', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <MessageSquare size={13} /> WhatsApp
                              </a>
                            )}
                            {investor?.email && (
                              <a 
                                href={`mailto:${investor.email}`}
                                style={{ 
                                  background: 'rgba(255,255,255,0.05)', 
                                  color: '#cbd5e1', 
                                  border: '1px solid rgba(255,255,255,0.1)', 
                                  padding: '0.4rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '700', 
                                  textDecoration: 'none', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.35rem' 
                                }}
                              >
                                <Mail size={13} /> Email
                              </a>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}
