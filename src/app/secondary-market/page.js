'use client';
import React, { useState } from 'react';
import { 
  RefreshCw, TrendingUp, ShieldCheck, ArrowUpRight, DollarSign, 
  Search, Filter, Info, AlertCircle, CheckCircle2, ChevronRight, Lock, Globe
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const initialListings = [
  { 
    id: 'ORD-701', 
    sellerAlias: 'NRB Expatriate Investor #104', 
    sellerBadge: 'UK Expatriate • Verified 6-Mo Holding',
    hubName: 'ORO Roasters - Mirpur', 
    category: 'F&B Franchise',
    yieldModel: 'Option 3: Partnership (5% + 35% Profit)',
    originalInvestment: 1500000, 
    trailingMonthlyYield: 25300, 
    fmv: 1725000, // +15% performance growth
    sellerPrice: 1811250, // +5% premium over FMV
    priceModifier: '+5% Corridor Premium',
    holdingMonths: 6,
    status: 'Active Listing'
  },
  { 
    id: 'ORD-702', 
    sellerAlias: 'HNI Investor #208', 
    sellerBadge: 'Dhaka HNI • Verified 8-Mo Holding',
    hubName: 'ORO Roasters - Banani', 
    category: 'F&B Franchise',
    yieldModel: 'Option 2: Multiplier (12% Gross Sales)',
    originalInvestment: 1000000, 
    trailingMonthlyYield: 18180, 
    fmv: 1100000, // +10% growth
    sellerPrice: 1067000, // -3% discount below FMV
    priceModifier: '-3% Corridor Discount',
    holdingMonths: 8,
    status: 'Active Listing'
  },
  { 
    id: 'ORD-703', 
    sellerAlias: 'NRB Investor #312', 
    sellerBadge: 'USA Expatriate • Verified 7-Mo Holding',
    hubName: 'GRO10X Digital Agency SPV', 
    category: 'Digital Agency & Tech',
    yieldModel: 'Option 1: Capped (10% Sales)',
    originalInvestment: 2000000, 
    trailingMonthlyYield: 36600, 
    fmv: 2200000, 
    sellerPrice: 2244000, // +2% premium
    priceModifier: '+2% Corridor Premium',
    holdingMonths: 7,
    status: 'Active Listing'
  }
];

export default function SecondaryMarketplace() {
  const [currency, setCurrency] = useState('BDT');
  const [listings, setListings] = useState(initialListings);
  const [filterCategory, setFilterCategory] = useState('All');

  // Sell Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellOriginalInvest, setSellOriginalInvest] = useState(1000000);
  const [sellPriceInput, setSellPriceInput] = useState(1100000);
  const [sellHubName, setSellHubName] = useState('ORO Roasters - Mirpur');
  const [corridorError, setCorridorError] = useState('');

  // Buy Modal State
  const [selectedListing, setSelectedListing] = useState(null);
  const [buySuccess, setBuySuccess] = useState(false);

  // Calculated FMV for listing validator
  const calculatedFmv = sellOriginalInvest * 1.10; // Assume +10% growth
  const minCorridorPrice = calculatedFmv * 0.90; // -10%
  const maxCorridorPrice = calculatedFmv * 1.10; // +10%

  const handlePriceChange = (val) => {
    const num = Number(val);
    setSellPriceInput(num);
    if (num < minCorridorPrice) {
      setCorridorError(`Price is too low! Below -10% Corridor Limit (${formatCurrency(minCorridorPrice, currency)})`);
    } else if (num > maxCorridorPrice) {
      setCorridorError(`Price is too high! Exceeds +10% Anti-Speculation Limit (${formatCurrency(maxCorridorPrice, currency)})`);
    } else {
      setCorridorError('');
    }
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (corridorError) return;

    const diffPct = ((sellPriceInput - calculatedFmv) / calculatedFmv) * 100;
    const modifierText = diffPct >= 0 ? `+${diffPct.toFixed(1)}% Corridor Premium` : `${diffPct.toFixed(1)}% Corridor Discount`;

    const newOrd = {
      id: `ORD-70${listings.length + 1}`,
      sellerAlias: 'NRB Expatriate Investor #405 (You)',
      sellerBadge: 'Verified Investor • 6-Mo Holding',
      hubName: sellHubName,
      category: 'F&B Franchise',
      yieldModel: 'Option 3: Partnership',
      originalInvestment: sellOriginalInvest,
      trailingMonthlyYield: (sellOriginalInvest * 0.20) / 12,
      fmv: calculatedFmv,
      sellerPrice: sellPriceInput,
      priceModifier: modifierText,
      holdingMonths: 6,
      status: 'Active Listing'
    };

    setListings([newOrd, ...listings]);
    setShowSellModal(false);
  };

  const handleAcquireShare = () => {
    setBuySuccess(true);
    setTimeout(() => {
      setBuySuccess(false);
      setSelectedListing(null);
    }, 1800);
  };

  const filteredListings = filterCategory === 'All' 
    ? listings 
    : listings.filter(l => l.category === filterCategory);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            S
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>SECONDARY <span style={{ color: '#D4AF37' }}>ORDERBOOK</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Anonymized P2P Share Exchange v0.1.4</p>
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

          <button onClick={() => setShowSellModal(true)} className="btn-gold" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
            + List Share for Sale
          </button>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* TOP BANNER */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '0.5rem' }}>
              <RefreshCw size={14} /> Anonymized & Platform-Mediated
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Secondary Share Trading Exchange</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem', maxWidth: '650px' }}>
              Acquire pre-seasoned, income-generating outlet & agency shares directly from existing investors. All transactions are cleared & reassigned by <strong>GRO10X SPV Ltd.</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Enforced Price Corridor</span>
            <h3 style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>±10% FMV Limit</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Prevents Speculative Bubbles</p>
          </div>
        </div>

        {/* CATEGORY FILTER BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['All', 'F&B Franchise', 'Digital Agency & Tech'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                background: filterCategory === cat ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.6)',
                color: filterCategory === cat ? '#D4AF37' : '#94a3b8',
                border: filterCategory === cat ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.55rem 1.25rem',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ORDERBOOK GRID */}
        <div className="grid-3">
          {filteredListings.map((item) => (
            <div key={item.id} className="glass-card flex-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#D4AF37', fontWeight: '700', fontSize: '0.85rem' }}>{item.id}</span>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                  {item.priceModifier}
                </span>
              </div>

              {/* ANONYMIZED SELLER ALIAS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', background: 'rgba(7,10,20,0.6)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                <Lock size={14} style={{ color: '#D4AF37' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>{item.sellerAlias}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{item.sellerBadge}</p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{item.hubName}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Category: <strong>{item.category}</strong></p>

              <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '12px', display: 'grid', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Original Investment:</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(item.originalInvestment, currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Trailing Monthly Yield:</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(item.trailingMonthlyYield, currency)} / mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>System Fair Valuation (FMV):</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>{formatCurrency(item.fmv, currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#D4AF37', fontWeight: '700' }}>Seller Listing Price:</span>
                  <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.1rem' }}>{formatCurrency(item.sellerPrice, currency)}</span>
                </div>
              </div>

              <button onClick={() => setSelectedListing(item)} className="btn-gold" style={{ marginTop: 'auto', justifyContent: 'center', fontSize: '0.95rem' }}>
                Acquire Share <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>

      </main>

      {/* CREATE LISTING MODAL WITH CORRIDOR VALIDATOR */}
      {showSellModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '92%', borderColor: '#D4AF37' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>List Share for Sale</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Your listing will be published under your anonymized ID (`NRB Expatriate Investor #405`).
            </p>

            <form onSubmit={handleCreateListing} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Outlet / Project Share</label>
                <select value={sellHubName} onChange={(e) => setSellHubName(e.target.value)} className="form-input">
                  <option>ORO Roasters - Mirpur (Partnership Option)</option>
                  <option>ORO Roasters - Banani (Multiplier Option)</option>
                  <option>GRO10X Digital Agency SPV</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Original Purchase Price ({currency})</label>
                <input 
                  type="number" 
                  value={sellOriginalInvest} 
                  onChange={(e) => setSellOriginalInvest(Number(e.target.value))}
                  className="form-input" 
                  required 
                />
              </div>

              <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>System Fair Market Value (FMV):</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(calculatedFmv, currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Allowed Listing Price Corridor:</span>
                  <span>{formatCurrency(minCorridorPrice, currency)} - {formatCurrency(maxCorridorPrice, currency)}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Desired Listing Price ({currency})</label>
                <input 
                  type="number" 
                  value={sellPriceInput} 
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>

              {corridorError && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> {corridorError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={!!corridorError} className="btn-gold" style={{ flex: 1, justifyContent: 'center', opacity: corridorError ? 0.5 : 1 }}>
                  Publish Orderbook Listing
                </button>
                <button type="button" onClick={() => setShowSellModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACQUIRE SHARE CONFIRMATION MODAL */}
      {selectedListing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '92%', borderColor: '#10b981' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Acquire Pre-Seasoned Share</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Buying from <strong>{selectedListing.sellerAlias}</strong> via GRO10X SPV Ltd.
            </p>

            {buySuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#10b981', fontSize: '1.2rem' }}>Share Acquisition Confirmed!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Share certificate reassigned. Monthly payout added to your Investor Dashboard.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '10px', display: 'grid', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Target Hub:</span>
                    <span style={{ fontWeight: '700' }}>{selectedListing.hubName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Trailing Monthly Yield:</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(selectedListing.trailingMonthlyYield, currency)} / mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                    <span style={{ color: '#D4AF37', fontWeight: '700' }}>Acquisition Price:</span>
                    <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(selectedListing.sellerPrice, currency)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAcquireShare} className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                    Confirm & Transfer SPV Share
                  </button>
                  <button onClick={() => setSelectedListing(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
