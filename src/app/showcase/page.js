'use client';
import React, { useState } from 'react';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe,
  Briefcase, Star, Clock, AlertTriangle, ArrowRight, LineChart
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function BusinessShowcase() {
  const [currency, setCurrency] = useState('BDT');

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER BAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(7,10,20,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="/" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', textDecoration: 'none' }}>
            GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Deal Flow</span>
            <ChevronRight size={14} />
            <span style={{ color: '#f8fafc' }}>ORO Roasters (Mirpur)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
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
          
          <button style={{ background: '#D4AF37', color: '#070a14', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
            Invest Now
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '4rem 3rem', background: 'radial-gradient(circle at top right, rgba(212,175,55,0.08), transparent 50%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Business Logo/Image */}
          <div style={{ width: '160px', height: '160px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: '#D4AF37' }}>ORO</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge-gold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                <CheckCircle2 size={12} /> KAM Audited
              </span>
              <span className="badge-gold">Food & Beverage</span>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>ORO Roasters</h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', margin: '0 0 2rem 0', maxWidth: '800px', lineHeight: '1.5' }}>
              Premium specialty coffee and community hub in Mirpur. Expanding their high-margin roasting operations and drive-thru footprint.
            </p>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Target Raise</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37' }}>{formatCurrency(12000000, currency)}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Projected Yield</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>18% - 24% <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>IRR</span></p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Operating Since</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>2021</p>
              </div>
            </div>
          </div>

          {/* AI HEALTH SCORE GAUGE */}
          <div className="glass-card" style={{ width: '280px', textAlign: 'center', background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              <ShieldCheck size={16} /> Verified Platform Score
            </div>
            
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1rem auto' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="33.9" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: '1' }}>88</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>/100</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
              Score based on <strong>Founder History</strong> and <strong>Monthly KAM Audits</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED SHOWCASE */}
      <section style={{ padding: '0 3rem 4rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          
          {/* LEFT: DEEP TRANSPARENCY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* FOUNDER PROFILE (Deep Transparency) */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={24} style={{ color: '#D4AF37' }} /> The Founder
              </h2>
              
              <div className="glass-card" style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #475569, #1e293b)', flexShrink: 0, overflow: 'hidden' }}>
                   {/* Placeholder for Founder Photo */}
                   <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
                     <Users size={40} />
                   </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>Tanvir Ahmed</h3>
                  <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>Serial F&B Entrepreneur</p>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Tanvir has over 12 years of experience in the Dhaka F&B scene. He previously founded 'Cafe Locale' which successfully exited to a private equity firm in 2019. 
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Track Record</p>
                      <p style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} /> 2 Successful Exits
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Risk Note</p>
                      <p style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={16} /> 1 Venture Closed (2020)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KAM AUDITED FINANCIALS */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LineChart size={24} style={{ color: '#D4AF37' }} /> KAM Audited Metrics (Aug 2026)
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Stock & Collateral Value</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{formatCurrency(250000, currency)}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Monthly Run Rate (Sales)</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{formatCurrency(1250000, currency)}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Monthly Payroll Burn</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{formatCurrency(135000, currency)}</p>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} /> These metrics are physically audited every month by GRO10X internal Key Account Managers.
              </p>
            </div>
          </div>

          {/* RIGHT: ACTIVE FUNDING ROUNDS */}
          <div>
            <div className="glass-card" style={{ background: 'rgba(212,175,55,0.03)', borderColor: 'rgba(212,175,55,0.2)', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={20} style={{ color: '#D4AF37' }} /> Active Funding Rounds
              </h3>

              {/* Round 1 */}
              <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>FRANCHISE BUILDOUT</span>
                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>18% Yield</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>Mirpur Flagship Store</h4>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: '#D4AF37' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <span>{formatCurrency(7800000, currency)} raised</span>
                  <span>65%</span>
                </div>
                <button style={{ width: '100%', background: '#fff', color: '#070a14', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  View Project <ArrowRight size={16} />
                </button>
              </div>

              {/* Round 2 */}
              <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>SHORT-TERM DEBT</span>
                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>24% APR</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>Coffee Bean Import LC</h4>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: '#3b82f6' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <span>{formatCurrency(750000, currency)} raised</span>
                  <span>15%</span>
                </div>
                <button style={{ width: '100%', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  View Project <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
