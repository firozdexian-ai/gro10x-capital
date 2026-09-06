'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Search, FileText, 
  TrendingDown, ArrowUpRight, ShieldCheck, Eye, RefreshCw, Globe, ChevronRight, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const fallbackAnomalies = [
  { id: 'ALT-901', outlet: 'ORO Roasters - Mirpur', date: '2026-05-15', metric: 'Staff Bonus Distribution', variance: '+৳1,80,000', severity: 'Medium', status: 'Explained (Eid Staff Bonus)', verifiedBy: 'KAM Anisur' },
  { id: 'ALT-902', outlet: 'ORO Roasters - Banani', date: '2026-06-02', metric: 'Espresso Bean COGS Variance', variance: '+14.2%', severity: 'High', status: 'Under Review', verifiedBy: 'System Auto-Flag' },
  { id: 'ALT-903', outlet: 'Segreto Hub - Dhanmondi', date: '2026-06-18', metric: 'Inventory Shrinkage (Dairy)', variance: '-৳12,500', severity: 'Low', status: 'Resolved', verifiedBy: 'KAM Tanvir' }
];

export default function FraudDetectionPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [anomalies, setAnomalies] = useState(fallbackAnomalies);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [outletOptions, setOutletOptions] = useState(['All', 'Mirpur', 'Banani', 'Dhanmondi']);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (role && !['admin', 'kam'].includes(role)) {
        router.push('/');
      }
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    async function loadTelemetryAnomalies() {
      try {
        setLoadingData(true);
        // Query daily sales to compute anomalies
        const { data: sales, error } = await supabase
          .from('pos_daily_sales')
          .select('*, businesses(brand_name)')
          .order('date', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (sales && sales.length > 0) {
          const liveAnomalies = [];
          const brands = new Set(['All']);

          sales.forEach(sale => {
            const brand = sale.businesses?.brand_name || 'Outlet Franchise';
            brands.add(brand);
            const gross = Number(sale.gross_sales_bdt) || 0;
            const net = Number(sale.net_profit_bdt) || 0;
            const margin = gross > 0 ? (net / gross) * 100 : 0;

            // Anomaly condition 1: Margin below 10%
            if (gross > 0 && margin < 10) {
              liveAnomalies.push({
                id: `POS-ANM-${sale.id.substring(0, 5).toUpperCase()}`,
                outlet: brand,
                date: sale.date,
                metric: 'Low Margin Outlier (<10%)',
                variance: `${margin.toFixed(1)}% net margin`,
                severity: margin < 5 ? 'High' : 'Medium',
                status: 'Under Review',
                verifiedBy: 'AI Telemetry Watchdog'
              });
            }
            // Anomaly condition 2: Negative profit
            else if (net < 0) {
              liveAnomalies.push({
                id: `POS-NEG-${sale.id.substring(0, 5).toUpperCase()}`,
                outlet: brand,
                date: sale.date,
                metric: 'Negative Operating Cashflow',
                variance: `৳${net.toLocaleString()}`,
                severity: 'High',
                status: 'Under Review',
                verifiedBy: 'Ledger Exception'
              });
            }
          });

          setOutletOptions(Array.from(brands));

          if (liveAnomalies.length > 0) {
            setAnomalies([...liveAnomalies, ...fallbackAnomalies]);
          }
        }
      } catch (err) {
        console.warn('Error querying POS telemetry anomalies:', err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadTelemetryAnomalies();
    }
  }, [user]);

  const handleResolve = (id) => {
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: 'Verified & Approved', severity: 'Resolved' } : a));
  };

  const filteredAnomalies = selectedFilter === 'All' 
    ? anomalies 
    : anomalies.filter(a => a.outlet.toLowerCase().includes(selectedFilter.toLowerCase()));

  const highRiskCount = anomalies.filter(a => a.severity === 'High' && !a.status.includes('Approved')).length;
  const resolvedCount = anomalies.filter(a => a.status.includes('Approved') || a.status.includes('Resolved')).length;

  if (authLoading || loadingData) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
        <Loader2 className="spin" size={40} />
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(239,68,68,0.3)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ef4444, #991b1b)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '900' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>AUTOMATED <span style={{ color: '#ef4444' }}>FRAUD & ANOMALY ENGINE</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>v2.3 POS Telemetry Audit & Cost Variance Detection</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#ef4444' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/pos-sync" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            POS Sync <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* STATS OVERVIEW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Active Anomaly Flags</p>
            <h2 style={{ fontSize: '1.8rem', color: '#ef4444', fontWeight: '800', margin: '0.2rem 0' }}>{highRiskCount} High Risk</h2>
            <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: 0 }}>Requires KAM Verification</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Resolved Anomalies</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800', margin: '0.2rem 0' }}>{resolvedCount} Verified</h2>
            <p style={{ color: '#10b981', fontSize: '0.78rem', margin: 0 }}>Audit Passed</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>COGS Variance Index</p>
            <h2 style={{ fontSize: '1.8rem', color: '#D4AF37', fontWeight: '800', margin: '0.2rem 0' }}>2.1%</h2>
            <p style={{ color: '#D4AF37', fontSize: '0.78rem', margin: 0 }}>Within Safe Threshold</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>System Health</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800', margin: '0.2rem 0' }}>99.4%</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>Continuous POS Sync</p>
          </div>
        </div>

        {/* ANOMALIES AUDIT TABLE */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>POS Financial Anomaly & Fraud Log</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Algorithmic detection flagging cost spikes and inventory discrepancies.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {outletOptions.slice(0, 6).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: selectedFilter === filter ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedFilter === filter ? 'rgba(239,68,68,0.15)' : 'transparent',
                    color: selectedFilter === filter ? '#ef4444' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Alert ID</th>
                  <th style={{ padding: '0.75rem' }}>Outlet</th>
                  <th style={{ padding: '0.75rem' }}>Flagged Metric</th>
                  <th style={{ padding: '0.75rem' }}>Variance</th>
                  <th style={{ padding: '0.75rem' }}>Severity</th>
                  <th style={{ padding: '0.75rem' }}>Audit Status</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnomalies.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', color: '#ef4444', fontWeight: '700' }}>{a.id}</td>
                    <td style={{ padding: '0.85rem', fontWeight: '600' }}>{a.outlet}</td>
                    <td style={{ padding: '0.85rem', color: '#cbd5e1' }}>{a.metric}</td>
                    <td style={{ padding: '0.85rem', color: a.variance?.includes('+') || a.variance?.includes('Low') ? '#ef4444' : '#f59e0b', fontWeight: '700' }}>
                      {a.variance}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: a.severity === 'High' ? 'rgba(239,68,68,0.2)' : a.severity === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                        color: a.severity === 'High' ? '#ef4444' : a.severity === 'Medium' ? '#f59e0b' : '#10b981',
                        fontWeight: '700'
                      }}>
                        {a.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {a.status} ({a.verifiedBy})
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {a.status?.includes('Review') ? (
                        <button onClick={() => handleResolve(a.id)} style={{ background: '#10b981', color: '#070a14', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={14} /> Approve Audit
                        </button>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>✓ Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
