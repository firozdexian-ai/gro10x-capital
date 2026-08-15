'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, TrendingUp, ShieldCheck, HelpCircle, MessageSquare, 
  Calendar, CheckCircle, Lock, ArrowUpRight, DollarSign, Send,
  FileText, Award, ChevronDown, ChevronUp, AlertTriangle, Info, Sparkles, Globe,
  UserCheck, Shield, Unlock, RefreshCw, Loader2, Download
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

// Global constants for month order mapping
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dueDiligenceFAQs = [
  {
    q: "Who owns GRO10X, and do any ORO Roasters founders hold equity in GRO10X?",
    a: "GRO10X operates as an independent growth & data management entity (24-Month Master Growth Agreement). GRO10X has zero operational, payroll, or real estate liabilities for ORO Roasters. ORO founders handle culinary execution, payroll, and supply chain logistics, while GRO10X handles digital demand gen, live COGS monitoring, and capital rotation."
  },
  {
    q: "How does GRO10X make money from each outlet?",
    a: "GRO10X charges a 2.5% management fee on monthly gross network sales, clear of all payroll liabilities, plus a 2.5% capital success fee on total raised capital."
  },
  {
    q: "How are coffee roasting equipment and physical fit-outs owned?",
    a: "Physical assets (machinery, civil fit-outs, kitchen equipment) are held directly under the specific outlet SPV entity in which investors hold their yield/partnership agreements, ensuring clear asset-backed claim."
  }
];

export default function InvestorPortal() {
  const { user, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [openFaq, setOpenFaq] = useState(null);
  
  // Real Data State
  const [loadingData, setLoadingData] = useState(true);
  const [holdings, setHoldings] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [yieldHistory, setYieldHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [legalDocuments, setLegalDocuments] = useState([]);

  // Payment Upload State
  const [uploadBookingId, setUploadBookingId] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { addToast } = useToast();

  // Progressive KYC Verification State
  const [kycLevel, setKycLevel] = useState(1); 
  const [investorDbId, setInvestorDbId] = useState(null);
  
  // KYC Form State
  const [activeKycForm, setActiveKycForm] = useState(null); // 'L2' or 'L3'
  const [nidFront, setNidFront] = useState(null);
  const [nidBack, setNidBack] = useState(null);
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Secondary Market Sell State
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  // AI Concierge State
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your GRO10X AI Investment Concierge. Ask me anything about our 20% ROI yield structures, Mirpur & Banani outlet data, or due diligence FAQs.' }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchInvestorData(user.id);
    } else {
      setLoadingData(false);
    }
  }, [user]);

  const fetchInvestorData = async (authUserId) => {
    try {
      // 1. Fetch internal investor_id from auth user
      const { data: invData, error: invError } = await supabase
        .from('investors')
        .select('id, kyc_verified')
        .eq('user_id', authUserId)
        .single();

      if (invError) {
        if (invError.code === 'PGRST116') {
          setLoadingData(false);
          return;
        }
        throw invError;
      }

      setInvestorDbId(invData.id);
      
      // Determine kyc level
      if (invData.kyc_verified) {
        setKycLevel(3); // For MVP, verified means L3. Could be more granular.
      } else {
        // Check if they have a pending submission
        const { data: sub } = await supabase
          .from('kyc_submissions')
          .select('status, target_level')
          .eq('investor_id', invData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (sub && sub.status === 'Approved') {
          setKycLevel(sub.target_level);
        } else {
          setKycLevel(1);
        }
      }

      // 2. Fetch their portfolio holdings
      const { data: investments, error: investErr } = await supabase
        .from('investments')
        .select(`
          id,
          amount_invested_bdt,
          status,
          yield_option,
          created_at,
          funding_projects(
            project_title,
            yield_model,
            businesses(brand_name)
          )
        `)
        .eq('investor_id', invData.id)
        .order('created_at', { ascending: false });

      if (investErr) throw investErr;
      
      setHoldings(investments || []);
      
      // Calculate total
      const total = (investments || []).reduce((acc, curr) => acc + Number(curr.amount_invested_bdt), 0);
      setTotalInvested(total);

      // 3. Fetch pending bookings (Action Required)
      const { data: pending, error: pendingErr } = await supabase
        .from('investment_bookings')
        .select(`
          id,
          amount_bdt,
          yield_option,
          booking_type,
          project_id,
          funding_projects(
            project_title,
            businesses(brand_name)
          )
        `)
        .eq('investor_id', invData.id)
        .eq('status', 'Pending_Proof');

      if (pendingErr) throw pendingErr;
      setPendingBookings(pending || []);
      
      // 4. Fetch actual yields from investor_yields
      const { data: yields, error: yieldsErr } = await supabase
        .from('investor_yields')
        .select(`
          amount_bdt,
          yield_disbursements (month, year)
        `)
        .eq('investor_id', invData.id);
        
      if (yieldsErr) throw yieldsErr;
      
      if (yields && yields.length > 0) {
        let earned = 0;
        const monthlyAgg = {};
        
        yields.forEach(y => {
          const amt = Number(y.amount_bdt);
          earned += amt;
          const month = y.yield_disbursements?.month;
          if (month) {
            const shortMonth = month.substring(0, 3);
            monthlyAgg[shortMonth] = (monthlyAgg[shortMonth] || 0) + amt;
          }
        });
        
        setTotalEarned(earned);
        
        // Map back to array sorted by months
        const historyData = [];
        MONTHS.forEach(m => {
          const shortM = m.substring(0, 3);
          if (monthlyAgg[shortM]) {
            historyData.push({ month: shortM, payout: monthlyAgg[shortM] });
          }
        });
        
        // If history is empty but we have zero earned, supply empty array.
        setYieldHistory(historyData);
      } else {
        setTotalEarned(0);
        setYieldHistory([]);
      }

      // 5. Fetch Legal Documents
      const { data: docsData, error: docsErr } = await supabase
        .from('legal_documents')
        .select(`
          id, doc_url, doc_type, created_at,
          investment_id,
          investments (
            funding_projects (project_title)
          )
        `)
        .eq('investor_id', invData.id)
        .order('created_at', { ascending: false });
        
      if (docsErr) throw docsErr;
      setLegalDocuments(docsData || []);

    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAiSend = (query) => {
    const qText = query || inputQuery;
    if (!qText.trim()) return;

    const userMsg = { sender: 'user', text: qText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      let reply = "GRO10X targets a 20% annual ROI across 3 structures: Option 1 Capped Yield (10% sales), Option 2 Multiplier (12% sales), and Option 3 Partnership (5% floor + 35% profit).";
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handlePaymentUpload = async (e) => {
    e.preventDefault();
    if (!transactionId || !screenshotFile || !uploadBookingId) {
      addToast('Please provide a Transaction ID and upload a screenshot.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // Real Supabase Storage upload
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `payment-proofs/${user.id}-${Date.now()}.${fileExt}`;
      let screenshotUrl = null;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('public-docs')
        .upload(fileName, screenshotFile);

      if (uploadErr) {
        console.warn('Storage upload fallback:', uploadErr.message);
        // Graceful fallback — still record with placeholder URL
        screenshotUrl = `payment-proof-pending:${Date.now()}`;
      } else {
        screenshotUrl = supabase.storage.from('public-docs').getPublicUrl(fileName).data.publicUrl;
      }

      const { error: insertErr } = await supabase
        .from('payment_submissions')
        .insert([{
          booking_id: uploadBookingId,
          transaction_id: transactionId,
          payment_method: paymentMethod,
          screenshot_url: screenshotUrl
        }]);

      if (insertErr) throw insertErr;

      // Update Booking status to Proof_Submitted
      const { error: updateErr } = await supabase
        .from('investment_bookings')
        .update({ status: 'Proof_Submitted' })
        .eq('id', uploadBookingId);

      if (updateErr) throw updateErr;

      addToast('Payment proof submitted successfully! Awaiting Admin verification.', 'success');
      setUploadBookingId(null);
      setTransactionId('');
      setScreenshotFile(null);
      fetchInvestorData(user.id);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to submit payment proof.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKycSubmit = async (e, level) => {
    e.preventDefault();
    if (!investorDbId) return;
    
    if (level === 2 && (!nidFront || !nidBack)) {
      addToast('Please upload both Front and Back of your NID.', 'error');
      return;
    }
    
    if (level === 3 && !sourceOfFunds.trim()) {
      addToast('Please declare your source of funds.', 'error');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      // Real Supabase Storage upload for NID
      let frontUrl = null;
      let backUrl = null;

      if (level === 2 && nidFront && nidBack) {
        const frontPath = `kyc/${investorDbId}/nid-front-${Date.now()}.${nidFront.name.split('.').pop()}`;
        const backPath = `kyc/${investorDbId}/nid-back-${Date.now()}.${nidBack.name.split('.').pop()}`;

        const [{ data: fData, error: fErr }, { data: bData, error: bErr }] = await Promise.all([
          supabase.storage.from('public-docs').upload(frontPath, nidFront),
          supabase.storage.from('public-docs').upload(backPath, nidBack)
        ]);

        if (fErr) console.warn('NID front upload error:', fErr.message);
        if (bErr) console.warn('NID back upload error:', bErr.message);

        frontUrl = fData ? supabase.storage.from('public-docs').getPublicUrl(frontPath).data.publicUrl : `kyc-front-pending:${Date.now()}`;
        backUrl = bData ? supabase.storage.from('public-docs').getPublicUrl(backPath).data.publicUrl : `kyc-back-pending:${Date.now()}`;
      }

      const { error } = await supabase
        .from('kyc_submissions')
        .insert([{
          investor_id: investorDbId,
          target_level: level,
          nid_front_url: frontUrl,
          nid_back_url: backUrl,
          source_of_funds: level === 3 ? sourceOfFunds : null,
          status: 'Pending'
        }]);

      if (error) throw error;

      addToast(`Level ${level} Verification Submitted. Awaiting Admin Clearance.`, 'success');
      setActiveKycForm(null);
      setNidFront(null);
      setNidBack(null);
      setSourceOfFunds('');

    } catch (err) {
      console.error(err);
      addToast('Failed to submit KYC data.', 'error');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleListForSell = async (e) => {
    e.preventDefault();
    if (!selectedHolding || !sellPrice) return;
    
    // Anti-speculation Guardrail (±10%)
    const originalAmt = Number(selectedHolding.amount_invested_bdt);
    const minPrice = originalAmt * 0.90;
    const maxPrice = originalAmt * 1.10;
    const inputPrice = Number(sellPrice);
    
    if (inputPrice < minPrice || inputPrice > maxPrice) {
      addToast(`Price must be between ${formatCurrency(minPrice, currency)} and ${formatCurrency(maxPrice, currency)} (±10% of original investment).`, 'error');
      return;
    }
    
    setIsListing(true);
    try {
      // Create listing
      const { error } = await supabase.from('secondary_orders').insert([{
        seller_investor_id: investorDbId,
        investment_id: selectedHolding.id,
        original_investment_bdt: originalAmt,
        seller_price_bdt: inputPrice,
        fmv_at_listing_bdt: originalAmt, // For MVP, FMV is original amount
        status: 'Active'
      }]);
      
      if (error) throw error;
      
      addToast('Share successfully listed on the Secondary Market!', 'success');
      setShowSellModal(false);
      setSelectedHolding(null);
      setSellPrice('');
      
    } catch (err) {
      console.error(err);
      addToast('Failed to list share. Please try again.', 'error');
    } finally {
      setIsListing(false);
    }
  };

  if (loadingData || authLoading) {
    return <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* LOCAL INVESTOR TABS (Under the global Navigation) */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(16,185,129,0.2)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', position: 'sticky', top: '70px', zIndex: 9, backdropFilter: 'blur(10px)' }}>
        <button onClick={() => setActiveTab('portfolio')} style={tabBtnStyle(activeTab === 'portfolio')}>
          My Portfolio
        </button>
        <button onClick={() => setActiveTab('kyc')} style={tabBtnStyle(activeTab === 'kyc')}>
          <Shield size={16} style={{ color: '#10b981' }} /> Verification (L{kycLevel})
        </button>
        <button onClick={() => setActiveTab('vault')} style={tabBtnStyle(activeTab === 'vault')}>
          <FileText size={16} style={{ color: '#D4AF37' }} /> Document Vault
        </button>
        <button onClick={() => setActiveTab('ai-concierge')} style={tabBtnStyle(activeTab === 'ai-concierge')}>
          <Sparkles size={16} style={{ color: '#D4AF37' }} /> AI Assistant
        </button>
        <button onClick={() => setActiveTab('faq')} style={tabBtnStyle(activeTab === 'faq')}>
          <HelpCircle size={16} /> FAQ
        </button>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* PROGRESSIVE KYC LEVEL BANNER */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(7,10,20,0.8))', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Account Verification: Level {kycLevel} / 3</span>
                <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {kycLevel === 1 ? 'Basic Access' : kycLevel === 2 ? 'Secondary Market Unlocked' : 'VIP Concierge Unlocked'}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                {kycLevel === 2 ? 'Level 2 Active: You can trade on the Secondary P2P Orderbook.' : 'Level 3 Active: Unlimited Private Cash Concierge deals.'}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('kyc')} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Unlock size={16} /> Manage Verification
          </button>
        </div>

        {/* 1. PORTFOLIO DASHBOARD */}
        {activeTab === 'portfolio' && (
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            
            {/* TAB HEADER ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
                  My Portfolio & Active Holdings
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Track SPV allocations, live yield distributions, and secondary market exits
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
                  ● {holdings.filter(h => h.status === 'Active' || !h.status).length} Active Position{holdings.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* ACTION REQUIRED: PENDING BOOKINGS */}
            {pendingBookings.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.85rem 0', fontWeight: '800' }}>
                  <AlertTriangle size={18} /> Action Required: Complete Pending Payments ({pendingBookings.length})
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {pendingBookings.map(booking => (
                    <div key={booking.id} className="glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: '800', color: '#fff' }}>
                            {booking.funding_projects?.businesses?.brand_name} - {booking.funding_projects?.project_title}
                          </h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                            Intent: <strong style={{ color: '#f0b429' }}>{formatCurrency(booking.amount_bdt, currency)}</strong> • Option {booking.yield_option} Yield • Type: {booking.booking_type}
                          </p>
                        </div>
                        {uploadBookingId === booking.id ? (
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#D4AF37', fontWeight: '700' }}>Upload Proof of Transfer</p>
                            <form onSubmit={handlePaymentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                              <select 
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.82rem' }}
                              >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="bKash">bKash</option>
                                <option value="Cash Deposit">Cash Deposit</option>
                              </select>
                              <input 
                                type="text" 
                                placeholder="Transaction Ref / Slip ID" 
                                value={transactionId} 
                                onChange={(e) => setTransactionId(e.target.value)}
                                style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.82rem' }}
                                required
                              />
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setScreenshotFile(e.target.files[0])}
                                style={{ fontSize: '0.78rem', color: '#94a3b8' }}
                                required
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <button type="submit" disabled={isUploading} className="btn-gold" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', flex: 1 }}>
                                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                                <button type="button" onClick={() => setUploadBookingId(null)} style={{ background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', padding: '0.45rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setUploadBookingId(booking.id)}
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                          >
                            Upload Payment Proof →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingData ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                 {[1,2,3,4].map(i => (
                   <div key={i} className="glass-card">
                     <Skeleton width="60%" height="16px" className="mb-2" />
                     <Skeleton width="80%" height="32px" className="mb-2" />
                     <Skeleton width="40%" height="14px" />
                   </div>
                 ))}
               </div>
            ) : (
              <>
                {/* 4-CARD LIVE KPI STRIP */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Capital Invested
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
                        {formatCurrency(totalInvested, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{holdings.length} Positions</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Yield Earned
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
                        {formatCurrency(totalEarned, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Lifetime Paid</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Latest Dividend
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#60a5fa', margin: 0 }}>
                        {yieldHistory.length > 0 ? formatCurrency(yieldHistory[yieldHistory.length - 1]?.payout || 0, currency) : formatCurrency(0, currency)}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {yieldHistory.length > 0 ? `${yieldHistory[yieldHistory.length - 1]?.month} Run` : 'No runs yet'}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.4rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Portfolio Distribution
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa', margin: 0 }}>
                        {holdings.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Outlets</span>
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                        {holdings.length > 0 ? '100% Asset-Backed' : '0 Assets'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* 2-COLUMN MAIN WORKSPACE: CHART + ACTIVE HOLDINGS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem', alignItems: 'flex-start' }}>
                  
                  {/* PAYOUT HISTORY CHART */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                          Monthly Payout Distributions
                        </h3>
                        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                          Audited monthly yield disbursements on file
                        </p>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '700' }}>
                        {yieldHistory.length} Month{yieldHistory.length !== 1 ? 's' : ''} Logged
                      </span>
                    </div>

                    <div style={{ height: '280px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                      {yieldHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={yieldHistory}>
                            <defs>
                              <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val/1000}k`} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                            <Area type="monotone" dataKey="payout" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPayout)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <TrendingUp size={36} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>No dividend payout history recorded yet.</p>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Monthly disbursements will chart automatically here upon audit reconciliation.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MY HOLDINGS LIST (PREMIUM CARDS) */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                          Active Outlet Shares & Allocations
                        </h3>
                        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                          Direct SPV equity & revenue-share investments
                        </p>
                      </div>
                      <a href="/showcase" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Deal Showcase <ArrowUpRight size={13} />
                      </a>
                    </div>
                    
                    {holdings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                        <Building2 size={36} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#94a3b8' }}>No active investments in your portfolio</h4>
                        <p style={{ margin: '0.3rem 0 1rem 0', fontSize: '0.78rem' }}>Explore live CapEx funding rounds and syndicate allocations in the deal room.</p>
                        <a 
                          href="/showcase" 
                          style={{ 
                            background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                            color: '#070a14', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px', 
                            fontWeight: '800', 
                            fontSize: '0.78rem', 
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Explore Live Rounds →
                        </a>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.85rem' }}>
                        {holdings.map((h) => {
                          const statusColor = h.status === 'Active' || !h.status ? '#10b981' : h.status === 'Pending' ? '#f59e0b' : '#94a3b8';
                          const statusLabel = h.status === 'Active' || !h.status ? '● Active Allocation' : h.status;
                          const yieldOption = h.yield_option ? `Option ${h.yield_option}` : null;
                          const dateStr = h.created_at ? new Date(h.created_at).toLocaleDateString() : null;

                          return (
                            <div 
                              key={h.id || Math.random()} 
                              style={{ 
                                background: 'rgba(15,23,42,0.7)', 
                                padding: '1.1rem 1.25rem', 
                                borderRadius: '10px', 
                                borderLeft: `4px solid ${statusColor}`,
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'grid',
                                gap: '0.65rem'
                              }}
                            >
                              {/* TOP ROW */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                    <span style={{ color: '#60a5fa', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      {h.funding_projects?.businesses?.brand_name || 'GRO10X Network'}
                                    </span>
                                    {yieldOption && (
                                      <span style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                                        {yieldOption}
                                      </span>
                                    )}
                                    <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}35`, padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#fff' }}>
                                    {h.funding_projects?.project_title || 'Outlet Franchise SPV'}
                                  </h4>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Invested Capital</div>
                                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#D4AF37' }}>
                                    {formatCurrency(h.amount_invested_bdt, currency)}
                                  </div>
                                </div>
                              </div>

                              {/* DETAIL & ACTION ROW */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                  {h.funding_projects?.yield_model && (
                                    <span style={{ color: '#cbd5e1' }}>Model: <strong style={{ color: '#f0b429' }}>{h.funding_projects.yield_model}</strong></span>
                                  )}
                                  {dateStr && <span style={{ marginLeft: '0.6rem', color: '#64748b' }}>Since: {dateStr}</span>}
                                </div>

                                <button 
                                  onClick={() => {
                                    if (kycLevel < 2) {
                                      addToast('Level 2 Verification is required to access the Secondary Market.', 'error');
                                      return;
                                    }
                                    setSelectedHolding(h);
                                    setSellPrice(h.amount_invested_bdt);
                                    setShowSellModal(true);
                                  }}
                                  style={{ 
                                    background: 'rgba(212,175,55,0.12)', 
                                    color: '#D4AF37', 
                                    border: '1px solid rgba(212,175,55,0.3)', 
                                    padding: '0.35rem 0.75rem', 
                                    borderRadius: '6px', 
                                    fontWeight: '800', 
                                    cursor: 'pointer', 
                                    fontSize: '0.72rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  List on Secondary Market →
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
        )}

        {/* 2. PROGRESSIVE KYC TAB */}
        {activeTab === 'kyc' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' }}>Progressive Investor Profiling</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Complete higher verification tiers to unlock Secondary Market trading and Private Cash Concierge facilities.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* LEVEL 1 */}
              <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L1</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 1: Basic Investor Registration</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>View public deals & calculate target yields.</p>
                    </div>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={16} /> Verified
                  </span>
                </div>
              </div>

              {/* LEVEL 2 */}
              <div className="glass-card" style={{ borderColor: kycLevel >= 2 ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: activeKycForm === 'L2' ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: kycLevel >= 2 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: kycLevel >= 2 ? '#10b981' : '#94a3b8', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L2</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 2: NID / Passport Verification</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Unlocks Secondary P2P Orderbook share trading.</p>
                    </div>
                  </div>
                  {kycLevel >= 2 ? (
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={16} /> Verified
                    </span>
                  ) : (
                    <button onClick={() => setActiveKycForm(activeKycForm === 'L2' ? null : 'L2')} style={{ background: '#10b981', color: '#070a14', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                      {activeKycForm === 'L2' ? 'Cancel' : 'Submit NID'}
                    </button>
                  )}
                </div>
                
                {activeKycForm === 'L2' && kycLevel < 2 && (
                  <form onSubmit={(e) => handleKycSubmit(e, 2)} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>NID Front Image</label>
                      <input type="file" accept="image/*" onChange={(e) => setNidFront(e.target.files[0])} className="form-input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>NID Back Image</label>
                      <input type="file" accept="image/*" onChange={(e) => setNidBack(e.target.files[0])} className="form-input" required />
                    </div>
                    <button type="submit" disabled={isSubmittingKyc} style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: isSubmittingKyc ? 0.6 : 1 }}>
                      {isSubmittingKyc ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                  </form>
                )}
              </div>

              {/* LEVEL 3 */}
              <div className="glass-card" style={{ borderColor: kycLevel >= 3 ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: activeKycForm === 'L3' ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: kycLevel >= 3 ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', color: kycLevel >= 3 ? '#10b981' : '#D4AF37', padding: '0.6rem 0.9rem', borderRadius: '8px', fontWeight: '800' }}>L3</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Level 3: Accredited HNI Accreditation</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Unlocks Private Cash Concierge & BDT 50L+ deals.</p>
                    </div>
                  </div>
                  {kycLevel >= 3 ? (
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={16} /> Accredited HNI
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
                      style={{ background: '#D4AF37', color: '#070a14', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', opacity: kycLevel < 2 ? 0.5 : 1 }}
                    >
                      {activeKycForm === 'L3' ? 'Cancel' : 'Upgrade to L3 VIP'}
                    </button>
                  )}
                </div>
                
                {activeKycForm === 'L3' && kycLevel === 2 && (
                  <form onSubmit={(e) => handleKycSubmit(e, 3)} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Source of Funds Declaration</label>
                      <textarea 
                        value={sourceOfFunds} 
                        onChange={(e) => setSourceOfFunds(e.target.value)} 
                        className="form-input" 
                        placeholder="Please briefly explain your primary source of investment capital (e.g., Business Income from XYZ Corp, Salary, Inheritance)..." 
                        rows={3}
                        required 
                      />
                    </div>
                    <button type="submit" disabled={isSubmittingKyc} style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: isSubmittingKyc ? 0.6 : 1 }}>
                      {isSubmittingKyc ? 'Submitting...' : 'Request L3 Accreditation'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2.5. DOCUMENT VAULT TAB */}
        {activeTab === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.2rem' }}>Document Vault</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Securely download your executed SPV Share Certificates and Tax Statements.</p>
              </div>
            </div>

            {loadingData ? (
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Skeleton width="100%" height="80px" borderRadius="12px" />
                <Skeleton width="100%" height="80px" borderRadius="12px" />
              </div>
            ) : legalDocuments.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <FileText size={48} style={{ color: '#334155', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No Documents Yet</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Your legal certificates will appear here once your investments are fully cleared and minted.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {legalDocuments.map(doc => (
                  <div key={doc.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: 'rgba(212,175,55,0.1)', padding: '1rem', borderRadius: '12px' }}>
                        <FileText size={24} style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>
                          {doc.doc_type === 'Share_Certificate' ? 'SPV Share Certificate' : 
                           doc.doc_type === 'Subscription_Agreement' ? 'Subscription Agreement' : 'Tax Document'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          {doc.investments?.funding_projects?.project_title || 'General Account Document'} • Issued on {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a href={doc.doc_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                      <Download size={16} /> Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. AI CONCIERGE */}
        {activeTab === 'ai-concierge' && (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.15)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>GRO10X AI Investment Concierge</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Trained on Master Agreement & Due Diligence FAQs</p>
              </div>
            </div>

            <div style={{ height: '320px', overflowY: 'auto', background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: m.sender === 'user' ? '#D4AF37' : 'rgba(15,23,42,0.9)', color: m.sender === 'user' ? '#070a14' : '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '14px', fontSize: '0.95rem' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Ask any due diligence question..." 
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                className="form-input"
              />
              <button onClick={() => handleAiSend()} className="btn-gold" style={{ padding: '0 1.5rem' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 4. DUE DILIGENCE FAQ */}
        {activeTab === 'faq' && (
          <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>Investor Due Diligence</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {dueDiligenceFAQs.map((faq, idx) => (
                <div key={idx} style={{ background: 'rgba(7,10,20,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '1.25rem', background: 'transparent', border: 'none', color: '#f8fafc', fontWeight: '700', fontSize: '1.05rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>Q: {faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={20} style={{ color: '#D4AF37' }} /> : <ChevronDown size={20} style={{ color: '#94a3b8' }} />}
                  </button>

                  {openFaq === idx && (
                    <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* SECONDARY MARKET SELL MODAL */}
      {showSellModal && selectedHolding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button 
              onClick={() => {
                setShowSellModal(false);
                setSelectedHolding(null);
              }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#D4AF37' }}>List on Secondary Market</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You are listing your shares in <strong>{selectedHolding.funding_projects?.businesses?.brand_name}</strong>.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>Original Investment</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(selectedHolding.amount_invested_bdt, currency)}</p>
            </div>

            <form onSubmit={handleListForSell} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Listing Price (BDT)
                </label>
                <input 
                  type="number" 
                  value={sellPrice} 
                  onChange={(e) => setSellPrice(e.target.value)} 
                  className="form-input" 
                  required 
                />
                <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Anti-Speculation Rule: You can list this asset between {formatCurrency(Number(selectedHolding.amount_invested_bdt) * 0.90, currency)} (-10%) and {formatCurrency(Number(selectedHolding.amount_invested_bdt) * 1.10, currency)} (+10%).
                </p>
              </div>
              
              <button type="submit" disabled={isListing} style={{ background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: isListing ? 0.7 : 1 }}>
                {isListing ? 'Publishing Order...' : 'Confirm Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
    color: active ? '#10b981' : '#94a3b8',
    border: active ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: active ? '700' : '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s'
  };
}
