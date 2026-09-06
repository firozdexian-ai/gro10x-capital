'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, DollarSign, Link2, Copy, CheckCircle2, 
  Award, ShieldCheck, Lock, Unlock, Loader2, Crosshair, CreditCard, Share2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

import PromoterLeadsTab from './tabs/PromoterLeadsTab';
import PromoterTargetsTab from './tabs/PromoterTargetsTab';
import PromoterEarningsTab from './tabs/PromoterEarningsTab';
import PromoterPayoutsTab from './tabs/PromoterPayoutsTab';

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

      // If staff overseer (Admin / KAM), fetch all promoters from both team and promoters tables
      if (isStaffOverseer) {
        const [{ data: teamPromoters }, { data: legacyPromoters }] = await Promise.all([
          supabase.from('team').select('*').eq('team_type', 'promoter').order('full_name', { ascending: true }),
          supabase.from('promoters').select('*').order('full_name', { ascending: true })
        ]);

        const combinedMap = new Map();
        (teamPromoters || []).forEach(p => {
          combinedMap.set(p.id, {
            ...p,
            alias_name: p.alias_name || p.full_name,
            tier: p.tier || p.promoter_tier || 'Trainee'
          });
        });
        (legacyPromoters || []).forEach(p => {
          if (!combinedMap.has(p.id)) {
            combinedMap.set(p.id, {
              ...p,
              alias_name: p.alias_name || p.full_name,
              tier: p.tier || p.promoter_tier || 'Trainee'
            });
          }
        });

        const promotersList = Array.from(combinedMap.values());

        if (promotersList.length > 0) {
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

      // Fetch promoter profile linked to logged in user (Check public.team first, then public.promoters)
      let resolvedProfile = null;

      const { data: teamMember } = await supabase
        .from('team')
        .select('*')
        .eq('team_type', 'promoter')
        .or(`user_id.eq.${user.id},email.eq.${user.email || 'none'},phone.eq.${user.phone || 'none'}`)
        .maybeSingle();

      if (teamMember) {
        resolvedProfile = {
          ...teamMember,
          alias_name: teamMember.alias_name || teamMember.full_name,
          tier: teamMember.tier || teamMember.promoter_tier || 'Trainee'
        };
      } else {
        const { data: legacyProfile } = await supabase
          .from('promoters')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (legacyProfile) {
          resolvedProfile = {
            ...legacyProfile,
            alias_name: legacyProfile.alias_name || legacyProfile.full_name,
            tier: legacyProfile.tier || legacyProfile.promoter_tier || 'Trainee'
          };
        }
      }

      if (!resolvedProfile) {
        setPromoterProfile(null);
        setLoading(false);
        return;
      }

      setPromoterProfile(resolvedProfile);
      await loadPromoterRelations(resolvedProfile.id);

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

    // 5. Fetch commissions scoped to this promoter
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

  const totalClearedPayoutBdt = useMemo(() => {
    return payouts
      .filter(p => p.status === 'Cleared' || p.status === 'Disbursed')
      .reduce((sum, p) => sum + (Number(p.amount_bdt) || 0), 0);
  }, [payouts]);

  const totalPendingPayoutBdt = useMemo(() => {
    return payouts
      .filter(p => !['Cleared', 'Disbursed', 'Rejected'].includes(p.status))
      .reduce((sum, p) => sum + (Number(p.amount_bdt) || 0), 0);
  }, [payouts]);

  const availableBalanceBdt = Math.max(0, totalCommissionsEarnedBdt - totalClearedPayoutBdt - totalPendingPayoutBdt);

  const totalPledgedTargetBdt = useMemo(() => {
    return promoterTargets.reduce((sum, t) => sum + (Number(t.target_raise_bdt) || 0), 0);
  }, [promoterTargets]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = (lead.name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
                          (lead.phone || '').includes(leadSearch) ||
                          (lead.email || '').toLowerCase().includes(leadSearch.toLowerCase());
      const matchStatus = leadStatusFilter === 'All' || lead.status === leadStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    if (!referralLink) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Invest with GRO10X Capital',
          text: `Explore vetted franchise and SME growth investment rounds with GRO10X Capital. Use my promoter referral link:`,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!promoterProfile) return;
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      addToast('Please enter full name and phone number.', 'error');
      return;
    }

    try {
      setIsSubmittingLead(true);
      const payload = {
        promoter_id: promoterProfile.id,
        name: newLeadName.trim(),
        phone: newLeadPhone.trim(),
        email: newLeadEmail.trim() || null,
        category: newLeadCategory,
        interest: newLeadInterest,
        status: 'New Lead'
      };

      const { data, error } = await supabase
        .from('promoter_leads')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      addToast('Prospect added to pipeline!', 'success');
      setLeads(prev => [data, ...prev]);
      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
    } catch (err) {
      console.error('Add lead error:', err);
      addToast('Failed to add prospect. Phone may already be registered.', 'error');
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
      addToast(`Status updated to "${newStatus}"`, 'success');
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error('Update status error:', err);
      addToast('Failed to update status.', 'error');
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!promoterProfile || !selectedProjectId || !targetAmount) {
      addToast('Please select a project and target amount.', 'error');
      return;
    }

    try {
      setIsSubmittingTarget(true);
      const parsedAmount = Number(targetAmount);
      const payload = {
        promoter_id: promoterProfile.id,
        project_id: selectedProjectId,
        target_raise_bdt: parsedAmount,
        status: 'In_Progress'
      };

      const { data, error } = await supabase
        .from('promoter_targets')
        .insert([payload])
        .select(`*, funding_projects(project_title, target_raise_bdt)`)
        .single();

      if (error) throw error;

      addToast('🎯 Campaign target committed successfully!', 'success');
      setPromoterTargets(prev => [data, ...prev]);
      setSelectedProjectId('');
      setTargetAmount('');
    } catch (err) {
      console.error('Add target error:', err);
      addToast('Failed to commit campaign target.', 'error');
    } finally {
      setIsSubmittingTarget(false);
    }
  };

  const handleSubmitPayoutRequest = async (e) => {
    e.preventDefault();
    if (!promoterProfile) return;

    const parsedAmount = Number(payoutAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast('Please enter a valid payout amount.', 'error');
      return;
    }

    if (parsedAmount > availableBalanceBdt && !isStaffOverseer) {
      addToast('Requested amount exceeds available balance.', 'error');
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
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button 
                onClick={handleShareLink} 
                style={{ 
                  background: 'rgba(212,175,55,0.15)', 
                  border: '1px solid rgba(212,175,55,0.4)', 
                  padding: '0.65rem 1.25rem', 
                  color: '#D4AF37', 
                  fontWeight: '800', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: '0.82rem'
                }}
              >
                <Share2 size={16} /> Share Link
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

        {/* TAB 1: CRM & PROSPECTS */}
        {activeTab === 'leads' && (
          <PromoterLeadsTab 
            leads={leads}
            newLeadName={newLeadName}
            setNewLeadName={setNewLeadName}
            newLeadPhone={newLeadPhone}
            setNewLeadPhone={setNewLeadPhone}
            newLeadEmail={newLeadEmail}
            setNewLeadEmail={setNewLeadEmail}
            newLeadCategory={newLeadCategory}
            setNewLeadCategory={setNewLeadCategory}
            newLeadInterest={newLeadInterest}
            setNewLeadInterest={setNewLeadInterest}
            isSubmittingLead={isSubmittingLead}
            handleAddLead={handleAddLead}
            leadSearch={leadSearch}
            setLeadSearch={setLeadSearch}
            leadStatusFilter={leadStatusFilter}
            setLeadStatusFilter={setLeadStatusFilter}
            filteredLeads={filteredLeads}
            handleUpdateLeadStatus={handleUpdateLeadStatus}
          />
        )}

        {/* TAB 2: CAMPAIGN TARGETS */}
        {activeTab === 'targets' && (
          <PromoterTargetsTab 
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            targetAmount={targetAmount}
            setTargetAmount={setTargetAmount}
            isSubmittingTarget={isSubmittingTarget}
            handleAddTarget={handleAddTarget}
            projects={projects}
            promoterTargets={promoterTargets}
            currency={currency}
          />
        )}

        {/* TAB 3: EARNINGS & COMMISSION LEDGER */}
        {activeTab === 'earnings' && (
          <PromoterEarningsTab 
            promoterProfile={promoterProfile}
            totalCommissionsEarnedBdt={totalCommissionsEarnedBdt}
            totalClearedPayoutBdt={totalClearedPayoutBdt}
            availableBalanceBdt={availableBalanceBdt}
            commissions={commissions}
            currency={currency}
          />
        )}

        {/* TAB 4: PAYOUT REQUESTS */}
        {activeTab === 'payouts' && (
          <PromoterPayoutsTab 
            availableBalanceBdt={availableBalanceBdt}
            payoutAmount={payoutAmount}
            setPayoutAmount={setPayoutAmount}
            payoutChannel={payoutChannel}
            setPayoutChannel={setPayoutChannel}
            payoutAccount={payoutAccount}
            setPayoutAccount={setPayoutAccount}
            handleSubmitPayoutRequest={handleSubmitPayoutRequest}
            submittingPayout={submittingPayout}
            isStaffOverseer={isStaffOverseer}
            payouts={payouts}
            currency={currency}
          />
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
