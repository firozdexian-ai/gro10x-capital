'use client';
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, TrendingUp, ShieldCheck, ArrowUpRight, DollarSign, 
  Search, Filter, Info, AlertCircle, CheckCircle2, ChevronRight, Lock, Globe, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function SecondaryMarketplace() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Real Data State
  const [loadingListings, setLoadingListings] = useState(true);
  const [listings, setListings] = useState([]);
  
  const [selectedListing, setSelectedListing] = useState(null);
  const [buySuccess, setBuySuccess] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const { addToast } = useToast();

  // Sell Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [myHoldings, setMyHoldings] = useState([]);
  const [selectedHoldingId, setSelectedHoldingId] = useState('');
  const [sellPriceInput, setSellPriceInput] = useState('');
  const [corridorError, setCorridorError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedFmv, setCalculatedFmv] = useState(0);
  const [minCorridorPrice, setMinCorridorPrice] = useState(0);
  const [maxCorridorPrice, setMaxCorridorPrice] = useState(0);

  useEffect(() => {
    fetchOrderbook();
  }, []);

  const fetchOrderbook = async () => {
    try {
      setLoadingListings(true);
      const { data, error } = await supabase
        .from('secondary_orders')
        .select(`
          *,
          investors ( alias_name ),
          investments (
            amount_invested_bdt,
            funding_project_id,
            funding_projects (
              project_title,
              yield_model,
              businesses ( brand_name, industry_sector )
            )
          )
        `)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching orderbook:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleOpenSellModal = async () => {
    if (!user) { addToast('Please log in to list a share.', 'error'); return; }
    const { data: inv } = await supabase.from('investors').select('id').eq('user_id', user.id).single();
    if (!inv) { addToast('No investor profile found.', 'error'); return; }
    const { data: holdings } = await supabase
      .from('investments').select('*, funding_projects(project_title, businesses(brand_name))')
      .eq('investor_id', inv.id).eq('status', 'Active');
    setMyHoldings(holdings || []);
    if (holdings && holdings.length > 0) {
      setSelectedHoldingId(holdings[0].id);
      const fmv = Number(holdings[0].amount_invested_bdt);
      setCalculatedFmv(fmv);
      setMinCorridorPrice(fmv * 0.9);
      setMaxCorridorPrice(fmv * 1.1);
    }
    setShowSellModal(true);
  };

  const handlePriceChange = (val) => {
    setSellPriceInput(val);
    const price = Number(val);
    if (price < minCorridorPrice || price > maxCorridorPrice) {
      setCorridorError(`Price must be between ${formatCurrency(minCorridorPrice, currency)} and ${formatCurrency(maxCorridorPrice, currency)}`);
    } else {
      setCorridorError('');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (corridorError) return;
    setIsSubmitting(true);
    try {
      const { data: inv } = await supabase.from('investors').select('id').eq('user_id', user.id).single();
      const holding = myHoldings.find(h => h.id === selectedHoldingId);
      if (!holding || !inv) throw new Error('Invalid selection');
      await supabase.from('secondary_orders').insert({
        seller_investor_id: inv.id,
        investment_id: holding.id,
        original_investment_bdt: holding.amount_invested_bdt,
        seller_price_bdt: Number(sellPriceInput),
        fmv_at_listing_bdt: calculatedFmv,
        status: 'Active'
      });
      addToast('Share listed on Secondary Market!', 'success');
      setShowSellModal(false);
      fetchOrderbook();
    } catch (err) {
      addToast('Failed to list share.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcquireShare = async () => {
    if (!user) {
      addToast("You must be logged in as an Investor to acquire a share.", "error");
      return;
    }
    
    setIsAcquiring(true);
    try {
      // 1. Get Investor ID
      const { data: invData, error: invError } = await supabase
        .from('investors')
        .select('id, kyc_verified')
        .eq('user_id', user.id)
        .single();
        
      if (invError || !invData) {
        throw new Error("Investor profile not found. Make sure you are logged in as an investor.");
      }
      
      // Determine KYC Level
      let currentKycLevel = 1;
      if (invData.kyc_verified) {
        currentKycLevel = 3;
      } else {
        const { data: sub } = await supabase
          .from('kyc_submissions')
          .select('status, target_level')
          .eq('investor_id', invData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (sub && sub.status === 'Approved') currentKycLevel = sub.target_level;
      }
      
      if (currentKycLevel < 2) {
        addToast("KYC Level 2 is required to acquire secondary shares. Please complete verification in your Portfolio.", "error");
        setIsAcquiring(false);
        return;
      }
      
      // 2. Create Secondary Booking
      const { data: newBooking, error: bookingErr } = await supabase
        .from('investment_bookings')
        .insert([{
          investor_id: invData.id,
          project_id: selectedListing.investments.funding_project_id,
          amount_bdt: selectedListing.seller_price_bdt,
          yield_option: 1, // Defaulting to Option 1 for secondary for now
          booking_type: 'Secondary',
          status: 'Pending_Payment' // Correct status
        }])
        .select()
        .single();
        
      if (bookingErr) throw bookingErr;
      
      // 3. Mark the secondary order as pending clearance and link booking
      await supabase
        .from('secondary_orders')
        .update({ status: 'Pending_Clearance', buyer_booking_id: newBooking.id })
        .eq('id', selectedListing.id);
        
      setBuySuccess(true);
      addToast('Secondary Booking Intent created! Please submit payment proof in your Portfolio.', 'success');
      
      setTimeout(() => {
        setBuySuccess(false);
        setSelectedListing(null);
        fetchOrderbook();
      }, 2500);
      
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to initiate acquisition.', 'error');
    } finally {
      setIsAcquiring(false);
    }
  };

  const filteredListings = filterCategory === 'All' 
    ? listings 
    : listings.filter(l => l.investments?.funding_projects?.businesses?.industry_sector === filterCategory);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      <main className="container" style={{ padding: '2.5rem 2rem' }}>
        
        {/* TOP BANNER */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '0.5rem' }}>
              <RefreshCw size={14} /> Anonymized & Platform-Mediated
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Secondary Share Exchange</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.25rem', maxWidth: '650px' }}>
              Acquire pre-seasoned, income-generating shares directly from existing investors. Transactions cleared by <strong>GRO10X SPV Ltd.</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Enforced Price Corridor</span>
              <h3 style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>±10% FMV Limit</h3>
            </div>
            <button onClick={handleOpenSellModal} className="btn-gold" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
              + List Share for Sale
            </button>
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
          
          {/* CURRENCY SELECTOR */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
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
        </div>

        {/* ORDERBOOK GRID */}
        {loadingListings ? (
           <div style={{ textAlign: 'center', padding: '5rem', color: '#D4AF37' }}>
             <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1rem auto' }} />
             <p style={{ color: '#94a3b8' }}>Syncing with GRO10X Secondary Ledger...</p>
           </div>
        ) : filteredListings.length === 0 ? (
           <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderColor: 'rgba(212,175,55,0.2)' }}>
             <RefreshCw size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
             <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Active Orders</h3>
             <p style={{ color: '#94a3b8' }}>There are currently no P2P listings matching this filter.</p>
           </div>
        ) : (
          <div className="grid-3">
            {filteredListings.map((item) => {
              const project = item.investments?.funding_projects;
              const business = project?.businesses;
              const diffPct = ((item.seller_price_bdt - item.fmv_at_listing_bdt) / item.fmv_at_listing_bdt) * 100;
              const modifierText = diffPct >= 0 ? `+${diffPct.toFixed(1)}% Corridor Premium` : `${diffPct.toFixed(1)}% Corridor Discount`;

              return (
                <div key={item.id} className="glass-card flex-col">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#D4AF37', fontWeight: '700', fontSize: '0.85rem' }}>#{item.id.split('-')[0]}...</span>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {modifierText}
                    </span>
                  </div>

                  {/* ANONYMIZED SELLER ALIAS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(138,109,27,0.1))', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                      <Lock size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>NRB Investor #{item.seller_investor_id.substring(0, 5)}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Verified HNI Platform Member</p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{business?.brand_name || 'Unknown Hub'}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Category: <strong>{business?.industry_sector || 'Business'}</strong></p>

                  <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '12px', display: 'grid', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Original Investment:</span>
                      <span style={{ fontWeight: '600' }}>{formatCurrency(item.original_investment_bdt, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Est. Monthly Yield:</span>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(item.original_investment_bdt * 0.016, currency)} / mo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                      <span style={{ color: '#94a3b8' }}>System Fair Valuation (FMV):</span>
                      <span style={{ color: '#f8fafc', fontWeight: '600' }}>{formatCurrency(item.fmv_at_listing_bdt, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#D4AF37', fontWeight: '700' }}>Seller Listing Price:</span>
                      <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.1rem' }}>{formatCurrency(item.seller_price_bdt, currency)}</span>
                    </div>
                  </div>

                  <button onClick={() => setSelectedListing(item)} className="btn-gold" style={{ marginTop: 'auto', justifyContent: 'center', fontSize: '0.95rem' }}>
                    Acquire Share <ChevronRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* CREATE LISTING MODAL WITH CORRIDOR VALIDATOR */}
      {showSellModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '92%', borderColor: '#D4AF37' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>List Share for Sale</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Your listing will be published under your secure alias to protect your identity.
            </p>

            {myHoldings.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px' }}>
                 <AlertCircle size={32} style={{ margin: '0 auto 1rem auto' }} />
                 <p>You do not hold any active investments to sell.</p>
                 <button onClick={() => setShowSellModal(false)} className="btn-outline" style={{ marginTop: '1rem' }}>Close</button>
               </div>
            ) : (
              <form onSubmit={handleCreateListing} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Asset to Sell</label>
                  <select 
                    value={selectedHoldingId} 
                    onChange={(e) => setSelectedHoldingId(e.target.value)} 
                    className="form-input"
                  >
                    {myHoldings.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.funding_projects?.businesses?.brand_name} - {formatCurrency(h.amount_invested_bdt, currency)}
                      </option>
                    ))}
                  </select>
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
                  <button type="submit" disabled={!!corridorError || isSubmitting} className="btn-gold" style={{ flex: 1, justifyContent: 'center', opacity: (corridorError || isSubmitting) ? 0.5 : 1 }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Publish Orderbook Listing'}
                  </button>
                  <button type="button" onClick={() => setShowSellModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACQUIRE SHARE CONFIRMATION MODAL */}
      {selectedListing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '92%', borderColor: '#10b981' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Acquire Pre-Seasoned Share</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Buying from <strong>{selectedListing.investors?.alias_name || 'Anonymous Investor'}</strong> via GRO10X SPV Ltd.
            </p>

            {buySuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#10b981', fontSize: '1.2rem' }}>Acquisition Initiated!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Sent to Admin for Clearance. Once cash transfer is verified, the SPV share will hit your portfolio.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '10px', display: 'grid', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Target Hub:</span>
                    <span style={{ fontWeight: '700' }}>{selectedListing.investments?.funding_projects?.businesses?.brand_name || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                    <span style={{ color: '#D4AF37', fontWeight: '700' }}>Acquisition Price:</span>
                    <span style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(selectedListing.seller_price_bdt, currency)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAcquireShare} disabled={isAcquiring} className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                    {isAcquiring ? <Loader2 className="animate-spin" size={16} /> : 'Confirm & Transfer SPV Share'}
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
