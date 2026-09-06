'use client';

import React, { useState, useEffect } from 'react';
import { Shield, FileText, Sparkles, HelpCircle, ShieldCheck, Unlock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

import PortfolioTab from './tabs/PortfolioTab';
import KycVerificationTab from './tabs/KycVerificationTab';
import DocumentVaultTab from './tabs/DocumentVaultTab';
import AiConciergeTab from './tabs/AiConciergeTab';
import FaqTab from './tabs/FaqTab';
import SecondarySellModal from './modals/SecondarySellModal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function InvestorPortal() {
  const { user, loading: authLoading } = useAuth();
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

  // Deep linking: read query parameter (?tab=kyc) or URL hash (#kyc)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get('tab');
      const hashTab = window.location.hash.replace('#', '');
      const validTabs = ['portfolio', 'kyc', 'vault', 'ai-concierge', 'faq'];
      const target = queryTab || hashTab;
      if (target && validTabs.includes(target.toLowerCase())) {
        setActiveTab(target.toLowerCase());
      }
    }
  }, []);

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
        setKycLevel(3);
      } else {
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
      
      const total = (investments || []).reduce((acc, curr) => acc + Number(curr.amount_invested_bdt), 0);
      setTotalInvested(total);

      // 3. Fetch pending bookings
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
      
      // 4. Fetch actual yields
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
        
        const historyData = [];
        MONTHS.forEach(m => {
          const shortM = m.substring(0, 3);
          if (monthlyAgg[shortM]) {
            historyData.push({ month: shortM, payout: monthlyAgg[shortM] });
          }
        });
        
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
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `payment-proofs/${user.id}-${Date.now()}.${fileExt}`;
      let screenshotUrl = null;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('public-docs')
        .upload(fileName, screenshotFile);

      if (uploadErr) {
        console.warn('Storage upload fallback:', uploadErr.message);
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

      const { error: updateErr } = await supabase
        .from('investment_bookings')
        .update({ status: 'Proof_Submitted' })
        .eq('id', uploadBookingId);

      if (updateErr) throw updateErr;

      try {
        await fetch('/api/telegram-notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '💳 New Payment Proof Uploaded',
            message: `Investor submitted payment verification.\nBooking: #${uploadBookingId.slice(0, 8)}\nTxID: ${transactionId}\nMethod: ${paymentMethod}`,
            actionUrl: `${window.location.origin}/admin`
          })
        });
      } catch (e) {
        console.warn('Failed to notify admin of payment proof:', e);
      }

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

      try {
        await fetch('/api/telegram-notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `🛡️ New Level ${level} KYC Submission`,
            message: `Investor submitted Level ${level} KYC documents for verification.\nInvestor ID: #${investorDbId.slice(0, 8)}`,
            actionUrl: `${window.location.origin}/admin`
          })
        });
      } catch (e) {
        console.warn('Failed to notify admin of KYC submission:', e);
      }

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

  const handleOpenSellModal = (holding) => {
    if (kycLevel < 2) {
      addToast('Level 2 Verification is required to access the Secondary Market.', 'error');
      return;
    }
    setSelectedHolding(holding);
    setSellPrice(holding.amount_invested_bdt);
    setShowSellModal(true);
  };

  const handleListForSell = async (e) => {
    e.preventDefault();
    if (!selectedHolding || !sellPrice) return;
    
    const originalAmt = Number(selectedHolding.amount_invested_bdt);
    const minPrice = originalAmt * 0.90;
    const maxPrice = originalAmt * 1.10;
    const inputPrice = Number(sellPrice);
    
    if (inputPrice < minPrice || inputPrice > maxPrice) {
      addToast(`Price must be within ±10% of original investment.`, 'error');
      return;
    }
    
    setIsListing(true);
    try {
      const { error } = await supabase.from('secondary_orders').insert([{
        seller_investor_id: investorDbId,
        investment_id: selectedHolding.id,
        original_investment_bdt: originalAmt,
        seller_price_bdt: inputPrice,
        fmv_at_listing_bdt: originalAmt,
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
      
      {/* LOCAL INVESTOR TABS */}
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
          <PortfolioTab 
            holdings={holdings}
            totalInvested={totalInvested}
            totalEarned={totalEarned}
            yieldHistory={yieldHistory}
            pendingBookings={pendingBookings}
            uploadBookingId={uploadBookingId}
            setUploadBookingId={setUploadBookingId}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
            setScreenshotFile={setScreenshotFile}
            handlePaymentUpload={handlePaymentUpload}
            isUploading={isUploading}
            loadingData={loadingData}
            kycLevel={kycLevel}
            onOpenSellModal={handleOpenSellModal}
          />
        )}

        {/* 2. PROGRESSIVE KYC TAB */}
        {activeTab === 'kyc' && (
          <KycVerificationTab 
            kycLevel={kycLevel}
            activeKycForm={activeKycForm}
            setActiveKycForm={setActiveKycForm}
            setNidFront={setNidFront}
            setNidBack={setNidBack}
            sourceOfFunds={sourceOfFunds}
            setSourceOfFunds={setSourceOfFunds}
            isSubmittingKyc={isSubmittingKyc}
            handleKycSubmit={handleKycSubmit}
            addToast={addToast}
          />
        )}

        {/* 3. DOCUMENT VAULT TAB */}
        {activeTab === 'vault' && (
          <DocumentVaultTab 
            legalDocuments={legalDocuments}
            loadingData={loadingData}
          />
        )}

        {/* 4. AI CONCIERGE TAB */}
        {activeTab === 'ai-concierge' && (
          <AiConciergeTab 
            messages={messages}
            inputQuery={inputQuery}
            setInputQuery={setInputQuery}
            handleAiSend={handleAiSend}
          />
        )}

        {/* 5. DUE DILIGENCE FAQ TAB */}
        {activeTab === 'faq' && (
          <FaqTab 
            openFaq={openFaq}
            setOpenFaq={setOpenFaq}
          />
        )}

      </main>

      {/* SECONDARY MARKET SELL MODAL */}
      <SecondarySellModal 
        isOpen={showSellModal}
        onClose={() => {
          setShowSellModal(false);
          setSelectedHolding(null);
        }}
        selectedHolding={selectedHolding}
        sellPrice={sellPrice}
        setSellPrice={setSellPrice}
        isListing={isListing}
        onSubmit={handleListForSell}
      />
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
