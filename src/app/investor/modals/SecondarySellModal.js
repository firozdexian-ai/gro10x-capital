'use client';
import React, { useEffect } from 'react';
import { formatCurrency } from '../../../lib/currency';
import { AlertCircle, CheckCircle2, TrendingUp, X } from 'lucide-react';

export default function SecondarySellModal({
  isOpen,
  onClose,
  selectedHolding,
  sellPrice,
  setSellPrice,
  isListing,
  onSubmit,
  currency = 'BDT'
}) {
  // ESC key listener for accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedHolding) return null;

  const originalAmt = Number(selectedHolding.amount_invested_bdt) || 0;
  const minPrice = Math.round(originalAmt * 0.90);
  const maxPrice = Math.round(originalAmt * 1.10);

  const numericPrice = Number(sellPrice) || 0;
  const spreadPct = originalAmt > 0 && numericPrice > 0 ? (((numericPrice - originalAmt) / originalAmt) * 100) : 0;
  const isOutOfCorridor = numericPrice > 0 && (numericPrice < minPrice || numericPrice > maxPrice);

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="secondary-sell-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 9999, padding: '1rem' }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', position: 'relative', borderColor: 'rgba(212,175,55,0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
        <button 
          onClick={onClose}
          aria-label="Close dialog"
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
        >
          <X size={16} />
        </button>
        <h3 id="secondary-sell-title" style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 0.35rem 0', color: '#D4AF37' }}>
          List on Secondary Market
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          You are listing your shares in <strong style={{ color: '#fff' }}>{selectedHolding.funding_projects?.businesses?.brand_name}</strong>.
        </p>
        
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Original Investment</p>
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#fff' }}>{formatCurrency(originalAmt, currency)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Allowed Corridor (±10%)</p>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: '#10b981' }}>{formatCurrency(minPrice, currency)} – {formatCurrency(maxPrice, currency)}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '700' }}>
                Listing Ask Price ({currency}) *
              </label>
              {numericPrice > 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: isOutOfCorridor ? '#ef4444' : spreadPct >= 0 ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {isOutOfCorridor ? (
                    <><AlertCircle size={13} /> Out of ±10% Corridor</>
                  ) : (
                    <><CheckCircle2 size={13} /> {spreadPct >= 0 ? `+${spreadPct.toFixed(1)}% Premium` : `${spreadPct.toFixed(1)}% Discount`}</>
                  )}
                </span>
              )}
            </div>
            <input 
              type="number" 
              value={sellPrice} 
              onChange={(e) => setSellPrice(e.target.value)} 
              className="form-input" 
              placeholder={`e.g. ${originalAmt}`}
              style={{
                borderColor: isOutOfCorridor ? '#ef4444' : numericPrice > 0 ? '#10b981' : undefined
              }}
              required 
              autoFocus
            />

            {/* Quick Corridor Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSellPrice(String(minPrice))}
                style={{
                  background: numericPrice === minPrice ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${numericPrice === minPrice ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: numericPrice === minPrice ? '#ef4444' : '#cbd5e1',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                -10% Floor (৳{(minPrice / 100000).toFixed(1)}L)
              </button>
              <button
                type="button"
                onClick={() => setSellPrice(String(originalAmt))}
                style={{
                  background: numericPrice === originalAmt ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${numericPrice === originalAmt ? '#D4AF37' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: numericPrice === originalAmt ? '#D4AF37' : '#cbd5e1',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                At Cost / FMV (৳{(originalAmt / 100000).toFixed(1)}L)
              </button>
              <button
                type="button"
                onClick={() => setSellPrice(String(Math.round(originalAmt * 1.05)))}
                style={{
                  background: numericPrice === Math.round(originalAmt * 1.05) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${numericPrice === Math.round(originalAmt * 1.05) ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: numericPrice === Math.round(originalAmt * 1.05) ? '#10b981' : '#cbd5e1',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                +5% Premium
              </button>
              <button
                type="button"
                onClick={() => setSellPrice(String(maxPrice))}
                style={{
                  background: numericPrice === maxPrice ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${numericPrice === maxPrice ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: numericPrice === maxPrice ? '#10b981' : '#cbd5e1',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                +10% Cap (৳{(maxPrice / 100000).toFixed(1)}L)
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.45rem', lineHeight: '1.4' }}>
              🛡️ <strong>Anti-Speculation Rule:</strong> To preserve market stability, secondary orders are capped between {formatCurrency(minPrice, currency)} (-10%) and {formatCurrency(maxPrice, currency)} (+10%).
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isListing || isOutOfCorridor || !numericPrice} 
              style={{ 
                flex: 1.5,
                background: isOutOfCorridor ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                color: isOutOfCorridor ? '#64748b' : '#070a14', 
                border: 'none', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                fontWeight: '800', 
                cursor: (isListing || isOutOfCorridor || !numericPrice) ? 'not-allowed' : 'pointer', 
                opacity: isListing ? 0.7 : 1,
                fontSize: '0.85rem'
              }}
            >
              {isListing ? 'Publishing Order...' : 'Confirm Listing →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

