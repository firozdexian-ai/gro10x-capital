'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, Database, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, List, FileText, ChevronRight, Loader2,
  Search, Briefcase, Calendar, Percent, Activity, ExternalLink, Layers, AlertCircle
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency, formatFullCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function BusinessOwnerPortal() {
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [founderProfile, setFounderProfile] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState('campaign'); // 'campaign', 'captable', 'pos'
  const [loading, setLoading] = useState(true);

  // Campaign Overview
  const [fundingProjects, setFundingProjects] = useState([]);

  // Cap Table
  const [capTable, setCapTable] = useState([]);
  const [capTableSearch, setCapTableSearch] = useState('');

  // POS Sync State
  const [posSyncDate, setPosSyncDate] = useState(new Date().toISOString().substring(0, 10));
  const [grossSales, setGrossSales] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [transactionCount, setTransactionCount] = useState('');
  const [posHistory, setPosHistory] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { addToast } = useToast();

  const isStaffOverseer = role === 'admin' || role === 'kam';

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchBusinessData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, role]);

  const fetchBusinessData = async (targetBusinessId = null) => {
    try {
      setLoading(true);

      // If staff/admin, fetch all businesses for overseer switcher
      if (isStaffOverseer) {
        const { data: businessesList } = await supabase
          .from('businesses')
          .select('*, founders(full_name)')
          .order('brand_name', { ascending: true });
        
        if (businessesList && businessesList.length > 0) {
          setAllBusinesses(businessesList);
          
          // Select targeted business or default to first
          const target = targetBusinessId 
            ? businessesList.find(b => b.id === targetBusinessId) || businessesList[0]
            : businessesList[0];
          
          setBusinessData(target);
          if (target.founders) {
            setFounderProfile(target.founders);
          } else {
            setFounderProfile({ full_name: 'Platform Managed' });
          }

          await loadBusinessRelations(target.id);
          setLoading(false);
          return;
        }
      }

      // 1. Fetch founder profile for logged in founder
      const { data: profile, error: profErr } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (profErr) {
        console.error('Founder lookup error:', profErr);
      }

      if (!profile) {
        // Not a founder and not admin/kam
        setFounderProfile(null);
        setBusinessData(null);
        setLoading(false);
        return;
      }

      setFounderProfile(profile);

      // 2. Fetch business for this founder
      const { data: bizData, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('founder_id', profile.id)
        .maybeSingle();
        
      if (bizErr) console.error('Business lookup error:', bizErr);
      
      if (bizData) {
        setBusinessData(bizData);
        await loadBusinessRelations(bizData.id);
      } else {
        setBusinessData(null);
      }

    } catch (err) {
      console.error('Error fetching business portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessRelations = async (bizId) => {
    // 3. Fetch Funding Projects
    const { data: projects, error: projErr } = await supabase
      .from('funding_projects')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });
      
    if (projErr) console.error('Projects error:', projErr);
    const activeProjects = projects || [];
    setFundingProjects(activeProjects);

    // 4. Fetch Cap Table (Active investments)
    if (activeProjects.length > 0) {
      const projectIds = activeProjects.map(p => p.id);
      const { data: invData, error: invErr } = await supabase
        .from('investments')
        .select(`
          id,
          amount_invested_bdt,
          status,
          created_at,
          funding_project_id,
          investors ( alias_name, category ),
          funding_projects ( project_title, target_raise_bdt )
        `)
        .in('funding_project_id', projectIds)
        .eq('status', 'Active')
        .order('amount_invested_bdt', { ascending: false });
        
      if (invErr) console.error('Cap table error:', invErr);
      setCapTable(invData || []);
    } else {
      setCapTable([]);
    }

    // 5. Fetch POS History
    const { data: posData, error: posErr } = await supabase
      .from('pos_daily_sales')
      .select('*')
      .eq('business_id', bizId)
      .order('date', { ascending: false })
      .limit(60);
      
    if (posErr) console.error('POS history error:', posErr);
    setPosHistory(posData || []);
  };

  const handleOverseerBusinessChange = async (newBizId) => {
    const chosen = allBusinesses.find(b => b.id === newBizId);
    if (chosen) {
      setBusinessData(chosen);
      setFounderProfile(chosen.founders || { full_name: 'Platform Managed' });
      await loadBusinessRelations(chosen.id);
    }
  };

  const handlePosSync = async (e) => {
    e.preventDefault();
    if (!businessData) return;
    
    const parsedGross = parseFloat(grossSales);
    const parsedNet = parseFloat(netProfit);

    if (isNaN(parsedGross) || isNaN(parsedNet) || !posSyncDate) {
      addToast('Please provide valid numbers for Gross Sales and Net Profit.', 'error');
      return;
    }

    if (parsedNet > parsedGross) {
      addToast('Net Profit cannot exceed Gross Sales. Please verify numbers.', 'error');
      return;
    }

    try {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from('pos_daily_sales')
        .insert([{
          business_id: businessData.id,
          date: posSyncDate,
          gross_sales_bdt: parsedGross,
          net_profit_bdt: parsedNet,
          transaction_count: parseInt(transactionCount, 10) || 0,
          sync_source: isStaffOverseer ? 'Admin_Verified_Entry' : 'Founder_Portal'
        }])
        .select()
        .single();

      if (error) throw error;

      addToast('POS Telemetry Successfully Logged to Ledger!', 'success');
      
      // Update local history
      setPosHistory(prev => [data, ...prev].sort((a,b) => new Date(b.date) - new Date(a.date)));
      
      // Reset form
      setGrossSales('');
      setNetProfit('');
      setTransactionCount('');
      
    } catch (err) {
      console.error('POS Sync Error:', err);
      addToast('Failed to sync POS data. Please check connection and try again.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Aggregated KPIs
  const totalRaisedBdt = useMemo(() => {
    return fundingProjects.reduce((acc, p) => acc + (Number(p.amount_raised_bdt) || 0), 0);
  }, [fundingProjects]);

  const totalTargetRaiseBdt = useMemo(() => {
    return fundingProjects.reduce((acc, p) => acc + (Number(p.target_raise_bdt) || 0), 0);
  }, [fundingProjects]);

  const overallProgress = totalTargetRaiseBdt > 0 ? (totalRaisedBdt / totalTargetRaiseBdt) * 100 : 0;

  const totalSyndicateCapital = useMemo(() => {
    return capTable.reduce((acc, c) => acc + (Number(c.amount_invested_bdt) || 0), 0);
  }, [capTable]);

  const totalPOS30dBdt = useMemo(() => {
    return posHistory.reduce((acc, l) => acc + (Number(l.gross_sales_bdt) || 0), 0);
  }, [posHistory]);

  const totalNet30dBdt = useMemo(() => {
    return posHistory.reduce((acc, l) => acc + (Number(l.net_profit_bdt) || 0), 0);
  }, [posHistory]);

  const avgMargin30d = totalPOS30dBdt > 0 ? (totalNet30dBdt / totalPOS30dBdt) * 100 : 0;

  // Filtered Cap Table
  const filteredCapTable = useMemo(() => {
    if (!capTableSearch.trim()) return capTable;
    const query = capTableSearch.toLowerCase();
    return capTable.filter(inv => 
      (inv.investors?.alias_name || '').toLowerCase().includes(query) ||
      (inv.funding_projects?.project_title || '').toLowerCase().includes(query) ||
      (inv.investors?.category || '').toLowerCase().includes(query)
    );
  }, [capTable, capTableSearch]);

  // Filtered POS History
  const filteredPosHistory = useMemo(() => {
    if (!posSearch.trim()) return posHistory;
    return posHistory.filter(l => l.date && l.date.includes(posSearch.trim()));
  }, [posHistory, posSearch]);

  // Live Solvency Computation in POS Sync Form
  const liveGross = parseFloat(grossSales) || 0;
  const liveNet = parseFloat(netProfit) || 0;
  const liveMargin = liveGross > 0 ? ((liveNet / liveGross) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spin" size={48} color="#D4AF37" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>Authenticating Founder Portal...</p>
        </div>
      </div>
    );
  }

  if (!founderProfile && !isStaffOverseer) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', color: '#f8fafc', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '520px', padding: '3rem 2rem' }}>
          <ShieldCheck size={52} color="#f0b429" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '0.5rem', color: '#fff' }}>Founder Onboarding Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Your account is authenticated, but no active brand franchise or business record is currently linked to your profile.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/apply" 
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                color: '#070a14', 
                padding: '0.65rem 1.5rem', 
                borderRadius: '6px', 
                fontWeight: '800', 
                fontSize: '0.85rem', 
                textDecoration: 'none' 
              }}
            >
              Apply for Cohort Funding →
            </a>
            <a 
              href="/" 
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: '#cbd5e1', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '0.65rem 1.25rem', 
                borderRadius: '6px', 
                fontWeight: '700', 
                fontSize: '0.85rem', 
                textDecoration: 'none' 
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* EXECUTIVE HEADER */}
      <header style={{ background: 'rgba(7,10,20,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', boxShadow: '0 2px 10px rgba(212,175,55,0.2)' }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                  {businessData?.brand_name || 'Business Portal'}
                </h1>
                {isStaffOverseer && (
                  <span style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                    {role?.toUpperCase()} OVERSEER
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
                Managing Partner: <strong style={{ color: '#cbd5e1' }}>{founderProfile?.full_name || 'Executive'}</strong>
                {businessData?.industry_sector && <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>• {businessData.industry_sector}</span>}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* OVERSEER BUSINESS PICKER */}
            {isStaffOverseer && allBusinesses.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Outlet:</span>
                <select 
                  value={businessData?.id || ''} 
                  onChange={(e) => handleOverseerBusinessChange(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  {allBusinesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.brand_name} ({b.founders?.full_name || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CURRENCY SELECTOR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', color: '#D4AF37', fontWeight: '800', border: '1px solid rgba(212,175,55,0.35)' }}
              >
                {Object.keys(CURRENCY_RATES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCY_RATES[code].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '2rem auto 0 auto', padding: '0 1.5rem', display: 'grid', gap: '2rem' }}>
        
        {/* 4-CARD TOP-LEVEL KPI STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* KPI 1: TOTAL CAPITAL RAISED */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Capital Raised
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(212,175,55,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <TrendingUp size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#D4AF37', marginBottom: '0.2rem' }}>
              {formatCurrency(totalRaisedBdt, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Target: <strong style={{ color: '#cbd5e1' }}>{formatCurrency(totalTargetRaiseBdt, currency)}</strong> ({overallProgress.toFixed(1)}%)
            </div>
          </div>

          {/* KPI 2: SYNDICATE INVESTORS */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Syndicate Investors
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(16,185,129,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                <Users size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#fff', marginBottom: '0.2rem' }}>
              {capTable.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
              ● {formatCurrency(totalSyndicateCapital, currency)} Active Equity
            </div>
          </div>

          {/* KPI 3: 30-DAY POS REVENUE */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                30-Day POS Revenue
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(59,130,246,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#60a5fa' }}>
                <Activity size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#60a5fa', marginBottom: '0.2rem' }}>
              {formatCurrency(totalPOS30dBdt, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Net Profit: <strong style={{ color: '#10b981' }}>{formatCurrency(totalNet30dBdt, currency)}</strong> ({avgMargin30d.toFixed(1)}% margin)
            </div>
          </div>

          {/* KPI 4: ACTIVE CAMPAIGNS */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Projects / SPVs
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(139,92,246,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>
                <Layers size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#fff', marginBottom: '0.2rem' }}>
              {fundingProjects.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700' }}>
              ● {fundingProjects.filter(p => p.status !== 'Closed').length} Live Funding Rounds
            </div>
          </div>

        </div>

        {/* TABS NAVIGATION BAR */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('campaign')} style={tabBtnStyle(activeTab === 'campaign')}>
            <BarChart2 size={16} /> Funding Campaigns ({fundingProjects.length})
          </button>
          <button onClick={() => setActiveTab('captable')} style={tabBtnStyle(activeTab === 'captable')}>
            <Users size={16} /> Investor Cap Table ({capTable.length})
          </button>
          <button onClick={() => setActiveTab('pos')} style={tabBtnStyle(activeTab === 'pos')}>
            <Database size={16} /> POS Revenue Sync ({posHistory.length})
          </button>
        </div>

        {/* ============================================================ */}
        {/* 1. CAMPAIGN OVERVIEW TAB */}
        {/* ============================================================ */}
        {activeTab === 'campaign' && (
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            
            {/* TAB HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
                  Outlet Funding Campaigns
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Live CapEx syndication rounds, legal SPV structures, and investor allocation progress
                </p>
              </div>
              <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                ● {fundingProjects.length} Campaign{fundingProjects.length !== 1 ? 's' : ''} Managed
              </span>
            </div>

            {fundingProjects.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <Layers size={44} style={{ color: '#334155', margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff' }}>No Active Funding Rounds</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
                  New franchise expansion rounds created by the GRO10X Investment Committee will appear here once originated.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {fundingProjects.map(project => {
                  const raised = Number(project.amount_raised_bdt) || 0;
                  const target = Number(project.target_raise_bdt) || 1;
                  const percent = Math.min(100, (raised / target) * 100);
                  const isFunded = percent >= 100;

                  return (
                    <div 
                      key={project.id} 
                      className="glass-card" 
                      style={{ 
                        borderColor: isFunded ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.3)', 
                        padding: '1.5rem',
                        borderLeft: `4px solid ${isFunded ? '#10b981' : '#D4AF37'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span style={{ 
                              background: isFunded ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', 
                              color: isFunded ? '#10b981' : '#D4AF37', 
                              padding: '0.15rem 0.55rem', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              fontWeight: '800' 
                            }}>
                              {project.status || 'Active'}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                              Type: {project.funding_type}
                            </span>
                            {project.yield_model && (
                              <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                                Model: {project.yield_model}
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.35rem 0', fontWeight: '800', color: '#fff' }}>
                            {project.project_title}
                          </h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                            SPV Legal Entity: <strong style={{ color: '#cbd5e1' }}>{project.spv_name || 'Pending SPV Formation'}</strong>
                            {project.min_otc_investment_bdt && (
                              <span style={{ marginLeft: '0.6rem', color: '#64748b' }}>
                                • Min Ticket: {formatCurrency(project.min_otc_investment_bdt, currency)}
                              </span>
                            )}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Amount Raised</div>
                          <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#D4AF37', lineHeight: 1.1 }}>
                            {formatCurrency(project.amount_raised_bdt, currency)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', marginTop: '0.2rem' }}>
                            Target: {formatCurrency(project.target_raise_bdt, currency)}
                          </div>
                        </div>
                      </div>

                      {/* PROGRESS BAR */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                          <span style={{ color: '#94a3b8', fontWeight: '700' }}>Campaign Funding Progress</span>
                          <span style={{ color: '#D4AF37', fontWeight: '800' }}>{percent.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${percent}%`, 
                              background: isFunded 
                                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                : 'linear-gradient(90deg, #D4AF37, #F3E5AB)' 
                            }} 
                          />
                        </div>
                      </div>

                      {/* ACTIONS ROW */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <a 
                          href={`/projects/${project.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(212,175,55,0.12)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.3)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            textDecoration: 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          View Public Deal Room <ArrowUpRight size={14} />
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* 2. CAP TABLE TAB */}
        {/* ============================================================ */}
        {activeTab === 'captable' && (
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            
            {/* TAB HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
                  Investor Capitalization Table
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Active syndicate shareholders, equity allocations, and ownership distribution
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                  ● {capTable.length} Active Investors
                </span>
                <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                  {formatCurrency(totalSyndicateCapital, currency)} Total Syndicate
                </span>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Search investor alias or project..."
                  value={capTableSearch}
                  onChange={(e) => setCapTableSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {filteredCapTable.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <Users size={44} style={{ color: '#334155', margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff' }}>No Active Syndicate Investors</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
                  {capTableSearch ? 'No investors matched your search filter.' : 'When retail and HNI investors complete payments for your rounds, they appear here automatically.'}
                </p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Investor Alias</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Project SPV</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Tier</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Allocation Date</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Share of Syndicate</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCapTable.map((inv, idx) => {
                        const amount = Number(inv.amount_invested_bdt) || 0;
                        const sharePercent = totalSyndicateCapital > 0 ? (amount / totalSyndicateCapital) * 100 : 0;

                        return (
                          <tr key={inv.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                              {inv.investors?.alias_name || 'Anonymous Syndicate Member'}
                            </td>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                              {inv.funding_projects?.project_title || 'General SPV'}
                            </td>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.75rem' }}>
                              <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                                {inv.investors?.category?.includes('HNI') ? 'Accredited HNI' : 'Retail Syndicate'}
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                              {new Date(inv.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: '800', textAlign: 'right' }}>
                              {sharePercent.toFixed(2)}%
                            </td>
                            <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.92rem', fontWeight: '900', textAlign: 'right', color: '#D4AF37' }}>
                              {formatCurrency(inv.amount_invested_bdt, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* 3. POS DATA SYNC TAB */}
        {/* ============================================================ */}
        {activeTab === 'pos' && (
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            
            {/* TAB HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
                  Point of Sale (POS) Telemetry Engine
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Verifiable daily sales reporting used by GRO10X for automated investor yield reconciliation
                </p>
              </div>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                ● {posHistory.length} Days Logged
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
              
              {/* SYNC FORM PANEL */}
              <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.35)', padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                  <Database size={18} color="#10b981" /> Manual Daily Revenue Entry
                </h3>
                
                <form onSubmit={handlePosSync} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      Business Date *
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={posSyncDate}
                      onChange={(e) => setPosSyncDate(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                        Daily Gross Sales (BDT) *
                      </label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 150000"
                        value={grossSales}
                        onChange={(e) => setGrossSales(e.target.value)}
                        style={{ fontSize: '0.82rem' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                        Daily Net Profit (BDT) *
                      </label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 45000"
                        value={netProfit}
                        onChange={(e) => setNetProfit(e.target.value)}
                        style={{ fontSize: '0.82rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      Daily Invoice / Order Count (Optional)
                    </label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 185"
                      value={transactionCount}
                      onChange={(e) => setTransactionCount(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* LIVE SOLVENCY PREVIEW */}
                  {(liveGross > 0 || liveNet > 0) && (
                    <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Computed Solvency Preview
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#cbd5e1' }}>Gross Revenue:</span>
                        <strong style={{ color: '#D4AF37' }}>৳{liveGross.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                        <span style={{ color: '#cbd5e1' }}>Net Profit:</span>
                        <strong style={{ color: '#10b981' }}>৳{liveNet.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.2rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: '#cbd5e1' }}>Net Profit Margin:</span>
                        <strong style={{ color: liveMargin >= 20 ? '#10b981' : liveMargin >= 10 ? '#f0b429' : '#ef4444' }}>
                          {liveMargin.toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSyncing} 
                    className="btn-gold" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSyncing ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
                  >
                    {isSyncing ? 'Syncing to Ledger...' : 'Sync POS Telemetry to Ledger →'}
                  </button>
                </form>
              </div>

              {/* 30-DAY SYNC LEDGER */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                    <List size={18} color="#D4AF37" /> Historical Sync Ledger
                  </h3>
                  <div style={{ position: 'relative', width: '160px' }}>
                    <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      type="text"
                      placeholder="Filter date..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.72rem' }}
                    />
                  </div>
                </div>

                {filteredPosHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <Database size={36} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>No POS entries recorded for this date range.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '440px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {filteredPosHistory.map(log => {
                      const gross = Number(log.gross_sales_bdt) || 0;
                      const net = Number(log.net_profit_bdt) || 0;
                      const margin = gross > 0 ? (net / gross) * 100 : 0;

                      return (
                        <div 
                          key={log.id} 
                          style={{ 
                            background: 'rgba(7,10,20,0.6)', 
                            padding: '0.85rem 1rem', 
                            borderRadius: '8px', 
                            borderLeft: '3px solid #10b981',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderLeftWidth: '3px',
                            borderLeftColor: '#10b981'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#fff' }}>
                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {log.transaction_count > 0 && (
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  {log.transaction_count} txns
                                </span>
                              )}
                            </div>
                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.68rem', fontWeight: '800', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                              {margin.toFixed(1)}% margin
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            <span>Gross: <strong style={{ color: '#D4AF37' }}>{formatCurrency(log.gross_sales_bdt, currency)}</strong></span>
                            <span>Net: <strong style={{ color: '#10b981' }}>{formatCurrency(log.net_profit_bdt, currency)}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    color: active ? '#D4AF37' : '#94a3b8',
    border: active ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
    padding: '0.65rem 1.15rem',
    borderRadius: '6px',
    fontWeight: active ? '800' : '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
  };
}
