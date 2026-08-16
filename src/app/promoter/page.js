'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, TrendingUp, DollarSign, Link2, Copy, CheckCircle2, 
  ArrowUpRight, Award, ChevronRight, Share2, ShieldCheck, UserCheck,
  Lock, Unlock, MessageSquare, Mail, PlusCircle, Globe, Send, Sparkles, Loader2, Target, Crosshair,
  Search, Filter, ExternalLink, Activity, Phone, CreditCard, RefreshCw, AlertCircle
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

export default function PromoterPortal() {
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [allPromoters, setAllPromoters] = useState([]);
  const [copied, setCopied] = useState(false);

  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'targets' | 'earnings' | 'payouts'
  const [loading, setLoading] = useState(true);

  // Data states
  const [leads, setLeads] = useState([]);
  const [promoterTargets, setPromoterTargets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [commissions, setCommissions] = useState([]);

  // Filters & Search
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');

  // Form states
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCategory, setNewLeadCategory] = useState('NRB Expatriate');
  const [newLeadInterest, setNewLeadInterest] = useState('Franchise Yield (18%)');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Target form
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmittingTarget, setIsSubmittingTarget] = useState(false);

  // Payout request form
  const [payoutAmount, setPayoutAmount] = useState('5000');
  const [payoutChannel, setPayoutChannel] = useState('bKash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const { addToast } = useToast();
  const isStaffOverseer = role === 'admin' || role === 'kam';
  const TARGET_LEADS = 50;

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchPromoterData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, role]);

  const fetchPromoterData = async (targetPromoterId = null) => {
    try {
      setLoading(true);

      // If staff overseer (Admin / KAM), fetch all promoters for the switcher
      if (isStaffOverseer) {
        const { data: promotersList } = await supabase
          .from('promoters')
          .select('*')
          .order('full_name', { ascending: true });

        if (promotersList && promotersList.length > 0) {
          setAllPromoters(promotersList);
          const target = targetPromoterId 
            ? promotersList.find(p => p.id === targetPromoterId) || promotersList[0]
            : promotersList[0];
          
          setPromoterProfile(target);
          await loadPromoterRelations(target.id);
          setLoading(false);
          return;
        }
      }

      // 1. Fetch promoter profile linked to logged in user
      const { data: profile, error: profErr } = await supabase
        .from('promoters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profErr) {
        console.error('Error fetching promoter profile:', profErr);
      }

      if (!profile) {
        setPromoterProfile(null);
        setLoading(false);
        return;
      }

      setPromoterProfile(profile);
      await loadPromoterRelations(profile.id);

    } catch (err) {
      console.error('Error in fetchPromoterData:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoterRelations = async (promoterId) => {
    // 1. Fetch leads scoped to this promoter
    const { data: leadsData, error: leadsErr } = await supabase
      .from('promoter_leads')
      .select('*')
      .eq('promoter_id', promoterId)
      .order('created_at', { ascending: false });
    if (leadsErr) console.error('Leads error:', leadsErr);
    setLeads(leadsData || []);

    // 2. Fetch targets scoped to this promoter
    const { data: targetsData, error: targetsErr } = await supabase
      .from('promoter_targets')
      .select(`*, funding_projects(project_title, target_raise_bdt)`)
      .eq('promoter_id', promoterId)
      .order('created_at', { ascending: false });
    if (targetsErr) console.error('Targets error:', targetsErr);
    setPromoterTargets(targetsData || []);

    // 3. Fetch all active projects for target pledging
    const { data: projData, error: projErr } = await supabase
      .from('funding_projects')
      .select('id, project_title, target_raise_bdt, funding_type, status')
      .order('created_at', { ascending: false });
    if (projErr) console.error('Projects error:', projErr);
    setProjects(projData || []);

    // 4. Fetch payout requests scoped to this promoter
    const { data: payoutData, error: payoutErr } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('promoter_id', promoterId)
      .order('created_at', { ascending: false });
    if (payoutErr) console.error('Payouts error:', payoutErr);
    setPayouts(payoutData || []);

    // 5. Fetch commissions scoped to this promoter (using correct column amount_bdt)
    const { data: commData, error: commErr } = await supabase
      .from('promoter_commissions')
      .select(`
        id,
        created_at,
        amount_bdt,
        commission_type,
        investment_id,
        investments (
          amount_invested_bdt,
          funding_projects ( project_title )
        )
      `)
      .eq('promoter_id', promoterId)
      .order('created_at', { ascending: false });
    if (commErr) console.error('Commissions error:', commErr);
    setCommissions(commData || []);
  };

  const handleOverseerPromoterChange = async (newPromoterId) => {
    const chosen = allPromoters.find(p => p.id === newPromoterId);
    if (chosen) {
      setPromoterProfile(chosen);
      await loadPromoterRelations(chosen.id);
    }
  };

  const loggedLeadsCount = leads.length;
  const progressPercent = Math.min(100, Math.round((loggedLeadsCount / TARGET_LEADS) * 100));
  const isUnlocked = loggedLeadsCount >= TARGET_LEADS || (promoterProfile && promoterProfile.can_promote_deals);
  const leadsRemaining = Math.max(0, TARGET_LEADS - loggedLeadsCount);

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://gro10x.com');
  const referralLink = promoterProfile?.referral_code ? `${appBaseUrl}/showcase?ref=${promoterProfile.referral_code}` : '';

  // KPI Calculations
  const totalCommissionsEarnedBdt = useMemo(() => {
    return commissions.reduce((sum, c) => sum + (Number(c.amount_bdt) || 0), 0);
  }, [commissions]);

  const baseCommissionsBdt = useMemo(() => {
    return commissions
      .filter(c => c.commission_type === 'Base_0.75')
      .reduce((sum, c) => sum + (Number(c.amount_bdt) || 0), 0);
  }, [commissions]);

  const bonusCommissionsBdt = useMemo(() => {
    return commissions
      .filter(c => c.commission_type === 'Target_0.25')
      .reduce((sum, c) => sum + (Number(c.amount_bdt) || 0), 0);
  }, [commissions]);

  const totalPledgedTargetBdt = useMemo(() => {
    return promoterTargets.reduce((sum, t) => sum + (Number(t.target_raise_bdt) || 0), 0);
  }, [promoterTargets]);

  const totalClearedPayoutBdt = useMemo(() => {
    return payouts
      .filter(p => p.status === 'Cleared' || p.status === 'Disbursed')
      .reduce((sum, p) => sum + (Number(p.amount_bdt) || 0), 0);
  }, [payouts]);

  const totalPendingPayoutBdt = useMemo(() => {
    return payouts
      .filter(p => p.status === 'Pending' || p.status === 'Pending Verification')
      .reduce((sum, p) => sum + (Number(p.amount_bdt) || 0), 0);
  }, [payouts]);

  const availableBalanceBdt = Math.max(0, totalCommissionsEarnedBdt - totalClearedPayoutBdt - totalPendingPayoutBdt);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = !leadSearch.trim() || 
        (l.name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.phone || '').includes(leadSearch.trim()) ||
        (l.email || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.category || '').toLowerCase().includes(leadSearch.toLowerCase());
      
      const matchesStatus = leadStatusFilter === 'All' || l.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  // Handlers
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addToast('Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
      addToast('Failed to copy link. Please manually copy from the input box.', 'error');
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone || !promoterProfile) return;
    
    try {
      setIsSubmittingLead(true);
      const { data, error } = await supabase
        .from('promoter_leads')
        .insert([{
          promoter_id: promoterProfile.id,
          name: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail || null,
          category: newLeadCategory,
          interest: newLeadInterest,
          status: 'New Lead'
        }])
        .select()
        .single();
        
      if (error) throw error;

      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      addToast('🎉 Prospect successfully logged to your CRM pipeline!', 'success');
      setLeads(prev => [data, ...prev]);
      
    } catch (err) {
      console.error('Failed to log lead:', err);
      addToast('Failed to log prospect. Please check your connection.', 'error');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('promoter_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      addToast(`Lead status updated to "${newStatus}"`, 'success');
    } catch (err) {
      console.error('Error updating lead status:', err);
      addToast('Failed to update status', 'error');
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !targetAmount || !promoterProfile) return;
    
    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      addToast('Please specify a valid positive target amount.', 'error');
      return;
    }

    try {
      setIsSubmittingTarget(true);
      const { data, error } = await supabase
        .from('promoter_targets')
        .insert([{
          promoter_id: promoterProfile.id,
          project_id: selectedProjectId,
          target_raise_bdt: parsedTarget,
          status: 'Active'
        }])
        .select(`*, funding_projects(project_title, target_raise_bdt)`)
        .single();

      if (error) throw error;

      addToast('🎯 Campaign Raise Target Pledged Successfully!', 'success');
      setTargetAmount('');
      setSelectedProjectId('');
      setPromoterTargets(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding target:', err);
      addToast('Failed to pledge target. You may have already set a target for this project.', 'error');
    } finally {
      setIsSubmittingTarget(false);
    }
  };

  const handleSubmitPayoutRequest = async (e) => {
    e.preventDefault();
    if (!promoterProfile) return;

    const parsedAmount = Number(payoutAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Please enter a valid payout amount.', 'error');
      return;
    }

    if (parsedAmount > availableBalanceBdt && !isStaffOverseer) {
      addToast(`Requested amount (৳${parsedAmount.toLocaleString()}) exceeds your available balance (৳${availableBalanceBdt.toLocaleString()}).`, 'error');
      return;
    }

    try {
      setSubmittingPayout(true);
      const payload = {
        promoter_id: promoterProfile.id,
        amount_bdt: parsedAmount,
        disbursement_channel: payoutChannel,
        account_details: payoutAccount || 'Primary Account',
        status: 'Pending Verification'
      };

      const { data, error } = await supabase
        .from('payout_requests')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Dispatch Telegram Push Alert to Admin
      await fetch('/api/telegram-notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `💸 New Commission Payout Request: ৳${parsedAmount.toLocaleString()} BDT`,
          message: `Promoter: ${promoterProfile.full_name}\nChannel: ${payoutChannel}\nAccount: ${payload.account_details}\nStatus: Pending Verification`,
          action_url: `${appBaseUrl}/admin`
        })
      }).catch(err => console.error('Telegram notification error:', err));

      addToast('✅ Payout request submitted! Admin team notified.', 'success');
      setPayouts(prev => [data, ...prev]);
      setPayoutAmount('5000');
      setPayoutAccount('');
    } catch (err) {
      console.error('Payout submit error:', err);
      addToast('Failed to submit payout request.', 'error');
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spin" size={48} color="#D4AF37" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>Authenticating Promoter Hub...</p>
        </div>
      </div>
    );
  }

  if (!promoterProfile && !isStaffOverseer) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', color: '#f8fafc', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '520px', padding: '3rem 2rem' }}>
          <ShieldCheck size={52} color="#f0b429" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '0.5rem', color: '#fff' }}>Promoter Registration Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Your account is authenticated, but no active Promoter profile or referral code has been linked to your account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/apply" 
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                color: '#070a14', 
                padding: '0.65rem 1.5rem', 
                borderRadius: '6px', 
                fontWeight: '800', 
                fontSize: '0.85rem', 
                textDecoration: 'none' 
              }}
            >
              Apply as Capital Partner →
            </a>
            <a 
              href="/" 
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: '#cbd5e1', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '0.65rem 1.25rem', 
                borderRadius: '6px', 
                fontWeight: '700', 
                fontSize: '0.85rem', 
                textDecoration: 'none' 
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* EXECUTIVE HEADER */}
      <header style={{ background: 'rgba(7,10,20,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', boxShadow: '0 2px 10px rgba(212,175,55,0.2)' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                  {promoterProfile?.full_name || 'Capital Promoter'}
                </h1>
                {isStaffOverseer && (
                  <span style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                    {role?.toUpperCase()} OVERSEER
                  </span>
                )}
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                  Tier: {promoterProfile?.promoter_tier || 'Associate (0.75%)'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
                Referral Code: <strong style={{ color: '#D4AF37' }}>{promoterProfile?.referral_code || 'Pending'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* OVERSEER PROMOTER PICKER */}
            {isStaffOverseer && allPromoters.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Promoter:</span>
                <select 
                  value={promoterProfile?.id || ''} 
                  onChange={(e) => handleOverseerPromoterChange(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  {allPromoters.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.referral_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CURRENCY SELECTOR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', color: '#D4AF37', fontWeight: '800', border: '1px solid rgba(212,175,55,0.35)' }}
              >
                {Object.keys(CURRENCY_RATES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCY_RATES[code].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '2rem auto 0 auto', padding: '0 1.5rem', display: 'grid', gap: '2rem' }}>
        
        {/* 4-CARD TOP-LEVEL EXECUTIVE KPI STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* KPI 1: LEADS IN PIPELINE */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CRM Prospects Logged
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(212,175,55,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Users size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#D4AF37', marginBottom: '0.2rem' }}>
              {leads.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isUnlocked ? (
                <span style={{ color: '#10b981', fontWeight: '700' }}>● Deal Link Unlocked</span>
              ) : (
                <span>{leadsRemaining} more to unlock Deal Links</span>
              )}
            </div>
          </div>

          {/* KPI 2: COMMISSIONS EARNED */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Commission Earned
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(16,185,129,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                <DollarSign size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#10b981', marginBottom: '0.2rem' }}>
              {formatCurrency(totalCommissionsEarnedBdt, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Base (0.75%): <strong style={{ color: '#cbd5e1' }}>{formatCurrency(baseCommissionsBdt, currency)}</strong>
              {bonusCommissionsBdt > 0 && <span> • Bonus: <strong style={{ color: '#D4AF37' }}>{formatCurrency(bonusCommissionsBdt, currency)}</strong></span>}
            </div>
          </div>

          {/* KPI 3: ACTIVE PLEDGED TARGETS */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Campaign Target Pledges
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(59,130,246,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#60a5fa' }}>
                <Crosshair size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#60a5fa', marginBottom: '0.2rem' }}>
              {formatCurrency(totalPledgedTargetBdt, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Across <strong style={{ color: '#cbd5e1' }}>{promoterTargets.length}</strong> active campaign commitments
            </div>
          </div>

          {/* KPI 4: AVAILABLE PAYOUT BALANCE */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Available Payout Balance
              </span>
              <div style={{ width: '28px', height: '28px', background: 'rgba(139,92,246,0.15)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>
                <CreditCard size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#fff', marginBottom: '0.2rem' }}>
              {formatCurrency(availableBalanceBdt, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700' }}>
              Pending: {formatCurrency(totalPendingPayoutBdt, currency)}
            </div>
          </div>

        </div>

        {/* GAMIFIED MILESTONE GATEWAY BANNER */}
        <div 
          className="glass-card" 
          style={{ 
            borderColor: isUnlocked ? 'rgba(16,185,129,0.5)' : 'rgba(212,175,55,0.4)', 
            background: isUnlocked 
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(7,10,20,0.85))' 
              : 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(7,10,20,0.85))', 
            padding: '1.5rem 1.75rem',
            borderLeft: `4px solid ${isUnlocked ? '#10b981' : '#D4AF37'}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ 
                  background: isUnlocked ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', 
                  color: isUnlocked ? '#10b981' : '#D4AF37', 
                  border: `1px solid ${isUnlocked ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.4)'}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '800'
                }}>
                  {isUnlocked ? <Unlock size={13} /> : <Lock size={13} />} {isUnlocked ? 'ACTIVE CAPITAL PROMOTER' : '50-INVESTOR ONBOARDING CHALLENGE'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Referral Ref: <strong style={{ color: '#D4AF37' }}>{promoterProfile?.referral_code}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                {isUnlocked ? '🎉 Deal Promotion Link is Fully Unlocked & Active!' : 'Log 50 Qualified Prospects to Unlock Your Direct Deal Referral Link'}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: isUnlocked ? '#10b981' : '#D4AF37', lineHeight: 1 }}>
                {loggedLeadsCount} / {TARGET_LEADS}
              </span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                {isUnlocked ? 'Requirement Satisfied (100%)' : `${leadsRemaining} Leads Remaining (${progressPercent}%)`}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: isUnlocked ? '1rem' : '0' }}>
            <div 
              style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: isUnlocked 
                  ? 'linear-gradient(90deg, #10b981, #34d399)' 
                  : 'linear-gradient(90deg, #D4AF37, #F3E5AB)' 
              }} 
            />
          </div>

          {/* COPY LINK BAR (WHEN UNLOCKED) */}
          {isUnlocked && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Link2 size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink} 
                  className="form-input" 
                  style={{ paddingLeft: '2.2rem', fontWeight: '700', color: '#10b981', fontSize: '0.82rem' }} 
                />
              </div>
              <button 
                onClick={handleCopyLink} 
                style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  padding: '0.65rem 1.25rem', 
                  border: 'none', 
                  color: '#fff', 
                  fontWeight: '800', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: '0.82rem'
                }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Active Link'}
              </button>
            </div>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('leads')} style={tabBtnStyle(activeTab === 'leads')}>
            <Users size={16} /> CRM & Prospects ({leads.length})
          </button>
          <button onClick={() => setActiveTab('targets')} style={tabBtnStyle(activeTab === 'targets')}>
            <Crosshair size={16} /> Campaign Targets ({promoterTargets.length})
          </button>
          <button onClick={() => setActiveTab('earnings')} style={tabBtnStyle(activeTab === 'earnings')}>
            <Award size={16} /> Earnings & Commission Ledger
          </button>
          <button onClick={() => setActiveTab('payouts')} style={tabBtnStyle(activeTab === 'payouts')}>
            <DollarSign size={16} /> Payout Requests ({payouts.length})
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: CRM & PROSPECTS */}
        {/* ============================================================ */}
        {activeTab === 'leads' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.4fr)', gap: '1.75rem', alignItems: 'flex-start' }}>
            
            {/* LOG PROSPECT FORM */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <PlusCircle size={18} color="#D4AF37" /> Log Investor Prospect
              </h3>

              <form onSubmit={handleAddLead} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                    Investor Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={newLeadName} 
                    onChange={(e) => setNewLeadName(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. Engr. Shafiqul Islam" 
                    style={{ fontSize: '0.82rem' }}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      WhatsApp Phone *
                    </label>
                    <input 
                      type="text" 
                      value={newLeadPhone} 
                      onChange={(e) => setNewLeadPhone(e.target.value)} 
                      className="form-input" 
                      placeholder="01700000000" 
                      style={{ fontSize: '0.82rem' }}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      value={newLeadEmail} 
                      onChange={(e) => setNewLeadEmail(e.target.value)} 
                      className="form-input" 
                      placeholder="investor@example.com" 
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      Investor Category
                    </label>
                    <select 
                      value={newLeadCategory} 
                      onChange={(e) => setNewLeadCategory(e.target.value)} 
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="NRB Expatriate">NRB Expatriate</option>
                      <option value="Local HNI">Local HNI</option>
                      <option value="Corporate Treasury">Corporate Treasury</option>
                      <option value="Retail Syndicate">Retail Syndicate</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                      Investment Interest
                    </label>
                    <select 
                      value={newLeadInterest} 
                      onChange={(e) => setNewLeadInterest(e.target.value)} 
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="Franchise Yield (18%)">Franchise Yield (18%)</option>
                      <option value="Equity Stake">Equity Stake</option>
                      <option value="Short-Term Debt">Short-Term Debt</option>
                      <option value="Exploring Options">Exploring Options</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingLead} 
                  className="btn-gold" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSubmittingLead ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  {isSubmittingLead ? 'Saving Prospect...' : 'Save Prospect to CRM Pipeline →'}
                </button>
              </form>
            </div>

            {/* LEADS QUEUE */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                  My Logged Prospects Queue ({leads.length})
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '160px' }}>
                    <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={leadSearch} 
                      onChange={(e) => setLeadSearch(e.target.value)} 
                      className="form-input" 
                      style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.72rem' }} 
                    />
                  </div>
                  <select 
                    value={leadStatusFilter} 
                    onChange={(e) => setLeadStatusFilter(e.target.value)} 
                    className="form-input" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', width: 'auto' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting Booked">Meeting Booked</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Users size={38} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    {leadSearch || leadStatusFilter !== 'All' ? 'No prospects matched your search filter.' : 'No prospects logged yet. Use the form on the left to start building your 50-investor book.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {filteredLeads.map((l) => (
                    <div 
                      key={l.id} 
                      style={{ 
                        background: 'rgba(7,10,20,0.6)', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff' }}>{l.name}</span>
                          <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                            {l.category || 'Prospect'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          📞 {l.phone} {l.email && <span>• ✉️ {l.email}</span>} • <strong style={{ color: '#cbd5e1' }}>{l.interest || 'Exploring'}</strong>
                        </div>
                      </div>

                      {/* INLINE STATUS SELECTOR */}
                      <div>
                        <select 
                          value={l.status || 'New Lead'} 
                          onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                          className="form-input"
                          style={{ 
                            padding: '0.25rem 0.55rem', 
                            fontSize: '0.72rem', 
                            fontWeight: '800', 
                            borderRadius: '6px',
                            background: l.status === 'Converted' ? 'rgba(16,185,129,0.2)' : l.status === 'Meeting Booked' ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.9)',
                            color: l.status === 'Converted' ? '#10b981' : l.status === 'Meeting Booked' ? '#D4AF37' : '#cbd5e1',
                            borderColor: l.status === 'Converted' ? 'rgba(16,185,129,0.4)' : l.status === 'Meeting Booked' ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.15)'
                          }}
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Meeting Booked">Meeting Booked</option>
                          <option value="Converted">Converted (Allocated)</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CAMPAIGN TARGETS */}
        {/* ============================================================ */}
        {activeTab === 'targets' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.4fr)', gap: '1.75rem', alignItems: 'flex-start' }}>
            
            {/* PLEDGE FORM */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Crosshair size={18} color="#60a5fa" /> Pledge Campaign Raise Target
              </h3>

              <form onSubmit={handleAddTarget} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                    Select CapEx Target Project *
                  </label>
                  <select 
                    value={selectedProjectId} 
                    onChange={(e) => setSelectedProjectId(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.82rem' }}
                    required
                  >
                    <option value="">Choose Project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.project_title} ({p.funding_type} - Target: ৳{(p.target_raise_bdt / 10000000).toFixed(2)} Cr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                    My Pledged Raise Target (BDT) *
                  </label>
                  <input 
                    type="number" 
                    value={targetAmount} 
                    onChange={(e) => setTargetAmount(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. 50000000 (৳5 Crore)" 
                    style={{ fontSize: '0.82rem' }}
                    required 
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                    Unlocks +0.25% bonus commission upon crossing the pledged milestone
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingTarget} 
                  className="btn-gold" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSubmittingTarget ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  {isSubmittingTarget ? 'Pledging...' : 'Commit Campaign Target Pledge →'}
                </button>
              </form>
            </div>

            {/* PLEDGED TARGETS LIST */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#fff' }}>
                Pledged Project Raise Targets ({promoterTargets.length})
              </h3>

              {promoterTargets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Crosshair size={38} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    No project targets committed yet. Pledge a target on the left to activate the +0.25% bonus tier.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {promoterTargets.map(t => (
                    <div 
                      key={t.id} 
                      style={{ 
                        background: 'rgba(7,10,20,0.6)', 
                        padding: '1.15rem', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: '3px solid #3b82f6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: '0 0 0.2rem 0' }}>
                            {t.funding_projects?.project_title || 'CapEx Funding Project'}
                          </h4>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Committed on: {new Date(t.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ 
                          background: t.status === 'Target_Hit' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)', 
                          color: t.status === 'Target_Hit' ? '#10b981' : '#60a5fa', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.68rem', 
                          fontWeight: '800' 
                        }}>
                          {t.status === 'Target_Hit' ? 'Target Achieved (+0.25% Active)' : 'In Progress'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                        <span style={{ color: '#cbd5e1' }}>Pledged Target:</span>
                        <strong style={{ color: '#D4AF37', fontSize: '1.05rem' }}>
                          {formatCurrency(t.target_raise_bdt, currency)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EARNINGS & COMMISSION LEDGER */}
        {/* ============================================================ */}
        {activeTab === 'earnings' && (
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            
            {/* TIER STATUS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#D4AF37" /> Milestone Tier Status
                </h3>
                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#D4AF37', marginBottom: '0.5rem' }}>
                  {promoterProfile?.promoter_tier || 'Associate Partner'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  • <strong>Base Commission:</strong> 0.75% per verified allocation<br />
                  • <strong>Target Milestone Bonus:</strong> +0.25% upon hitting pledged campaign targets
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#10b981" /> Commission Earnings Summary
                </h3>
                <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#10b981', marginBottom: '0.2rem' }}>
                  {formatCurrency(totalCommissionsEarnedBdt, currency)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Cleared Payouts: <strong style={{ color: '#cbd5e1' }}>{formatCurrency(totalClearedPayoutBdt, currency)}</strong> • Available: <strong style={{ color: '#10b981' }}>{formatCurrency(availableBalanceBdt, currency)}</strong>
                </div>
              </div>
            </div>

            {/* DETAILED COMMISSIONS TABLE */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                  Individual Commission Allocation Ledger ({commissions.length})
                </h3>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  {formatCurrency(totalCommissionsEarnedBdt, currency)} Total
                </span>
              </div>

              {commissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <DollarSign size={40} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    No commissions registered on the ledger yet. Commissions are automatically credited when referred investors complete verified allocations.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Campaign / SPV</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Investment Size</th>
                        <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Commission Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c, idx) => (
                        <tr key={c.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                            {c.investments?.funding_projects?.project_title || 'CapEx Allocation'}
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem' }}>
                            <span style={{ 
                              background: c.commission_type === 'Target_0.25' ? 'rgba(212,175,55,0.15)' : 'rgba(16,185,129,0.15)', 
                              color: c.commission_type === 'Target_0.25' ? '#D4AF37' : '#10b981', 
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '4px', 
                              fontWeight: '800' 
                            }}>
                              {c.commission_type === 'Target_0.25' ? 'Bonus (0.25%)' : 'Base (0.75%)'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: '#cbd5e1', textAlign: 'right' }}>
                            {c.investments?.amount_invested_bdt ? formatCurrency(c.investments.amount_invested_bdt, currency) : '—'}
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.92rem', fontWeight: '900', color: '#10b981', textAlign: 'right' }}>
                            {formatCurrency(c.amount_bdt, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PAYOUT REQUESTS */}
        {/* ============================================================ */}
        {activeTab === 'payouts' && (
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
        )}

      </main>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    color: active ? '#D4AF37' : '#94a3b8',
    border: active ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
    padding: '0.65rem 1.15rem',
    borderRadius: '6px',
    fontWeight: active ? '800' : '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
  };
}
