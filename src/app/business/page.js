'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, Database, ShieldCheck, 
  TrendingUp, BarChart2, Loader2,
  Activity, Layers
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

// Tab Components
import CampaignOverviewTab from './tabs/CampaignOverviewTab';
import CapTableTab from './tabs/CapTableTab';
import PosTelemetryTab from './tabs/PosTelemetryTab';

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
      
      const marginPct = parsedGross > 0 ? Math.round((parsedNet / parsedGross) * 100) : 0;

      // 1. Dispatch Telegram push confirmation to founder
      try {
        if (founderProfile?.id) {
          await fetch('/api/telegram-notify-founder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              founderId: founderProfile.id,
              title: '📊 Daily POS Telemetry Synced',
              message: `Telemetry recorded for <b>${businessData?.brand_name}</b> on ${posSyncDate}:\n\n💰 Gross Sales: ৳${parsedGross.toLocaleString()} BDT\n📈 Net Profit: ৳${parsedNet.toLocaleString()} BDT\n📊 Margin: ${marginPct}% | ${parseInt(transactionCount, 10) || 0} Txns`,
              actionUrl: `${window.location.origin}/business`
            })
          });
        }
      } catch (err) {
        console.warn('Founder POS telegram notification skipped:', err);
      }

      // 2. Anomaly Check: Margin below 10% -> Dispatch alert to Admin
      if (parsedGross > 0 && (parsedNet / parsedGross) < 0.10) {
        try {
          await fetch('/api/telegram-notify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '⚠️ POS Telemetry Anomaly Detected',
              message: `Low profit margin reported for <b>${businessData?.brand_name}</b> on ${posSyncDate}.\n\nGross: ৳${parsedGross.toLocaleString()} | Net: ৳${parsedNet.toLocaleString()} | Margin: <b>${marginPct}%</b> (Below 10% threshold)`,
              actionUrl: `${window.location.origin}/admin`
            })
          });
        } catch (err) {
          console.warn('Admin anomaly telegram alert skipped:', err);
        }
      }

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
      <header style={{ background: 'rgba(7,10,20,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: '62px', zIndex: 20 }}>
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

        {/* 1. CAMPAIGN OVERVIEW TAB */}
        {activeTab === 'campaign' && (
          <CampaignOverviewTab 
            fundingProjects={fundingProjects} 
            currency={currency} 
          />
        )}

        {/* 2. CAP TABLE TAB */}
        {activeTab === 'captable' && (
          <CapTableTab 
            capTable={capTable}
            filteredCapTable={filteredCapTable}
            capTableSearch={capTableSearch}
            setCapTableSearch={setCapTableSearch}
            totalSyndicateCapital={totalSyndicateCapital}
            currency={currency}
          />
        )}

        {/* 3. POS DATA SYNC TAB */}
        {activeTab === 'pos' && (
          <PosTelemetryTab 
            posHistory={posHistory}
            filteredPosHistory={filteredPosHistory}
            posSyncDate={posSyncDate}
            setPosSyncDate={setPosSyncDate}
            grossSales={grossSales}
            setGrossSales={setGrossSales}
            netProfit={netProfit}
            setNetProfit={setNetProfit}
            transactionCount={transactionCount}
            setTransactionCount={setTransactionCount}
            liveGross={liveGross}
            liveNet={liveNet}
            liveMargin={liveMargin}
            isSyncing={isSyncing}
            handlePosSync={handlePosSync}
            posSearch={posSearch}
            setPosSearch={setPosSearch}
            currency={currency}
          />
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
