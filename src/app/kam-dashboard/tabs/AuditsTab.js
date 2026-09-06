'use client';
import React from 'react';
import { 
  Building2, CheckCircle2, ShieldCheck, BarChart2, Camera, 
  Loader2, AlertCircle, Upload, FileText, ClipboardCheck 
} from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function AuditsTab({
  businesses = [],
  selectedBusinessId,
  setSelectedBusinessId,
  auditSubmitted,
  setAuditSubmitted,
  handleAuditSubmit,
  isSubmitting,
  cashInHand,
  setCashInHand,
  stockInvestment,
  setStockInvestment,
  receivablesMarket,
  setReceivablesMarket,
  receivablesCompany,
  setReceivablesCompany,
  payables,
  setPayables,
  payrollExpense,
  setPayrollExpense,
  totalAssets,
  totalLiabilities,
  netWorkingCapital,
  hasInputs,
  calculatedHealthScore,
  healthInfo,
  uploadedAssets,
  assetPreviews = {},
  handlePhotoUpload,
  loadingHistory,
  auditHistory = [],
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      
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
                <div key={asset} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {assetPreviews[asset] ? (
                      <img 
                        src={assetPreviews[asset]} 
                        alt={asset} 
                        style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(16,185,129,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} 
                      />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center', color: '#64748b' }}>
                        <Camera size={16} />
                      </div>
                    )}
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>{asset}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
  );
}
