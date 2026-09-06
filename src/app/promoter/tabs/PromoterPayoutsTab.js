'use client';
import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function PromoterPayoutsTab({
  availableBalanceBdt = 0,
  payoutAmount,
  setPayoutAmount,
  payoutChannel,
  setPayoutChannel,
  payoutAccount,
  setPayoutAccount,
  handleSubmitPayoutRequest,
  submittingPayout,
  isStaffOverseer,
  payouts = [],
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.4fr)', gap: '1.75rem', alignItems: 'flex-start' }}>
      
      {/* PAYOUT REQUEST FORM */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} color="#10b981" /> Request Commission Withdrawal
        </h3>

        <div style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Available for Withdrawal</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', marginTop: '0.1rem' }}>
            {formatCurrency(availableBalanceBdt, currency)}
          </div>
        </div>

        <form onSubmit={handleSubmitPayoutRequest} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              Withdrawal Amount (BDT) *
            </label>
            <input 
              type="number" 
              value={payoutAmount} 
              onChange={(e) => setPayoutAmount(e.target.value)} 
              className="form-input" 
              style={{ fontSize: '0.82rem' }}
              min="1000"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              Disbursement Channel *
            </label>
            <select 
              value={payoutChannel} 
              onChange={(e) => setPayoutChannel(e.target.value)} 
              className="form-input"
              style={{ fontSize: '0.82rem' }}
            >
              <option value="bKash">bKash (Personal / Merchant)</option>
              <option value="Nagad">Nagad</option>
              <option value="City Bank Wire">City Bank Wire (Corporate / Personal)</option>
              <option value="BRAC Bank Wire">BRAC Bank Wire</option>
              <option value="Dutch Bangla Bank (DBBL)">Dutch Bangla Bank (DBBL)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              Account Details / Phone Number *
            </label>
            <input 
              type="text" 
              value={payoutAccount} 
              onChange={(e) => setPayoutAccount(e.target.value)} 
              className="form-input" 
              placeholder="e.g. 01700000000 or Account No + Routing No" 
              style={{ fontSize: '0.82rem' }}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={submittingPayout || (availableBalanceBdt <= 0 && !isStaffOverseer)} 
            className="btn-gold" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              marginTop: '0.5rem', 
              opacity: (submittingPayout || (availableBalanceBdt <= 0 && !isStaffOverseer)) ? 0.6 : 1, 
              fontSize: '0.82rem', 
              padding: '0.65rem' 
            }}
          >
            {submittingPayout ? 'Submitting Payout...' : 'Submit Withdrawal Request →'}
          </button>
        </form>
      </div>

      {/* PAYOUT REQUEST HISTORY */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#fff' }}>
          Payout Request History ({payouts.length})
        </h3>

        {payouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CreditCard size={38} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              No payout requests submitted yet. Earn commissions and submit withdrawal requests here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {payouts.map((p) => {
              const isCleared = p.status === 'Cleared' || p.status === 'Disbursed';
              const isRejected = p.status === 'Rejected';

              return (
                <div 
                  key={p.id} 
                  style={{ 
                    background: 'rgba(7,10,20,0.6)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    borderLeft: `3px solid ${isCleared ? '#10b981' : isRejected ? '#ef4444' : '#D4AF37'}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fff' }}>
                      {formatCurrency(p.amount_bdt, currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Channel: <strong style={{ color: '#cbd5e1' }}>{p.disbursement_channel}</strong> ({p.account_details || 'N/A'})
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Requested on: {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <span style={{ 
                    background: isCleared ? 'rgba(16,185,129,0.15)' : isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)', 
                    color: isCleared ? '#10b981' : isRejected ? '#ef4444' : '#D4AF37', 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '4px', 
                    fontSize: '0.72rem', 
                    fontWeight: '800' 
                  }}>
                    {p.status || 'Pending Verification'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
