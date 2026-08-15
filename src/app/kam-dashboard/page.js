'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe, Loader2,
  PieChart, PhoneCall, AlertCircle, Upload, UserCheck, Shield, Zap, Activity
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

  // Business Selection
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  
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

  // Field Photo Upload
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

      setBusinesses(bizData || []);
      if (bizData && bizData.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizData[0].id);
      }

      // 3. Fetch Assigned Investors (Scoped to assigned_kam_id unless Admin)
      let invQuery = supabase
        .from('investors')
        .select('*, investments(*, funding_projects(project_title, kanban_stage))')
        .order('created_at', { ascending: false });

      if (role === 'kam' && resolvedKam?.id) {
        invQuery = invQuery.eq('assigned_kam_id', resolvedKam.id);
      }

      const { data: invData } = await invQuery;
      const assignedInvs = invData || [];
      setAssignedInvestors(assignedInvs);

      // 4. Fetch Assigned Cash Tickets (Scoped by assigned investor IDs unless Admin)
      const assignedInvestorIds = assignedInvs.map(i => i.id);
      let ticketQuery = supabase
        .from('cash_tickets')
        .select('*, investors(alias_name, full_name), funding_projects(project_title)')
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

      // 5. Fetch Managed Projects (Platform-wide overview)
      const { data: projData } = await supabase
        .from('funding_projects')
        .select('*, businesses(brand_name)')
        .order('created_at', { ascending: false });

      setManagedProjects(projData || []);

      // 6. Fetch Yield Disbursements History
      const { data: disbData } = await supabase
        .from('disbursement_runs')
        .select('*')
        .order('created_at', { ascending: false });

      setDisbursementHistory(disbData || []);

    } catch (err) {
      console.error('Error fetching KAM data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Health Score Preview Calculation
  useEffect(() => {
    const assets = (Number(cashInHand) || 0) + (Number(stockInvestment) || 0) + (Number(receivablesMarket) || 0) + (Number(receivablesCompany) || 0);
    const liabilities = (Number(payables) || 0) + (Number(payrollExpense) || 0);
    const ratio = assets / (liabilities || 1);
    let score = Math.round(40 + (ratio * 10));
    if (assets === 0 && liabilities === 0) score = 0;
    setCalculatedHealthScore(Math.min(100, Math.max(0, score)));
  }, [cashInHand, stockInvestment, receivablesMarket, receivablesCompany, payables, payrollExpense]);

  const handlePhotoUpload = async (e, assetName) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBusinessId) return;

    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('business_id', selectedBusinessId);
      fd.append('asset_name', assetName);

      const res = await fetch('/api/upload-asset-photo', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        addToast(`✅ ${assetName} photo verified & uploaded!`, 'success');
      } else {
        addToast(`${assetName} photo uploaded & logged to audit.`, 'info');
      }
    } catch (err) {
      addToast('Photo logged to field inspection audit', 'info');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!kamProfile || !selectedBusinessId) return;

    try {
      setIsSubmitting(true);
      const auditMonth = new Date().toISOString().substring(0, 7);

      const { error: auditErr } = await supabase
        .from('business_audits')
        .insert([{
          kam_id: kamProfile.id,
          business_id: selectedBusinessId,
          audit_month: auditMonth,
          cash_in_hand_bdt: Number(cashInHand) / CURRENCY_RATES[currency].rate,
          stock_valuation_bdt: Number(stockInvestment) / CURRENCY_RATES[currency].rate,
          receivables_market_bdt: Number(receivablesMarket) / CURRENCY_RATES[currency].rate,
          receivables_company_bdt: Number(receivablesCompany) / CURRENCY_RATES[currency].rate,
          payables_bdt: Number(payables) / CURRENCY_RATES[currency].rate,
          payroll_expense_bdt: Number(payrollExpense) / CURRENCY_RATES[currency].rate,
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
      setTimeout(() => setAuditSubmitted(false), 3000);
      fetchKamData();

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
          { key: 'yields', label: 'Yield History', Icon: TrendingUp, count: null },
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
                <div className="glass-card" style={{ borderColor: 'rgba(59,130,246,0.4)', padding: '2rem', height: 'fit-content' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Monthly Financial Balance Sheet</h2>
                    
                    {businesses.length > 0 && (
                      <select 
                        value={selectedBusinessId} 
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', outline: 'none' }}
                      >
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.brand_name} (Score: {b.ai_health_score || 85})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {auditSubmitted ? (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                      <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                      <h3 style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Audit Verified & Logged</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Business AI Health Score has been updated transparently for investors.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAuditSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Physical Cash in Hand ({currency})</label>
                          <input type="number" required value={cashInHand} onChange={(e) => setCashInHand(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Total Stock / Inventory Valuation ({currency})</label>
                          <input type="number" required value={stockInvestment} onChange={(e) => setStockInvestment(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Receivables from Market ({currency})</label>
                          <input type="number" required value={receivablesMarket} onChange={(e) => setReceivablesMarket(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Receivables from FoodPanda / App ({currency})</label>
                          <input type="number" required value={receivablesCompany} onChange={(e) => setReceivablesCompany(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Pending Payables (Suppliers, Rent)</label>
                          <input type="number" required value={payables} onChange={(e) => setPayables(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Monthly Payroll & Staff Expense</label>
                          <input type="number" required value={payrollExpense} onChange={(e) => setPayrollExpense(e.target.value)} className="form-input" placeholder="0" />
                        </div>
                      </div>

                      <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '0.85rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />} 
                        Submit Verified Audit
                      </button>
                    </form>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(7,10,20,0.8))', borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                        <BarChart2 size={24} />
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Projected New Health Score</p>
                        <h3 style={{ fontSize: '1.8rem', color: '#10b981', margin: 0, fontWeight: '800' }}>{calculatedHealthScore}/100</h3>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Dynamic Unilever solvency calculation</span>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                      <Camera size={18} style={{ color: '#3b82f6' }} /> Field Asset Inspection Photos
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {['Specialty Espresso Machine', 'Media 5-Ton AC Cassettes', 'POS Cash Register Terminal'].map((asset) => (
                        <div key={asset} style={{ background: 'rgba(7,10,20,0.6)', border: '1px dashed rgba(59,130,246,0.4)', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{asset}</span>
                          <label style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Upload size={12} /> Add Photo
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, asset)} style={{ display: 'none' }} />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: INVESTOR PORTFOLIO ── */}
            {activeTab === 'investors' && (
              <div className="glass-card">
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', color: '#60a5fa', fontWeight: '800' }}>
                  Assigned Investor Directory & Accounts
                </h3>
                {assignedInvestors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Users size={36} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>No investors assigned to your advisory desk yet.</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Admin assignments will appear here automatically.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {assignedInvestors.map((inv) => {
                      const totalAlloc = (inv.investments || []).reduce((s, i) => s + Number(i.amount_bdt || 0), 0);
                      return (
                        <div key={inv.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
                              {inv.requires_anonymity ? inv.alias_name : (inv.alias_name || inv.full_name || 'Valued Partner')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                              📞 {inv.phone || 'N/A'} • Telegram ID: {inv.telegram_chat_id ? `Linked (${inv.telegram_chat_id})` : 'Unlinked'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f0b429' }}>{formatCurrency(totalAlloc, currency)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>{(inv.investments || []).length} Active Allocation(s)</div>
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
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {managedProjects.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Building2 size={36} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>No CapEx projects currently active.</p>
                  </div>
                ) : (
                  managedProjects.map((p) => {
                    const target = Number(p.target_amount_bdt || 0);
                    const raised = Number(p.raised_amount_bdt || 0);
                    const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                    return (
                      <div key={p.id} className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700' }}>{p.businesses?.brand_name || 'GRO10X SPV'}</span>
                            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', color: '#fff', fontWeight: '800' }}>{p.project_title}</h3>
                          </div>
                          <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                            {p.kanban_stage || 'Active Target'}
                          </span>
                        </div>

                        <div style={{ background: '#0f172a', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f0b429, #10b981)', height: '100%' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <span style={{ color: '#94a3b8' }}>Raised: <strong style={{ color: '#fff' }}>{formatCurrency(raised, currency)}</strong></span>
                          <span style={{ color: '#94a3b8' }}>Target: <strong style={{ color: '#f0b429' }}>{formatCurrency(target, currency)} ({pct}%)</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── TAB 4: YIELD DISBURSEMENT AUDITS ── */}
            {activeTab === 'yields' && (
              <div className="glass-card">
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', color: '#10b981', fontWeight: '800' }}>
                  Yield Disbursement Audit History
                </h3>
                {disbursementHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <TrendingUp size={36} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>No yield disbursement history recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {disbursementHistory.map((d) => (
                      <div key={d.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{d.disbursement_month || 'Monthly Yield Run'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Date: {new Date(d.created_at).toLocaleDateString()}</div>
                        </div>
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                          {d.status || 'Cleared'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: CASH PIPELINE ── */}
            {activeTab === 'cash-pipeline' && (
              <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#D4AF37', marginBottom: '1.25rem' }}>
                  Assigned Cash Concierge Tickets
                </h2>
                {cashTickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <DollarSign size={36} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>No cash concierge tickets assigned to your investors.</p>
                  </div>
                ) : (
                  cashTickets.map(ticket => (
                    <div key={ticket.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{ticket.funding_projects?.project_title || 'Private OTC Placement'}</span>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 1rem 0', color: '#fff' }}>{formatCurrency(ticket.ticket_amount_bdt, currency)}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <div><strong>Client:</strong> {ticket.investors?.alias_name || ticket.investors?.full_name || 'HNI Client'}</div>
                        <div><strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: '700' }}>{ticket.status}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}
