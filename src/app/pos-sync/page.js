'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, FileText, CheckCircle2, ShieldCheck, ArrowUpRight, DollarSign, 
  RefreshCw, AlertCircle, Filter, Search, Globe, Building2, Layers,
  Calendar, Loader2, ArrowRight, TrendingUp, BarChart2, PlusCircle, Check
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

/**
 * POS Sync Portal — Live POS Telemetry & Daily Sales Reconciliation Terminal
 * Staff & Managing Partner terminal for submitting daily outlet sales telemetry,
 * tracking gross revenue, line-item expenses, and verifying daily net solvency into pos_daily_sales.
 */
export default function PosSyncPortal() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [currency, setCurrency] = useState('BDT');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Entry Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(todayStr);
  const [dineInSales, setDineInSales] = useState('');
  const [foodPandaSales, setFoodPandaSales] = useState('');
  const [dailyExpenses, setDailyExpenses] = useState('');
  const [transactionCount, setTransactionCount] = useState('');

  // Role Guard: Require auth and restrict to staff, kam, admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (role && !['staff', 'kam', 'admin'].includes(role)) {
        router.push('/');
      }
    }
  }, [user, role, authLoading, router]);

  // Initial Load: Fetch active businesses
  useEffect(() => {
    if (user) {
      fetchBusinesses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // When selected business changes, fetch historical POS records
  useEffect(() => {
    if (selectedBusinessId) {
      fetchPosRecords(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('id, brand_name')
        .order('brand_name', { ascending: true });

      if (error) throw error;
      const bizList = data || [];
      setBusinesses(bizList);
      if (bizList.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizList[0].id);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      addToast('Failed to load registered outlets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosRecords = async (bizId) => {
    if (!bizId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pos_daily_sales')
        .select('*, businesses(brand_name)')
        .eq('business_id', bizId)
        .order('date', { ascending: false })
        .limit(50);

      if (error && error.code !== '42P01') throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching POS records:', err);
      addToast('Could not load historical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Real-time calculation for form preview
  const currentGross = (Number(dineInSales) || 0) + (Number(foodPandaSales) || 0);
  const currentExpenses = Number(dailyExpenses) || 0;
  const currentNet = currentGross - currentExpenses;
  const currentMargin = currentGross > 0 ? ((currentNet / currentGross) * 100).toFixed(1) : '0.0';
  const hasFormInputs = currentGross > 0 || currentExpenses > 0;

  const handleSubmitPos = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId || !reportDate || (!dineInSales && !foodPandaSales)) {
      addToast('Please enter report date and sales revenue', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const rate = CURRENCY_RATES[currency]?.rate || 1;
      const grossBdt = currentGross / rate;
      const netBdt = currentNet / rate;

      const { error } = await supabase
        .from('pos_daily_sales')
        .insert([{
          business_id: selectedBusinessId,
          date: reportDate,
          gross_sales_bdt: grossBdt,
          net_profit_bdt: netBdt,
          transaction_count: Number(transactionCount) || 0,
          sync_source: 'Staff_Submit'
        }]);

      if (error && error.code !== '42P01') throw error;

      addToast('🎉 Daily POS telemetry verified & logged!', 'success');
      
      // Reset inputs
      setDineInSales('');
      setFoodPandaSales('');
      setDailyExpenses('');
      setTransactionCount('');
      setReportDate(todayStr);

      // Refresh table
      fetchPosRecords(selectedBusinessId);

    } catch (err) {
      console.error('Failed to submit POS data:', err);
      addToast(err.message || 'Failed to submit POS telemetry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated KPI Metrics
  const totalGrossSales = records.reduce((sum, r) => sum + Number(r.gross_sales_bdt || 0), 0);
  const totalNetProfit = records.reduce((sum, r) => sum + Number(r.net_profit_bdt || 0), 0);
  const totalTxnCount = records.reduce((sum, r) => sum + Number(r.transaction_count || 0), 0);
  const avgMarginPct = totalGrossSales > 0 ? ((totalNetProfit / totalGrossSales) * 100).toFixed(1) : '0.0';

  const selectedBizName = businesses.find(b => b.id === selectedBusinessId)?.brand_name || 'Selected Outlet';

  // Filtered records by search
  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.date?.toLowerCase().includes(q) ||
      r.sync_source?.toLowerCase().includes(q) ||
      r.businesses?.brand_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ 
        background: 'rgba(15,23,42,0.9)', 
        borderBottom: '1px solid rgba(212,175,55,0.25)', 
        padding: '1.25rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
            borderRadius: '10px', 
            display: 'grid', 
            placeItems: 'center', 
            color: '#070a14', 
            fontWeight: '900', 
            fontSize: '1.2rem',
            boxShadow: '0 0 15px rgba(212,175,55,0.3)'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, letterSpacing: '-0.01em' }}>
                POS TELEMETRY <span style={{ color: '#D4AF37' }}>& AUDIT TERMINAL</span>
              </h1>
              <span style={{ 
                background: 'rgba(16,185,129,0.15)', 
                color: '#10b981', 
                border: '1px solid rgba(16,185,129,0.3)', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '6px', 
                fontSize: '0.68rem', 
                fontWeight: '800' 
              }}>
                ● Live Database Sync
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0 0' }}>
              Staff & Managing Partner daily sales reconciliation terminal connected to pos_daily_sales
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
            <Globe size={15} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => router.push('/kam-dashboard')}
            style={{ 
              background: 'rgba(59,130,246,0.15)', 
              color: '#60a5fa', 
              border: '1px solid rgba(59,130,246,0.3)', 
              padding: '0.45rem 0.9rem', 
              borderRadius: '8px', 
              fontSize: '0.8rem', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            Managing Partner Desk <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* OUTLET SELECTOR ROW */}
        <div className="glass-card" style={{ 
          padding: '1.25rem 1.5rem', 
          marginBottom: '1.75rem', 
          borderLeft: '4px solid #D4AF37',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
              Selected Operating Hub
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: '0.2rem 0 0 0' }}>
              {selectedBizName}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>Switch Outlet:</span>
            <select 
              value={selectedBusinessId} 
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              style={{ 
                background: 'rgba(15,23,42,0.95)', 
                border: '1px solid rgba(212,175,55,0.4)', 
                color: '#D4AF37', 
                padding: '0.55rem 1.1rem', 
                borderRadius: '8px', 
                fontSize: '0.88rem', 
                fontWeight: '800', 
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {businesses.length === 0 ? (
                <option value="">No outlets found</option>
              ) : (
                businesses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.brand_name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* 4 LIVE AUDITED SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Gross Revenue
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
                {formatCurrency(totalGrossSales, currency)}
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Logged Total</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Solvency Profit
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: totalNetProfit >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                {formatCurrency(totalNetProfit, currency)}
              </h3>
              <span style={{ fontSize: '0.7rem', color: totalNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                {totalNetProfit >= 0 ? '▲ Positive' : '▼ Deficit'}
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Net Margin
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa', margin: 0 }}>
                {avgMarginPct}%
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Outlet Average</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Telemetry Entries
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                {records.length}
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{totalTxnCount} Txns</span>
            </div>
          </div>

        </div>

        {/* TWO COLUMN WORKSPACE: FORM + HISTORICAL LEDGER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* LEFT: DAILY POS SALES ENTRY FORM */}
          <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.4)', padding: '1.75rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <PlusCircle size={20} style={{ color: '#D4AF37' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                  Log Daily Sales Telemetry
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  Direct write to pos_daily_sales with real-time net margin validation
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitPos} style={{ display: 'grid', gap: '1.1rem' }}>
              
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: '700' }}>
                  Report Date *
                </label>
                <input 
                  type="date" 
                  required 
                  value={reportDate} 
                  onChange={(e) => setReportDate(e.target.value)} 
                  className="form-input"
                  style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', width: '100%', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Dine-In Sales ({currency}) *
                  </label>
                  <input 
                    type="number" 
                    required 
                    placeholder="0" 
                    value={dineInSales} 
                    onChange={(e) => setDineInSales(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', width: '100%', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#60a5fa', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Delivery Sales ({currency})
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={foodPandaSales} 
                    onChange={(e) => setFoodPandaSales(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(59,130,246,0.3)', color: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Daily Expenses ({currency})
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={dailyExpenses} 
                    onChange={(e) => setDailyExpenses(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', width: '100%', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Txn Count
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={transactionCount} 
                    onChange={(e) => setTransactionCount(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              {/* REAL-TIME PREVIEW PANEL */}
              <div style={{ 
                background: 'rgba(7,10,20,0.6)', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: '8px', 
                padding: '0.85rem 1rem',
                margin: '0.5rem 0'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                  Live Computed Solvency Preview
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#94a3b8' }}>Gross Sales:</span>
                  <strong style={{ color: '#D4AF37' }}>{formatCurrency(currentGross, currency)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#94a3b8' }}>Net Solvency Profit:</span>
                  <strong style={{ color: currentNet >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(currentNet, currency)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#94a3b8' }}>Projected Net Margin:</span>
                  <strong style={{ color: '#a78bfa' }}>{currentMargin}%</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedBusinessId || (!dineInSales && !foodPandaSales)}
                style={{
                  background: (submitting || !selectedBusinessId || (!dineInSales && !foodPandaSales))
                    ? 'rgba(212,175,55,0.3)'
                    : 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
                  color: '#070a14',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: (submitting || !selectedBusinessId || (!dineInSales && !foodPandaSales)) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Submit Verified Daily Telemetry
              </button>

            </form>

          </div>

          {/* RIGHT: HISTORICAL POS SUBMISSIONS LEDGER */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                  Ingested Daily Sales Register
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  Permanent ledger entries for {selectedBizName}
                </p>
              </div>

              {/* SEARCH INPUT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                <Search size={14} style={{ color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Filter by date or source..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.78rem', outline: 'none', width: '150px' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#D4AF37' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Syncing POS ledger from database...</p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
                <FileText size={38} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#94a3b8' }}>
                  No POS daily sales logged yet
                </h4>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                  Use the terminal on the left to submit the first verified daily entry for {selectedBizName}.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Report Date</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Gross Sales</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Net Profit</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Margin</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Txns</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Sync Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => {
                      const gross = Number(r.gross_sales_bdt || 0);
                      const net = Number(r.net_profit_bdt || 0);
                      const margin = gross > 0 ? ((net / gross) * 100).toFixed(1) : '0.0';
                      const isPositive = net >= 0;

                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '800', color: '#fff' }}>
                            📅 {r.date}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#D4AF37', fontWeight: '800' }}>
                            {formatCurrency(gross, currency)}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                            {formatCurrency(net, currency)}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', 
                              color: isPositive ? '#10b981' : '#ef4444', 
                              border: isPositive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '4px', 
                              fontWeight: '800' 
                            }}>
                              {margin}%
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>
                            {r.transaction_count || 0}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              background: 'rgba(59,130,246,0.12)', 
                              color: '#60a5fa', 
                              border: '1px solid rgba(59,130,246,0.25)', 
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '4px', 
                              fontWeight: '700' 
                            }}>
                              {r.sync_source || 'Staff_Submit'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
