'use client';
import React, { useState } from 'react';
import { 
  Upload, FileText, CheckCircle2, ShieldCheck, ArrowUpRight, DollarSign, 
  RefreshCw, AlertCircle, Filter, Search, Globe, Building2, Layers
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialPosRecords = [
  { date: '13-Jun-2026', dineInSales: 111610, foodPandaSales: 15200, dailyExpenses: 32050, bankCity: 65820, bankEbl: 0, bankUcb: 0, cashCollected: 13740, status: 'Verified Match' },
  { date: '14-Jun-2026', dineInSales: 56039, foodPandaSales: 8900, dailyExpenses: 13185, bankCity: 28489, bankEbl: 0, bankUcb: 0, cashCollected: 14365, status: 'Verified Match' },
  { date: '15-Jun-2026', dineInSales: 137130, foodPandaSales: 18400, dailyExpenses: 48340, bankCity: 66820, bankEbl: 0, bankUcb: 0, cashCollected: 21970, status: 'Verified Match' },
  { date: '16-Jun-2026', dineInSales: 115595, foodPandaSales: 14100, dailyExpenses: 40125, bankCity: 60360, bankEbl: 0, bankUcb: 0, cashCollected: 15110, status: 'Verified Match' },
  { date: '17-Jun-2026', dineInSales: 115728, foodPandaSales: 16500, dailyExpenses: 29340, bankCity: 55758, bankEbl: 0, bankUcb: 0, cashCollected: 30630, status: 'Verified Match' },
];

export default function PosSyncPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [selectedHub, setSelectedHub] = useState('ORO Roasters - Mirpur (147 Records)');
  const [records, setRecords] = useState(initialPosRecords);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const totalDineIn = records.reduce((sum, r) => sum + r.dineInSales, 0);
  const totalFoodPanda = records.reduce((sum, r) => sum + r.foodPandaSales, 0);
  const totalExpenses = records.reduce((sum, r) => sum + r.dailyExpenses, 0);
  const totalGross = totalDineIn + totalFoodPanda;
  const netMarginPct = (((totalGross - totalExpenses) / totalGross) * 100).toFixed(2);

  const handleSimulateCsvUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            <Upload size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>POS DAILY DATA <span style={{ color: '#D4AF37' }}>SYNC & AUDIT</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Batch CSV Audit & Bank Reconciliation v0.1.8</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* CSV UPLOADER CARD */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', borderColor: 'rgba(212,175,55,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.4rem' }}>CSV Data Ingestion</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Batch POS Daily Sales Upload</h2>
            </div>

            <select 
              value={selectedHub} 
              onChange={(e) => setSelectedHub(e.target.value)}
              style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
            >
              <option>ORO Roasters - Mirpur (147 Records)</option>
              <option>ORO Roasters - Banani (36 Records)</option>
              <option>Segreto Hub - Dhanmondi</option>
            </select>
          </div>

          {uploadSuccess ? (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
              <h4 style={{ color: '#10b981', fontSize: '1.15rem' }}>147 Daily Records Synced & Audited!</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Calculated Net Margin: {netMarginPct}% • Verified with City Bank & EBL Deposit Slips</p>
            </div>
          ) : (
            <div style={{ border: '2px dashed rgba(212,175,55,0.4)', borderRadius: '14px', padding: '2.5rem', textAlign: 'center', background: 'rgba(7,10,20,0.4)' }}>
              <Upload size={36} style={{ color: '#D4AF37', marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Drag & Drop Outlet POS CSV File</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Pre-configured parser for `ORO Roasters Banani Investment - Mirpur.csv` format</p>
              <button onClick={handleSimulateCsvUpload} className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>
                Upload & Parse CSV Data
              </button>
            </div>
          )}
        </div>

        {/* 4 AUDITED SUMMARY CARDS */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Gross Sales (Dine-In + Delivery)</p>
            <h2 style={{ fontSize: '1.8rem', color: '#D4AF37', fontWeight: '800' }}>
              {formatCurrency(totalGross, currency)}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>Dine-In: {formatCurrency(totalDineIn, currency)}</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>FoodPanda Delivery Sales</p>
            <h2 style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: '800' }}>
              {formatCurrency(totalFoodPanda, currency)}
            </h2>
            <p style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.25rem' }}>12.8% Delivery Ratio</p>
          </div>

          <div className="glass-card">
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Line-Item Expenses</p>
            <h2 style={{ fontSize: '1.8rem', color: '#ef4444', fontWeight: '800' }}>
              {formatCurrency(totalExpenses, currency)}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>Milk, Beans, Utilities & Rent</p>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Verified Net Margin</p>
            <h2 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '800' }}>
              {netMarginPct}%
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>● Audited Data Integrity</p>
          </div>
        </div>

        {/* DAILY POS RECORDS AUDIT TABLE */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Daily POS Sales & Bank Deposit Reconciliation</h3>
            <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
              ● 100% Cash/Card Matched
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Dine-In Sales</th>
                <th style={{ padding: '0.75rem' }}>FoodPanda Sales</th>
                <th style={{ padding: '0.75rem' }}>Daily Expenses</th>
                <th style={{ padding: '0.75rem' }}>City Bank Deposit</th>
                <th style={{ padding: '0.75rem' }}>Cash Handheld</th>
                <th style={{ padding: '0.75rem' }}>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '600' }}>{r.date}</td>
                  <td style={{ padding: '0.85rem' }}>{formatCurrency(r.dineInSales, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#3b82f6' }}>{formatCurrency(r.foodPandaSales, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#ef4444' }}>{formatCurrency(r.dailyExpenses, currency)}</td>
                  <td style={{ padding: '0.85rem', color: '#10b981' }}>{formatCurrency(r.bankCity, currency)}</td>
                  <td style={{ padding: '0.85rem' }}>{formatCurrency(r.cashCollected, currency)}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      ● {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
