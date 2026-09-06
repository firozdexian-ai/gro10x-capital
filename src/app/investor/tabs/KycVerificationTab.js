'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function KycVerificationTab({
  kycLevel = 1,
  activeKycForm,
  setActiveKycForm,
  setNidFront,
  setNidBack,
  sourceOfFunds,
  setSourceOfFunds,
  isSubmittingKyc,
  handleKycSubmit,
  addToast
}) {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Progressive Investor Profiling
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Complete verification tiers to unlock Secondary Market trading and Private Cash Concierge access
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(16,185,129,0.15)', 
            color: '#10b981', 
            border: '1px solid rgba(16,185,129,0.3)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800' 
          }}>
            ● Level {kycLevel} / 3 Active
          </span>
        </div>
      </div>

      {/* 3-STEP PROGRESS STEPPER */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', background: 'rgba(15,23,42,0.6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* STEP 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(16,185,129,0.2)', 
              border: '2px solid #10b981', 
              display: 'grid', 
              placeItems: 'center', 
              color: '#10b981', 
              fontWeight: '900',
              fontSize: '0.82rem'
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff' }}>Level 1: Basic</div>
              <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>Active & Verified</div>
            </div>
          </div>

          <div style={{ height: '2px', background: kycLevel >= 2 ? '#10b981' : 'rgba(255,255,255,0.1)', width: '30px' }} />

          {/* STEP 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: kycLevel >= 2 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)', 
              border: `2px solid ${kycLevel >= 2 ? '#10b981' : '#3b82f6'}`, 
              display: 'grid', 
              placeItems: 'center', 
              color: kycLevel >= 2 ? '#10b981' : '#60a5fa', 
              fontWeight: '900',
              fontSize: '0.82rem'
            }}>
              {kycLevel >= 2 ? '✓' : '2'}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff' }}>Level 2: Identity</div>
              <div style={{ fontSize: '0.68rem', color: kycLevel >= 2 ? '#10b981' : '#60a5fa', fontWeight: '700' }}>
                {kycLevel >= 2 ? 'Active & Verified' : 'Secondary Trading'}
              </div>
            </div>
          </div>

          <div style={{ height: '2px', background: kycLevel >= 3 ? '#10b981' : 'rgba(255,255,255,0.1)', width: '30px' }} />

          {/* STEP 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: kycLevel >= 3 ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.15)', 
              border: `2px solid ${kycLevel >= 3 ? '#10b981' : '#D4AF37'}`, 
              display: 'grid', 
              placeItems: 'center', 
              color: kycLevel >= 3 ? '#10b981' : '#D4AF37', 
              fontWeight: '900',
              fontSize: '0.82rem'
            }}>
              {kycLevel >= 3 ? '✓' : '3'}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff' }}>Level 3: Accredited</div>
              <div style={{ fontSize: '0.68rem', color: kycLevel >= 3 ? '#10b981' : '#D4AF37', fontWeight: '700' }}>
                {kycLevel >= 3 ? 'Active & Verified' : 'VIP Cash Concierge'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LEVEL CARDS LIST */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        
        {/* LEVEL 1 CARD */}
        <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)', padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '900', fontSize: '1rem' }}>L1</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800', color: '#fff' }}>Level 1: Basic Investor Registration</h3>
                <p style={{ margin: '0.2rem 0 0.6rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Default tier granted on email / phone onboarding.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● View Live Deals
                  </span>
                  <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Calculate Projected Yields
                  </span>
                  <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Public Round Access
                  </span>
                </div>
              </div>
            </div>
            <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={15} /> Active Tier
            </span>
          </div>
        </div>

        {/* LEVEL 2 CARD */}
        <div className="glass-card" style={{ borderColor: kycLevel >= 2 ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.3)', padding: '1.5rem', borderLeft: `4px solid ${kycLevel >= 2 ? '#10b981' : '#3b82f6'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: activeKycForm === 'L2' ? '1.25rem' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: kycLevel >= 2 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)', color: kycLevel >= 2 ? '#10b981' : '#60a5fa', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '900', fontSize: '1rem' }}>L2</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800', color: '#fff' }}>Level 2: NID / Passport Verification</h3>
                <p style={{ margin: '0.2rem 0 0.6rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Required for P2P secondary share transfer, OTC market exits, and cap table registration.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Secondary P2P Market
                  </span>
                  <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Share Listing Rights
                  </span>
                  <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Live Orderbook Access
                  </span>
                </div>
              </div>
            </div>
            {kycLevel >= 2 ? (
              <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} /> Verified
              </span>
            ) : (
              <button 
                onClick={() => setActiveKycForm(activeKycForm === 'L2' ? null : 'L2')} 
                style={{ 
                  background: activeKycForm === 'L2' ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)', 
                  color: activeKycForm === 'L2' ? '#94a3b8' : '#fff', 
                  border: activeKycForm === 'L2' ? '1px solid #64748b' : 'none', 
                  padding: '0.55rem 1.1rem', 
                  borderRadius: '6px', 
                  fontSize: '0.82rem', 
                  fontWeight: '800', 
                  cursor: 'pointer' 
                }}
              >
                {activeKycForm === 'L2' ? 'Cancel' : 'Submit NID / Passport →'}
              </button>
            )}
          </div>
          
          {activeKycForm === 'L2' && kycLevel < 2 && (
            <form onSubmit={(e) => handleKycSubmit(e, 2)} style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: '800' }}>
                Upload Government-Issued Identity Document
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '700' }}>NID / Passport Front *</label>
                  <input type="file" accept="image/*" onChange={(e) => setNidFront(e.target.files[0])} className="form-input" style={{ fontSize: '0.78rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '700' }}>NID / Passport Back *</label>
                  <input type="file" accept="image/*" onChange={(e) => setNidBack(e.target.files[0])} className="form-input" style={{ fontSize: '0.78rem' }} required />
                </div>
              </div>
              <button type="submit" disabled={isSubmittingKyc} style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: isSubmittingKyc ? 'not-allowed' : 'pointer', opacity: isSubmittingKyc ? 0.6 : 1 }}>
                {isSubmittingKyc ? 'Uploading Documents...' : 'Submit Identity for Verification'}
              </button>
            </form>
          )}
        </div>

        {/* LEVEL 3 CARD */}
        <div className="glass-card" style={{ borderColor: kycLevel >= 3 ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.35)', padding: '1.5rem', borderLeft: `4px solid ${kycLevel >= 3 ? '#10b981' : '#D4AF37'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: activeKycForm === 'L3' ? '1.25rem' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: kycLevel >= 3 ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', color: kycLevel >= 3 ? '#10b981' : '#D4AF37', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '900', fontSize: '1rem' }}>L3</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800', color: '#fff' }}>Level 3: Accredited HNI Tier</h3>
                <p style={{ margin: '0.2rem 0 0.6rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Unlocks physical Cash Concierge appointments, multi-crore ticket syndicates, and priority SPV allocations.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● Private Cash Concierge
                  </span>
                  <span style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● BDT 50L+ Direct Rounds
                  </span>
                  <span style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                    ● VIP Allocation Priority
                  </span>
                </div>
              </div>
            </div>
            {kycLevel >= 3 ? (
              <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} /> Accredited HNI
              </span>
            ) : (
              <button 
                onClick={() => {
                  if (kycLevel < 2) {
                    addToast('You must complete Level 2 verification first.', 'error');
                    return;
                  }
                  setActiveKycForm(activeKycForm === 'L3' ? null : 'L3');
                }} 
                style={{ 
                  background: activeKycForm === 'L3' ? 'transparent' : 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                  color: activeKycForm === 'L3' ? '#94a3b8' : '#070a14', 
                  border: activeKycForm === 'L3' ? '1px solid #64748b' : 'none', 
                  padding: '0.55rem 1.1rem', 
                  borderRadius: '6px', 
                  fontSize: '0.82rem', 
                  fontWeight: '800', 
                  cursor: kycLevel < 2 ? 'not-allowed' : 'pointer', 
                  opacity: kycLevel < 2 ? 0.5 : 1 
                }}
              >
                {activeKycForm === 'L3' ? 'Cancel' : 'Upgrade to L3 VIP →'}
              </button>
            )}
          </div>
          
          {activeKycForm === 'L3' && kycLevel === 2 && (
            <form onSubmit={(e) => handleKycSubmit(e, 3)} style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#D4AF37', marginBottom: '0.35rem', fontWeight: '700' }}>
                  Source of Funds Declaration *
                </label>
                <textarea 
                  value={sourceOfFunds} 
                  onChange={(e) => setSourceOfFunds(e.target.value)} 
                  className="form-input" 
                  placeholder="Please briefly explain your primary source of investment capital (e.g., Business Income from XYZ Corp, Salary, Remittance, Inheritance)..." 
                  rows={3}
                  required 
                  style={{ fontSize: '0.82rem' }}
                />
              </div>
              <button type="submit" disabled={isSubmittingKyc} style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: isSubmittingKyc ? 'not-allowed' : 'pointer', opacity: isSubmittingKyc ? 0.6 : 1 }}>
                {isSubmittingKyc ? 'Submitting Declaration...' : 'Submit L3 Accreditation Request'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
