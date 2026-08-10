'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Database, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, List, FileText, ChevronRight, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function BusinessOwnerPortal() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [founderProfile, setFounderProfile] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [activeTab, setActiveTab] = useState('campaign'); // campaign, pos, captable
  const [loading, setLoading] = useState(true);

  // Campaign Overview
  const [fundingProjects, setFundingProjects] = useState([]);

  // Cap Table
  const [capTable, setCapTable] = useState([]);

  // POS Sync State
  const [posSyncDate, setPosSyncDate] = useState(new Date().toISOString().substring(0,10));
  const [grossSales, setGrossSales] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [transactionCount, setTransactionCount] = useState('');
  const [posHistory, setPosHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      // 1. Fetch founder profile
      const { data: profile, error: profErr } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profErr) {
        if (profErr.code !== 'PGRST116') throw profErr;
        setLoading(false);
        return; // Not a founder
      }
      setFounderProfile(profile);

      // 2. Fetch business
      const { data: bizData, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('founder_id', profile.id)
        .single();
        
      if (bizErr && bizErr.code !== 'PGRST116') throw bizErr;
      
      if (bizData) {
        setBusinessData(bizData);

        // 3. Fetch Funding Projects
        const { data: projects, error: projErr } = await supabase
          .from('funding_projects')
          .select('*')
          .eq('business_id', bizData.id)
          .order('created_at', { ascending: false });
          
        if (projErr) throw projErr;
        setFundingProjects(projects || []);

        if (projects && projects.length > 0) {
          // 4. Fetch Cap Table (Investors holding active investments in these projects)
          const projectIds = projects.map(p => p.id);
          const { data: invData, error: invErr } = await supabase
            .from('investments')
            .select(`
              id,
              amount_invested_bdt,
              status,
              created_at,
              investors ( alias_name ),
              funding_projects ( project_title )
            `)
            .in('funding_project_id', projectIds)
            .eq('status', 'Active');
            
          if (invErr) throw invErr;
          setCapTable(invData || []);
        }

        // 5. Fetch POS History
        const { data: posData, error: posErr } = await supabase
          .from('pos_daily_sales')
          .select('*')
          .eq('business_id', bizData.id)
          .order('date', { ascending: false })
          .limit(30);
          
        if (posErr) throw posErr;
        setPosHistory(posData || []);
      }

    } catch (err) {
      console.error('Error fetching business data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePosSync = async (e) => {
    e.preventDefault();
    if (!businessData) return;
    
    if (!grossSales || !netProfit || !posSyncDate) {
      addToast('Please fill all required POS fields.', 'error');
      return;
    }

    try {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from('pos_daily_sales')
        .insert([{
          business_id: businessData.id,
          date: posSyncDate,
          gross_sales_bdt: grossSales,
          net_profit_bdt: netProfit,
          transaction_count: transactionCount || 0,
          sync_source: 'Manual_Entry'
        }])
        .select()
        .single();

      if (error) throw error;

      addToast('POS Data Successfully Synced!', 'success');
      
      // Update local history
      setPosHistory(prev => [data, ...prev].sort((a,b) => new Date(b.date) - new Date(a.date)));
      
      // Reset form
      setGrossSales('');
      setNetProfit('');
      setTransactionCount('');
      
    } catch (err) {
      console.error('POS Sync Error:', err);
      addToast('Failed to sync POS data. Please try again.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center' }}><Loader2 className="spin" size={48} color="#D4AF37" /></div>;
  }

  if (!founderProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', color: '#f8fafc', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <ShieldCheck size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8' }}>Your account is not registered as a Business Founder. If you believe this is an error, please contact support.</p>
          <a href="/" className="btn-outline" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Return Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(7,10,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#000' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{businessData?.brand_name || 'Business Portal'}</h1>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Founder: {founderProfile.full_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2.5rem auto 0 auto', padding: '0 2rem' }}>
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('campaign')} style={tabBtnStyle(activeTab === 'campaign')}>
            <BarChart2 size={18} /> Campaign Overview
          </button>
          <button onClick={() => setActiveTab('captable')} style={tabBtnStyle(activeTab === 'captable')}>
            <Users size={18} /> Investor Cap Table
          </button>
          <button onClick={() => setActiveTab('pos')} style={tabBtnStyle(activeTab === 'pos')}>
            <Database size={18} /> POS Data Sync
          </button>
        </div>

        {/* 1. CAMPAIGN OVERVIEW */}
        {activeTab === 'campaign' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Funding Campaigns</h2>
            
            {fundingProjects.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#94a3b8' }}>No funding projects created yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {fundingProjects.map(project => {
                  const percent = Math.min(100, (Number(project.amount_raised_bdt) / Number(project.target_raise_bdt)) * 100);
                  
                  return (
                    <div key={project.id} className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', display: 'inline-block' }}>
                            {project.status}
                          </span>
                          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{project.project_title}</h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Type: {project.funding_type} | SPV: {project.spv_name || 'Pending Formation'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Amount Raised</p>
                          <h2 style={{ fontSize: '2rem', margin: 0, color: '#f8fafc' }}>
                            {formatCurrency(project.amount_raised_bdt, currency)}
                          </h2>
                          <p style={{ color: '#10b981', fontSize: '0.85rem', margin: 0 }}>Target: {formatCurrency(project.target_raise_bdt, currency)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#94a3b8' }}>Campaign Progress</span>
                          <span style={{ color: '#D4AF37', fontWeight: '700' }}>{percent.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, background: 'linear-gradient(90deg, #D4AF37, #F3E5AB)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. CAP TABLE */}
        {activeTab === 'captable' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Investor Capitalization Table</h2>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                {capTable.length} Active Investors
              </span>
            </div>

            {capTable.length === 0 ? (
               <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                 <p style={{ color: '#94a3b8' }}>No active investors yet.</p>
               </div>
            ) : (
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <tr>
                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>Investor Alias</th>
                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>Project</th>
                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>Investment Date</th>
                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capTable.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>{inv.investors?.alias_name || 'Unknown'}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>{inv.funding_projects?.project_title}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '700', textAlign: 'right', color: '#D4AF37' }}>
                            {formatCurrency(inv.amount_invested_bdt, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. POS DATA SYNC */}
        {activeTab === 'pos' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Point of Sale (POS) Sync Engine</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                GRO10X uses daily verifiable POS data to calculate and distribute investor yields automatically. 
                Use this portal to manually sync your daily revenue if API automation is offline.
              </p>
            </div>

            <div className="grid-2">
              {/* Sync Form */}
              <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={20} color="#10b981" /> Manual Data Sync
                </h3>
                
                <form onSubmit={handlePosSync} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Business Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={posSyncDate}
                      onChange={(e) => setPosSyncDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Daily Gross Sales (BDT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 150000"
                      value={grossSales}
                      onChange={(e) => setGrossSales(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Daily Net Profit (BDT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 45000"
                      value={netProfit}
                      onChange={(e) => setNetProfit(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Total Invoice Count (Optional)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 120"
                      value={transactionCount}
                      onChange={(e) => setTransactionCount(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={isSyncing} className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSyncing ? 0.7 : 1 }}>
                    {isSyncing ? 'Syncing to Ledger...' : 'Sync Daily POS Data'}
                  </button>
                </form>
              </div>

              {/* Sync History Log */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <List size={20} color="#D4AF37" /> 30-Day Sync Log
                </h3>

                {posHistory.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No POS data synced yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {posHistory.map(log => (
                      <div key={log.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{new Date(log.date).toLocaleDateString()}</span>
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Synced</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <span>Gross: {formatCurrency(log.gross_sales_bdt, currency)}</span>
                          <span>Net: {formatCurrency(log.net_profit_bdt, currency)}</span>
                        </div>
                      </div>
                    ))}
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
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontWeight: active ? '700' : '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  };
}
