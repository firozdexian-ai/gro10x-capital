'use client';

import React, { useState, useEffect } from 'react';
import { Inbox, UserPlus, Plus, Search, Sparkles, Filter, FileSpreadsheet, Megaphone, Send, Rocket, UserCheck, Calendar, Phone, Mail, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/currency';

/**
 * InquiryLeadsTab Component (Tab 8) — Production Standard
 * Handles Prospective Inquiry Lead Pipeline, Promoter Survey Vault,
 * and Marketing Campaigns Tracker.
 */
export default function InquiryLeadsTab({ currency = 'BDT', addToast, logPlatformActivity }) {
  const [leadsSubTab, setLeadsSubTab] = useState('pipeline'); // 'pipeline' | 'survey-vault' | 'campaigns'
  const [leads, setLeads] = useState([]);
  const [preProfiles, setPreProfiles] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [allKams, setAllKams] = useState([]);
  const [allPromoters, setAllPromoters] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [leadFilter, setLeadFilter] = useState('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedPreProfile, setSelectedPreProfile] = useState(null);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState(null);

  // Forms
  const [addLeadForm, setAddLeadForm] = useState({
    name: '', phone: '', email: '', investment_range: '৳10L - ৳50L',
    source_channel: 'Admin_Entry', notes: '', referral_code: '',
    meeting_preference: 'Online Call', target_project_id: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '', campaign_type: 'Event', start_date: '',
    end_date: '', budget_bdt: '', notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch Leads
      const { data: leadsData } = await supabase
        .from('inquiry_leads')
        .select(`*, funding_projects(project_title, businesses(brand_name)), promoters(alias_name, referral_code), kams(full_name)`)
        .order('created_at', { ascending: false });
      setLeads(leadsData || []);

      // Fetch Pre-Profiles (Promoter Surveys)
      const { data: preData } = await supabase
        .from('investor_pre_profiles')
        .select(`*, funding_projects(project_title, businesses(brand_name))`)
        .order('created_at', { ascending: false });
      setPreProfiles(preData || []);

      // Fetch Marketing Campaigns
      const { data: campData } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      setCampaigns(campData || []);

      // Fetch Helpers (KAMs, Promoters, Projects)
      const { data: kData } = await supabase.from('team').select('*').in('team_type', ['kam', 'manager', 'admin']);
      setAllKams(kData || []);

      const { data: pData } = await supabase.from('team').select('*').eq('team_type', 'promoter');
      setAllPromoters(pData || []);

      const { data: prjData } = await supabase.from('funding_projects').select(`*, businesses(brand_name)`);
      setAllProjects(prjData || []);

    } catch (err) {
      console.error('Error fetching leads data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe Activity Logger Helper
  const safeLogActivity = (title, message, type = 'info') => {
    if (typeof logPlatformActivity === 'function') {
      logPlatformActivity(title, message, type);
    }
  };

  // Lead Status Handler
  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('inquiry_leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      const targetLead = leads.find(l => l.id === id);
      addToast && addToast(`Lead status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
      safeLogActivity(
        'Lead Status Updated',
        `Updated status of lead ${targetLead?.name || '#' + id} to ${newStatus.replace(/_/g, ' ')}`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast('Failed to update lead status', 'error');
    }
  };

  // Assign Promoter to Lead
  const handleAssignPromoter = async (leadId, promoterId) => {
    try {
      const updates = { assigned_promoter_id: promoterId || null };
      if (promoterId) updates.status = 'Promoter_Assigned';

      const { error } = await supabase
        .from('inquiry_leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      const targetLead = leads.find(l => l.id === leadId);
      const targetProm = allPromoters.find(p => p.id === promoterId);
      addToast && addToast(promoterId ? 'Promoter assigned! Lead status moved to Promoter Assigned.' : 'Promoter unassigned', 'success');
      safeLogActivity(
        'Promoter Assigned to Lead',
        promoterId 
          ? `Assigned promoter ${targetProm?.alias_name || 'Promoter'} to lead ${targetLead?.name || '#' + leadId}` 
          : `Unassigned promoter from lead ${targetLead?.name || '#' + leadId}`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast('Failed to assign promoter', 'error');
    }
  };

  // Assign KAM to Lead
  const handleAssignKam = async (leadId, kamId) => {
    try {
      const { error } = await supabase
        .from('inquiry_leads')
        .update({ assigned_kam_id: kamId || null })
        .eq('id', leadId);

      if (error) throw error;
      const targetLead = leads.find(l => l.id === leadId);
      const targetKam = allKams.find(k => k.id === kamId);
      addToast && addToast('Managing Partner assigned to lead.', 'success');
      safeLogActivity(
        'Account Manager Assigned',
        kamId 
          ? `Assigned ${targetKam?.full_name || 'Managing Partner'} to lead ${targetLead?.name || '#' + leadId}`
          : `Removed assigned partner from lead ${targetLead?.name || '#' + leadId}`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast('Failed to assign Managing Partner', 'error');
    }
  };

  // Save Notes & Follow Up Date on Lead
  const handleSaveLeadDetails = async (leadId, notes, followUpDate) => {
    try {
      const { error } = await supabase
        .from('inquiry_leads')
        .update({ notes, follow_up_date: followUpDate || null })
        .eq('id', leadId);

      if (error) throw error;
      const targetLead = leads.find(l => l.id === leadId);
      addToast && addToast('Lead notes and follow-up date saved.', 'success');
      safeLogActivity(
        'Lead CRM Updated',
        `Saved notes & follow-up schedule for lead ${targetLead?.name || '#' + leadId}`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast('Failed to save lead details', 'error');
    }
  };

  // Manual Add Lead
  const handleAddManualLead = async (e) => {
    e.preventDefault();
    if (!addLeadForm.name || !addLeadForm.phone) {
      addToast && addToast('Name and Phone are required for leads.', 'error');
      return;
    }
    setSavingLead(true);
    try {
      const payload = {
        name: addLeadForm.name,
        phone: addLeadForm.phone,
        email: addLeadForm.email || null,
        investment_range: addLeadForm.investment_range,
        source_channel: addLeadForm.source_channel,
        notes: addLeadForm.notes || null,
        referral_code: addLeadForm.referral_code || null,
        meeting_preference: addLeadForm.meeting_preference,
        target_project_id: addLeadForm.target_project_id || null,
        status: 'New'
      };

      const { error } = await supabase.from('inquiry_leads').insert([payload]);
      if (error) throw error;

      addToast && addToast('New prospective lead logged successfully!', 'success');
      safeLogActivity(
        'Prospective Lead Logged',
        `Logged inquiry lead for ${addLeadForm.name} (${addLeadForm.investment_range}) via ${addLeadForm.source_channel}`,
        'success'
      );
      setAddLeadForm({ name: '', phone: '', email: '', investment_range: '৳10L - ৳50L', source_channel: 'Admin_Entry', notes: '', referral_code: '', meeting_preference: 'Online Call', target_project_id: '' });
      setShowAddLeadForm(false);
      fetchAllData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to log lead', 'error');
    } finally {
      setSavingLead(false);
    }
  };

  // Dispatch Telegram Bot Invitation to Pre-Profile
  const handleSendTelegramInvite = async (preProfileId) => {
    setSendingInviteId(preProfileId);
    try {
      const res = await fetch('/api/send-investor-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pre_profile_id: preProfileId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch Telegram invite');

      addToast && addToast(`Telegram Bot invite link generated for ${data.full_name}! Status updated to Invite Sent.`, 'success');
      safeLogActivity(
        'Telegram Bot Invite Dispatched',
        `Generated Telegram invitation link for ${data.full_name || 'survey profile #' + preProfileId}`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to send Telegram invite', 'error');
    } finally {
      setSendingInviteId(null);
    }
  };

  // Convert Pre-Profile to Verified Investor
  const handleConvertPreProfileToInvestor = async (preProfile) => {
    try {
      // 1. Create investor record
      const invPayload = {
        alias_name: preProfile.alias_name || preProfile.full_name,
        phone: preProfile.phone,
        email: preProfile.email || null,
        investor_category: preProfile.investor_category || 'HNI',
        requires_anonymity: preProfile.requires_anonymity || false,
        origin_source: preProfile.origin_source || 'Promoter_Referral',
        origin_promoter_id: preProfile.submitted_by_promoter_id || null,
        referral_code_used: preProfile.referral_code_used || null,
        onboarding_status: 'Active',
        kyc_level: 2
      };

      const { data: invData, error: invErr } = await supabase
        .from('investors')
        .insert([invPayload])
        .select()
        .single();

      if (invErr) throw invErr;

      // 2. Update pre-profile status
      await supabase
        .from('investor_pre_profiles')
        .update({ survey_status: 'Converted', converted_investor_id: invData.id })
        .eq('id', preProfile.id);

      // 3. Update lead status if linked
      if (preProfile.lead_id) {
        await supabase
          .from('inquiry_leads')
          .update({ status: 'Converted', converted_investor_id: invData.id })
          .eq('id', preProfile.lead_id);
      }

      addToast && addToast(`Promoted pre-profile '${preProfile.full_name}' to full Verified Investor profile!`, 'success');
      safeLogActivity(
        'Pre-Profile Converted to Investor',
        `Promoted survey pre-profile for ${preProfile.full_name} to full Verified Investor profile (Category: ${invPayload.investor_category})`,
        'success'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to convert investor', 'error');
    }
  };

  // Add Campaign Handler
  const handleAddCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.campaign_name) {
      addToast && addToast('Campaign Name is required.', 'error');
      return;
    }
    setSavingCampaign(true);
    try {
      const payload = {
        campaign_name: campaignForm.campaign_name,
        campaign_type: campaignForm.campaign_type,
        start_date: campaignForm.start_date || null,
        end_date: campaignForm.end_date || null,
        budget_bdt: campaignForm.budget_bdt ? Number(campaignForm.budget_bdt) : 0,
        notes: campaignForm.notes || null,
        status: 'Active'
      };

      const { error } = await supabase.from('marketing_campaigns').insert([payload]);
      if (error) throw error;

      addToast && addToast(`Marketing Campaign '${campaignForm.campaign_name}' created!`, 'success');
      safeLogActivity(
        'Marketing Campaign Created',
        `Launched marketing campaign '${campaignForm.campaign_name}' (${payload.campaign_type}, Budget: ৳${payload.budget_bdt.toLocaleString()})`,
        'success'
      );
      setCampaignForm({ campaign_name: '', campaign_type: 'Event', start_date: '', end_date: '', budget_bdt: '', notes: '' });
      setShowCampaignForm(false);
      fetchAllData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to add campaign', 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Close Campaign Handler
  const handleCloseCampaign = async (id) => {
    try {
      const { error } = await supabase.from('marketing_campaigns').update({ status: 'Completed' }).eq('id', id);
      if (error) throw error;
      const targetCamp = campaigns.find(c => c.id === id);
      addToast && addToast('Campaign marked as Completed.', 'info');
      safeLogActivity(
        'Marketing Campaign Completed',
        `Marked campaign '${targetCamp?.campaign_name || '#' + id}' as completed`,
        'info'
      );
      fetchAllData();
    } catch (err) {
      addToast && addToast('Failed to update campaign status', 'error');
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesFilter = leadFilter === 'All' || l.status === leadFilter;
    const searchLower = leadSearch.toLowerCase();
    const matchesSearch = !leadSearch || 
      (l.name && l.name.toLowerCase().includes(searchLower)) ||
      (l.phone && l.phone.includes(searchLower)) ||
      (l.email && l.email.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 5-TILE FUNNEL KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Inquiries */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inquiries
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>{leads.length}</h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Web &amp; Public Ingest</span>
        </div>

        {/* Card 2: Unworked (New) */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(245,158,11,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Unworked (New)
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {leads.filter(l => l.status === 'New').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Awaiting Promoter Tag</span>
        </div>

        {/* Card 3: Promoter Surveys */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Promoter Surveys
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{preProfiles.length}</h3>
          <span style={{ fontSize: '0.72rem', color: '#3b82f6' }}>Enriched Investor Files</span>
        </div>

        {/* Card 4: Pending Bot Invites */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Bot Invites
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {preProfiles.filter(p => p.survey_status === 'Complete' || p.survey_status === 'In_Progress').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#D4AF37' }}>Awaiting Telegram Verification</span>
        </div>

        {/* Card 5: Converted Investors */}
        <div className="glass-card-premium" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Converted Investors
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {leads.filter(l => l.status === 'Converted').length + preProfiles.filter(p => p.survey_status === 'Converted').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Full Active Portfolios</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        <button 
          onClick={() => setLeadsSubTab('pipeline')}
          className={`tab-toggle-btn ${leadsSubTab === 'pipeline' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Inbox size={15} /> Inquiry Lead Pipeline ({leads.length})
        </button>
        <button 
          onClick={() => setLeadsSubTab('survey-vault')}
          className={`tab-toggle-btn ${leadsSubTab === 'survey-vault' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <FileSpreadsheet size={15} /> Promoter Survey Vault ({preProfiles.length})
        </button>
        <button 
          onClick={() => setLeadsSubTab('campaigns')}
          className={`tab-toggle-btn ${leadsSubTab === 'campaigns' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Megaphone size={15} /> Marketing Campaigns ({campaigns.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: INQUIRY LEAD PIPELINE */}
      {/* ---------------------------------------------------- */}
      {leadsSubTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
                Public Prospective Inquiry Leads
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Assign promoters to conduct information gathering surveys and reduce investor friction.
              </p>
            </div>
            
            <button 
              onClick={() => setShowAddLeadForm(!showAddLeadForm)}
              className={showAddLeadForm ? 'btn-sm' : 'btn-sm btn-gold'}
              style={{ background: showAddLeadForm ? 'rgba(255,255,255,0.1)' : undefined, color: showAddLeadForm ? '#fff' : undefined, padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
            >
              {showAddLeadForm ? '✕ Close Form' : '+ Add Lead Manually'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD LEAD FORM */}
          {showAddLeadForm && (
            <div className="glass-card-premium" style={{ padding: '1.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Log New Offline / Call-In Inquiry Lead
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
                Record prospective investor contacts received via phone calls, private referrals, or offline networking events.
              </p>
              <form onSubmit={handleAddManualLead} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Lead Full Name *</label>
                  <input type="text" placeholder="e.g. Dr. Kazi Mahbub" value={addLeadForm.name} onChange={(e) => setAddLeadForm({ ...addLeadForm, name: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Phone Number *</label>
                  <input type="text" placeholder="+88017..." value={addLeadForm.phone} onChange={(e) => setAddLeadForm({ ...addLeadForm, phone: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Email Address</label>
                  <input type="email" placeholder="kazi@gmail.com" value={addLeadForm.email} onChange={(e) => setAddLeadForm({ ...addLeadForm, email: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Target CapEx Range</label>
                  <select value={addLeadForm.investment_range} onChange={(e) => setAddLeadForm({ ...addLeadForm, investment_range: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="৳1L - ৳5L">৳1L - ৳5L (Retail)</option>
                    <option value="৳5L - ৳10L">৳5L - ৳10L</option>
                    <option value="৳10L - ৳50L">৳10L - ৳50L (Standard HNI)</option>
                    <option value="৳50L - ৳2Cr">৳50L - ৳2Cr (UHNWI)</option>
                    <option value="৳2Cr+">৳2Cr+ (Institutional / Family Office)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Source Channel</label>
                  <select value={addLeadForm.source_channel} onChange={(e) => setAddLeadForm({ ...addLeadForm, source_channel: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Admin_Entry">Admin Manual Intake</option>
                    <option value="Website">Public Website</option>
                    <option value="Promoter_Referral">Promoter Referral</option>
                    <option value="Event">Marketing Event</option>
                    <option value="Direct_Call">Direct Call-In</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Target Project Campaign (Optional)</label>
                  <select value={addLeadForm.target_project_id} onChange={(e) => setAddLeadForm({ ...addLeadForm, target_project_id: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- General Platform Inquiry --</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Initial Notes</label>
                  <textarea rows={2} placeholder="e.g. Referred by Tanvir, interested in Gulshan outlet deal" value={addLeadForm.notes} onChange={(e) => setAddLeadForm({ ...addLeadForm, notes: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingLead} className="btn-gold" style={{ padding: '0.75rem 1.75rem', fontWeight: '700', borderRadius: '6px' }}>
                    {savingLead ? 'Logging...' : 'Log Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FILTER BAR & SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'New', 'Promoter_Assigned', 'Survey_In_Progress', 'Survey_Complete', 'Telegram_Invite_Sent', 'Converted', 'Not_Interested'].map(f => (
                <button
                  key={f}
                  onClick={() => setLeadFilter(f)}
                  className={`btn-sm ${leadFilter === f ? 'btn-gold' : ''}`}
                  style={{
                    background: leadFilter === f ? undefined : 'rgba(255,255,255,0.05)',
                    color: leadFilter === f ? undefined : '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* LEADS LIST */}
          {filteredLeads.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <Inbox size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Prospective Leads Found
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                  Web inquiries, promoter referrals, and event registrations will automatically appear here.
                </p>
              </div>
              <button
                onClick={() => setShowAddLeadForm(true)}
                className="btn-gold"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
              >
                <Plus size={16} /> Log Lead Manually
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                const isNew = lead.status === 'New';
                const isConverted = lead.status === 'Converted';

                return (
                  <div key={lead.id} className="lead-card" style={{ borderLeft: isConverted ? '4px solid #10b981' : isNew ? '4px solid #f59e0b' : '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 'bold' }}>{lead.name}</h4>
                          <span className="status-badge status-badge--gold">
                            {lead.investment_range || '৳10L - ৳50L'}
                          </span>
                          {lead.funding_projects?.project_title && (
                            <span className="status-badge status-badge--info">
                              🎯 {lead.funding_projects.businesses?.brand_name}
                            </span>
                          )}
                          <span className={isConverted ? 'status-badge status-badge--success' : isNew ? 'status-badge status-badge--warning' : 'status-badge status-badge--info'}>
                            {lead.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                          <span>📞 {lead.phone}</span>
                          <span>Source: <strong style={{ color: '#cbd5e1' }}>{lead.source_channel?.replace(/_/g, ' ')}</strong></span>
                          <span>Assigned Promoter: <strong style={{ color: '#D4AF37' }}>{lead.promoters?.alias_name || 'Unassigned'}</strong></span>
                          <span>Managing Partner: <strong style={{ color: '#3b82f6' }}>{lead.kams?.full_name || 'Unassigned'}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* PROMOTER SELECTOR */}
                        <select
                          value={lead.assigned_promoter_id || ''}
                          onChange={(e) => handleAssignPromoter(lead.id, e.target.value)}
                          style={{ padding: '0.35rem 0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#D4AF37', borderRadius: '4px', fontSize: '0.75rem' }}
                        >
                          <option value="">-- Assign Promoter --</option>
                          {allPromoters.map(p => (
                            <option key={p.id} value={p.id}>{p.alias_name} ({p.referral_code})</option>
                          ))}
                        </select>

                        {/* STATUS SELECTOR */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          style={{ padding: '0.35rem 0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}
                        >
                          <option value="New">New</option>
                          <option value="Promoter_Assigned">Promoter Assigned</option>
                          <option value="Survey_In_Progress">Survey In Progress</option>
                          <option value="Survey_Complete">Survey Complete</option>
                          <option value="Telegram_Invite_Sent">Telegram Invite Sent</option>
                          <option value="Converted">Converted</option>
                          <option value="Not_Interested">Not Interested</option>
                        </select>

                        <button 
                          onClick={() => setSelectedLead(isSelected ? null : lead)}
                          className="btn-sm"
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem' }}
                        >
                          {isSelected ? 'Close ▲' : 'Manage ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED LEAD DETAIL DRAWER */}
                    {isSelected && (
                      <div className="inspector-grid" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                          <h5 style={{ margin: 0, color: '#D4AF37' }}>CRM Details &amp; Assignment</h5>
                          <div>Email: <strong style={{ color: '#fff' }}>{lead.email || 'Unlisted'}</strong></div>
                          <div>Meeting Preference: <strong style={{ color: '#fff' }}>{lead.meeting_preference || 'Online Call'}</strong></div>
                          <div>Referral Code Used: <strong style={{ color: '#D4AF37' }}>{lead.referral_code || 'Direct Platform'}</strong></div>

                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.2rem' }}>Assign Managing Partner (KAM):</label>
                            <select
                              value={lead.assigned_kam_id || ''}
                              onChange={(e) => handleAssignKam(lead.id, e.target.value)}
                              style={{ width: '100%', padding: '0.4rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                              <option value="">-- Unassigned --</option>
                              {allKams.map(k => (
                                <option key={k.id} value={k.id}>{k.full_name} ({k.title || 'Managing Partner'})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <h5 style={{ margin: 0, color: '#D4AF37', fontSize: '0.8rem' }}>Lead Notes &amp; Follow-up Schedule</h5>
                          <textarea
                            defaultValue={lead.notes || ''}
                            id={`notes-${lead.id}`}
                            rows={2}
                            placeholder="Add interaction notes..."
                            style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="date"
                              id={`date-${lead.id}`}
                              defaultValue={lead.follow_up_date || ''}
                              style={{ padding: '0.35rem 0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                            />
                            <button
                              onClick={() => {
                                const n = document.getElementById(`notes-${lead.id}`)?.value;
                                const d = document.getElementById(`date-${lead.id}`)?.value;
                                handleSaveLeadDetails(lead.id, n, d);
                              }}
                              className="btn-sm btn-gold"
                              style={{ padding: '0.4rem 0.8rem' }}
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: PROMOTER SURVEY VAULT */}
      {/* ---------------------------------------------------- */}
      {leadsSubTab === 'survey-vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
              Promoter Investor Survey Vault
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
              Enriched investor profiles filled out by promoters to remove friction from the investor onboarding process.
            </p>
          </div>

          {preProfiles.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', display: 'grid', placeItems: 'center', color: '#3b82f6' }}>
                <FileSpreadsheet size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Promoter Investor Surveys Submitted Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '500px', margin: 0 }}>
                  Pre-onboarding questionnaires and financial profile surveys conducted by promoters will appear here for verification and direct investor conversion.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {preProfiles.map(profile => {
                const isSelected = selectedPreProfile?.id === profile.id;
                const isComplete = profile.survey_status === 'Complete';
                const isInviteSent = profile.survey_status === 'Telegram_Invite_Sent';
                const isConverted = profile.survey_status === 'Converted';

                return (
                  <div key={profile.id} className="lead-card" style={{ borderLeft: isConverted ? '4px solid #10b981' : isInviteSent ? '4px solid #3b82f6' : isComplete ? '4px solid #D4AF37' : '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>{profile.full_name}</h4>
                          <span className="status-badge status-badge--gold">
                            {profile.investor_category || 'HNI'}
                          </span>
                          {profile.funding_projects?.project_title && (
                            <span className="status-badge status-badge--info">
                              🎯 {profile.funding_projects.businesses?.brand_name}
                            </span>
                          )}
                          {profile.requires_anonymity && (
                            <span className="status-badge status-badge--purple">
                              🔒 Anonymous
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <span>📞 {profile.phone}</span>
                          <span>Promoter: <strong style={{ color: '#D4AF37' }}>{profile.promoters?.alias_name || 'Promoter'}</strong></span>
                          <span>Est. Capacity: <strong style={{ color: '#10b981' }}>{formatCurrency(profile.estimated_investment_capacity_bdt || 0, currency)}</strong></span>
                          <span>Status: <strong style={{ color: isConverted ? '#10b981' : isInviteSent ? '#3b82f6' : '#f59e0b' }}>{profile.survey_status.replace(/_/g, ' ')}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* DISPATCH TELEGRAM BOT INVITE */}
                        {!isConverted && (
                          <button
                            onClick={() => handleSendTelegramInvite(profile.id)}
                            disabled={sendingInviteId === profile.id}
                            className="btn-sm"
                            style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Send size={13} /> {sendingInviteId === profile.id ? 'Sending Invite...' : isInviteSent ? 'Re-send Telegram Invite' : 'Send Telegram Invite'}
                          </button>
                        )}

                        {/* CONVERT TO VERIFIED INVESTOR */}
                        {!isConverted && (
                          <button
                            onClick={() => handleConvertPreProfileToInvestor(profile)}
                            className="btn-sm btn-gold"
                            style={{ background: '#10b981', color: '#000', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Rocket size={13} /> Convert to Verified Investor
                          </button>
                        )}

                        {isConverted && (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✓ Verified Investor</span>
                        )}

                        <button 
                          onClick={() => setSelectedPreProfile(isSelected ? null : profile)}
                          className="btn-sm"
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.45rem 0.85rem', borderRadius: '6px', fontWeight: '600' }}
                        >
                          {isSelected ? 'Close ▲' : 'Inspect Dossier ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED PROFILE DOSSIER */}
                    {isSelected && (
                      <div className="inspector-grid" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          <h5 style={{ margin: 0, color: '#D4AF37', fontSize: '0.9rem' }}>Identity &amp; Financial Dossier</h5>
                          <div>NID Number: <strong style={{ color: '#fff' }}>{profile.nid_number || 'Unprovided'}</strong></div>
                          <div>Email: <strong style={{ color: '#fff' }}>{profile.email || 'Unprovided'}</strong></div>
                          <div>Source of Funds: <strong style={{ color: '#3b82f6' }}>{profile.source_of_funds || 'Declared Personal Savings'}</strong></div>
                          <div>Preferred Meeting Format: <strong style={{ color: '#fff' }}>{profile.preferred_meeting_type || 'Online Call'}</strong></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          <h5 style={{ margin: 0, color: '#3b82f6', fontSize: '0.9rem' }}>Social Links &amp; Verification</h5>
                          {profile.linkedin_url ? (
                            <div>LinkedIn: <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{profile.linkedin_url}</a></div>
                          ) : (
                            <div>LinkedIn: Unlinked</div>
                          )}
                          {profile.facebook_url ? (
                            <div>Facebook: <a href={profile.facebook_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{profile.facebook_url}</a></div>
                          ) : (
                            <div>Facebook: Unlinked</div>
                          )}
                          <div>Telegram Username: <strong style={{ color: '#10b981' }}>{profile.telegram_username || 'Pending Bot Verification'}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: MARKETING CAMPAIGNS */}
      {/* ---------------------------------------------------- */}
      {leadsSubTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#D4AF37', fontWeight: '800' }}>
                Marketing Campaign Tracker
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Track events, referral drives, and marketing channel investments.
              </p>
            </div>
            
            <button 
              onClick={() => setShowCampaignForm(!showCampaignForm)}
              className={showCampaignForm ? 'btn-sm' : 'btn-sm btn-gold'}
              style={{ background: showCampaignForm ? 'rgba(255,255,255,0.1)' : undefined, color: showCampaignForm ? '#fff' : undefined, padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
            >
              {showCampaignForm ? '✕ Close Form' : '+ Create Campaign'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD CAMPAIGN FORM */}
          {showCampaignForm && (
            <div className="glass-card-premium" style={{ padding: '1.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Create New Marketing Campaign
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
                Set up marketing drives, offline franchise expos, webinars, or targeted social media campaigns to track acquisition budget and performance.
              </p>
              <form onSubmit={handleAddCampaign} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Campaign Name *</label>
                  <input type="text" placeholder="e.g. Q3 Franchise Expo Dhaka" value={campaignForm.campaign_name} onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Campaign Type</label>
                  <select value={campaignForm.campaign_type} onChange={(e) => setCampaignForm({ ...campaignForm, campaign_type: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Event">Event / Expo</option>
                    <option value="Social_Media">Social Media Ads</option>
                    <option value="WhatsApp_Blast">WhatsApp / Telegram Blast</option>
                    <option value="Referral_Drive">Referral Drive</option>
                    <option value="Email_Campaign">Email Newsletter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Budget BDT</label>
                  <input type="number" placeholder="e.g. 50000" value={campaignForm.budget_bdt} onChange={(e) => setCampaignForm({ ...campaignForm, budget_bdt: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Start Date</label>
                  <input type="date" value={campaignForm.start_date} onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>End Date</label>
                  <input type="date" value={campaignForm.end_date} onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.35rem' }}>Notes</label>
                  <input type="text" placeholder="Target 100 HNI leads..." value={campaignForm.notes} onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })} style={{ width: '100%', padding: '0.65rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingCampaign} className="btn-gold" style={{ padding: '0.75rem 1.75rem', fontWeight: '700', borderRadius: '6px' }}>
                    {savingCampaign ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CAMPAIGN CARDS GRID */}
          {campaigns.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', display: 'grid', placeItems: 'center', color: '#c084fc' }}>
                <Megaphone size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  No Marketing Campaigns Tracked Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '500px', margin: 0 }}>
                  Log expos, private dinner events, digital ads, and promoter referral drives to monitor acquisition cost and investor lead volume.
                </p>
              </div>
              <button
                onClick={() => setShowCampaignForm(true)}
                className="btn-gold"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
              >
                <Plus size={16} /> Create First Campaign
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {campaigns.map(camp => {
                const isActive = camp.status === 'Active';
                return (
                  <div key={camp.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isActive ? '4px solid #D4AF37' : '4px solid #64748b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{camp.campaign_name}</h4>
                        <span className="status-badge status-badge--info" style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                          {camp.campaign_type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className={isActive ? 'status-badge status-badge--success' : 'status-badge status-badge--muted'}>
                        {isActive ? '● Active' : '○ Completed'}
                      </span>
                    </div>

                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <div>Budget: <strong style={{ color: '#10b981' }}>{formatCurrency(camp.budget_bdt || 0, currency)}</strong></div>
                      <div>Dates: <strong>{camp.start_date ? `${camp.start_date} → ${camp.end_date || 'Ongoing'}` : 'Undated'}</strong></div>
                    </div>

                    {camp.notes && <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{camp.notes}</p>}

                    {isActive && (
                      <button 
                        onClick={() => handleCloseCampaign(camp.id)}
                        className="btn-sm"
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', marginTop: 'auto', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Mark Campaign Completed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
