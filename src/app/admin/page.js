'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PlusCircle, CheckCircle, Clock, ShieldAlert, 
  TrendingUp, DollarSign, Upload, FileText, ArrowUpRight, ChevronRight, Wallet,
  Filter, Search, RefreshCw, BarChart2, Layers, Award, Sparkles, Lock, ShieldCheck, Loader2,
  MessageSquare, Globe, LogOut, Eye, Activity, AlertCircle, XCircle, Calendar, Image,
  FileUp, Link as LinkIcon, CheckCircle2, ChevronDown, UserCheck, Shield, ChevronUp, AlertTriangle,
  Bot, MapPin, X, ChevronLeft
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const kanbanStages = [
  { id: 'Origination', title: '1. Origination & Pitch Review' },
  { id: 'Diligence', title: '2. Diligence & Valuation' },
  { id: 'Funding', title: '3. Active Capital Raise (90/10)' },
  { id: 'Active', title: '4. Active National Grid Hub' },
  { id: 'Closed', title: '5. Closed / Matured' },
];

export default function AdminPortal() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('dashboard'); // Default landing: Command Center
  const [investorSubTab, setInvestorSubTab] = useState('all-investors'); // 'all-investors' | 'kyc' | 'payments'
  const [pipelineView, setPipelineView] = useState('kanban'); // 'kanban' | 'table'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [allInvestors, setAllInvestors] = useState([]);
  const [allPromoters, setAllPromoters] = useState([]);
  const [cashTickets, setCashTickets] = useState([]);
  const [allKams, setAllKams] = useState([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [inquiryLeads, setInquiryLeads] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [yieldDisbursements, setYieldDisbursements] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allInvestorNotes, setAllInvestorNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Investor Hub Deep Dive States
  const [investorSearch, setInvestorSearch] = useState('');
  const [investorStatusFilter, setInvestorStatusFilter] = useState('All');
  const [investorDrawerTab, setInvestorDrawerTab] = useState('profile'); // 'profile' | 'investments' | 'yield' | 'kyc-docs' | 'notes'
  const [newNoteForm, setNewNoteForm] = useState({ note_type: 'General', content: '' });
  const [savingNote, setSavingNote] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [showAddInvestorModal, setShowAddInvestorModal] = useState(false);
  const [newInvestorForm, setNewInvestorForm] = useState({
    alias_name: '', phone: '', email: '',
    investor_category: 'HNI', requires_anonymity: false,
    origin_source: 'Admin', origin_promoter_id: '',
    referral_code_used: '', onboarding_status: 'Invited'
  });
  const [savingInvestor, setSavingInvestor] = useState(false);

  // Drawer & Modal States
  const [selectedInvestor, setSelectedInvestor] = useState(null); // Investor Hub Drawer
  const [selectedProjectForInvestors, setSelectedProjectForInvestors] = useState(null); // Per-Project Investor Drawer
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState('basics');
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Inline Business Creation Sub-Modal State
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [newBusinessForm, setNewBusinessForm] = useState({
    brand_name: '',
    company_legal_name: '',
    company_registration_number: '',
    industry_sector: 'F&B Franchise',
    operational_months: 12,
    founder_name: '',
    founder_linkedin_url: ''
  });
  
  // Project Form State
  const [projectForm, setProjectForm] = useState({
    project_title: '',
    business_id: '',
    funding_type: 'Franchise',
    status: 'Origination',
    target_raise_bdt: 20000000,
    min_otc_investment_bdt: 1000000,
    spv_name: '',
    spv_reg_number: '',
    spv_entity_type: 'Pvt Ltd',
    kam_id: '',
    location_address: '',
    expected_close_date: '',
    buildout_timeline_months: 2,
    equity_investor_share: 90,
    yield_option_1_rate: 10,
    yield_option_2_rate: 12,
    yield_option_3_rate: 35,
    description: '',
    project_highlights: '',
    cover_image_url: '',
    video_url: '',
    show_on_showcase: true,
    media_list: [] // Array of { id, media_url, media_type }
  });

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Stage Advance Modal
  const [advanceModal, setAdvanceModal] = useState({ open: false, project: null, targetStage: '' });

  // Yield Engine Form State
  const [dividendProjectId, setDividendProjectId] = useState('');
  const [dividendMonth, setDividendMonth] = useState('Aug');
  const [dividendYear, setDividendYear] = useState('2026');
  const [grossSales, setGrossSales] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [posSyncStatus, setPosSyncStatus] = useState('');
  const [selectedYieldHistory, setSelectedYieldHistory] = useState(null);

  // Yield Engine Deep-Dive States (Tab 5)
  const [yieldSubTab, setYieldSubTab] = useState('declare'); // 'declare' | 'ledger' | 'pos-reports'
  const [selectedDisbursement, setSelectedDisbursement] = useState(null); // ledger drilldown
  const [allInvestorYields, setAllInvestorYields] = useState([]);
  const [allPosReports, setAllPosReports] = useState([]);
  const [posReportSubTab, setPosReportSubTab] = useState('manual'); // 'manual' | 'csv'
  const [posEntryForm, setPosEntryForm] = useState({
    project_id: '', report_month: 'Aug 2026', gross_sales_bdt: '', net_profit_bdt: '', transaction_count: ''
  });
  const [savingPosReport, setSavingPosReport] = useState(false);
  const [posCSVFile, setPosCSVFile] = useState(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [disbPaymentForm, setDisbPaymentForm] = useState({
    payment_txn_ref: '', payment_date: '', notes: ''
  });
  const [disbPaymentFile, setDisbPaymentFile] = useState(null);
  const [uploadingDisbProof, setUploadingDisbProof] = useState(false);
  const [pushingToTelegram, setPushingToTelegram] = useState(false);

  // Cash Concierge Deep-Dive States (Tab 6)
  const [cashSubTab, setCashSubTab] = useState('pipeline'); // 'pipeline' | 'new-ticket'
  const [selectedCashTicket, setSelectedCashTicket] = useState(null); // ticket drilldown
  const [cashStatusFilter, setCashStatusFilter] = useState('All'); // 'All' | 'Pending_Review' | 'Meeting_Scheduled' | 'Funds_Cleared' | 'Closed' | 'Rejected'
  const [adminTicketForm, setAdminTicketForm] = useState({
    investor_id: '', target_project_id: '', ticket_amount_bdt: '', preferred_meeting_time: 'Weekday Afternoon', meeting_format: 'In_Person', admin_notes: ''
  });
  const [cashMeetingForm, setCashMeetingForm] = useState({ date: '', format: 'In_Person' });
  const [cashFundsRef, setCashFundsRef] = useState('');
  const [cashNoteInput, setCashNoteInput] = useState('');
  const [savingCashAction, setSavingCashAction] = useState(false);
  const [pushingCashTelegram, setPushingCashTelegram] = useState(false);

  // Team & Promoters Deep-Dive States (Tab 7)
  const [teamSubTab, setTeamSubTab] = useState('kams'); // 'kams' | 'promoters' | 'payouts'
  const [selectedPromoter, setSelectedPromoter] = useState(null);
  const [promoterLeads, setPromoterLeads] = useState([]);
  const [promoterCommissions, setPromoterCommissions] = useState([]);
  const [promoterTargets, setPromoterTargets] = useState([]);
  const [kamForm, setKamForm] = useState({ full_name: '', team_type: 'kam', designation: 'Managing Partner', title: 'Managing Partner', region: 'Dhaka HQ', email: '', phone: '', joined_at: new Date().toISOString().slice(0, 10) });
  const [promoterForm, setPromoterForm] = useState({ full_name: '', alias_name: '', phone: '', email: '', tier: 'Trainee', joined_at: new Date().toISOString().slice(0, 10) });
  const [showKamForm, setShowKamForm] = useState(false);
  const [showPromoterForm, setShowPromoterForm] = useState(false);
  const [savingTeamAction, setSavingTeamAction] = useState(false);

  // Legal Upload State
  const [uploadDocUrl, setUploadDocUrl] = useState('');
  const [uploadDocType, setUploadDocType] = useState('Share_Certificate');

  // Business Registry (Tab 3) States
  const [cohortApplications, setCohortApplications] = useState([]);
  const [allAppStakeholders, setAllAppStakeholders] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [appDrawerSubTab, setAppDrawerSubTab] = useState('brand'); // 'brand' | 'team' | 'financials' | 'documents' | 'audit'
  const [appFilterStatus, setAppFilterStatus] = useState('All'); // 'All' | 'New_Submission' | 'KAM_Assigned' | 'Diligence_Complete' | 'Onboarded_To_Pipeline' | 'Rejected'
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [convertingAppId, setConvertingAppId] = useState(null);

  // KAM Audit Form State in Drawer
  const [kamAuditForm, setKamAuditForm] = useState({
    kam_site_visit_date: '',
    kam_location_score: 4,
    kam_equipment_score: 4,
    kam_financial_verification: 'Pass',
    kam_legal_doc_status: 'Verified',
    kam_notes: ''
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch Businesses
      const { data: bzData } = await supabase.from('businesses').select('*');
      setBusinesses(bzData || []);

      // Fetch Cohort Applications & Stakeholders
      const { data: appData } = await supabase
        .from('business_cohort_applications')
        .select('*')
        .order('created_at', { ascending: false });
      setCohortApplications(appData || []);

      const { data: stkData } = await supabase.from('business_stakeholders').select('*');
      setAllAppStakeholders(stkData || []);


      // Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('funding_projects')
        .select(`*, businesses (brand_name)`)
        .order('created_at', { ascending: false });
      if (projErr) throw projErr;
      setProjects(projData || []);

      // Fetch KAMs & Team Members from public.team
      const { data: kamsData } = await supabase
        .from('team')
        .select('*')
        .in('team_type', ['kam', 'manager', 'admin'])
        .order('created_at', { ascending: false });
      setAllKams(kamsData || []);

      // Fetch Promoters from public.team
      const { data: promData } = await supabase
        .from('team')
        .select('*')
        .eq('team_type', 'promoter')
        .order('created_at', { ascending: false });
      setAllPromoters(promData || []);

      // Fetch Promoter Leads (CRM)
      const { data: promLeadsData } = await supabase
        .from('promoter_leads')
        .select('*')
        .order('created_at', { ascending: false });
      setPromoterLeads(promLeadsData || []);

      // Fetch Promoter Commissions
      const { data: commData } = await supabase
        .from('promoter_commissions')
        .select(`*, investments ( amount_invested_bdt, funding_projects ( project_title, businesses ( brand_name ) ) )`)
        .order('created_at', { ascending: false });
      setPromoterCommissions(commData || []);

      // Fetch Promoter Targets (Gamified Tiers)
      const { data: targetsData } = await supabase
        .from('promoter_targets')
        .select(`*, funding_projects ( project_title, businesses ( brand_name ) )`)
        .order('created_at', { ascending: false });
      setPromoterTargets(targetsData || []);

      // Fetch All Investors with KAM & Promoter details
      const { data: invsList } = await supabase
        .from('investors')
        .select('*')
        .order('created_at', { ascending: false });
      setAllInvestors(invsList || []);

      // Fetch Investor Notes
      const { data: notesData } = await supabase
        .from('investor_notes')
        .select('*')
        .order('created_at', { ascending: false });
      setAllInvestorNotes(notesData || []);

      // Fetch All Investment Bookings
      const { data: bookingsData } = await supabase
        .from('investment_bookings')
        .select(`
          *,
          investors ( alias_name, requires_anonymity ),
          funding_projects ( project_title, businesses (brand_name) )
        `)
        .order('created_at', { ascending: false });
      setAllBookings(bookingsData || []);

      // Fetch Cash Tickets
      const { data: cashData } = await supabase
        .from('cash_tickets')
        .select(`
          *,
          investors ( id, alias_name, phone, email, requires_anonymity, telegram_chat_id, kyc_level ),
          funding_projects ( id, project_title, min_otc_investment_bdt, businesses ( brand_name ) )
        `)
        .order('created_at', { ascending: false });
      setCashTickets(cashData || []);

      // Fetch Payment Submissions
      const { data: paymentData } = await supabase
        .from('payment_submissions')
        .select(`
          *,
          investment_bookings (
            amount_bdt,
            yield_option,
            booking_type,
            status,
            investors ( alias_name ),
            funding_projects ( project_title, businesses (brand_name) )
          )
        `)
        .order('created_at', { ascending: false });
      setPaymentSubmissions(paymentData || []);

      // Fetch KYC Submissions
      const { data: kycData } = await supabase
        .from('kyc_submissions')
        .select(`*, investors ( alias_name, user_id )`)
        .order('created_at', { ascending: false });
      setKycSubmissions(kycData || []);

      // Fetch Payout Requests
      const { data: payoutsData } = await supabase
        .from('payout_requests')
        .select(`*, promoters(id, alias_name, user_id)`)
        .order('created_at', { ascending: false });
      setPayoutRequests(payoutsData || []);

      // Fetch Active Investments
      const { data: invsData } = await supabase
        .from('investments')
        .select(`*, investors(id, alias_name, user_id), funding_projects(project_title)`)
        .order('created_at', { ascending: false });
      setActiveInvestments(invsData || []);

      // Fetch Inquiry Leads
      const { data: leadsData } = await supabase
        .from('inquiry_leads')
        .select('*')
        .order('created_at', { ascending: false });
      setInquiryLeads(leadsData || []);

      // Fetch Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setRecentNotifications(notifData || []);

      // Fetch Yield Disbursements
      const { data: yieldData } = await supabase
        .from('yield_disbursements')
        .select(`*, funding_projects(project_title, businesses(brand_name))`)
        .order('created_at', { ascending: false });
      setYieldDisbursements(yieldData || []);

      // Fetch Investor Yields (for per-batch drilldown)
      const { data: invYieldsData } = await supabase
        .from('investor_yields')
        .select(`*, investors(alias_name, phone, email, requires_anonymity, telegram_chat_id)`)
        .order('created_at', { ascending: false });
      setAllInvestorYields(invYieldsData || []);

      // Fetch POS Daily Sales / Monthly Reports
      const { data: posData } = await supabase
        .from('pos_daily_sales')
        .select(`*, businesses(brand_name)`)
        .order('created_at', { ascending: false });
      setAllPosReports(posData || []);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminData();
    } else if (!authLoading && role !== 'admin') {
      setLoading(false);
    }
  }, [role, authLoading]);

  // Stage Advance Handler
  const handleConfirmAdvanceStage = async () => {
    if (!advanceModal.project || !advanceModal.targetStage) return;
    try {
      const { error } = await supabase
        .from('funding_projects')
        .update({ status: advanceModal.targetStage })
        .eq('id', advanceModal.project.id);

      if (error) throw error;

      addToast(`Project advanced to ${advanceModal.targetStage}`, 'success');
      setAdvanceModal({ open: false, project: null, targetStage: '' });
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to advance stage', 'error');
    }
  };

  // Open Project Modal for Create or Edit
  const handleOpenProjectModal = async (projectToEdit = null) => {
    if (projectToEdit) {
      setEditingProjectId(projectToEdit.id);
      
      // Fetch media
      const { data: mediaData } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', projectToEdit.id);

      let highlightsStr = '';
      if (Array.isArray(projectToEdit.project_highlights)) {
        highlightsStr = projectToEdit.project_highlights.join('\n');
      } else if (typeof projectToEdit.project_highlights === 'string') {
        highlightsStr = projectToEdit.project_highlights;
      }

      setProjectForm({
        project_title: projectToEdit.project_title || '',
        business_id: projectToEdit.business_id || '',
        funding_type: projectToEdit.funding_type || 'Franchise',
        status: projectToEdit.status || 'Origination',
        target_raise_bdt: projectToEdit.target_raise_bdt || 20000000,
        min_otc_investment_bdt: projectToEdit.min_otc_investment_bdt || 1000000,
        spv_name: projectToEdit.spv_name || '',
        spv_reg_number: projectToEdit.spv_reg_number || '',
        spv_entity_type: projectToEdit.spv_entity_type || 'Pvt Ltd',
        kam_id: projectToEdit.kam_id || '',
        location_address: projectToEdit.location_address || '',
        expected_close_date: projectToEdit.expected_close_date || '',
        buildout_timeline_months: projectToEdit.buildout_timeline_months || 2,
        equity_investor_share: projectToEdit.equity_investor_share || 90,
        yield_option_1_rate: projectToEdit.yield_option_1_rate || 10,
        yield_option_2_rate: projectToEdit.yield_option_2_rate || 12,
        yield_option_3_rate: projectToEdit.yield_option_3_rate || 35,
        description: projectToEdit.description || '',
        project_highlights: highlightsStr,
        cover_image_url: projectToEdit.cover_image_url || '',
        video_url: projectToEdit.video_url || '',
        show_on_showcase: projectToEdit.show_on_showcase !== false,
        media_list: mediaData || []
      });
    } else {
      setEditingProjectId(null);
      setProjectForm({
        project_title: '',
        business_id: businesses[0]?.id || '',
        funding_type: 'Franchise',
        status: 'Origination',
        target_raise_bdt: 20000000,
        min_otc_investment_bdt: 1000000,
        spv_name: '',
        spv_reg_number: '',
        spv_entity_type: 'Pvt Ltd',
        kam_id: '',
        location_address: '',
        expected_close_date: '',
        buildout_timeline_months: 2,
        equity_investor_share: 90,
        yield_option_1_rate: 10,
        yield_option_2_rate: 12,
        yield_option_3_rate: 35,
        description: '',
        project_highlights: '',
        cover_image_url: '',
        video_url: '',
        show_on_showcase: true,
        media_list: []
      });
    }
    setProjectModalTab('basics');
    setShowProjectModal(true);
  };

  // Upload Cover Image Handler
  const handleUploadCoverImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setProjectForm(prev => ({ ...prev, cover_image_url: data.url }));
      addToast('Cover image uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Error uploading cover image', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload Gallery Image Handler
  const handleUploadGalleryImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload-media', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setProjectForm(prev => ({
          ...prev,
          media_list: [...prev.media_list, { media_url: data.url, media_type: 'photo' }]
        }));
      }
      addToast('Gallery images uploaded', 'success');
    } catch (err) {
      addToast(err.message || 'Error uploading gallery media', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryMedia = (index) => {
    setProjectForm(prev => ({
      ...prev,
      media_list: prev.media_list.filter((_, i) => i !== index)
    }));
  };

  // Save Inline New Business Handler
  const handleSaveNewBusiness = async (e) => {
    e.preventDefault();
    if (!newBusinessForm.brand_name) return;
    setSavingBusiness(true);

    try {
      // 1. Create Founder
      let founderId = null;
      if (newBusinessForm.founder_name) {
        const { data: fData, error: fErr } = await supabase
          .from('founders')
          .insert([{
            full_name: newBusinessForm.founder_name,
            linkedin_url: newBusinessForm.founder_linkedin_url,
            track_record_score: 85
          }])
          .select()
          .single();
        if (!fErr && fData) {
          founderId = fData.id;
        }
      }

      // 2. Create Business
      const { data: bzNew, error: bzErr } = await supabase
        .from('businesses')
        .insert([{
          brand_name: newBusinessForm.brand_name,
          company_legal_name: newBusinessForm.company_legal_name,
          company_registration_number: newBusinessForm.company_registration_number,
          industry_sector: newBusinessForm.industry_sector,
          operational_months: Number(newBusinessForm.operational_months || 12),
          founder_id: founderId,
          ai_health_score: 88,
          is_enlisted: true
        }])
        .select()
        .single();

      if (bzErr) throw bzErr;

      addToast(`Brand "${newBusinessForm.brand_name}" created successfully!`, 'success');
      
      // Refresh businesses & auto select
      const { data: updatedBz } = await supabase.from('businesses').select('*');
      setBusinesses(updatedBz || []);
      setProjectForm(prev => ({ ...prev, business_id: bzNew.id }));
      setShowNewBusinessModal(false);
      
      // Reset form
      setNewBusinessForm({
        brand_name: '',
        company_legal_name: '',
        company_registration_number: '',
        industry_sector: 'F&B Franchise',
        operational_months: 12,
        founder_name: '',
        founder_linkedin_url: ''
      });
    } catch (err) {
      addToast(err.message || 'Failed to create business', 'error');
    } finally {
      setSavingBusiness(false);
    }
  };

  // Save Project Handler
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const highlightsArray = projectForm.project_highlights
        ? projectForm.project_highlights.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        project_title: projectForm.project_title,
        business_id: projectForm.business_id || (businesses[0]?.id || null),
        funding_type: projectForm.funding_type,
        status: projectForm.status,
        target_raise_bdt: Number(projectForm.target_raise_bdt),
        min_otc_investment_bdt: Number(projectForm.min_otc_investment_bdt),
        spv_name: projectForm.spv_name,
        spv_reg_number: projectForm.spv_reg_number,
        spv_entity_type: projectForm.spv_entity_type,
        kam_id: projectForm.kam_id || null,
        location_address: projectForm.location_address,
        expected_close_date: projectForm.expected_close_date || null,
        buildout_timeline_months: Number(projectForm.buildout_timeline_months || 2),
        equity_investor_share: Number(projectForm.equity_investor_share || 90),
        yield_option_1_rate: Number(projectForm.yield_option_1_rate || 10),
        yield_option_2_rate: Number(projectForm.yield_option_2_rate || 12),
        yield_option_3_rate: Number(projectForm.yield_option_3_rate || 35),
        description: projectForm.description,
        project_highlights: highlightsArray,
        cover_image_url: projectForm.cover_image_url,
        video_url: projectForm.video_url,
        show_on_showcase: projectForm.show_on_showcase
      };

      let projectId = editingProjectId;

      if (editingProjectId) {
        const { error } = await supabase
          .from('funding_projects')
          .update(payload)
          .eq('id', editingProjectId);
        if (error) throw error;
      } else {
        const { data: newProj, error } = await supabase
          .from('funding_projects')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        projectId = newProj.id;
      }

      // Save media list
      if (projectId && projectForm.media_list.length > 0) {
        await supabase.from('project_media').delete().eq('project_id', projectId);
        const mediaInserts = projectForm.media_list.map((m, idx) => ({
          project_id: projectId,
          media_url: m.media_url,
          media_type: m.media_type || 'photo',
          display_order: idx
        }));
        await supabase.from('project_media').insert(mediaInserts);
      }

      addToast(editingProjectId ? 'Project updated successfully' : 'Project onboarded successfully', 'success');
      setShowProjectModal(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save project', 'error');
    }
  };

  // KYC Review Handler
  const handleKycReview = async (submissionId, investorId, targetLevel, approve) => {
    try {
      const status = approve ? 'Approved' : 'Rejected';
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      if (approve) {
        await supabase
          .from('investors')
          .update({ kyc_level: targetLevel, kyc_verified: true })
          .eq('id', investorId);
      }

      addToast(`KYC submission ${status.toLowerCase()}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'KYC update failed', 'error');
    }
  };

  // Payment Review Handler
  const handlePaymentReview = async (submissionId, bookingId, investorId, approve) => {
    try {
      if (approve) {
        const { data: bookingData, error: bErr } = await supabase
          .from('investment_bookings')
          .update({ status: 'Approved' })
          .eq('id', bookingId)
          .select()
          .single();

        if (bErr) throw bErr;

        await supabase.from('investments').insert([{
          investor_id: investorId,
          project_id: bookingData.project_id,
          amount_invested_bdt: bookingData.amount_bdt,
          yield_option: bookingData.yield_option,
          status: 'Active'
        }]);

        const proj = projects.find(p => p.id === bookingData.project_id);
        if (proj) {
          await supabase
            .from('funding_projects')
            .update({ amount_raised_bdt: Number(proj.amount_raised_bdt || 0) + Number(bookingData.amount_bdt) })
            .eq('id', proj.id);
        }
      } else {
        await supabase
          .from('investment_bookings')
          .update({ status: 'Rejected' })
          .eq('id', bookingId);
      }

      addToast(`Payment proof ${approve ? 'approved' : 'rejected'}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Payment review failed', 'error');
    }
  };

  // POS Sync Auto-Fill Handler (Reads Real POS Data if Available)
  const handlePullPosData = () => {
    if (!dividendProjectId) {
      addToast('Please select a project first.', 'error');
      return;
    }
    const proj = projects.find(p => p.id === dividendProjectId);
    if (!proj) return;

    // Search real POS reports for this project / business
    const targetMonthStr = `${dividendMonth} ${dividendYear}`;
    const matchingPos = allPosReports.filter(r => 
      r.business_id === proj.business_id && 
      (r.report_month === targetMonthStr || r.date?.includes(`${dividendYear}`))
    );

    if (matchingPos.length > 0) {
      const sumGross = matchingPos.reduce((acc, r) => acc + Number(r.gross_sales_bdt || 0), 0);
      const sumNet = matchingPos.reduce((acc, r) => acc + Number(r.net_profit_bdt || 0), 0);
      setGrossSales(sumGross);
      setNetProfit(sumNet);
      setPosSyncStatus(`Real POS Data Pulled for ${targetMonthStr}: ৳${sumGross.toLocaleString()} Gross Sales (${matchingPos.length} report entries)`);
      addToast(`Real POS sales report pulled (${matchingPos.length} entries).`, 'success');
    } else {
      // Fallback estimate
      const estimatedGross = Math.round(Number(proj.target_raise_bdt) * 0.08);
      const estimatedNet = Math.round(estimatedGross * 0.25);
      setGrossSales(estimatedGross);
      setNetProfit(estimatedNet);
      setPosSyncStatus(`No POS reports on file for ${targetMonthStr}. Auto-estimated: ৳${estimatedGross.toLocaleString()}`);
      addToast('Estimated POS sales calculated.', 'info');
    }
  };

  // Yield Distribution Handler (With Duplicate Guard & Full Column Support)
  const handleDistributeYield = async (e) => {
    e.preventDefault();
    if (!dividendProjectId || !grossSales || !netProfit) return;
    setIsDistributing(true);

    try {
      const proj = projects.find(p => p.id === dividendProjectId);
      const projInvestments = activeInvestments.filter(i => i.project_id === dividendProjectId);

      if (projInvestments.length === 0) {
        throw new Error('No active investors found for this project.');
      }

      const disMonth = `${dividendMonth} ${dividendYear}`;

      // Duplicate Check
      const existingDisb = yieldDisbursements.find(d => d.project_id === dividendProjectId && d.disbursement_month === disMonth);
      if (existingDisb) {
        throw new Error(`Yield disbursement already declared for ${proj.project_title} in ${disMonth}.`);
      }

      const totalGross = Number(grossSales);
      const totalNet = Number(netProfit);

      const r1 = Number(proj?.yield_option_1_rate || 10) / 100;
      const r2 = Number(proj?.yield_option_2_rate || 12) / 100;
      const r3 = Number(proj?.yield_option_3_rate || 35) / 100;

      const poolOpt1 = totalGross * r1;
      const poolOpt2 = totalGross * r2;
      const poolOpt3 = totalNet * r3;

      const opt1Invs = projInvestments.filter(i => Number(i.yield_option) === 1);
      const opt2Invs = projInvestments.filter(i => Number(i.yield_option) === 2);
      const opt3Invs = projInvestments.filter(i => Number(i.yield_option) === 3);

      const sum1 = opt1Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
      const sum2 = opt2Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
      const sum3 = opt3Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);

      const { data: disbRecord, error: dErr } = await supabase
        .from('yield_disbursements')
        .insert([{
          project_id: dividendProjectId,
          month: dividendMonth,
          year: Number(dividendYear),
          disbursement_month: disMonth,
          gross_sales_bdt: totalGross,
          net_profit_bdt: totalNet,
          total_disbursed_bdt: 0,
          status: 'Draft'
        }])
        .select()
        .single();

      if (dErr) throw dErr;

      let totalDistributed = 0;
      const yieldInserts = [];

      opt1Invs.forEach(i => {
        const share = sum1 > 0 ? (Number(i.amount_invested_bdt) / sum1) * poolOpt1 : 0;
        totalDistributed += share;
        yieldInserts.push({
          disbursement_id: disbRecord.id,
          investor_id: i.investor_id,
          investment_id: i.id,
          project_id: dividendProjectId,
          amount_bdt: Math.round(share),
          yield_option: 1
        });
      });

      opt2Invs.forEach(i => {
        const share = sum2 > 0 ? (Number(i.amount_invested_bdt) / sum2) * poolOpt2 : 0;
        totalDistributed += share;
        yieldInserts.push({
          disbursement_id: disbRecord.id,
          investor_id: i.investor_id,
          investment_id: i.id,
          project_id: dividendProjectId,
          amount_bdt: Math.round(share),
          yield_option: 2
        });
      });

      opt3Invs.forEach(i => {
        const share = sum3 > 0 ? (Number(i.amount_invested_bdt) / sum3) * poolOpt3 : 0;
        totalDistributed += share;
        yieldInserts.push({
          disbursement_id: disbRecord.id,
          investor_id: i.investor_id,
          investment_id: i.id,
          project_id: dividendProjectId,
          amount_bdt: Math.round(share),
          yield_option: 3
        });
      });

      if (yieldInserts.length > 0) {
        await supabase.from('investor_yields').insert(yieldInserts);
      }

      await supabase
        .from('yield_disbursements')
        .update({ total_disbursed_bdt: Math.round(totalDistributed) })
        .eq('id', disbRecord.id);

      addToast(`Declared yield batch for ${disMonth}: ${formatCurrency(totalDistributed, currency)} allocated across ${yieldInserts.length} investors!`, 'success');
      setDividendProjectId('');
      setGrossSales('');
      setNetProfit('');
      setPosSyncStatus('');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to distribute yield', 'error');
    } finally {
      setIsDistributing(false);
    }
  };

  // Submit Manual POS Report
  const handleSubmitPosManual = async (e) => {
    e.preventDefault();
    if (!posEntryForm.project_id || !posEntryForm.gross_sales_bdt || !posEntryForm.net_profit_bdt) {
      addToast('Project, Gross Sales, and Net Profit are required.', 'error');
      return;
    }
    setSavingPosReport(true);
    try {
      const proj = projects.find(p => p.id === posEntryForm.project_id);
      const payload = {
        business_id: proj?.business_id,
        date: new Date().toISOString().split('T')[0],
        report_month: posEntryForm.report_month || 'Aug 2026',
        gross_sales_bdt: Number(posEntryForm.gross_sales_bdt),
        net_profit_bdt: Number(posEntryForm.net_profit_bdt),
        transaction_count: Number(posEntryForm.transaction_count || 0),
        sync_source: 'Manual_Entry'
      };

      const { error } = await supabase.from('pos_daily_sales').insert([payload]);
      if (error) throw error;

      addToast('POS Monthly Sales Report submitted successfully!', 'success');
      setPosEntryForm({ project_id: '', report_month: 'Aug 2026', gross_sales_bdt: '', net_profit_bdt: '', transaction_count: '' });
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to submit POS report', 'error');
    } finally {
      setSavingPosReport(false);
    }
  };

  // Upload POS CSV File
  const handleUploadPosCSV = async (e) => {
    e.preventDefault();
    if (!posEntryForm.project_id || !posCSVFile) {
      addToast('Please select a project and a CSV file.', 'error');
      return;
    }
    setUploadingCSV(true);
    try {
      const text = await posCSVFile.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const proj = projects.find(p => p.id === posEntryForm.project_id);
      
      const records = [];
      // Skip header line if present
      const startIdx = lines[0].toLowerCase().includes('gross') || lines[0].toLowerCase().includes('date') ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 2) {
          records.push({
            business_id: proj?.business_id,
            date: parts[0] || new Date().toISOString().split('T')[0],
            report_month: posEntryForm.report_month || 'Aug 2026',
            gross_sales_bdt: Number(parts[1] || 0),
            net_profit_bdt: Number(parts[2] || (Number(parts[1] || 0) * 0.25)),
            transaction_count: Number(parts[3] || 0),
            sync_source: 'CSV_Upload'
          });
        }
      }

      if (records.length === 0) {
        throw new Error('No valid rows found in CSV.');
      }

      const { error } = await supabase.from('pos_daily_sales').insert(records);
      if (error) throw error;

      addToast(`Uploaded ${records.length} POS rows from CSV successfully!`, 'success');
      setPosCSVFile(null);
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to upload CSV', 'error');
    } finally {
      setUploadingCSV(false);
    }
  };

  // Save Disbursement Payment Proof & Reference
  const handleSaveDisbursementProof = async (e, disbId) => {
    e.preventDefault();
    try {
      let attachmentUrl = selectedDisbursement?.payment_attachment_url || null;

      if (disbPaymentFile) {
        setUploadingDisbProof(true);
        const formData = new FormData();
        formData.append('file', disbPaymentFile);
        formData.append('bucket', 'cohort-docs');

        const uploadRes = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'File upload failed');
        attachmentUrl = uploadData.fileUrl;
      }

      const { error } = await supabase
        .from('yield_disbursements')
        .update({
          payment_txn_ref: disbPaymentForm.payment_txn_ref,
          payment_date: disbPaymentForm.payment_date || new Date().toISOString().split('T')[0],
          payment_attachment_url: attachmentUrl,
          notes: disbPaymentForm.notes
        })
        .eq('id', disbId);

      if (error) throw error;

      addToast('Disbursement payment proof & reference saved.', 'success');
      setSelectedDisbursement(prev => ({
        ...prev,
        payment_txn_ref: disbPaymentForm.payment_txn_ref,
        payment_date: disbPaymentForm.payment_date,
        payment_attachment_url: attachmentUrl,
        notes: disbPaymentForm.notes
      }));
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save payment proof', 'error');
    } finally {
      setUploadingDisbProof(false);
    }
  };

  // Mark Disbursement as Finalised
  const handleFinaliseDisbursement = async (disbId) => {
    try {
      const { error } = await supabase
        .from('yield_disbursements')
        .update({ status: 'Finalised' })
        .eq('id', disbId);

      if (error) throw error;
      addToast('Disbursement batch marked as Finalised.', 'success');
      setSelectedDisbursement(prev => ({ ...prev, status: 'Finalised' }));
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to finalise disbursement', 'error');
    }
  };

  // Push Yield Notification to Telegram Bot
  const handlePushYieldToTelegram = async (disbId) => {
    setPushingToTelegram(true);
    try {
      const res = await fetch('/api/send-yield-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disbursement_id: disbId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send Telegram push');

      addToast(`Pushed Telegram notifications! (${data.notified_count} sent out of ${data.total_investors} investors)`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Telegram push failed', 'error');
    } finally {
      setPushingToTelegram(false);
    }
  };

  // Download Payout CSV for Compliance
  const handleDownloadYieldCSV = (disb) => {
    try {
      const batchYields = allInvestorYields.filter(y => y.disbursement_id === disb.id);
      if (batchYields.length === 0) {
        addToast('No investor payout records found for this batch.', 'error');
        return;
      }

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Disbursement ID,Month,Project,Investor Alias,Yield Option,Amount BDT,Acknowledged,Date\n';

      batchYields.forEach(y => {
        const row = [
          disb.id,
          `"${disb.disbursement_month || disb.month}"`,
          `"${disb.funding_projects?.project_title || ''}"`,
          `"${y.investors?.alias_name || 'Investor'}"`,
          y.yield_option || 1,
          y.amount_bdt,
          y.acknowledged ? 'Yes' : 'No',
          `"${new Date(y.created_at).toLocaleDateString()}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `GRO10X_Yield_${disb.disbursement_month || 'Batch'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Yield Payout Breakdown CSV downloaded!', 'success');
    } catch (err) {
      addToast('Failed to download CSV.', 'error');
    }
  };

  // Cash Concierge Status Update Handler
  const handleCashStatusUpdate = async (ticketId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === 'Closed') updates.closed_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('cash_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
      addToast(`Cash ticket status updated to ${newStatus.replace('_', ' ')}.`, 'success');
      
      if (selectedCashTicket?.id === ticketId) {
        setSelectedCashTicket(prev => ({ ...prev, status: newStatus, ...updates }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update ticket status', 'error');
    }
  };

  // Assign KAM to Cash Ticket
  const handleCashKamAssign = async (ticketId, kamId) => {
    try {
      const { error } = await supabase
        .from('cash_tickets')
        .update({ kam_id: kamId })
        .eq('id', ticketId);

      if (error) throw error;
      const assignedKam = allKams.find(k => k.id === kamId);
      addToast(`Assigned ${assignedKam?.full_name || 'Managing Partner'} to cash ticket.`, 'success');
      
      if (selectedCashTicket?.id === ticketId) {
        setSelectedCashTicket(prev => ({ ...prev, kam_id: kamId, kams: assignedKam }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to assign KAM', 'error');
    }
  };

  // Confirm Meeting for Cash Ticket
  const handleCashMeetingConfirm = async (e, ticketId) => {
    e.preventDefault();
    if (!cashMeetingForm.date) {
      addToast('Please select a meeting date and time.', 'error');
      return;
    }
    setSavingCashAction(true);
    try {
      const { error } = await supabase
        .from('cash_tickets')
        .update({
          confirmed_meeting_date: new Date(cashMeetingForm.date).toISOString(),
          meeting_format: cashMeetingForm.format || 'In_Person',
          status: 'Meeting_Scheduled'
        })
        .eq('id', ticketId);

      if (error) throw error;

      addToast('OTC Consultation Meeting confirmed & scheduled!', 'success');
      if (selectedCashTicket?.id === ticketId) {
        setSelectedCashTicket(prev => ({
          ...prev,
          confirmed_meeting_date: new Date(cashMeetingForm.date).toISOString(),
          meeting_format: cashMeetingForm.format,
          status: 'Meeting_Scheduled'
        }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to confirm meeting', 'error');
    } finally {
      setSavingCashAction(false);
    }
  };

  // Save Admin Internal Note on Cash Ticket
  const handleSaveCashNote = async (e, ticketId) => {
    e.preventDefault();
    if (!cashNoteInput.trim()) return;
    setSavingCashAction(true);
    try {
      const timestamp = new Date().toLocaleString();
      const existingNotes = selectedCashTicket?.admin_notes || '';
      const newNotes = existingNotes 
        ? `${existingNotes}\n[${timestamp}] ${cashNoteInput}` 
        : `[${timestamp}] ${cashNoteInput}`;

      const { error } = await supabase
        .from('cash_tickets')
        .update({ admin_notes: newNotes })
        .eq('id', ticketId);

      if (error) throw error;

      addToast('Advisory note saved to ticket file.', 'success');
      setCashNoteInput('');
      if (selectedCashTicket?.id === ticketId) {
        setSelectedCashTicket(prev => ({ ...prev, admin_notes: newNotes }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSavingCashAction(false);
    }
  };

  // Mark Cash Ticket Funds as Cleared
  const handleCashFundsCleared = async (e, ticketId) => {
    e.preventDefault();
    if (!cashFundsRef.trim()) {
      addToast('Please enter the bank transfer / escrow clearance reference ID.', 'error');
      return;
    }
    setSavingCashAction(true);
    try {
      const clearedAt = new Date().toISOString();
      const { error } = await supabase
        .from('cash_tickets')
        .update({
          funds_transfer_ref: cashFundsRef,
          funds_cleared_at: clearedAt,
          status: 'Funds_Cleared'
        })
        .eq('id', ticketId);

      if (error) throw error;

      addToast('Funds marked as Cleared & Verified!', 'success');
      setCashFundsRef('');
      if (selectedCashTicket?.id === ticketId) {
        setSelectedCashTicket(prev => ({
          ...prev,
          funds_transfer_ref: cashFundsRef,
          funds_cleared_at: clearedAt,
          status: 'Funds_Cleared'
        }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to record funds clearance', 'error');
    } finally {
      setSavingCashAction(false);
    }
  };

  // Admin Manually Creates Cash Consultation Ticket
  const handleCreateCashTicket = async (e) => {
    e.preventDefault();
    if (!adminTicketForm.investor_id || !adminTicketForm.target_project_id || !adminTicketForm.ticket_amount_bdt) {
      addToast('Investor, Project Target, and Ticket Amount are required.', 'error');
      return;
    }
    setSavingCashAction(true);
    try {
      const inv = allInvestors.find(i => i.id === adminTicketForm.investor_id);
      
      const payload = {
        investor_id: adminTicketForm.investor_id,
        target_project_id: adminTicketForm.target_project_id,
        ticket_amount_bdt: Number(adminTicketForm.ticket_amount_bdt),
        preferred_meeting_time: adminTicketForm.preferred_meeting_time || 'Weekday Afternoon',
        meeting_format: adminTicketForm.meeting_format || 'In_Person',
        admin_notes: adminTicketForm.admin_notes ? `[Admin Created] ${adminTicketForm.admin_notes}` : '[Admin Created Ticket]',
        kam_id: inv?.assigned_kam_id || null,
        created_by_admin: true,
        status: 'Pending_Review'
      };

      const { error } = await supabase.from('cash_tickets').insert([payload]);
      if (error) throw error;

      addToast('New OTC Cash Ticket logged successfully!', 'success');
      setAdminTicketForm({
        investor_id: '', target_project_id: '', ticket_amount_bdt: '', preferred_meeting_time: 'Weekday Afternoon', meeting_format: 'In_Person', admin_notes: ''
      });
      setCashSubTab('pipeline');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to create cash ticket', 'error');
    } finally {
      setSavingCashAction(false);
    }
  };

  // Push Cash Notification via Telegram
  const handlePushCashTelegramNotif = async (ticket, messageType) => {
    setPushingCashTelegram(true);
    try {
      const res = await fetch('/api/send-cash-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.id, message_type: messageType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push Telegram update');

      if (data.sent_telegram) {
        addToast(`Sent Telegram push to ${ticket.investors?.alias_name}!`, 'success');
      } else {
        addToast(`Notification logged in portal (${data.has_telegram_id ? 'Telegram push failed' : 'No Telegram chat ID registered'}).`, 'info');
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to push Telegram notification', 'error');
    } finally {
      setPushingCashTelegram(false);
    }
  };

  // Payout Clear Handler
  const handleClearPayout = async (payoutId, promoterUserId) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Cleared', cleared_at: new Date().toISOString() })
        .eq('id', payoutId);
      if (error) throw error;
      addToast('Payout marked as cleared.', 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Error clearing payout.', 'error');
    }
  };

  // Reject Payout Request Handler
  const handleRejectPayout = async (payoutId) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Rejected' })
        .eq('id', payoutId);
      if (error) throw error;
      addToast('Payout request rejected.', 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to reject payout', 'error');
    }
  };

  // Add New Team Member (Admin, Manager, KAM, Promoter, Support & BackOps)
  const handleAddKam = async (e) => {
    e.preventDefault();
    if (!kamForm.full_name || !kamForm.phone) {
      addToast('Full Name and Phone Number are required to onboard a Team Member.', 'error');
      return;
    }
    setSavingTeamAction(true);
    try {
      const payload = {
        full_name: kamForm.full_name,
        phone: kamForm.phone,
        email: kamForm.email || null,
        team_type: kamForm.team_type || 'kam',
        designation: kamForm.designation || kamForm.title || 'Team Member',
        region: kamForm.region || 'Dhaka HQ',
        joined_at: kamForm.joined_at || new Date().toISOString().slice(0, 10),
        is_active: true
      };

      const { data, error } = await supabase.from('team').insert([payload]).select().single();
      if (error) throw error;

      addToast(`Team Member '${kamForm.full_name}' pre-registered! Ask them to send /start to @gro10xmanbot.`, 'success');
      setKamForm({ full_name: '', team_type: 'kam', designation: 'Managing Partner', title: 'Managing Partner', region: 'Dhaka HQ', email: '', phone: '', joined_at: new Date().toISOString().slice(0, 10) });
      setShowKamForm(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to add Team Member', 'error');
    } finally {
      setSavingTeamAction(false);
    }
  };

  // Toggle KAM Active Status
  const handleToggleKamActive = async (kamId, currentActive) => {
    try {
      const { error } = await supabase
        .from('team')
        .update({ is_active: !currentActive })
        .eq('id', kamId);

      if (error) throw error;
      addToast(`Managing Partner status updated to ${!currentActive ? 'Active' : 'Inactive'}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update KAM status', 'error');
    }
  };

  // Add New Promoter
  const handleAddPromoter = async (e) => {
    e.preventDefault();
    if (!promoterForm.full_name || !promoterForm.alias_name) {
      addToast('Full Name and Alias Name are required for Promoters.', 'error');
      return;
    }
    setSavingTeamAction(true);
    try {
      // Auto-generate unique referral code: GRO-{ALIAS_INITIALS}-{RANDOM_4}
      const initials = promoterForm.alias_name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PROM';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const referralCode = `GRO-${initials}-${randomNum}`;

      const payload = {
        full_name: promoterForm.full_name,
        alias_name: promoterForm.alias_name,
        phone: promoterForm.phone || null,
        email: promoterForm.email || null,
        team_type: 'promoter',
        designation: 'Growth Promoter',
        referral_code: referralCode,
        tier: promoterForm.tier || 'Trainee',
        joined_at: promoterForm.joined_at || new Date().toISOString().slice(0, 10),
        can_promote_deals: (promoterForm.tier && promoterForm.tier !== 'Trainee'),
        is_active: true,
        telegram_onboarded: false
      };

      const { data, error } = await supabase.from('team').insert([payload]).select().single();
      if (error) throw error;

      addToast(`Promoter onboarded! Code: ${referralCode}. Direct them to GRO10X Telegram Bot to complete onboarding.`, 'success');
      setPromoterForm({ full_name: '', alias_name: '', phone: '', email: '', tier: 'Trainee', joined_at: new Date().toISOString().slice(0, 10) });
      setShowPromoterForm(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to add promoter', 'error');
    } finally {
      setSavingTeamAction(false);
    }
  };

  // Toggle Promoter Deal Promotion Permission
  const handleTogglePromoterDeals = async (promoterId, currentCanPromote, currentTier) => {
    if (currentTier === 'Trainee' && !currentCanPromote) {
      addToast('Promoters in Trainee tier must collect 50 leads to reach Junior Associate before deal promotion access is unlocked.', 'alert');
      return;
    }
    try {
      const { error } = await supabase
        .from('team')
        .update({ can_promote_deals: !currentCanPromote })
        .eq('id', promoterId);

      if (error) throw error;
      addToast(`Deal promotion access ${!currentCanPromote ? 'granted' : 'revoked'}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update deal permission', 'error');
    }
  };

  // Toggle Promoter Active Status
  const handleTogglePromoterActive = async (promoterId, currentActive) => {
    try {
      const { error } = await supabase
        .from('team')
        .update({ is_active: !currentActive })
        .eq('id', promoterId);

      if (error) throw error;
      addToast(`Promoter status updated to ${!currentActive ? 'Active' : 'Inactive'}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update promoter status', 'error');
    }
  };

  // Manual Promoter Tier Override
  const handlePromoterTierOverride = async (promoterId, newTier) => {
    try {
      const updates = { tier: newTier };
      if (newTier !== 'Trainee') {
        updates.can_promote_deals = true;
      }
      const { error } = await supabase
        .from('team')
        .update(updates)
        .eq('id', promoterId);

      if (error) throw error;
      addToast(`Promoter tier updated to ${newTier.replace('_', ' ')}.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update promoter tier', 'error');
    }
  };

  // Auto-Scan & Upgrade Promoter Tiers Based on Milestones
  const handleAutoCheckPromoterTiers = async () => {
    setSavingTeamAction(true);
    let upgradedCount = 0;
    try {
      for (const p of allPromoters) {
        const pLeads = promoterLeads.filter(l => l.promoter_id === p.id);
        const pInvs = activeInvestments.filter(inv => inv.investors?.origin_promoter_id === p.id);
        const totalRaised = pInvs.reduce((sum, i) => sum + Number(i.amount_invested_bdt || 0), 0);
        const leadCount = pLeads.length;

        let targetTier = p.tier || 'Trainee';

        if (totalRaised >= 20000000) {
          targetTier = 'Elite';
        } else if (totalRaised >= 5000000) {
          targetTier = 'Senior_Associate';
        } else if (pInvs.length >= 1 || totalRaised > 0) {
          targetTier = 'Associate';
        } else if (leadCount >= 50) {
          targetTier = 'Junior_Associate';
        }

        if (targetTier !== p.tier) {
          const updates = { tier: targetTier, total_raised_bdt: totalRaised };
          if (targetTier !== 'Trainee') updates.can_promote_deals = true;

          await supabase.from('team').update(updates).eq('id', p.id);
          upgradedCount++;
        }
      }

      addToast(`Scanned all promoters. Upgraded ${upgradedCount} promoter(s) based on live milestones!`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to auto-check promoter tiers', 'error');
    } finally {
      setSavingTeamAction(false);
    }
  };

  // Legal Upload Handler
  const handleUploadLegalDoc = async (e, invId, investorId, investorUserId) => {
    e.preventDefault();
    if (!uploadDocUrl) return;
    try {
      const { error } = await supabase.from('legal_documents').insert([{
        investment_id: invId,
        investor_id: investorId,
        doc_url: uploadDocUrl,
        doc_type: uploadDocType
      }]);
      if (error) throw error;
      addToast('Legal document successfully issued.', 'success');
      setUploadDocUrl('');
      fetchAdminData();
    } catch (err) {
      addToast('Error uploading legal document.', 'error');
    }
  };

  // Assign KAM Handler
  const handleAssignKamToInvestor = async (investorId, kamId) => {
    try {
      const { error } = await supabase
        .from('investors')
        .update({ assigned_kam_id: kamId || null })
        .eq('id', investorId);
      if (error) throw error;
      addToast('KAM assigned to investor.', 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to assign KAM.', 'error');
    }
  };

  // Add New Investor Handler
  const handleAddInvestor = async (e) => {
    e.preventDefault();
    if (!newInvestorForm.alias_name.trim()) {
      addToast('Investor alias name is required.', 'error');
      return;
    }
    setSavingInvestor(true);
    try {
      const payload = {
        alias_name: newInvestorForm.alias_name.trim(),
        phone: newInvestorForm.phone.trim() || null,
        email: newInvestorForm.email.trim() || null,
        investor_category: newInvestorForm.investor_category,
        requires_anonymity: newInvestorForm.requires_anonymity,
        origin_source: newInvestorForm.origin_source,
        origin_promoter_id: newInvestorForm.origin_promoter_id || null,
        referral_code_used: newInvestorForm.referral_code_used.trim() || null,
        onboarding_status: newInvestorForm.onboarding_status,
        kyc_level: 1,
        kyc_verified: false
      };

      const { error } = await supabase.from('investors').insert([payload]);
      if (error) throw error;

      addToast(`Investor "${newInvestorForm.alias_name}" onboarded successfully!`, 'success');
      setShowAddInvestorModal(false);
      setNewInvestorForm({
        alias_name: '', phone: '', email: '',
        investor_category: 'HNI', requires_anonymity: false,
        origin_source: 'Admin', origin_promoter_id: '',
        referral_code_used: '', onboarding_status: 'Invited'
      });
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to add investor', 'error');
    } finally {
      setSavingInvestor(false);
    }
  };

  // Update Investor Status Handler
  const handleUpdateInvestorStatus = async (investorId, newStatus) => {
    try {
      const isVerified = ['KYC_L2', 'KYC_L3', 'Active', 'VIP'].includes(newStatus);
      const { error } = await supabase
        .from('investors')
        .update({ onboarding_status: newStatus, kyc_verified: isVerified })
        .eq('id', investorId);

      if (error) throw error;
      addToast(`Investor status updated to ${newStatus.replace('_', ' ')}`, 'success');
      if (selectedInvestor && selectedInvestor.id === investorId) {
        setSelectedInvestor(prev => ({ ...prev, onboarding_status: newStatus, kyc_verified: isVerified }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update investor status', 'error');
    }
  };

  // Toggle Anonymity Handler
  const handleToggleAnonymity = async (investorId, currentVal) => {
    try {
      const newVal = !currentVal;
      const { error } = await supabase
        .from('investors')
        .update({ requires_anonymity: newVal })
        .eq('id', investorId);

      if (error) throw error;
      addToast(`Privacy coverage ${newVal ? 'ENABLED (Alias Only)' : 'DISABLED'}`, 'success');
      if (selectedInvestor && selectedInvestor.id === investorId) {
        setSelectedInvestor(prev => ({ ...prev, requires_anonymity: newVal }));
      }
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update anonymity setting', 'error');
    }
  };

  // Save Investor Note Handler
  const handleSaveInvestorNote = async (e, investorId) => {
    e.preventDefault();
    if (!newNoteForm.content.trim()) return;
    setSavingNote(true);

    try {
      const payload = {
        investor_id: investorId,
        created_by_kam_id: null, // Admin note
        note_type: newNoteForm.note_type,
        content: newNoteForm.content.trim()
      };

      const { error } = await supabase.from('investor_notes').insert([payload]);
      if (error) throw error;

      addToast('KAM/Admin note logged.', 'success');
      setNewNoteForm({ note_type: 'General', content: '' });

      const { data: updatedNotes } = await supabase
        .from('investor_notes')
        .select(`*, kams(full_name)`)
        .order('created_at', { ascending: false });
      setAllInvestorNotes(updatedNotes || []);
    } catch (err) {
      addToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // Override Booking Status Handler
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('investment_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      addToast(`Booking status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to update booking status', 'error');
    }
  };

  // Assign KAM to Cohort Application
  const handleAssignKamToApp = async (appId, kamId) => {

    try {
      const { error } = await supabase
        .from('business_cohort_applications')
        .update({ 
          assigned_kam_id: kamId || null,
          status: kamId ? 'KAM_Assigned' : 'New_Submission'
        })
        .eq('id', appId);

      if (error) throw error;
      addToast('KAM assigned to cohort application', 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to assign KAM', 'error');
    }
  };

  // Save KAM Audit & Compute AI Health Score
  const handleSaveKamAudit = async (e, appId) => {
    e.preventDefault();
    try {
      // Calculate AI Health Score (0-100)
      const locScore = Number(kamAuditForm.kam_location_score || 4) * 10; // max 50 -> scale to 100
      const eqScore = Number(kamAuditForm.kam_equipment_score || 4) * 10;
      const finBonus = kamAuditForm.kam_financial_verification === 'Pass' ? 90 : kamAuditForm.kam_financial_verification === 'Partial' ? 65 : 40;
      const computedScore = Math.round((locScore * 0.25) + (eqScore * 0.25) + (finBonus * 0.5));

      const { error } = await supabase
        .from('business_cohort_applications')
        .update({
          kam_site_visit_date: kamAuditForm.kam_site_visit_date || new Date().toISOString().split('T')[0],
          kam_location_score: Number(kamAuditForm.kam_location_score),
          kam_equipment_score: Number(kamAuditForm.kam_equipment_score),
          kam_financial_verification: kamAuditForm.kam_financial_verification,
          kam_legal_doc_status: kamAuditForm.kam_legal_doc_status,
          kam_notes: kamAuditForm.kam_notes,
          ai_health_score: computedScore,
          status: 'Diligence_Complete'
        })
        .eq('id', appId);

      if (error) throw error;
      addToast(`KAM audit saved! Computed AI Health Score: ${computedScore}/100`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save KAM audit', 'error');
    }
  };

  // Reject Cohort Application
  const handleRejectApp = async (appId) => {
    if (!rejectionReasonInput) {
      addToast('Please enter a rejection reason.', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('business_cohort_applications')
        .update({
          status: 'Rejected',
          rejection_reason: rejectionReasonInput
        })
        .eq('id', appId);

      if (error) throw error;
      addToast('Cohort application rejected', 'success');
      setRejectingAppId(null);
      setRejectionReasonInput('');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to reject application', 'error');
    }
  };

  // ONE-CLICK CONVERT COHORT APPLICATION TO DEAL PIPELINE CAMPAIGN
  const handleConvertCohortToDeal = async (app) => {
    setConvertingAppId(app.id);
    try {
      // 1. Create Founder
      const { data: fData, error: fErr } = await supabase
        .from('founders')
        .insert([{
          full_name: app.lead_founder_name,
          linkedin_url: app.lead_founder_linkedin_url,
          track_record_score: app.ai_health_score || 85
        }])
        .select()
        .single();

      if (fErr) throw fErr;

      // 2. Create Business
      const { data: bzData, error: bzErr } = await supabase
        .from('businesses')
        .insert([{
          founder_id: fData.id,
          brand_name: app.brand_name,
          company_legal_name: app.company_legal_name,
          company_registration_number: app.company_registration_number,
          headquarters_address: app.headquarters_address,
          website_url: app.website_url,
          industry_sector: app.industry_sector,
          operational_months: Number(app.operational_months || 12),
          ai_health_score: app.ai_health_score || 85,
          is_enlisted: true,
          source_application_id: app.id
        }])
        .select()
        .single();

      if (bzErr) throw bzErr;

      // 3. Link Stakeholders to Business
      const appStks = allAppStakeholders.filter(s => s.application_id === app.id);
      if (appStks.length > 0) {
        await supabase
          .from('business_stakeholders')
          .update({ business_id: bzData.id })
          .eq('application_id', app.id);
      }

      // 4. Create Funding Project in Deal Pipeline at "Origination" Stage
      const { data: projData, error: projErr } = await supabase
        .from('funding_projects')
        .insert([{
          business_id: bzData.id,
          project_title: `${app.brand_name} — Expansion Round`,
          funding_type: app.preferred_funding_type || 'Franchise',
          target_raise_bdt: Number(app.requested_funding_bdt),
          amount_raised_bdt: 0,
          spv_name: app.company_legal_name ? `${app.company_legal_name} SPV` : `${app.brand_name} SPV Ltd`,
          status: 'Origination',
          description: app.pitch_text || `Structured SME expansion campaign for ${app.brand_name}.`,
          show_on_showcase: true,
          kam_id: app.assigned_kam_id || null,
          location_address: app.headquarters_address || '',
          source_application_id: app.id
        }])
        .select()
        .single();

      if (projErr) throw projErr;

      // 5. Update Application Status
      await supabase
        .from('business_cohort_applications')
        .update({
          status: 'Onboarded_To_Pipeline',
          converted_business_id: bzData.id,
          converted_project_id: projData.id
        })
        .eq('id', app.id);

      addToast(`🚀 Onboarded "${app.brand_name}" to Deal Pipeline!`, 'success');
      setConvertingAppId(null);
      setSelectedApplication(null);
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to convert cohort application', 'error');
      setConvertingAppId(null);
    }
  };

  if (loading || authLoading) {

    return (
      <div style={{ background: '#070a14', color: '#D4AF37', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ef4444', marginBottom: '1rem' }}>RESTRICTED AREA</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', textAlign: 'center', maxWidth: '600px' }}>
          You do not have the required clearance to access the Master Command Center. This terminal requires `admin` privileges.
        </p>
        <a href="/" style={{ marginTop: '2rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '0.8rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700' }}>
          Return to Public Portal
        </a>
      </div>
    );
  }

  // Calculated Metrics
  const totalAumRaised = activeInvestments.reduce((sum, i) => sum + Number(i.amount_invested_bdt || 0), 0);
  const activeInvestorsCount = allInvestors.filter(i => i.kyc_verified).length;
  const activeProjectsCount = projects.filter(p => ['Active', 'Trading', 'Funding'].includes(p.status)).length;
  const totalYieldDisbursed = yieldDisbursements.reduce((sum, y) => sum + Number(y.total_disbursed_bdt || 0), 0);
  const totalFeeSpreadCaptured = projects.reduce((sum, p) => sum + (Number(p.target_raise_bdt) * 0.05), 0);

  const pendingKycCount = kycSubmissions.filter(s => s.status === 'Pending').length;
  const pendingPaymentsCount = paymentSubmissions.filter(s => s.investment_bookings?.status === 'Proof_Submitted').length;
  const pendingLeadsCount = inquiryLeads.filter(l => l.status === 'New').length;
  const pendingCashTicketsCount = cashTickets.filter(t => t.status === 'Pending_Review').length;
  const pendingCohortCount = cohortApplications.filter(a => ['New_Submission', 'Under_Director_Review', 'KAM_Assigned', 'Diligence_In_Progress'].includes(a.status)).length;

  // Global Search Items Computation
  const searchResults = globalSearchQuery.trim() === '' ? [] : [
    ...allInvestors.filter(i => (i.alias_name || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (i.phone || '').includes(globalSearchQuery) || (i.email || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3).map(i => ({ type: 'Investor', title: i.alias_name || 'Investor', sub: i.phone || i.email || 'KYC User', tab: 'investors', item: i })),
    ...projects.filter(p => (p.project_title || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (p.businesses?.brand_name || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3).map(p => ({ type: 'Project', title: p.project_title, sub: p.businesses?.brand_name || 'Deal', tab: 'kanban', item: p })),
    ...inquiryLeads.filter(l => (l.name || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (l.phone || '').includes(globalSearchQuery)).slice(0, 3).map(l => ({ type: 'Lead', title: l.name, sub: l.phone || 'Inquiry Lead', tab: 'leads-marketing', item: l }))
  ];

  return (
    <div className="admin-shell">

      {/* ── SIDEBAR ── */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={user}
        signOut={signOut}
        currency={currency}
        totalFeeSpreadCaptured={totalFeeSpreadCaptured}
        pendingCounts={{
          kycPayments: pendingKycCount + pendingPaymentsCount,
          cohort: pendingCohortCount,
          leads: pendingLeadsCount,
        }}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">

        {/* HEADER */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currency={currency}
          setCurrency={setCurrency}
          searchResults={searchResults}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          onAddProject={() => handleOpenProjectModal()}
        />

        {/* ---------------------------------------------------- */}
        {/* TAB 1: COMMAND CENTER (dashboard) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* ZONE 1: KPI STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total AUM Raised</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>{formatCurrency(totalAumRaised, currency)}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Active CapEx</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Active Investors</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>{activeInvestorsCount}</h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>KYC Verified</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Active Projects</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{activeProjectsCount}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>In Pipeline/Trading</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Yield Disbursed</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#8b5cf6', margin: 0 }}>{formatCurrency(totalYieldDisbursed, currency)}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>All-Time Ledger</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Platform Revenue (5%)</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>{formatCurrency(totalFeeSpreadCaptured, currency)}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Deal Fee Spread</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>New Leads</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ec4899', margin: 0 }}>{inquiryLeads.length}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Via LeadBot</span>
              </div>
            </div>

            {/* ZONE 2 & 3: MAIN GRID (HEALTH GRID + PENDING ACTIONS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>
              
              {/* ZONE 3: ACTIVE PROJECT HEALTH GRID */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Active Campaign Health</h3>
                  <button onClick={() => setActiveTab('kanban')} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    View All in Pipeline <ChevronRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {projects.slice(0, 4).map(p => {
                    const raised = Number(p.amount_raised_bdt || 0);
                    const target = Number(p.target_raise_bdt || 1);
                    const pct = Math.min(100, Math.round((raised / target) * 100));

                    return (
                      <div key={p.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 'bold' }}>{p.businesses?.brand_name || 'GRO10X Hub'}</span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0.2rem 0 0 0' }}>{p.project_title}</h4>
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: p.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)', color: p.status === 'Active' ? '#10b981' : '#D4AF37', fontWeight: 'bold' }}>
                            {p.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <span style={{ color: '#94a3b8' }}>Funding Progress</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{pct}% ({formatCurrency(raised, currency)})</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)' }}></div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          <span>SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</strong></span>
                          <span>KAM: <strong style={{ color: '#fff' }}>{allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned'}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ZONE 2: PENDING ACTION QUEUE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>⚡ Pending Action Alerts</h3>

                <div 
                  onClick={() => { setActiveTab('investors'); setInvestorSubTab('kyc'); }}
                  style={{ background: pendingKycCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: pendingKycCount > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShieldCheck style={{ color: pendingKycCount > 0 ? '#ef4444' : '#10b981' }} size={24} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>KYC Clearance Queue</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{pendingKycCount} identity verification pending</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>

                <div 
                  onClick={() => { setActiveTab('investors'); setInvestorSubTab('payments'); }}
                  style={{ background: pendingPaymentsCount > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)', border: pendingPaymentsCount > 0 ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <DollarSign style={{ color: pendingPaymentsCount > 0 ? '#D4AF37' : '#10b981' }} size={24} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>Payment Clearances</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{pendingPaymentsCount} bank proof awaiting review</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('leads-marketing')}
                  style={{ background: pendingLeadsCount > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', border: pendingLeadsCount > 0 ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <MessageSquare style={{ color: pendingLeadsCount > 0 ? '#3b82f6' : '#10b981' }} size={24} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>Inquiry Lead Queue</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{pendingLeadsCount} new website leads</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('cash-pipeline')}
                  style={{ background: pendingCashTicketsCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', border: pendingCashTicketsCount > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ArrowUpRight style={{ color: pendingCashTicketsCount > 0 ? '#f59e0b' : '#10b981' }} size={24} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>Cash Concierge Tickets</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{pendingCashTicketsCount} confidential inquiries</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>

              </div>

            </div>

            {/* ZONE 4: RECENT PLATFORM ACTIVITY FEED */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Platform Activity Feed</h3>
              
              {recentNotifications.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent platform activity logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentNotifications.slice(0, 6).map(n => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '0.85rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: n.type === 'success' ? '#10b981' : '#3b82f6' }}></span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{n.title}</p>
                        <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{n.message}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleOpenProjectModal()} className="btn-gold" style={{ flex: 1, padding: '0.9rem', justifyContent: 'center' }}>
                <PlusCircle size={18} /> Onboard New Project
              </button>
              <button onClick={() => setActiveTab('dividend')} style={{ flex: 1, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', padding: '0.9rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Declare Monthly Yield
              </button>
              <button onClick={() => { setActiveTab('investors'); setInvestorSubTab('kyc'); }} style={{ flex: 1, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.9rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Review KYC Queue ({pendingKycCount})
              </button>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: DEAL PIPELINE (kanban) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'kanban' && (
          <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* VIEW MODE TOGGLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#0f172a', padding: '0.3rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setPipelineView('kanban')} 
                  style={{ background: pipelineView === 'kanban' ? '#D4AF37' : 'transparent', color: pipelineView === 'kanban' ? '#000' : '#94a3b8', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Kanban View
                </button>
                <button 
                  onClick={() => setPipelineView('table')} 
                  style={{ background: pipelineView === 'table' ? '#D4AF37' : 'transparent', color: pipelineView === 'table' ? '#000' : '#94a3b8', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Table View
                </button>
              </div>

              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Active Pipeline Projects: <strong>{projects.length}</strong></span>
            </div>

            {/* KANBAN BOARD */}
            {pipelineView === 'kanban' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'start' }}>
                {kanbanStages.map((stage) => {
                  const stageProjects = projects.filter(p => p.status === stage.id);
                  return (
                    <div key={stage.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.6rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#D4AF37', margin: 0 }}>{stage.title}</h4>
                        <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {stageProjects.length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stageProjects.length === 0 ? (
                          <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>No projects in stage</div>
                        ) : (
                          stageProjects.map((p) => {
                            const feeSpread = Number(p.target_raise_bdt) * 0.05;
                            const raised = Number(p.amount_raised_bdt || 0);
                            const target = Number(p.target_raise_bdt || 1);
                            const pct = Math.min(100, Math.round((raised / target) * 100));

                            // Per-project investors count
                            const projInvsCount = activeInvestments.filter(i => i.project_id === p.id).length;

                            // Next stage logic
                            let nextStage = null;
                            if (p.status === 'Origination') nextStage = 'Diligence';
                            else if (p.status === 'Diligence') nextStage = 'Funding';
                            else if (p.status === 'Funding') nextStage = 'Active';
                            else if (p.status === 'Active') nextStage = 'Closed';

                            return (
                              <div key={p.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: 'bold' }}>{p.businesses?.brand_name || 'GRO10X Hub'}</span>
                                    {p.show_on_showcase && <span style={{ fontSize: '0.6rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Live</span>}
                                  </div>
                                  <p style={{ fontWeight: '700', margin: '0.1rem 0 0.2rem 0', fontSize: '0.9rem', color: '#f8fafc' }}>{p.project_title}</p>
                                  {p.location_address && (
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                      <MapPin size={12} style={{ color: '#D4AF37' }} /> {p.location_address}
                                    </p>
                                  )}
                                </div>

                                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>CapEx:</span>
                                    <span style={{ fontWeight: '700' }}>{formatCurrency(p.target_raise_bdt, currency)}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Raised:</span>
                                    <span style={{ color: '#10b981', fontWeight: '700' }}>{pct}% ({formatCurrency(raised, currency)})</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Yield Rates:</span>
                                    <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{p.yield_option_1_rate || 10}% / {p.yield_option_2_rate || 12}% / {p.yield_option_3_rate || 35}%</span>
                                  </div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span>SPV: <strong style={{ color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured ⚠'}</strong></span>
                                  <span>KAM: <strong style={{ color: '#fff' }}>{allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned ⚠'}</strong></span>
                                  {p.expected_close_date && <span>Close Target: <strong style={{ color: '#f59e0b' }}>{p.expected_close_date}</strong></span>}
                                </div>

                                {/* CARD ACTION BUTTONS */}
                                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                                  <button 
                                    onClick={() => handleOpenProjectModal(p)} 
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    ✏ Edit
                                  </button>

                                  <button 
                                    onClick={() => setSelectedProjectForInvestors(p)} 
                                    style={{ flex: 1, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    👥 ({projInvsCount})
                                  </button>

                                  {nextStage && (
                                    <button 
                                      onClick={() => setAdvanceModal({ open: true, project: p, targetStage: nextStage })}
                                      style={{ flex: 1, background: '#D4AF37', color: '#000', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                      → {nextStage}
                                    </button>
                                  )}
                                </div>

                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="glass-card">
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '0.75rem' }}>Project Title</th>
                      <th style={{ padding: '0.75rem' }}>Brand & Location</th>
                      <th style={{ padding: '0.75rem' }}>Stage</th>
                      <th style={{ padding: '0.75rem' }}>Target CapEx</th>
                      <th style={{ padding: '0.75rem' }}>Amount Raised</th>
                      <th style={{ padding: '0.75rem' }}>SPV Legal Entity</th>
                      <th style={{ padding: '0.75rem' }}>Assigned KAM</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{p.project_title}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ color: '#D4AF37', fontWeight: 'bold', display: 'block' }}>{p.businesses?.brand_name || 'N/A'}</span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.location_address || 'Address unlisted'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{formatCurrency(p.target_raise_bdt, currency)}</td>
                        <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(p.amount_raised_bdt || 0, currency)}</td>
                        <td style={{ padding: '0.75rem', color: p.spv_name ? '#fff' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</td>
                        <td style={{ padding: '0.75rem' }}>{allKams.find(k => k.id === p.kam_id)?.full_name || 'Unassigned'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button onClick={() => handleOpenProjectModal(p)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.34rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            Edit Project
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: BUSINESS REGISTRY (business-registry) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'business-registry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* TOP BAR: SEARCH & FILTER TABS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {['All', 'New_Submission', 'KAM_Assigned', 'Diligence_Complete', 'Onboarded_To_Pipeline', 'Rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => setAppFilterStatus(st)}
                    style={{
                      background: appFilterStatus === st ? '#D4AF37' : 'rgba(15,23,42,0.8)',
                      color: appFilterStatus === st ? '#000' : '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                <Search size={16} style={{ color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Search brand, founder, ref code..."
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* APPLICATIONS LIST TABLE */}
            <div className="glass-card">
              {cohortApplications.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Building2 size={48} style={{ color: '#D4AF37', margin: '0 auto 1rem auto', opacity: 0.6 }} />
                  <h3>No Cohort Applications Found</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Founders applying via `/apply` will appear here in real-time.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '0.85rem' }}>Ref Code</th>
                      <th style={{ padding: '0.85rem' }}>Brand & Sector</th>
                      <th style={{ padding: '0.85rem' }}>Lead Founder</th>
                      <th style={{ padding: '0.85rem' }}>Capital Ask</th>
                      <th style={{ padding: '0.85rem' }}>Status</th>
                      <th style={{ padding: '0.85rem' }}>Assigned KAM</th>
                      <th style={{ padding: '0.85rem' }}>Health Score</th>
                      <th style={{ padding: '0.85rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortApplications
                      .filter(a => appFilterStatus === 'All' || a.status === appFilterStatus)
                      .filter(a => !appSearchQuery || a.brand_name.toLowerCase().includes(appSearchQuery.toLowerCase()) || a.ref_code.toLowerCase().includes(appSearchQuery.toLowerCase()) || a.lead_founder_name.toLowerCase().includes(appSearchQuery.toLowerCase()))
                      .map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: '#D4AF37', fontWeight: 'bold' }}>{app.ref_code}</td>
                          <td style={{ padding: '0.85rem' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', color: '#fff' }}>{app.brand_name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{app.industry_sector} ({app.outlet_count} outlets)</span>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span style={{ fontWeight: '600', display: 'block' }}>{app.lead_founder_name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{app.lead_founder_phone}</span>
                          </td>
                          <td style={{ padding: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>
                            {formatCurrency(app.requested_funding_bdt, currency)}
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>{app.preferred_funding_type}</span>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span style={{
                              background: app.status === 'Onboarded_To_Pipeline' ? 'rgba(16,185,129,0.15)' : app.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)',
                              color: app.status === 'Onboarded_To_Pipeline' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#D4AF37',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {app.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <select 
                              value={app.assigned_kam_id || ''} 
                              onChange={(e) => handleAssignKamToApp(app.id, e.target.value)}
                              style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                              <option value="">-- Assign KAM --</option>
                              {allKams.map(k => (
                                <option key={k.id} value={k.id}>{k.full_name}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span style={{ fontWeight: '800', color: app.ai_health_score >= 75 ? '#10b981' : app.ai_health_score >= 50 ? '#D4AF37' : '#ef4444' }}>
                              {app.ai_health_score || 0}/100
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <button 
                              onClick={() => {
                                setSelectedApplication(app);
                                setAppDrawerSubTab('brand');
                                setKamAuditForm({
                                  kam_site_visit_date: app.kam_site_visit_date || '',
                                  kam_location_score: app.kam_location_score || 4,
                                  kam_equipment_score: app.kam_equipment_score || 4,
                                  kam_financial_verification: app.kam_financial_verification || 'Pass',
                                  kam_legal_doc_status: app.kam_legal_doc_status || 'Verified',
                                  kam_notes: app.kam_notes || ''
                                });
                              }} 
                              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                            >
                              Inspect Drawer
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: INVESTOR HUB (investors) */}
        {/* ---------------------------------------------------- */}

        {activeTab === 'investors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KPI STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Investors</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>{allInvestors.length}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Platform Total</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>KYC Verified (Active+)</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                  {allInvestors.filter(i => i.kyc_verified || ['KYC_L2','KYC_L3','Active','VIP'].includes(i.onboarding_status)).length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Clearance Passed</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total AUM Raised</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                  {formatCurrency(totalAumRaised, currency)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Settled Capital</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>KYC Queue</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: pendingKycCount > 0 ? '#ef4444' : '#10b981', margin: 0 }}>{pendingKycCount}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Awaiting Review</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Payment Queue</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: pendingPaymentsCount > 0 ? '#f59e0b' : '#10b981', margin: 0 }}>{pendingPaymentsCount}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Proof Clearance</span>
              </div>
            </div>

            {/* 4 SUB-TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
              <button 
                onClick={() => setInvestorSubTab('all-investors')}
                style={{ background: 'transparent', border: 'none', borderBottom: investorSubTab === 'all-investors' ? '2px solid #D4AF37' : '2px solid transparent', color: investorSubTab === 'all-investors' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                All Investors ({allInvestors.length})
              </button>
              <button 
                onClick={() => setInvestorSubTab('bookings')}
                style={{ background: 'transparent', border: 'none', borderBottom: investorSubTab === 'bookings' ? '2px solid #D4AF37' : '2px solid transparent', color: investorSubTab === 'bookings' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Investment Bookings ({allBookings.length})
                {allBookings.filter(b => b.status === 'Proof_Submitted').length > 0 && (
                  <span style={{ background: '#3b82f6', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                    {allBookings.filter(b => b.status === 'Proof_Submitted').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setInvestorSubTab('kyc')}
                style={{ background: 'transparent', border: 'none', borderBottom: investorSubTab === 'kyc' ? '2px solid #D4AF37' : '2px solid transparent', color: investorSubTab === 'kyc' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                KYC Clearance Queue
                {pendingKycCount > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>{pendingKycCount}</span>}
              </button>
              <button 
                onClick={() => setInvestorSubTab('payments')}
                style={{ background: 'transparent', border: 'none', borderBottom: investorSubTab === 'payments' ? '2px solid #D4AF37' : '2px solid transparent', color: investorSubTab === 'payments' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Payment Clearance Queue
                {pendingPaymentsCount > 0 && <span style={{ background: '#D4AF37', color: '#000', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>{pendingPaymentsCount}</span>}
              </button>
            </div>

            {/* SUB-TAB 1: ALL INVESTORS */}
            {investorSubTab === 'all-investors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* FILTER & CONTROL BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  
                  <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input 
                        type="text"
                        placeholder="Search investor alias or contact..."
                        value={investorSearch}
                        onChange={(e) => setInvestorSearch(e.target.value)}
                        style={{ width: '100%', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* Status Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status:</span>
                      <select 
                        value={investorStatusFilter}
                        onChange={(e) => setInvestorStatusFilter(e.target.value)}
                        style={{ background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}
                      >
                        <option value="All">All Lifecycle Statuses</option>
                        <option value="Invited">Invited</option>
                        <option value="Telegram_Verified">Telegram Verified</option>
                        <option value="KYC_L1">KYC Level 1</option>
                        <option value="KYC_L2">KYC Level 2</option>
                        <option value="KYC_L3">KYC Level 3</option>
                        <option value="Active">Active Investor</option>
                        <option value="VIP">VIP Investor</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Investor Button */}
                  <button 
                    onClick={() => setShowAddInvestorModal(true)} 
                    className="btn-gold" 
                    style={{ padding: '0.65rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
                  >
                    <PlusCircle size={18} /> Onboard Investor
                  </button>
                </div>

                {/* TABLE */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Investor Alias</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Lifecycle Status</th>
                        <th style={{ padding: '0.85rem 1rem' }}>KYC Level</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Total Invested</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Origin Source</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Assigned KAM</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allInvestors
                        .filter(inv => {
                          const matchesSearch = !investorSearch || 
                            (inv.alias_name && inv.alias_name.toLowerCase().includes(investorSearch.toLowerCase())) ||
                            (inv.phone && inv.phone.includes(investorSearch)) ||
                            (inv.email && inv.email.toLowerCase().includes(investorSearch.toLowerCase()));
                          const matchesStatus = investorStatusFilter === 'All' || (inv.onboarding_status || 'Invited') === investorStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map(inv => {
                          const invInvestments = activeInvestments.filter(i => i.investor_id === inv.id);
                          const totalInvAmt = invInvestments.reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                          const status = inv.onboarding_status || (inv.kyc_verified ? 'Active' : 'Invited');

                          return (
                            <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              
                              {/* Alias + Privacy Badge */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 'bold', color: '#D4AF37' }}>{inv.alias_name}</span>
                                  {inv.requires_anonymity && (
                                    <span title="Privacy Coverage Enabled (Alias Only)" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                      <Lock size={10} /> Anon
                                    </span>
                                  )}
                                </div>
                                {!inv.requires_anonymity && (inv.phone || inv.email) && (
                                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                    {inv.phone} {inv.email ? `| ${inv.email}` : ''}
                                  </p>
                                )}
                              </td>

                              {/* Category */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                  {inv.investor_category || 'HNI'}
                                </span>
                              </td>

                              {/* Lifecycle Status Pill */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{
                                  background: ['Active','VIP'].includes(status) ? 'rgba(16,185,129,0.15)' : ['KYC_L2','KYC_L3'].includes(status) ? 'rgba(59,130,246,0.15)' : 'rgba(212,175,55,0.15)',
                                  color: ['Active','VIP'].includes(status) ? '#10b981' : ['KYC_L2','KYC_L3'].includes(status) ? '#3b82f6' : '#D4AF37',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  {status.replace(/_/g, ' ')}
                                </span>
                              </td>

                              {/* KYC Level */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ color: inv.kyc_verified ? '#10b981' : '#94a3b8', fontWeight: 'bold' }}>
                                  Level {inv.kyc_level || 1}
                                </span>
                              </td>

                              {/* Total Invested */}
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: totalInvAmt > 0 ? '#10b981' : '#64748b' }}>
                                {formatCurrency(totalInvAmt, currency)}
                              </td>

                              {/* Origin Source */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                {inv.origin_source === 'Promoter' || inv.promoters?.full_name || inv.promoters?.alias_name ? (
                                  <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    Promoter: {inv.promoters?.alias_name || inv.promoters?.full_name || 'Tagged'}
                                  </span>
                                ) : inv.origin_source === 'Public_Page' ? (
                                  <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    Public Web Lead
                                  </span>
                                ) : (
                                  <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                                    Direct Admin
                                  </span>
                                )}
                              </td>

                              {/* Assigned KAM */}
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <select 
                                  value={inv.assigned_kam_id || ''} 
                                  onChange={(e) => handleAssignKamToInvestor(inv.id, e.target.value)}
                                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.35rem', borderRadius: '4px', fontSize: '0.8rem' }}
                                >
                                  <option value="">-- Unassigned --</option>
                                  {allKams.map(k => (
                                    <option key={k.id} value={k.id}>{k.full_name}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Action */}
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <button 
                                  onClick={() => {
                                    setSelectedInvestor(inv);
                                    setInvestorDrawerTab('profile');
                                  }} 
                                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                >
                                  Inspect Profile
                                </button>
                              </td>

                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: BOOKINGS QUEUE */}
            {investorSubTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Status Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#0f172a', padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
                  {['All', 'Pending_Proof', 'Proof_Submitted', 'Approved', 'Rejected'].map(st => (
                    <button 
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      style={{
                        background: bookingStatusFilter === st ? '#D4AF37' : 'transparent',
                        color: bookingStatusFilter === st ? '#000' : '#94a3b8',
                        border: 'none',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="glass-card">
                  {allBookings.filter(b => bookingStatusFilter === 'All' || b.status === bookingStatusFilter).length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      No investment bookings found for this filter.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                          <th style={{ padding: '0.85rem 1rem' }}>Investor</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Target Campaign</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Booking Amount</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Yield Option</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings
                          .filter(b => bookingStatusFilter === 'All' || b.status === bookingStatusFilter)
                          .map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                {b.investors?.alias_name || 'Anonymous Investor'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ color: '#fff', fontWeight: '600' }}>{b.funding_projects?.businesses?.brand_name}</span> - {b.funding_projects?.project_title}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#10b981' }}>
                                {formatCurrency(b.amount_bdt, currency)}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                Option {b.yield_option}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                  {b.booking_type || 'Primary'}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <select 
                                  value={b.status}
                                  onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                  style={{
                                    background: b.status === 'Approved' ? 'rgba(16,185,129,0.2)' : b.status === 'Proof_Submitted' ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.8)',
                                    color: b.status === 'Approved' ? '#10b981' : b.status === 'Proof_Submitted' ? '#D4AF37' : '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '0.3rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  <option value="Pending_Proof">Pending Proof</option>
                                  <option value="Proof_Submitted">Proof Submitted</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>
                                {new Date(b.created_at).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                {b.status === 'Proof_Submitted' && (
                                  <button onClick={() => setInvestorSubTab('payments')} style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Review Proof →
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* SUB-TAB 3: KYC QUEUE */}
            {investorSubTab === 'kyc' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {kycSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.3rem' }}>All Clear!</h3>
                    <p style={{ color: '#94a3b8' }}>No pending KYC submissions await verification.</p>
                  </div>
                ) : (
                  kycSubmissions.map(sub => {
                    const isPending = sub.status === 'Pending';
                    return (
                      <div key={sub.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : sub.status === 'Approved' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isPending ? '#D4AF37' : '#94a3b8' }}>{sub.status}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                          </div>
                          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{sub.investors?.alias_name}</h4>
                          <p style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '1rem' }}>Requesting Clearance: Level {sub.target_level}</p>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                            {sub.target_level === 2 && (
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>NID Front</p>
                                  {sub.nid_front_url ? <a href={sub.nid_front_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>View NID Front Image</a> : 'N/A'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>NID Back</p>
                                  {sub.nid_back_url ? <a href={sub.nid_back_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>View NID Back Image</a> : 'N/A'}
                                </div>
                              </div>
                            )}
                            {sub.target_level === 3 && (
                              <div>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Source of Funds Declaration</p>
                                <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontStyle: 'italic' }}>"{sub.source_of_funds}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                          {isPending ? (
                            <>
                              <button onClick={() => handleKycReview(sub.id, sub.investor_id, sub.target_level, true)} style={{ background: '#10b981', color: '#000', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                                Approve Level {sub.target_level}
                              </button>
                              <button onClick={() => handleKycReview(sub.id, sub.investor_id, sub.target_level, false)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.85rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                                Reject Verification
                              </button>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center' }}>
                              <CheckCircle size={32} style={{ color: sub.status === 'Approved' ? '#10b981' : '#ef4444', margin: '0 auto 0.5rem auto' }} />
                              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Reviewed at {new Date(sub.reviewed_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SUB-TAB 4: PAYMENT QUEUE */}
            {investorSubTab === 'payments' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {paymentSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.3rem' }}>All Clear!</h3>
                    <p style={{ color: '#94a3b8' }}>No pending payment proofs await verification.</p>
                  </div>
                ) : (
                  paymentSubmissions.map(sub => {
                    const booking = sub.investment_bookings;
                    const isPending = booking?.status === 'Proof_Submitted';
                    
                    return (
                      <div key={sub.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : '4px solid #334155' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isPending ? '#D4AF37' : '#94a3b8' }}>{booking?.status.replace('_', ' ')}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                          </div>
                          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{booking?.investors?.alias_name}</h4>
                          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{booking?.funding_projects?.businesses?.brand_name} - {booking?.funding_projects?.project_title}</p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                            <div>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Amount</p>
                              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>{formatCurrency(booking?.amount_bdt, currency)}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Yield Option</p>
                              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>Option {booking?.yield_option}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Method & TXN ID</p>
                              <p style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{sub.payment_method} | <span style={{ fontFamily: 'monospace', color: '#D4AF37' }}>{sub.transaction_id}</span></p>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ flex: 1, background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {sub.screenshot_url ? (
                              <a href={sub.screenshot_url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                                <img src={sub.screenshot_url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                              </a>
                            ) : (
                              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No Proof Image Uploaded</p>
                            )}
                          </div>
                          
                          {isPending && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handlePaymentReview(sub.id, sub.booking_id, booking.investor_id, true)} style={{ flex: 1, background: '#10b981', color: '#000', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                Approve
                              </button>
                              <button onClick={() => handlePaymentReview(sub.id, sub.booking_id, booking.investor_id, false)} style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        )}

        {activeTab === 'dividend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KPI STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Batches Declared</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>{yieldDisbursements.length}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Completed Cycles</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>All-Time Distributed</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                  {formatCurrency(yieldDisbursements.reduce((acc, d) => acc + Number(d.total_disbursed_bdt || 0), 0), currency)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Credited Capital</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Payee Rows</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{allInvestorYields.length}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Investor Credits</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Unacknowledged</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: allInvestorYields.filter(y => !y.acknowledged).length > 0 ? '#f59e0b' : '#10b981', margin: 0 }}>
                  {allInvestorYields.filter(y => !y.acknowledged).length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Awaiting Telegram Confirmation</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>POS Reports on File</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#8b5cf6', margin: 0 }}>{allPosReports.length}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ingested Sales Files</span>
              </div>
            </div>

            {/* 3 SUB-TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
              <button 
                onClick={() => setYieldSubTab('declare')}
                style={{ background: 'transparent', border: 'none', borderBottom: yieldSubTab === 'declare' ? '2px solid #D4AF37' : '2px solid transparent', color: yieldSubTab === 'declare' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Declare Monthly Yield
              </button>
              <button 
                onClick={() => setYieldSubTab('ledger')}
                style={{ background: 'transparent', border: 'none', borderBottom: yieldSubTab === 'ledger' ? '2px solid #D4AF37' : '2px solid transparent', color: yieldSubTab === 'ledger' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Disbursement Ledger & Payouts ({yieldDisbursements.length})
              </button>
              <button 
                onClick={() => setYieldSubTab('pos-reports')}
                style={{ background: 'transparent', border: 'none', borderBottom: yieldSubTab === 'pos-reports' ? '2px solid #D4AF37' : '2px solid transparent', color: yieldSubTab === 'pos-reports' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                POS Sales Reports & Ingestion ({allPosReports.length})
              </button>
            </div>

            {/* SUB-TAB 1: DECLARE YIELD */}
            {yieldSubTab === 'declare' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '1.5rem' }}>
                
                {/* FORM PANEL */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37' }}>
                    <TrendingUp size={22} /> Declare Yield Batch
                  </h3>

                  <form onSubmit={handleDistributeYield} style={{ display: 'grid', gap: '1.1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Project Campaign</label>
                      <select 
                        value={dividendProjectId}
                        onChange={(e) => setDividendProjectId(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                        required
                      >
                        <option value="">-- Choose Active Campaign --</option>
                        {projects.filter(p => ['Trading', 'Active', 'Origination', 'Funding'].includes(p.status)).map(p => (
                          <option key={p.id} value={p.id}>{p.project_title}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Operating Month</label>
                        <select 
                          value={dividendMonth}
                          onChange={(e) => setDividendMonth(e.target.value)}
                          style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                          required
                        >
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Year</label>
                        <input 
                          type="number" 
                          value={dividendYear}
                          onChange={(e) => setDividendYear(e.target.value)}
                          style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handlePullPosData} 
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.65rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <RefreshCw size={16} /> Pull Sales Data from POS Record
                    </button>

                    {posSyncStatus && (
                      <div style={{ padding: '0.65rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {posSyncStatus}
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Gross Sales (BDT)</label>
                      <input 
                        type="number" 
                        value={grossSales}
                        onChange={(e) => setGrossSales(e.target.value)}
                        placeholder="e.g. 1800000"
                        style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Net Profit (BDT)</label>
                      <input 
                        type="number" 
                        value={netProfit}
                        onChange={(e) => setNetProfit(e.target.value)}
                        placeholder="e.g. 420000"
                        style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isDistributing}
                      style={{ background: 'linear-gradient(135deg, #D4AF37, #b89628)', color: '#000', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '0.95rem', cursor: isDistributing ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
                    >
                      {isDistributing ? 'Distributing...' : 'Declare & Allocate Yield Batch'}
                    </button>
                  </form>
                </div>

                {/* PREVIEW & PRE-DISTRIBUTION BREAKDOWN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Pool Preview Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 1 (10% Gross)</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {formatCurrency(grossSales ? Number(grossSales) * 0.10 : 0, currency)}
                      </h4>
                    </div>
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 2 (12% Gross)</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {formatCurrency(grossSales ? Number(grossSales) * 0.12 : 0, currency)}
                      </h4>
                    </div>
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 3 (35% Net)</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {formatCurrency(netProfit ? Number(netProfit) * 0.35 : 0, currency)}
                      </h4>
                    </div>
                  </div>

                  {/* Pre-Distribution Investor Table Preview */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '1rem' }}>
                      📋 Projected Investor Allocation Preview
                    </h4>
                    
                    {!dividendProjectId ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a campaign to preview individual investor yield shares.</p>
                    ) : (() => {
                      const proj = projects.find(p => p.id === dividendProjectId);
                      const projInvs = activeInvestments.filter(i => i.project_id === dividendProjectId);

                      if (projInvs.length === 0) {
                        return <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>No active investors settled for this campaign yet.</p>;
                      }

                      const r1 = Number(proj?.yield_option_1_rate || 10) / 100;
                      const r2 = Number(proj?.yield_option_2_rate || 12) / 100;
                      const r3 = Number(proj?.yield_option_3_rate || 35) / 100;

                      const p1 = Number(grossSales || 0) * r1;
                      const p2 = Number(grossSales || 0) * r2;
                      const p3 = Number(netProfit || 0) * r3;

                      const opt1Invs = projInvs.filter(i => Number(i.yield_option) === 1);
                      const opt2Invs = projInvs.filter(i => Number(i.yield_option) === 2);
                      const opt3Invs = projInvs.filter(i => Number(i.yield_option) === 3);

                      const sum1 = opt1Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
                      const sum2 = opt2Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);
                      const sum3 = opt3Invs.reduce((acc, i) => acc + Number(i.amount_invested_bdt), 0);

                      return (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.8rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                              <th style={{ padding: '0.5rem' }}>Investor</th>
                              <th style={{ padding: '0.5rem' }}>Option</th>
                              <th style={{ padding: '0.5rem' }}>Invested BDT</th>
                              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Projected Yield</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projInvs.map(inv => {
                              const opt = Number(inv.yield_option || 1);
                              let share = 0;
                              if (opt === 1 && sum1 > 0) share = (Number(inv.amount_invested_bdt) / sum1) * p1;
                              if (opt === 2 && sum2 > 0) share = (Number(inv.amount_invested_bdt) / sum2) * p2;
                              if (opt === 3 && sum3 > 0) share = (Number(inv.amount_invested_bdt) / sum3) * p3;

                              return (
                                <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#D4AF37' }}>{inv.investors?.alias_name}</td>
                                  <td style={{ padding: '0.5rem' }}>Option {opt}</td>
                                  <td style={{ padding: '0.5rem' }}>{formatCurrency(inv.amount_invested_bdt, currency)}</td>
                                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(Math.round(share), currency)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>

                </div>

              </div>
            )}

            {/* SUB-TAB 2: DISBURSEMENT LEDGER & DRILLDOWN */}
            {yieldSubTab === 'ledger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Ledger Table */}
                <div className="glass-card">
                  {yieldDisbursements.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No yield disbursement records declared yet.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                          <th style={{ padding: '0.85rem 1rem' }}>Operating Period</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Target Campaign</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Gross Sales</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Net Profit</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Total Distributed</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yieldDisbursements.map(disb => {
                          const status = disb.status || 'Draft';
                          const isSelected = selectedDisbursement?.id === disb.id;

                          return (
                            <React.Fragment key={disb.id}>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isSelected ? 'rgba(212,175,55,0.05)' : 'transparent' }}>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                  {disb.disbursement_month || `${disb.month} ${disb.year}`}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ color: '#fff', fontWeight: '600' }}>{disb.funding_projects?.businesses?.brand_name}</span> - {disb.funding_projects?.project_title}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>{formatCurrency(disb.gross_sales_bdt, currency)}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>{formatCurrency(disb.net_profit_bdt, currency)}</td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(disb.total_disbursed_bdt, currency)}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{
                                    background: status === 'Paid_Out' ? 'rgba(16,185,129,0.2)' : status === 'Finalised' ? 'rgba(59,130,246,0.2)' : 'rgba(212,175,55,0.2)',
                                    color: status === 'Paid_Out' ? '#10b981' : status === 'Finalised' ? '#3b82f6' : '#D4AF37',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {status}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedDisbursement(null);
                                        } else {
                                          setSelectedDisbursement(disb);
                                          setDisbPaymentForm({
                                            payment_txn_ref: disb.payment_txn_ref || '',
                                            payment_date: disb.payment_date || new Date().toISOString().split('T')[0],
                                            notes: disb.notes || ''
                                          });
                                        }
                                      }}
                                      style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                      {isSelected ? 'Hide Breakdown ▲' : 'Inspect Breakdown ▼'}
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadYieldCSV(disb)}
                                      style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                      title="Download Payout CSV Statement"
                                    >
                                      CSV 📥
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* DRILLDOWN PANEL */}
                              {isSelected && (
                                <tr>
                                  <td colSpan={7} style={{ background: '#070a14', padding: '1.5rem', borderBottom: '2px solid rgba(212,175,55,0.3)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                      
                                      {/* Header details */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>
                                          Per-Investor Allocation Ledger — {disb.disbursement_month || disb.month}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                          {status === 'Draft' && (
                                            <button 
                                              onClick={() => handleFinaliseDisbursement(disb.id)}
                                              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                              Mark as Finalised
                                            </button>
                                          )}
                                          <button 
                                            onClick={() => handlePushYieldToTelegram(disb.id)}
                                            disabled={pushingToTelegram}
                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                                          >
                                            {pushingToTelegram ? 'Pushing...' : '📲 Push Notifications to Investors via Telegram'}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Per-Investor Table */}
                                      <div style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                          <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                                              <th style={{ padding: '0.65rem 1rem' }}>Investor Alias</th>
                                              <th style={{ padding: '0.65rem 1rem' }}>Yield Option</th>
                                              <th style={{ padding: '0.65rem 1rem' }}>Yield Credited</th>
                                              <th style={{ padding: '0.65rem 1rem' }}>Telegram Chat ID</th>
                                              <th style={{ padding: '0.65rem 1rem' }}>Receipt Acknowledged</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {allInvestorYields.filter(y => y.disbursement_id === disb.id).map(y => (
                                              <tr key={y.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '0.65rem 1rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                                  {y.investors?.alias_name || 'Investor'}
                                                </td>
                                                <td style={{ padding: '0.65rem 1rem' }}>Option {y.yield_option || 1}</td>
                                                <td style={{ padding: '0.65rem 1rem', fontWeight: 'bold', color: '#10b981' }}>
                                                  {formatCurrency(y.amount_bdt, currency)}
                                                </td>
                                                <td style={{ padding: '0.65rem 1rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                  {y.investors?.telegram_chat_id || 'Not Registered'}
                                                </td>
                                                <td style={{ padding: '0.65rem 1rem' }}>
                                                  <span style={{ color: y.acknowledged ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                                    {y.acknowledged ? 'Yes ✅' : 'Pending'}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Payment Proof / Reference Form */}
                                      <form onSubmit={(e) => handleSaveDisbursementProof(e, disb.id)} style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr auto', gap: '1rem', alignItems: 'end' }}>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Bank / bKash TXN Ref</label>
                                          <input 
                                            type="text" 
                                            placeholder="e.g. TXN-998811" 
                                            value={disbPaymentForm.payment_txn_ref}
                                            onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, payment_txn_ref: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Disbursement Date</label>
                                          <input 
                                            type="date" 
                                            value={disbPaymentForm.payment_date}
                                            onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, payment_date: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Bank Receipt Attachment</label>
                                          <input 
                                            type="file" 
                                            onChange={(e) => setDisbPaymentFile(e.target.files[0])}
                                            style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8' }}
                                          />
                                          {disb.payment_attachment_url && (
                                            <a href={disb.payment_attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.1rem', display: 'block' }}>View Uploaded Proof</a>
                                          )}
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Notes</label>
                                          <input 
                                            type="text" 
                                            placeholder="Batch transfer notes..."
                                            value={disbPaymentForm.notes}
                                            onChange={(e) => setDisbPaymentForm({ ...disbPaymentForm, notes: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                          />
                                        </div>
                                        <button type="submit" disabled={uploadingDisbProof} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                          {uploadingDisbProof ? 'Saving...' : 'Save Proof'}
                                        </button>
                                      </form>

                                    </div>
                                  </td>
                                </tr>
                              )}

                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* SUB-TAB 3: POS SALES REPORTS & INGESTION */}
            {yieldSubTab === 'pos-reports' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
                
                {/* INGESTION FORM PANEL */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#070a14', padding: '0.2rem', borderRadius: '6px' }}>
                    <button 
                      onClick={() => setPosReportSubTab('manual')}
                      style={{ flex: 1, background: posReportSubTab === 'manual' ? 'rgba(212,175,55,0.2)' : 'transparent', color: posReportSubTab === 'manual' ? '#D4AF37' : '#94a3b8', border: 'none', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Manual Report Entry
                    </button>
                    <button 
                      onClick={() => setPosReportSubTab('csv')}
                      style={{ flex: 1, background: posReportSubTab === 'csv' ? 'rgba(212,175,55,0.2)' : 'transparent', color: posReportSubTab === 'csv' ? '#D4AF37' : '#94a3b8', border: 'none', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      CSV File Upload
                    </button>
                  </div>

                  {posReportSubTab === 'manual' ? (
                    <form onSubmit={handleSubmitPosManual} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <h4 style={{ margin: 0, color: '#D4AF37' }}>+ Ingest Monthly POS Report</h4>
                      
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Campaign / Brand</label>
                        <select 
                          value={posEntryForm.project_id}
                          onChange={(e) => setPosEntryForm({ ...posEntryForm, project_id: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                          required
                        >
                          <option value="">-- Choose Campaign --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Report Operating Month</label>
                        <input 
                          type="text"
                          placeholder="e.g. Aug 2026"
                          value={posEntryForm.report_month}
                          onChange={(e) => setPosEntryForm({ ...posEntryForm, report_month: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Gross Sales (BDT)</label>
                          <input 
                            type="number"
                            placeholder="1800000"
                            value={posEntryForm.gross_sales_bdt}
                            onChange={(e) => setPosEntryForm({ ...posEntryForm, gross_sales_bdt: e.target.value })}
                            className="form-input"
                            required
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Net Profit (BDT)</label>
                          <input 
                            type="number"
                            placeholder="420000"
                            value={posEntryForm.net_profit_bdt}
                            onChange={(e) => setPosEntryForm({ ...posEntryForm, net_profit_bdt: e.target.value })}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Transaction Count (Optional)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 1420"
                          value={posEntryForm.transaction_count}
                          onChange={(e) => setPosEntryForm({ ...posEntryForm, transaction_count: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <button type="submit" disabled={savingPosReport} className="btn-gold" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {savingPosReport ? 'Submitting Report...' : 'Submit POS Report'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleUploadPosCSV} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <h4 style={{ margin: 0, color: '#D4AF37' }}>📄 Batch Upload POS CSV File</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                        Expected CSV Columns: <code style={{ color: '#D4AF37' }}>Date, GrossSales, NetProfit, TxnCount</code>
                      </p>

                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Campaign / Brand</label>
                        <select 
                          value={posEntryForm.project_id}
                          onChange={(e) => setPosEntryForm({ ...posEntryForm, project_id: e.target.value })}
                          style={{ width: '100%', padding: '0.7rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                          required
                        >
                          <option value="">-- Choose Campaign --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Report Month Tag</label>
                        <input 
                          type="text"
                          placeholder="e.g. Aug 2026"
                          value={posEntryForm.report_month}
                          onChange={(e) => setPosEntryForm({ ...posEntryForm, report_month: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select CSV File</label>
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={(e) => setPosCSVFile(e.target.files[0])}
                          style={{ color: '#fff', fontSize: '0.8rem' }}
                          required
                        />
                      </div>

                      <button type="submit" disabled={uploadingCSV} className="btn-gold" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {uploadingCSV ? 'Parsing & Uploading...' : 'Upload & Ingest CSV'}
                      </button>
                    </form>
                  )}
                </div>

                {/* REPORTS TABLE */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f8fafc' }}>POS Ingested Sales Register</h3>
                  
                  {allPosReports.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No POS sales reports ingested yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                          <th style={{ padding: '0.65rem' }}>Month / Date</th>
                          <th style={{ padding: '0.65rem' }}>Brand</th>
                          <th style={{ padding: '0.65rem' }}>Gross Sales</th>
                          <th style={{ padding: '0.65rem' }}>Net Profit</th>
                          <th style={{ padding: '0.65rem' }}>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPosReports.map(pos => (
                          <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.65rem', fontWeight: 'bold', color: '#D4AF37' }}>
                              {pos.report_month || pos.date}
                            </td>
                            <td style={{ padding: '0.65rem' }}>{pos.businesses?.brand_name || 'SPV Brand'}</td>
                            <td style={{ padding: '0.65rem', fontWeight: 'bold', color: '#fff' }}>{formatCurrency(pos.gross_sales_bdt, currency)}</td>
                            <td style={{ padding: '0.65rem', color: '#10b981' }}>{formatCurrency(pos.net_profit_bdt, currency)}</td>
                            <td style={{ padding: '0.65rem' }}>
                              <span style={{
                                background: pos.sync_source === 'CSV_Upload' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                                color: pos.sync_source === 'CSV_Upload' ? '#3b82f6' : '#cbd5e1',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem'
                              }}>
                                {pos.sync_source || 'Manual'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CASH CONCIERGE & OTC ADVISORY DESK */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'cash-pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KPI METRIC STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending Review</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
                  {cashTickets.filter(t => t.status === 'Pending_Review').length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Awaiting Advisory Review</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Meetings Scheduled</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                  {cashTickets.filter(t => t.status === 'Meeting_Scheduled').length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>OTC Consultations Confirmed</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Funds Cleared</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                  {cashTickets.filter(t => t.status === 'Funds_Cleared').length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Verified Escrow Capital</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Active Pipeline Value</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                  {formatCurrency(
                    cashTickets
                      .filter(t => !['Closed', 'Rejected'].includes(t.status))
                      .reduce((acc, t) => acc + Number(t.ticket_amount_bdt || 0), 0),
                    currency
                  )}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#D4AF37' }}>Target OTC Commitment</span>
              </div>
            </div>

            {/* SUB-TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
              <button 
                onClick={() => setCashSubTab('pipeline')}
                style={{ background: 'transparent', border: 'none', borderBottom: cashSubTab === 'pipeline' ? '2px solid #D4AF37' : '2px solid transparent', color: cashSubTab === 'pipeline' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Confidential OTC Pipeline Queue ({cashTickets.length})
              </button>
              <button 
                onClick={() => setCashSubTab('new-ticket')}
                style={{ background: 'transparent', border: 'none', borderBottom: cashSubTab === 'new-ticket' ? '2px solid #D4AF37' : '2px solid transparent', color: cashSubTab === 'new-ticket' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                + Admin Log OTC Ticket
              </button>
            </div>

            {/* SUB-TAB 1: PIPELINE QUEUE */}
            {cashSubTab === 'pipeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* FILTER PILLS */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', pb: '0.5rem' }}>
                  {['All', 'Pending_Review', 'Meeting_Scheduled', 'Funds_Cleared', 'Closed', 'Rejected'].map(st => {
                    const isActive = cashStatusFilter === st;
                    const count = st === 'All' ? cashTickets.length : cashTickets.filter(t => t.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setCashStatusFilter(st)}
                        style={{
                          background: isActive ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.8)',
                          color: isActive ? '#D4AF37' : '#94a3b8',
                          border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {st.replace('_', ' ')} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* TICKET CARDS LIST */}
                {cashTickets.filter(t => cashStatusFilter === 'All' || t.status === cashStatusFilter).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#94a3b8' }}>No confidential OTC consultation tickets found for this filter.</h3>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cashTickets
                      .filter(t => cashStatusFilter === 'All' || t.status === cashStatusFilter)
                      .map(ticket => {
                        const isSelected = selectedCashTicket?.id === ticket.id;
                        const isPending = ticket.status === 'Pending_Review';
                        const isScheduled = ticket.status === 'Meeting_Scheduled';
                        const isCleared = ticket.status === 'Funds_Cleared';
                        
                        const statusColor = isCleared ? '#10b981' : isScheduled ? '#3b82f6' : isPending ? '#D4AF37' : ticket.status === 'Closed' ? '#94a3b8' : '#ef4444';

                        const investorAlias = ticket.investors?.requires_anonymity 
                          ? `[Anonymized ${ticket.investors?.alias_name?.slice(0, 4)}***]` 
                          : (ticket.investors?.alias_name || 'Client');

                        return (
                          <div key={ticket.id} className="glass-card" style={{ borderLeft: `4px solid ${statusColor}`, padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                  <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.15rem', color: '#D4AF37', fontWeight: 'bold' }}>{investorAlias}</h4>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Project Campaign</span>
                                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>
                                    {ticket.funding_projects?.businesses?.brand_name} - {ticket.funding_projects?.project_title}
                                  </p>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Commitment</span>
                                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.05rem', color: '#10b981', fontWeight: 'bold' }}>
                                    {formatCurrency(ticket.ticket_amount_bdt, currency)}
                                  </p>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Managing Partner</span>
                                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.85rem', color: '#D4AF37' }}>
                                    {ticket.kams?.full_name || 'Unassigned'}
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                  background: `${statusColor}20`,
                                  color: statusColor,
                                  border: `1px solid ${statusColor}40`,
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold'
                                }}>
                                  ● {ticket.status.replace('_', ' ')}
                                </span>

                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedCashTicket(null);
                                    } else {
                                      setSelectedCashTicket(ticket);
                                      setCashMeetingForm({
                                        date: ticket.confirmed_meeting_date ? new Date(ticket.confirmed_meeting_date).toISOString().slice(0, 16) : '',
                                        format: ticket.meeting_format || 'In_Person'
                                      });
                                    }
                                  }}
                                  style={{
                                    background: 'rgba(212,175,55,0.15)',
                                    color: '#D4AF37',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isSelected ? 'Close File ▲' : 'Inspect File ▼'}
                                </button>
                              </div>
                            </div>

                            {/* EXPANDED DRILLDOWN INSPECTOR */}
                            {isSelected && (
                              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px' }}>
                                
                                {/* LEFT COLUMN: INVESTOR PROFILE & NOTES */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>👤 Advisory File Details</h4>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#0f172a', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Client Identity</p>
                                      <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>{ticket.investors?.alias_name}</p>
                                    </div>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>KYC Clearance</p>
                                      <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>Level {ticket.investors?.kyc_level || 3} Verified</p>
                                    </div>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Direct Phone</p>
                                      <p style={{ margin: 0, color: '#fff' }}>{ticket.investors?.phone || 'On file'}</p>
                                    </div>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Email Address</p>
                                      <p style={{ margin: 0, color: '#fff' }}>{ticket.investors?.email || 'On file'}</p>
                                    </div>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Client Preferred Time</p>
                                      <p style={{ margin: 0, color: '#D4AF37' }}>{ticket.preferred_meeting_time || 'Flexible'}</p>
                                    </div>
                                    <div>
                                      <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Meeting Format</p>
                                      <p style={{ margin: 0, color: '#fff' }}>{(ticket.meeting_format || 'In_Person').replace('_', ' ')}</p>
                                    </div>
                                  </div>

                                  {ticket.confirmed_meeting_date && (
                                    <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📅 Confirmed Meeting Time: </span>
                                      <strong style={{ color: '#fff' }}>{new Date(ticket.confirmed_meeting_date).toLocaleString()}</strong>
                                    </div>
                                  )}

                                  {ticket.funds_transfer_ref && (
                                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Escrow Reference: </span>
                                      <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{ticket.funds_transfer_ref}</strong>
                                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                        (Cleared {new Date(ticket.funds_cleared_at).toLocaleDateString()})
                                      </span>
                                    </div>
                                  )}

                                  {/* Internal Notes History */}
                                  <div>
                                    <h5 style={{ margin: '0 0 0.4rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Advisory & Diligence Notes Log</h5>
                                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', minHeight: '60px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'pre-line', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      {ticket.admin_notes || 'No advisory notes recorded yet.'}
                                    </div>
                                  </div>

                                  {/* Append Note Form */}
                                  <form onSubmit={(e) => handleSaveCashNote(e, ticket.id)} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                      type="text" 
                                      placeholder="Log advisory note / call outcome..."
                                      value={cashNoteInput}
                                      onChange={(e) => setCashNoteInput(e.target.value)}
                                      style={{ flex: 1, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                                    />
                                    <button type="submit" disabled={savingCashAction} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      Save Note
                                    </button>
                                  </form>

                                </div>

                                {/* RIGHT COLUMN: ACTION CONTROLS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                                  <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>⚙️ Managing Partner Actions</h4>

                                  {/* KAM Assignment Dropdown */}
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Assign Managing Partner (KAM)</label>
                                    <select 
                                      value={ticket.kam_id || ''}
                                      onChange={(e) => handleCashKamAssign(ticket.id, e.target.value)}
                                      style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                                    >
                                      <option value="">-- Choose Partner --</option>
                                      {allKams.map(k => (
                                        <option key={k.id} value={k.id}>{k.full_name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Schedule Consultation Form */}
                                  <form onSubmit={(e) => handleCashMeetingConfirm(e, ticket.id)} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3b82f6' }}>📅 Schedule & Confirm Consultation</span>
                                    
                                    <input 
                                      type="datetime-local" 
                                      value={cashMeetingForm.date}
                                      onChange={(e) => setCashMeetingForm({ ...cashMeetingForm, date: e.target.value })}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                      required
                                    />
                                    
                                    <select 
                                      value={cashMeetingForm.format}
                                      onChange={(e) => setCashMeetingForm({ ...cashMeetingForm, format: e.target.value })}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                    >
                                      <option value="In_Person">In-Person Meeting (GRO10X HQ)</option>
                                      <option value="Virtual_Call">Virtual Video Call (Zoom)</option>
                                      <option value="Phone_Consultation">Confidential Phone Call</option>
                                    </select>

                                    <button type="submit" disabled={savingCashAction} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      Confirm Meeting Schedule
                                    </button>
                                  </form>

                                  {/* Record Funds Clearance Form */}
                                  <form onSubmit={(e) => handleCashFundsCleared(e, ticket.id)} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>💳 Verify & Clear Escrow Funds</span>
                                    
                                    <input 
                                      type="text" 
                                      placeholder="Bank TXN / Escrow Ref ID"
                                      value={cashFundsRef}
                                      onChange={(e) => setCashFundsRef(e.target.value)}
                                      style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                    />

                                    <button type="submit" disabled={savingCashAction} style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      Mark Funds Cleared
                                    </button>
                                  </form>

                                  {/* Quick Status Buttons */}
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                      onClick={() => handleCashStatusUpdate(ticket.id, 'Closed')}
                                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                      Close Ticket File
                                    </button>
                                    <button 
                                      onClick={() => handleCashStatusUpdate(ticket.id, 'Rejected')}
                                      style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                      Decline Consultation
                                    </button>
                                  </div>

                                  {/* Push Telegram Update Button */}
                                  <button 
                                    onClick={() => handlePushCashTelegramNotif(ticket, ticket.status === 'Meeting_Scheduled' ? 'meeting_confirmed' : ticket.status === 'Funds_Cleared' ? 'funds_cleared' : 'status_update')}
                                    disabled={pushingCashTelegram}
                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}
                                  >
                                    {pushingCashTelegram ? 'Pushing...' : '📲 Notify Investor via Telegram'}
                                  </button>

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

            {/* SUB-TAB 2: ADMIN LOG OTC TICKET */}
            {cashSubTab === 'new-ticket' && (
              <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#D4AF37' }}>
                  + Admin Log OTC Advisory Ticket
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Manually record a confidential block trade inquiry on behalf of a verified HNI / UHNWI investor.
                </p>

                <form onSubmit={handleCreateCashTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select HNI Investor</label>
                    <select 
                      value={adminTicketForm.investor_id}
                      onChange={(e) => setAdminTicketForm({ ...adminTicketForm, investor_id: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    >
                      <option value="">-- Choose Investor --</option>
                      {allInvestors.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.alias_name} ({inv.investor_category || 'HNI'}) - {inv.phone || inv.email || 'KYC L' + (inv.kyc_level || 1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Project Campaign</label>
                    <select 
                      value={adminTicketForm.target_project_id}
                      onChange={(e) => setAdminTicketForm({ ...adminTicketForm, target_project_id: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    >
                      <option value="">-- Choose Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Commitment Amount (BDT)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 10000000"
                      value={adminTicketForm.ticket_amount_bdt}
                      onChange={(e) => setAdminTicketForm({ ...adminTicketForm, ticket_amount_bdt: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Preferred Meeting Time</label>
                      <input 
                        type="text"
                        placeholder="e.g. Tomorrow 3 PM"
                        value={adminTicketForm.preferred_meeting_time}
                        onChange={(e) => setAdminTicketForm({ ...adminTicketForm, preferred_meeting_time: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Meeting Format</label>
                      <select 
                        value={adminTicketForm.meeting_format}
                        onChange={(e) => setAdminTicketForm({ ...adminTicketForm, meeting_format: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      >
                        <option value="In_Person">In-Person Meeting</option>
                        <option value="Virtual_Call">Virtual Call (Zoom)</option>
                        <option value="Phone_Consultation">Phone Call</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Advisory & Initial Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Initial consultation notes, investor preferences..."
                      value={adminTicketForm.admin_notes}
                      onChange={(e) => setAdminTicketForm({ ...adminTicketForm, admin_notes: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>

                  <button type="submit" disabled={savingCashAction} className="btn-gold" style={{ padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    {savingCashAction ? 'Logging Ticket...' : 'Log OTC Advisory Ticket'}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: TEAM & PROMOTERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'team-promoters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* KPI METRIC STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Managing Partners (KAMs)</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
                  {allKams.filter(k => k.is_active !== false).length} Active
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Client Portfolio Directors</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Promoter Network</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                  {allPromoters.filter(p => p.is_active !== false).length} Active
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Growth & Referral Partners</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending Payout Requests</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
                  {payoutRequests.filter(p => p.status === 'Pending Verification').length}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Awaiting Finance Clearance</span>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Commission Earned</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                  {formatCurrency(
                    promoterCommissions.reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0),
                    currency
                  )}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Base 0.75% + Bonus 0.25%</span>
              </div>
            </div>

            {/* SUB-TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
              <button 
                onClick={() => setTeamSubTab('kams')}
                style={{ background: 'transparent', border: 'none', borderBottom: teamSubTab === 'kams' ? '2px solid #D4AF37' : '2px solid transparent', color: teamSubTab === 'kams' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Managing Partners ({allKams.length})
              </button>
              <button 
                onClick={() => setTeamSubTab('promoters')}
                style={{ background: 'transparent', border: 'none', borderBottom: teamSubTab === 'promoters' ? '2px solid #D4AF37' : '2px solid transparent', color: teamSubTab === 'promoters' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Promoter Network ({allPromoters.length})
              </button>
              <button 
                onClick={() => setTeamSubTab('payouts')}
                style={{ background: 'transparent', border: 'none', borderBottom: teamSubTab === 'payouts' ? '2px solid #D4AF37' : '2px solid transparent', color: teamSubTab === 'payouts' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Commission Payout Queue ({payoutRequests.length})
              </button>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SUB-TAB 1: MANAGING PARTNERS (KAMs) */}
            {/* ---------------------------------------------------- */}
            {teamSubTab === 'kams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Managing Partners & Portfolio Directors</h3>
                  <button 
                    onClick={() => setShowKamForm(!showKamForm)}
                    style={{ background: showKamForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showKamForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    {showKamForm ? '✕ Close Form' : '+ Onboard Managing Partner'}
                  </button>
                </div>

                {/* COLLAPSIBLE ADD KAM FORM */}
                {showKamForm && (
                  <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Onboard New Managing Partner (KAM)</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '-0.5rem 0 1rem 0' }}>
                      Once entered, direct the partner to open the GRO10X Telegram Bot to sync their Chat ID and unlock their Mini App dashboard.
                    </p>
                    <form onSubmit={handleAddKam} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Tanvir Ahmed" 
                          value={kamForm.full_name} 
                          onChange={(e) => setKamForm({ ...kamForm, full_name: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Managing Partner - Consumer CapEx" 
                          value={kamForm.title} 
                          onChange={(e) => setKamForm({ ...kamForm, title: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Region / Division</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Dhaka Central" 
                          value={kamForm.region} 
                          onChange={(e) => setKamForm({ ...kamForm, region: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address *</label>
                        <input 
                          type="email" 
                          placeholder="partner@gro10x.com" 
                          value={kamForm.email} 
                          onChange={(e) => setKamForm({ ...kamForm, email: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+8801700000000" 
                          value={kamForm.phone} 
                          onChange={(e) => setKamForm({ ...kamForm, phone: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Joining Date</label>
                        <input 
                          type="date" 
                          value={kamForm.joined_at} 
                          onChange={(e) => setKamForm({ ...kamForm, joined_at: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                          {savingTeamAction ? 'Saving Partner...' : 'Onboard Partner'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* KAM CARDS GRID */}
                {allKams.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No Managing Partners registered yet.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    {allKams.map(kam => {
                      const assignedInvsCount = allInvestors.filter(i => i.assigned_kam_id === kam.id).length;
                      const assignedBizCount = businesses.filter(b => b.kam_id === kam.id).length;
                      const auditsCount = (allAppStakeholders || []).filter(s => s.kam_id === kam.id).length; // or audits
                      const isActive = kam.is_active !== false;

                      return (
                        <div key={kam.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isActive ? '4px solid #D4AF37' : '4px solid #64748b', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{kam.full_name}</h4>
                              <p style={{ margin: '0.1rem 0 0 0', color: '#D4AF37', fontSize: '0.8rem' }}>{kam.title || 'Managing Partner'}</p>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📍 {kam.region || 'Dhaka HQ'}</span>
                            </div>

                            <span style={{
                              background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                              color: isActive ? '#10b981' : '#94a3b8',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}>
                              {isActive ? '● Active' : '○ Inactive'}
                            </span>
                          </div>

                          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                            <div>📧 {kam.email || 'Email unlisted'}</div>
                            <div>📞 {kam.phone || 'Phone unlisted'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <span style={{ fontSize: '0.75rem' }}>Telegram Bot:</span>
                              {kam.telegram_onboarded ? (
                                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.75rem' }}>✅ Bot Onboarded</span>
                              ) : (
                                <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⏳ Pending Setup</span>
                              )}
                            </div>
                          </div>

                          {/* PORTFOLIO STATS BOX */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '6px' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Investors</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6', fontSize: '1rem' }}>{assignedInvsCount}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Businesses</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#D4AF37', fontSize: '1rem' }}>{assignedBizCount}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Audits</span>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>{auditsCount}</p>
                            </div>
                          </div>

                          {/* TOGGLE ACTIVE STATUS */}
                          <button 
                            onClick={() => handleToggleKamActive(kam.id, isActive)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', marginTop: 'auto' }}
                          >
                            {isActive ? 'Deactivate Partner Access' : 'Activate Partner Access'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-TAB 2: PROMOTER NETWORK */}
            {/* ---------------------------------------------------- */}
            {teamSubTab === 'promoters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Promoter Network & Gamified Referral Engine</h3>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={handleAutoCheckPromoterTiers}
                      disabled={savingTeamAction}
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {savingTeamAction ? 'Scanning...' : '🔄 Auto-Check All Tiers'}
                    </button>
                    <button 
                      onClick={() => setShowPromoterForm(!showPromoterForm)}
                      style={{ background: showPromoterForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showPromoterForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {showPromoterForm ? '✕ Close Form' : '+ Onboard Promoter'}
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE ADD PROMOTER FORM */}
                {showPromoterForm && (
                  <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Onboard New Growth Promoter</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '-0.5rem 0 1rem 0' }}>
                      A unique referral code (e.g. <code>GRO-ALI-4892</code>) will be auto-generated. Direct promoter to GRO10X Telegram Bot to complete onboarding.
                    </p>
                    <form onSubmit={handleAddPromoter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Legal Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rafiqul Islam" 
                          value={promoterForm.full_name} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, full_name: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Alias / Brand Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rafiq Finance" 
                          value={promoterForm.alias_name} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, alias_name: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Tier</label>
                        <select 
                          value={promoterForm.tier} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, tier: e.target.value })} 
                          style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                        >
                          <option value="Trainee">Trainee (0-49 Leads) [No Deal Access]</option>
                          <option value="Junior_Associate">Junior Associate (50+ Leads)</option>
                          <option value="Associate">Associate (1st Investment)</option>
                          <option value="Senior_Associate">Senior Associate (5M BDT Raised)</option>
                          <option value="Elite">Elite (20M BDT Raised)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+8801800000000" 
                          value={promoterForm.phone} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, phone: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                        <input 
                          type="email" 
                          placeholder="promoter@gmail.com" 
                          value={promoterForm.email} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, email: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Joined Date</label>
                        <input 
                          type="date" 
                          value={promoterForm.joined_at} 
                          onChange={(e) => setPromoterForm({ ...promoterForm, joined_at: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={savingTeamAction} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                          {savingTeamAction ? 'Saving Promoter...' : 'Onboard Promoter'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* PROMOTER CARD STACK */}
                {allPromoters.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No promoters onboarded in referral network yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {allPromoters.map(promoter => {
                      const isSelected = selectedPromoter?.id === promoter.id;
                      const pLeads = promoterLeads.filter(l => l.promoter_id === promoter.id);
                      const pInvs = activeInvestments.filter(inv => inv.investors?.origin_promoter_id === promoter.id);
                      const pComms = promoterCommissions.filter(c => c.promoter_id === promoter.id);
                      
                      const totalBaseComm = pComms.filter(c => c.commission_type === 'Base_0.75').reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0);
                      const totalBonusComm = pComms.filter(c => c.commission_type === 'Target_0.25').reduce((sum, c) => sum + Number(c.amount_bdt || 0), 0);
                      const totalRaised = pInvs.reduce((sum, i) => sum + Number(i.amount_invested_bdt || 0), 0);

                      const tier = promoter.tier || 'Trainee';
                      const isTrainee = tier === 'Trainee';

                      const tierBadgeStyle = {
                        Trainee: { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: '1px solid #64748b' },
                        Junior_Associate: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b' },
                        Associate: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981' },
                        Senior_Associate: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid #3b82f6' },
                        Elite: { bg: 'rgba(212,175,55,0.25)', color: '#D4AF37', border: '1px solid #D4AF37' }
                      }[tier] || { bg: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #fff' };

                      return (
                        <div key={promoter.id} className="glass-card" style={{ borderLeft: `4px solid ${tierBadgeStyle.color}`, padding: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Alias / Brand Name</span>
                                <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.15rem', color: '#fff', fontWeight: 'bold' }}>{promoter.alias_name}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({promoter.full_name})</span>
                              </div>

                              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Referral Code</span>
                                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.9rem', color: '#D4AF37', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                  {promoter.referral_code}
                                </p>
                              </div>

                              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Promoter Tier</span>
                                <div style={{ marginTop: '0.2rem' }}>
                                  <span style={{
                                    background: tierBadgeStyle.bg,
                                    color: tierBadgeStyle.color,
                                    border: tierBadgeStyle.border,
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ★ {tier.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Raised</span>
                                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.95rem', color: '#10b981', fontWeight: 'bold' }}>
                                  {formatCurrency(totalRaised, currency)}
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {/* DEAL ACCESS TOGGLE */}
                              <button
                                onClick={() => handleTogglePromoterDeals(promoter.id, promoter.can_promote_deals, tier)}
                                title={isTrainee ? 'Trainee tier locked: must reach 50 leads first' : 'Toggle deal sharing link access'}
                                style={{
                                  background: promoter.can_promote_deals ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: promoter.can_promote_deals ? '#10b981' : '#ef4444',
                                  border: promoter.can_promote_deals ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  cursor: isTrainee ? 'not-allowed' : 'pointer',
                                  opacity: isTrainee ? 0.6 : 1
                                }}
                              >
                                {promoter.can_promote_deals ? '🔓 Deals Unlocked' : '🔒 Deals Locked'}
                              </button>

                              {/* INSPECT TOGGLE */}
                              <button
                                onClick={() => setSelectedPromoter(isSelected ? null : promoter)}
                                style={{
                                  background: 'rgba(212,175,55,0.15)',
                                  color: '#D4AF37',
                                  border: '1px solid rgba(212,175,55,0.3)',
                                  padding: '0.4rem 0.85rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                {isSelected ? 'Close File ▲' : 'Inspect File ▼'}
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED DRILLDOWN INSPECTOR */}
                          {isSelected && (
                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px' }}>
                              
                              {/* LEFT PANEL: SCORECARD & TIER MILESTONES */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>📊 Performance Scorecard & Tier Progress</h4>

                                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Milestone Progression Map</span>
                                    <span style={{ fontSize: '0.75rem', color: tierBadgeStyle.color, fontWeight: 'bold' }}>Current: {tier.replace('_', ' ')}</span>
                                  </div>

                                  {/* MILESTONE MAP */}
                                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                                    <div style={{ color: tier === 'Trainee' ? '#D4AF37' : '#10b981', fontWeight: 'bold' }}>
                                      🔵 Trainee<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>0-49 Leads</span>
                                    </div>
                                    <span style={{ color: '#64748b' }}>→</span>
                                    <div style={{ color: ['Junior_Associate', 'Associate', 'Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                      🟡 Junior Assoc<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>50 Leads</span>
                                    </div>
                                    <span style={{ color: '#64748b' }}>→</span>
                                    <div style={{ color: ['Associate', 'Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                      🟢 Associate<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>1st Raise</span>
                                    </div>
                                    <span style={{ color: '#64748b' }}>→</span>
                                    <div style={{ color: ['Senior_Associate', 'Elite'].includes(tier) ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                      🔷 Senior Assoc<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>5M BDT</span>
                                    </div>
                                    <span style={{ color: '#64748b' }}>→</span>
                                    <div style={{ color: tier === 'Elite' ? '#D4AF37' : '#64748b', fontWeight: 'bold' }}>
                                      ⭐ Elite<br/><span style={{ fontSize: '0.65rem', color: '#64748b' }}>20M BDT</span>
                                    </div>
                                  </div>

                                  {/* PROGRESS HINT */}
                                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                                    {isTrainee && (
                                      <span>🎯 <strong>Next Milestone:</strong> Submit <strong>{Math.max(0, 50 - pLeads.length)}</strong> more investor leads to unlock Junior Associate & Deal Promotion links.</span>
                                    )}
                                    {tier === 'Junior_Associate' && (
                                      <span>🎯 <strong>Next Milestone:</strong> Secure <strong>1st active investment</strong> via referral link to reach Associate tier.</span>
                                    )}
                                    {tier === 'Associate' && (
                                      <span>🎯 <strong>Next Milestone:</strong> Reach <strong>৳5,000,000 BDT</strong> total raised to reach Senior Associate tier.</span>
                                    )}
                                    {tier === 'Senior_Associate' && (
                                      <span>🎯 <strong>Next Milestone:</strong> Reach <strong>৳20,000,000 BDT</strong> total raised to reach Elite tier.</span>
                                    )}
                                    {tier === 'Elite' && (
                                      <span style={{ color: '#D4AF37' }}>🏆 <strong>Top Tier Achieved:</strong> Highest tier unlocked! Maximized bonus tier commission eligible.</span>
                                    )}
                                  </div>
                                </div>

                                {/* SCORECARD METRICS */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.8rem' }}>
                                  <div>
                                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Total Leads</span>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{pLeads.length}</p>
                                  </div>
                                  <div>
                                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Conversions</span>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>{pInvs.length}</p>
                                  </div>
                                  <div>
                                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Base 0.75%</span>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6' }}>{formatCurrency(totalBaseComm, currency)}</p>
                                  </div>
                                  <div>
                                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Bonus 0.25%</span>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#D4AF37' }}>{formatCurrency(totalBonusComm, currency)}</p>
                                  </div>
                                </div>

                                {/* GAMIFIED TARGETS FOR PROMOTER */}
                                <div>
                                  <h5 style={{ margin: '0 0 0.4rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Gamified Campaign Targets (0.25% Bonus Tier)</h5>
                                  {promoterTargets.filter(t => t.promoter_id === promoter.id).length === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No active project target goals assigned.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                      {promoterTargets.filter(t => t.promoter_id === promoter.id).map(tgt => {
                                        const pct = Math.min(100, Math.round((Number(tgt.amount_raised_bdt || 0) / Number(tgt.target_raise_bdt || 1)) * 100));
                                        return (
                                          <div key={tgt.id} style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                              <span style={{ color: '#fff', fontWeight: 'bold' }}>{tgt.funding_projects?.project_title}</span>
                                              <span style={{ color: tgt.status === 'Target_Hit' ? '#10b981' : '#D4AF37', fontWeight: 'bold' }}>
                                                {pct}% ({formatCurrency(tgt.amount_raised_bdt, currency)} / {formatCurrency(tgt.target_raise_bdt, currency)})
                                              </span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                              <div style={{ width: `${pct}%`, height: '100%', background: tgt.status === 'Target_Hit' ? '#10b981' : '#D4AF37' }}></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* MANUAL TIER OVERRIDE DROPDOWN */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Admin Tier Override:</span>
                                  <select 
                                    value={tier}
                                    onChange={(e) => handlePromoterTierOverride(promoter.id, e.target.value)}
                                    style={{ padding: '0.4rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                  >
                                    <option value="Trainee">Trainee</option>
                                    <option value="Junior_Associate">Junior Associate</option>
                                    <option value="Associate">Associate</option>
                                    <option value="Senior_Associate">Senior Associate</option>
                                    <option value="Elite">Elite</option>
                                  </select>
                                </div>

                              </div>

                              {/* RIGHT PANEL: COMMISSION LEDGER & CRM LEADS */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                                
                                {/* COMMISSION LEDGER */}
                                <div>
                                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>💰 Commission Earnings Ledger</h4>
                                  {pComms.length === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No commission records logged for this promoter.</p>
                                  ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#f8fafc' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                                          <th style={{ padding: '0.4rem' }}>Date</th>
                                          <th style={{ padding: '0.4rem' }}>Type</th>
                                          <th style={{ padding: '0.4rem' }}>Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {pComms.map(c => (
                                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.4rem', color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.4rem' }}>
                                              <span style={{ color: c.commission_type === 'Base_0.75' ? '#3b82f6' : '#D4AF37', fontWeight: 'bold' }}>
                                                {c.commission_type.replace('_', ' ')}
                                              </span>
                                            </td>
                                            <td style={{ padding: '0.4rem', color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(c.amount_bdt, currency)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>

                                {/* CRM LEADS LOG */}
                                <div>
                                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '0.95rem' }}>📞 CRM Leads Submitted ({pLeads.length})</h4>
                                  {pLeads.length === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No CRM leads submitted by this promoter yet.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                                      {pLeads.slice(0, 10).map(lead => (
                                        <div key={lead.id} style={{ background: '#0f172a', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div>
                                            <strong style={{ color: '#fff' }}>{lead.name}</strong>
                                            <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>{lead.phone}</span>
                                          </div>
                                          <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                                            {lead.status || 'New Lead'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
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
            {/* SUB-TAB 3: COMMISSION PAYOUT QUEUE */}
            {/* ---------------------------------------------------- */}
            {teamSubTab === 'payouts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  💡 <strong>Payroll Note:</strong> Commission payout clearance is managed here. Full team payroll & monthly AUM revenue-share disbursements for KAMs & Staff will be available in the upcoming <strong>Team Disbursement</strong> module.
                </div>

                {payoutRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No payout requests in finance queue.</div>
                ) : (
                  <div className="glass-card" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                          <th style={{ padding: '0.85rem' }}>Request Date</th>
                          <th style={{ padding: '0.85rem' }}>Promoter</th>
                          <th style={{ padding: '0.85rem' }}>Disbursement Channel</th>
                          <th style={{ padding: '0.85rem' }}>Account Details</th>
                          <th style={{ padding: '0.85rem' }}>Amount BDT</th>
                          <th style={{ padding: '0.85rem' }}>Status</th>
                          <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutRequests.map(req => {
                          const isPending = req.status === 'Pending Verification';
                          const isCleared = req.status === 'Cleared' || req.status === 'Disbursed';
                          const statusColor = isCleared ? '#10b981' : isPending ? '#f59e0b' : '#ef4444';

                          return (
                            <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.85rem', color: '#94a3b8' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{req.promoters?.alias_name || 'Promoter'}</td>
                              <td style={{ padding: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>{req.disbursement_channel}</td>
                              <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: '#cbd5e1' }}>{req.account_details}</td>
                              <td style={{ padding: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(req.amount_bdt, currency)}</td>
                              <td style={{ padding: '0.85rem' }}>
                                <span style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40`, padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  ● {req.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                                {isPending ? (
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => handleClearPayout(req.id, req.promoters?.user_id)}
                                      style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                      Mark Cleared
                                    </button>
                                    <button 
                                      onClick={() => handleRejectPayout(req.id)}
                                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {req.cleared_at ? `Cleared ${new Date(req.cleared_at).toLocaleDateString()}` : 'Processed'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
        {activeTab === 'legal' && (
          <LegalComplianceTab currency={currency} addToast={addToast} />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            currency={currency}
            activeInvestments={activeInvestments}
            allInvestors={allInvestors}
            allPromoters={allPromoters}
            promoterCommissions={promoterCommissions}
            inquiryLeads={inquiryLeads}
            projects={projects}
            businesses={businesses}
            yieldDisbursements={yieldDisbursements}
            allPosReports={allPosReports}
            payoutRequests={payoutRequests}
            allBookings={allBookings}
          />
        )}

        {/* INQUIRY LEADS TAB */}
        {activeTab === 'leads-marketing' && (
          <InquiryLeadsTab currency={currency} addToast={addToast} />
        )}

        {/* BOT MANAGEMENT & ACCESS CONTROL TAB */}
        {activeTab === 'bot-management' && (
          <BotManagementTab currency={currency} addToast={addToast} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <PlatformSettingsTab addToast={addToast} />
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* COHORT APPLICATION INSPECTION DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedApplication && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '640px', background: '#0f172a', borderLeft: '1px solid rgba(212,175,55,0.3)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* DRAWER HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#D4AF37', fontWeight: 'bold' }}>{selectedApplication.ref_code}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: '0.2rem 0 0.3rem 0' }}>{selectedApplication.brand_name}</h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
                  {selectedApplication.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button onClick={() => setSelectedApplication(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* DRAWER SUB-TABS (5 SUB-TABS) */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(7,10,20,0.6)', borderRadius: '8px', padding: '0.25rem' }}>
              {['brand', 'team', 'financials', 'documents', 'audit'].map(subTab => (
                <button
                  key={subTab}
                  onClick={() => setAppDrawerSubTab(subTab)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: appDrawerSubTab === subTab ? '#D4AF37' : 'transparent',
                    color: appDrawerSubTab === subTab ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {subTab === 'brand' ? 'Brand Identity' : subTab === 'team' ? 'Team Roster' : subTab === 'audit' ? 'KAM Audit & Onboard' : subTab}
                </button>
              ))}
            </div>

            {/* SUB-TAB 1: BRAND IDENTITY & LEGAL */}
            {appDrawerSubTab === 'brand' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0 }}>Company Legal Name: <strong style={{ color: '#fff' }}>{selectedApplication.company_legal_name || 'N/A'}</strong></p>
                  <p style={{ margin: 0 }}>Company Entity Type: <strong style={{ color: '#fff' }}>{selectedApplication.company_type}</strong></p>
                  <p style={{ margin: 0 }}>Trade License / Reg No: <strong style={{ color: '#D4AF37' }}>{selectedApplication.company_registration_number || 'N/A'}</strong></p>
                  <p style={{ margin: 0 }}>TIN Number: <strong style={{ color: '#fff' }}>{selectedApplication.tin_number || 'N/A'}</strong></p>
                  <p style={{ margin: 0 }}>BIN Number (VAT): <strong style={{ color: '#fff' }}>{selectedApplication.bin_number || 'N/A'}</strong></p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0 }}>Industry Sector: <strong style={{ color: '#3b82f6' }}>{selectedApplication.industry_sector}</strong></p>
                  <p style={{ margin: 0 }}>Operating Outlets: <strong style={{ color: '#fff' }}>{selectedApplication.outlet_count} active hubs</strong></p>
                  <p style={{ margin: 0 }}>HQ Address: <strong style={{ color: '#fff' }}>{selectedApplication.headquarters_address || 'Unlisted'}</strong></p>
                  {selectedApplication.website_url && (
                    <p style={{ margin: 0 }}>Website: <a href={selectedApplication.website_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{selectedApplication.website_url}</a></p>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FOUNDING TEAM & STAKEHOLDERS */}
            {appDrawerSubTab === 'team' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 'bold' }}>Lead Applicant Contact</span>
                  <h4 style={{ margin: '0.2rem 0', color: '#fff', fontSize: '1rem' }}>{selectedApplication.lead_founder_name}</h4>
                  <p style={{ margin: 0, color: '#94a3b8' }}>{selectedApplication.lead_founder_title} | Phone: {selectedApplication.lead_founder_phone}</p>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8' }}>Email: {selectedApplication.lead_founder_email}</p>
                  {selectedApplication.lead_founder_linkedin_url && (
                    <a href={selectedApplication.lead_founder_linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.8rem', display: 'inline-block', marginTop: '0.3rem' }}>
                      View LinkedIn Profile ↗
                    </a>
                  )}
                </div>

                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>All Registered Business Stakeholders</h4>
                {allAppStakeholders.filter(s => s.application_id === selectedApplication.id).length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No co-founders registered in multi-stakeholder table.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {allAppStakeholders.filter(s => s.application_id === selectedApplication.id).map(stk => (
                      <div key={stk.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>{stk.full_name}</p>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stk.role_title} | {stk.phone || stk.email || 'No contact'}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>{stk.equity_ownership_pct}% Equity</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* SUB-TAB 3: FINANCIALS & UNIT ECONOMICS */}
            {appDrawerSubTab === 'financials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(7,10,20,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Monthly Gross Sales</span>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{formatCurrency(selectedApplication.monthly_gross_revenue_bdt, currency)}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Monthly Net Profit</span>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#10b981' }}>{formatCurrency(selectedApplication.monthly_net_profit_bdt, currency)}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Capital Ask</span>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#D4AF37' }}>{formatCurrency(selectedApplication.requested_funding_bdt, currency)}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>POS Software</span>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{selectedApplication.pos_system_name || 'N/A'}</p>
                  </div>
                </div>

                {selectedApplication.pitch_text && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>Founder Value Proposition / Pitch</span>
                    <p style={{ margin: '0.3rem 0 0 0', lineHeight: '1.5', fontStyle: 'italic' }}>"{selectedApplication.pitch_text}"</p>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: DOCUMENT VAULT */}
            {appDrawerSubTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Pitch Deck PDF</span>
                    {selectedApplication.pitch_deck_url ? (
                      <a href={selectedApplication.pitch_deck_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>View Pitch Deck PDF ↗</a>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not Uploaded</span>
                    )}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Trade License Scan</span>
                    {selectedApplication.trade_license_url ? (
                      <a href={selectedApplication.trade_license_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>View Trade License ↗</a>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not Uploaded</span>
                    )}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Financial Audit (1 Yr)</span>
                    {selectedApplication.financial_audit_url ? (
                      <a href={selectedApplication.financial_audit_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>View Audit Document ↗</a>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not Uploaded</span>
                    )}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>TIN Certificate</span>
                    {selectedApplication.tin_certificate_url ? (
                      <a href={selectedApplication.tin_certificate_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>View TIN Certificate ↗</a>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not Uploaded</span>
                    )}
                  </div>
                </div>

                {Array.isArray(selectedApplication.outlet_photos) && selectedApplication.outlet_photos.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Uploaded Outlet Media</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {selectedApplication.outlet_photos.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ height: '80px', borderRadius: '6px', overflow: 'hidden', display: 'block' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 5: KAM AUDIT & DIRECTOR CONSOLE */}
            {appDrawerSubTab === 'audit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                
                {/* KAM ASSIGNMENT */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Assigned Key Account Manager (KAM)</label>
                  <select 
                    value={selectedApplication.assigned_kam_id || ''}
                    onChange={(e) => handleAssignKamToApp(selectedApplication.id, e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="">-- Unassigned --</option>
                    {allKams.map(k => (
                      <option key={k.id} value={k.id}>{k.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* KAM ON-SITE AUDIT FORM */}
                <form onSubmit={(e) => handleSaveKamAudit(e, selectedApplication.id)} style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '0.95rem' }}>KAM On-Site Audit Findings</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Location Score (1-5 Stars)</label>
                      <input 
                        type="number" min="1" max="5" 
                        value={kamAuditForm.kam_location_score} 
                        onChange={(e) => setKamAuditForm({ ...kamAuditForm, kam_location_score: e.target.value })} 
                        className="form-input" style={{ padding: '0.5rem' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Equipment Score (1-5 Stars)</label>
                      <input 
                        type="number" min="1" max="5" 
                        value={kamAuditForm.kam_equipment_score} 
                        onChange={(e) => setKamAuditForm({ ...kamAuditForm, kam_equipment_score: e.target.value })} 
                        className="form-input" style={{ padding: '0.5rem' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>POS Financial Cross-Check</label>
                      <select 
                        value={kamAuditForm.kam_financial_verification}
                        onChange={(e) => setKamAuditForm({ ...kamAuditForm, kam_financial_verification: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      >
                        <option value="Pass">Pass (Verified 100%)</option>
                        <option value="Partial">Partial Match</option>
                        <option value="Fail">Fail / Discrepancy</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Legal Document Audit</label>
                      <select 
                        value={kamAuditForm.kam_legal_doc_status}
                        onChange={(e) => setKamAuditForm({ ...kamAuditForm, kam_legal_doc_status: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      >
                        <option value="Verified">Verified Authentic</option>
                        <option value="Pending">Pending Audit</option>
                        <option value="Unverified">Unverified / Suspect</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>KAM Notes & Field Report</label>
                    <textarea 
                      rows={2} 
                      value={kamAuditForm.kam_notes} 
                      onChange={(e) => setKamAuditForm({ ...kamAuditForm, kam_notes: e.target.value })} 
                      placeholder="On-site findings, daily footfall observed, machinery condition..." 
                      className="form-input" style={{ padding: '0.5rem' }} 
                    />
                  </div>

                  <button type="submit" style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Save Audit & Compute AI Health Score
                  </button>
                </form>

                {/* REJECTION ACTION */}
                {rejectingAppId === selectedApplication.id ? (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Rejection Reason</label>
                    <textarea 
                      rows={2} 
                      value={rejectionReasonInput} 
                      onChange={(e) => setRejectionReasonInput(e.target.value)} 
                      placeholder="e.g. Discrepancy in stated sales vs physical POS audit" 
                      className="form-input" 
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setRejectingAppId(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>Cancel</button>
                      <button onClick={() => handleRejectApp(selectedApplication.id)} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>Confirm Reject</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRejectingAppId(selectedApplication.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Reject Application
                  </button>
                )}

                {/* 1-CLICK DEAL PIPELINE CONVERSION ACTION */}
                <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(16,185,129,0.15))', border: '1px solid #D4AF37', padding: '1.25rem', borderRadius: '10px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', color: '#D4AF37', fontSize: '1.05rem' }}>🚀 Onboard to Deal Pipeline</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
                    Auto-provisions Founder, Business, Stakeholders & Deal Campaign at "Origination" stage.
                  </p>

                  <button 
                    onClick={() => handleConvertCohortToDeal(selectedApplication)}
                    disabled={convertingAppId === selectedApplication.id || selectedApplication.status === 'Onboarded_To_Pipeline'}
                    className="btn-gold" 
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                  >
                    {convertingAppId === selectedApplication.id ? 'Converting...' : selectedApplication.status === 'Onboarded_To_Pipeline' ? 'Already Onboarded ✓' : 'Approve & Onboard to Deal Pipeline'}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* INVESTOR PORTFOLIO DRAWER */}
      {/* ---------------------------------------------------- */}

      {/* ---------------------------------------------------- */}
      {/* 5-TAB INVESTOR INSPECTION DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedInvestor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '580px', background: '#0f172a', borderLeft: '1px solid rgba(212,175,55,0.3)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* DRAWER HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    {selectedInvestor.investor_category || 'HNI'}
                  </span>
                  {selectedInvestor.requires_anonymity && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Lock size={12} /> Privacy Coverage
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{selectedInvestor.alias_name}</h3>
              </div>
              <button onClick={() => setSelectedInvestor(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* 5 SUB-TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.2rem' }}>
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'investments', label: 'Investments' },
                { id: 'yield', label: 'Yield History' },
                { id: 'kyc-docs', label: 'KYC & Docs' },
                { id: 'notes', label: 'KAM Notes' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setInvestorDrawerTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.4rem',
                    background: investorDrawerTab === tab.id ? 'rgba(212,175,55,0.2)' : 'transparent',
                    color: investorDrawerTab === tab.id ? '#D4AF37' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PROFILE */}
            {investorDrawerTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                
                {/* Status Override */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem' }}>
                  <label style={{ color: '#D4AF37', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Lifecycle Onboarding Status</label>
                  <select 
                    value={selectedInvestor.onboarding_status || (selectedInvestor.kyc_verified ? 'Active' : 'Invited')}
                    onChange={(e) => handleUpdateInvestorStatus(selectedInvestor.id, e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontWeight: 'bold' }}
                  >
                    <option value="Invited">Invited (Telegram Pending)</option>
                    <option value="Telegram_Verified">Telegram Verified</option>
                    <option value="KYC_L1">KYC Level 1 (Alias Set)</option>
                    <option value="KYC_L2">KYC Level 2 (NID Verified)</option>
                    <option value="KYC_L3">KYC Level 3 (Funds Source Verified)</option>
                    <option value="Active">Active Investor</option>
                    <option value="VIP">VIP Investor (High Volume)</option>
                  </select>
                </div>

                {/* Privacy Toggle */}
                <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#a78bfa' }}>Privacy & Anonymity Coverage</p>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>When active, phone and email are masked across all table views and public exports.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleAnonymity(selectedInvestor.id, selectedInvestor.requires_anonymity)}
                    style={{
                      background: selectedInvestor.requires_anonymity ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {selectedInvestor.requires_anonymity ? 'Active 🔒' : 'Off'}
                  </button>
                </div>

                {/* Detailed Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Phone Number</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: '#fff' }}>{selectedInvestor.phone || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Email Address</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: '#fff' }}>{selectedInvestor.email || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Origin Source</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: '#f59e0b' }}>
                      {selectedInvestor.origin_source || 'Admin Direct'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Tagged Promoter</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: '#fff' }}>
                      {selectedInvestor.promoters?.alias_name || selectedInvestor.promoters?.full_name || 'None'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Assigned KAM</span>
                    <select 
                      value={selectedInvestor.assigned_kam_id || ''} 
                      onChange={(e) => handleAssignKamToInvestor(selectedInvestor.id, e.target.value)}
                      style={{ width: '100%', marginTop: '0.2rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}
                    >
                      <option value="">-- Unassigned --</option>
                      {allKams.map(k => (
                        <option key={k.id} value={k.id}>{k.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Joined Platform</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: '#94a3b8' }}>
                      {new Date(selectedInvestor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: INVESTMENTS */}
            {investorDrawerTab === 'investments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeInvestments.filter(i => i.investor_id === selectedInvestor.id).length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No active settled investments recorded for this investor.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {activeInvestments.filter(i => i.investor_id === selectedInvestor.id).map(inv => (
                      <div key={inv.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <p style={{ fontWeight: 'bold', margin: 0, color: '#fff' }}>{inv.funding_projects?.project_title}</p>
                          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {inv.status || 'Active'}
                          </span>
                        </div>
                        <p style={{ color: '#10b981', fontWeight: 'bold', margin: 0, fontSize: '1.05rem' }}>
                          {formatCurrency(inv.amount_invested_bdt, currency)}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.3rem 0 0 0' }}>
                          Yield Option {inv.yield_option} | Settled {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: YIELD HISTORY */}
            {investorDrawerTab === 'yield' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.8rem', margin: 0, fontWeight: 'bold' }}>Yield Payout Engine Summary</p>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.2rem 0 0 0' }}>
                    Automated monthly disbursements derived from campaign gross/net POS reports.
                  </p>
                </div>
                {yieldDisbursements.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No yield disbursements recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {yieldDisbursements.map(yd => (
                      <div key={yd.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{yd.funding_projects?.project_title}</p>
                          <p style={{ margin: '0.1rem 0 0 0', color: '#94a3b8' }}>Disbursement Batch: {yd.disbursement_month || 'Monthly'}</p>
                        </div>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(yd.total_disbursed_bdt || 0, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KYC & DOCS */}
            {investorDrawerTab === 'kyc-docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Current Clearance</p>
                  <h4 style={{ margin: '0.2rem 0 0 0', color: '#D4AF37' }}>KYC Level {selectedInvestor.kyc_level || 1} Verified</h4>
                </div>

                <h4 style={{ margin: 0, color: '#fff' }}>KYC Submissions History</h4>
                {kycSubmissions.filter(k => k.investor_id === selectedInvestor.id).length === 0 ? (
                  <p style={{ color: '#64748b' }}>No individual KYC submissions recorded.</p>
                ) : (
                  kycSubmissions.filter(k => k.investor_id === selectedInvestor.id).map(sub => (
                    <div key={sub.id} style={{ background: '#070a14', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#D4AF37' }}>Level {sub.target_level} Submission</span>
                        <span style={{ color: sub.status === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{sub.status}</span>
                      </div>
                      {sub.target_level === 2 && (
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                          {sub.nid_front_url && <a href={sub.nid_front_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>View NID Front</a>}
                          {sub.nid_back_url && <a href={sub.nid_back_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>View NID Back</a>}
                        </div>
                      )}
                      {sub.target_level === 3 && sub.source_of_funds && (
                        <p style={{ fontStyle: 'italic', color: '#cbd5e1', margin: '0.3rem 0 0 0' }}>"{sub.source_of_funds}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: KAM NOTES */}
            {investorDrawerTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                
                {/* Notes Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {allInvestorNotes.filter(n => n.investor_id === selectedInvestor.id).length === 0 ? (
                    <p style={{ color: '#64748b' }}>No communication notes logged for this investor yet.</p>
                  ) : (
                    allInvestorNotes.filter(n => n.investor_id === selectedInvestor.id).map(n => (
                      <div key={n.id} style={{ background: '#070a14', border: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {n.note_type || 'General'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#f8fafc', lineHeight: '1.4' }}>{n.content}</p>
                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.7rem', color: '#64748b' }}>
                          By: <strong style={{ color: '#94a3b8' }}>{n.kams?.full_name || 'Admin'}</strong>
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={(e) => handleSaveInvestorNote(e, selectedInvestor.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                  <label style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.8rem' }}>+ Log KAM / Admin Communication Note</label>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select 
                      value={newNoteForm.note_type}
                      onChange={(e) => setNewNoteForm({ ...newNoteForm, note_type: e.target.value })}
                      style={{ background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value="General">General Note</option>
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">In-Person Meeting</option>
                      <option value="Warning">Compliance / Warning</option>
                      <option value="Milestone">Investment Milestone</option>
                    </select>
                  </div>

                  <textarea 
                    rows={3}
                    placeholder="Record conversation summary, commitments made, or follow-up notes..."
                    value={newNoteForm.content}
                    onChange={(e) => setNewNoteForm({ ...newNoteForm, content: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.8rem' }}
                    required
                  />

                  <button type="submit" disabled={savingNote} className="btn-gold" style={{ padding: '0.65rem', justifyContent: 'center', fontSize: '0.85rem' }}>
                    {savingNote ? 'Logging Note...' : 'Save Note to Timeline'}
                  </button>
                </form>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MANUAL ADD INVESTOR SUB-MODAL */}
      {/* ---------------------------------------------------- */}
      {showAddInvestorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'grid', placeItems: 'center', padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Onboard New Investor</h3>
              <button onClick={() => setShowAddInvestorModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddInvestor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Investor Alias Name (Public Handle)</label>
                <input 
                  type="text" 
                  value={newInvestorForm.alias_name}
                  onChange={(e) => setNewInvestorForm({ ...newInvestorForm, alias_name: e.target.value })}
                  placeholder="e.g. Investor Apex 01"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                  <input 
                    type="text" 
                    value={newInvestorForm.phone}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, phone: e.target.value })}
                    placeholder="+88017..."
                    className="form-input"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={newInvestorForm.email}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, email: e.target.value })}
                    placeholder="investor@domain.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Investor Category</label>
                  <select 
                    value={newInvestorForm.investor_category}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, investor_category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="HNI">High Net Worth Individual (HNI)</option>
                    <option value="UHNWI">Ultra HNI (UHNWI)</option>
                    <option value="Family_Office">Family Office (Single)</option>
                    <option value="Institutional">Institutional Partner</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Status</label>
                  <select 
                    value={newInvestorForm.onboarding_status}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, onboarding_status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Invited">Invited (Default)</option>
                    <option value="Telegram_Verified">Telegram Verified</option>
                    <option value="KYC_L1">KYC Level 1</option>
                    <option value="KYC_L2">KYC Level 2</option>
                    <option value="KYC_L3">KYC Level 3</option>
                    <option value="Active">Active Investor</option>
                    <option value="VIP">VIP Investor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Origin Tagging Source</label>
                  <select 
                    value={newInvestorForm.origin_source}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, origin_source: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Admin">Admin Panel Direct</option>
                    <option value="Promoter">Promoter Tagged</option>
                    <option value="Public_Page">Public Web Ingestion</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Tag Responsible Promoter</label>
                  <select 
                    value={newInvestorForm.origin_promoter_id}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, origin_promoter_id: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="">-- No Promoter Tag --</option>
                    {allPromoters.map(p => (
                      <option key={p.id} value={p.id}>{p.alias_name || p.full_name} ({p.referral_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(139,92,246,0.1)', padding: '0.75rem', borderRadius: '6px' }}>
                <input 
                  type="checkbox" 
                  id="add_anonymity_check"
                  checked={newInvestorForm.requires_anonymity}
                  onChange={(e) => setNewInvestorForm({ ...newInvestorForm, requires_anonymity: e.target.checked })}
                />
                <label htmlFor="add_anonymity_check" style={{ color: '#a78bfa', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Enable Privacy Coverage (Mask Contact Details in Public Exports)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddInvestorModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingInvestor} className="btn-gold" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  {savingInvestor ? 'Onboarding...' : 'Onboard Investor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PER-PROJECT INVESTOR DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedProjectForInvestors && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '520px', background: '#0f172a', borderLeft: '1px solid rgba(212,175,55,0.3)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 'bold' }}>Project CapEx Investors</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff', margin: '0.2rem 0 0 0' }}>{selectedProjectForInvestors.project_title}</h3>
              </div>
              <button onClick={() => setSelectedProjectForInvestors(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Total Target:</span>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{formatCurrency(selectedProjectForInvestors.target_raise_bdt, currency)}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Amount Raised:</span>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#10b981' }}>{formatCurrency(selectedProjectForInvestors.amount_raised_bdt || 0, currency)}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', margin: 0 }}>Backed Investors List</h4>
            {activeInvestments.filter(i => i.project_id === selectedProjectForInvestors.id).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                No active investments settled for this campaign yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeInvestments.filter(i => i.project_id === selectedProjectForInvestors.id).map(inv => (
                  <div key={inv.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.2rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>{inv.investors?.alias_name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Yield Model: Option {inv.yield_option}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#10b981', fontWeight: 'bold', margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{formatCurrency(inv.amount_invested_bdt, currency)}</p>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STAGE ADVANCE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {advanceModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: '#D4AF37', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Advance Project Stage</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to move <strong>"{advanceModal.project?.project_title}"</strong> to the <strong>"{advanceModal.targetStage}"</strong> stage?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setAdvanceModal({ open: false, project: null, targetStage: '' })} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button onClick={handleConfirmAdvanceStage} style={{ flex: 1, background: '#D4AF37', color: '#000', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Confirm Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FULL PROJECT CREATE / EDIT MODAL (6 TABS) */}
      {/* ---------------------------------------------------- */}
      {showProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, color: '#D4AF37' }}>
                {editingProjectId ? '✏ Edit Project Campaign' : '🚀 Onboard New Project Campaign'}
              </h3>
              <button onClick={() => setShowProjectModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* MODAL TABS (6 TABS) */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>
              {['basics', 'financials', 'spv', 'content', 'gallery', 'summary'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setProjectModalTab(tab)}
                  style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: projectModalTab === tab ? '2px solid #D4AF37' : '2px solid transparent', color: projectModalTab === tab ? '#D4AF37' : '#94a3b8', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {tab === 'spv' ? 'SPV & Legal' : tab}
                </button>
              ))}
            </div>

            {/* MODAL BODY FORM */}
            <form onSubmit={handleSaveProject} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* TAB 1: BASICS */}
              {projectModalTab === 'basics' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Project Title</label>
                    <input 
                      type="text" 
                      value={projectForm.project_title}
                      onChange={(e) => setProjectForm({ ...projectForm, project_title: e.target.value })}
                      placeholder="e.g. ORO Roasters Hub 4 - Gulshan 2"
                      className="form-input" 
                      required
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Linked Business Brand</label>
                      <button 
                        type="button" 
                        onClick={() => setShowNewBusinessModal(true)}
                        style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        + Create New Business Brand
                      </button>
                    </div>
                    <select 
                      value={projectForm.business_id}
                      onChange={(e) => setProjectForm({ ...projectForm, business_id: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    >
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.brand_name} ({b.company_legal_name || 'Standard'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Physical Outlet Location Address</label>
                    <input 
                      type="text" 
                      value={projectForm.location_address}
                      onChange={(e) => setProjectForm({ ...projectForm, location_address: e.target.value })}
                      placeholder="e.g. Shop 4A, Road 11, Gulshan 2, Dhaka"
                      className="form-input" 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Funding Type</label>
                      <select 
                        value={projectForm.funding_type}
                        onChange={(e) => setProjectForm({ ...projectForm, funding_type: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      >
                        <option value="Franchise">Franchise Expansion</option>
                        <option value="Distribution">Distribution Hub</option>
                        <option value="Equity">Equity SPV</option>
                        <option value="Short-Term Debt">Short-Term Debt</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Pipeline Stage</label>
                      <select 
                        value={projectForm.status}
                        onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      >
                        {kanbanStages.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Assigned Key Account Manager (KAM)</label>
                    <select 
                      value={projectForm.kam_id}
                      onChange={(e) => setProjectForm({ ...projectForm, kam_id: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    >
                      <option value="">-- Unassigned --</option>
                      {allKams.map(k => (
                        <option key={k.id} value={k.id}>{k.full_name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* TAB 2: FINANCIALS & YIELD RATES */}
              {projectModalTab === 'financials' && (
                <>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Target CapEx Raise (BDT)</label>
                      <input 
                        type="number" 
                        value={projectForm.target_raise_bdt}
                        onChange={(e) => setProjectForm({ ...projectForm, target_raise_bdt: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Min OTC Ticket Size (BDT)</label>
                      <input 
                        type="number" 
                        value={projectForm.min_otc_investment_bdt}
                        onChange={(e) => setProjectForm({ ...projectForm, min_otc_investment_bdt: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Expected Close Date</label>
                      <input 
                        type="date" 
                        value={projectForm.expected_close_date}
                        onChange={(e) => setProjectForm({ ...projectForm, expected_close_date: e.target.value })}
                        className="form-input" 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Buildout Timeline (Months)</label>
                      <input 
                        type="number" 
                        value={projectForm.buildout_timeline_months}
                        onChange={(e) => setProjectForm({ ...projectForm, buildout_timeline_months: e.target.value })}
                        className="form-input" 
                      />
                    </div>
                  </div>

                  {/* YIELD RATES CONFIGURATION */}
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#D4AF37', fontWeight: 'bold' }}>Per-Project Structured Yield Option Rates (%):</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 1 (Fixed Gross)</label>
                        <input 
                          type="number" 
                          value={projectForm.yield_option_1_rate} 
                          onChange={(e) => setProjectForm({ ...projectForm, yield_option_1_rate: e.target.value })} 
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 2 (Growth Gross)</label>
                        <input 
                          type="number" 
                          value={projectForm.yield_option_2_rate} 
                          onChange={(e) => setProjectForm({ ...projectForm, yield_option_2_rate: e.target.value })} 
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Option 3 (Net Profit)</label>
                        <input 
                          type="number" 
                          value={projectForm.yield_option_3_rate} 
                          onChange={(e) => setProjectForm({ ...projectForm, yield_option_3_rate: e.target.value })} 
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: SPV & LEGAL */}
              {projectModalTab === 'spv' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>SPV Legal Entity Name</label>
                    <input 
                      type="text" 
                      value={projectForm.spv_name}
                      onChange={(e) => setProjectForm({ ...projectForm, spv_name: e.target.value })}
                      placeholder="e.g. ORO SPV4 Gulshan Ltd."
                      className="form-input" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>SPV Registration / CJS Number</label>
                    <input 
                      type="text" 
                      value={projectForm.spv_reg_number}
                      onChange={(e) => setProjectForm({ ...projectForm, spv_reg_number: e.target.value })}
                      placeholder="e.g. C-198234/2026"
                      className="form-input" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>SPV Entity Type</label>
                    <select 
                      value={projectForm.spv_entity_type}
                      onChange={(e) => setProjectForm({ ...projectForm, spv_entity_type: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    >
                      <option value="Pvt Ltd">Private Limited Company (Pvt Ltd)</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Trust">Special Purpose Trust</option>
                    </select>
                  </div>
                </>
              )}

              {/* TAB 4: CONTENT */}
              {projectModalTab === 'content' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Project Description (Public Profile)</label>
                    <textarea 
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Describe the opportunity, hub location, unit economics, etc."
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Project Highlights (One per line)</label>
                    <textarea 
                      rows={3}
                      value={projectForm.project_highlights}
                      onChange={(e) => setProjectForm({ ...projectForm, project_highlights: e.target.value })}
                      placeholder="Built in 45 days&#10;500 sqft prime footfall location&#10;150+ active daily customers"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Cover Image</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={projectForm.cover_image_url}
                        onChange={(e) => setProjectForm({ ...projectForm, cover_image_url: e.target.value })}
                        placeholder="https://..."
                        className="form-input"
                        style={{ flex: 1 }}
                      />
                      <label style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {uploadingCover ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" onChange={handleUploadCoverImage} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Video Embed URL (YouTube/Facebook)</label>
                    <input 
                      type="text" 
                      value={projectForm.video_url}
                      onChange={(e) => setProjectForm({ ...projectForm, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input 
                      type="checkbox" 
                      id="showcase_toggle"
                      checked={projectForm.show_on_showcase}
                      onChange={(e) => setProjectForm({ ...projectForm, show_on_showcase: e.target.checked })}
                    />
                    <label htmlFor="showcase_toggle" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                      Publish on Public Deal Showcase Page (`/showcase`)
                    </label>
                  </div>
                </>
              )}

              {/* TAB 5: GALLERY */}
              {projectModalTab === 'gallery' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Project Photos & Media</h4>
                    <label style={{ background: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {uploadingGallery ? 'Uploading...' : '+ Add Photos'}
                      <input type="file" accept="image/*" multiple onChange={handleUploadGalleryImage} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {projectForm.media_list.length === 0 ? (
                    <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
                      No photo assets uploaded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {projectForm.media_list.map((m, idx) => (
                        <div key={idx} style={{ position: 'relative', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={m.media_url || m.url} alt="Project Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => handleDeleteGalleryMedia(idx)}
                            style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.8rem', display: 'grid', placeItems: 'center' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 6: SUMMARY */}
              {projectModalTab === 'summary' && (
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <h4 style={{ margin: 0, color: '#D4AF37' }}>Campaign Validation Checklist</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: projectForm.project_title ? '#10b981' : '#ef4444' }}>
                    <CheckCircle2 size={16} /> Title: {projectForm.project_title || 'Missing'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: projectForm.target_raise_bdt ? '#10b981' : '#ef4444' }}>
                    <CheckCircle2 size={16} /> CapEx Target: {formatCurrency(projectForm.target_raise_bdt, currency)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: projectForm.spv_name ? '#10b981' : '#f59e0b' }}>
                    <CheckCircle2 size={16} /> SPV Entity: {projectForm.spv_name || 'Not Configured'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: projectForm.cover_image_url ? '#10b981' : '#f59e0b' }}>
                    <CheckCircle2 size={16} /> Cover Image: {projectForm.cover_image_url ? 'Provided' : 'Default Fallback'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                    <CheckCircle2 size={16} /> Gallery Photos: {projectForm.media_list.length} assets
                  </div>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingProjectId ? 'Save Changes' : 'Publish Campaign'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* INLINE NEW BUSINESS SUB-MODAL */}
      {/* ---------------------------------------------------- */}
      {showNewBusinessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'grid', placeItems: 'center', padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Create New Business Brand</h3>
              <button onClick={() => setShowNewBusinessModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveNewBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Brand Name</label>
                <input 
                  type="text" 
                  value={newBusinessForm.brand_name} 
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, brand_name: e.target.value })} 
                  placeholder="e.g. ORO Roasters" 
                  className="form-input" 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Company Legal Name</label>
                <input 
                  type="text" 
                  value={newBusinessForm.company_legal_name} 
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, company_legal_name: e.target.value })} 
                  placeholder="e.g. ORO Bangladesh Pvt Ltd" 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Industry Sector</label>
                  <select 
                    value={newBusinessForm.industry_sector}
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, industry_sector: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="F&B Franchise">F&B Franchise</option>
                    <option value="Retail Distribution">Retail Distribution</option>
                    <option value="Services">Services</option>
                    <option value="Tech & Logistics">Tech & Logistics</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Operational Months</label>
                  <input 
                    type="number" 
                    value={newBusinessForm.operational_months} 
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, operational_months: e.target.value })} 
                    className="form-input" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Founder Full Name</label>
                <input 
                  type="text" 
                  value={newBusinessForm.founder_name} 
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, founder_name: e.target.value })} 
                  placeholder="e.g. Tanvir Ahmed" 
                  className="form-input" 
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Founder LinkedIn Profile URL</label>
                <input 
                  type="text" 
                  value={newBusinessForm.founder_linkedin_url} 
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, founder_linkedin_url: e.target.value })} 
                  placeholder="https://linkedin.com/in/..." 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowNewBusinessModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingBusiness} className="btn-gold" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  {savingBusiness ? 'Saving...' : 'Save & Select Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


function InquiryLeadsTab({ currency, addToast }) {
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

  // Lead Status Handler
  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('inquiry_leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      addToast(`Lead status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
      fetchAllData();
    } catch (err) {
      addToast('Failed to update lead status', 'error');
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
      addToast(promoterId ? 'Promoter assigned! Lead status moved to Promoter Assigned.' : 'Promoter unassigned', 'success');
      fetchAllData();
    } catch (err) {
      addToast('Failed to assign promoter', 'error');
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
      addToast('Managing Partner assigned to lead.', 'success');
      fetchAllData();
    } catch (err) {
      addToast('Failed to assign Managing Partner', 'error');
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
      addToast('Lead notes and follow-up date saved.', 'success');
      fetchAllData();
    } catch (err) {
      addToast('Failed to save lead details', 'error');
    }
  };

  // Manual Add Lead
  const handleAddManualLead = async (e) => {
    e.preventDefault();
    if (!addLeadForm.name || !addLeadForm.phone) {
      addToast('Name and Phone are required for leads.', 'error');
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

      addToast('New prospective lead logged successfully!', 'success');
      setAddLeadForm({ name: '', phone: '', email: '', investment_range: '৳10L - ৳50L', source_channel: 'Admin_Entry', notes: '', referral_code: '', meeting_preference: 'Online Call', target_project_id: '' });
      setShowAddLeadForm(false);
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to log lead', 'error');
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

      addToast(`Telegram Bot invite link generated for ${data.full_name}! Status updated to Invite Sent.`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to send Telegram invite', 'error');
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

      addToast(`Promoted pre-profile '${preProfile.full_name}' to full Verified Investor profile!`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to convert investor', 'error');
    }
  };

  // Add Campaign Handler
  const handleAddCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.campaign_name) {
      addToast('Campaign Name is required.', 'error');
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

      addToast(`Marketing Campaign '${campaignForm.campaign_name}' created!`, 'success');
      setCampaignForm({ campaign_name: '', campaign_type: 'Event', start_date: '', end_date: '', budget_bdt: '', notes: '' });
      setShowCampaignForm(false);
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to add campaign', 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Close Campaign Handler
  const handleCloseCampaign = async (id) => {
    try {
      const { error } = await supabase.from('marketing_campaigns').update({ status: 'Completed' }).eq('id', id);
      if (error) throw error;
      addToast('Campaign marked as Completed.', 'info');
      fetchAllData();
    } catch (err) {
      addToast('Failed to update campaign status', 'error');
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Inquiries</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>{leads.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Web & Public Ingest</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Unworked (New)</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ec4899', margin: 0 }}>
            {leads.filter(l => l.status === 'New').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#ec4899' }}>Awaiting Promoter Tag</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Promoter Surveys</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#a855f7', margin: 0 }}>{preProfiles.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>Enriched Investor Files</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending Bot Invites</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {preProfiles.filter(p => p.survey_status === 'Complete' || p.survey_status === 'In_Progress').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Awaiting Telegram Verification</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Converted Investors</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {leads.filter(l => l.status === 'Converted').length + preProfiles.filter(p => p.survey_status === 'Converted').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Full Active Portfolios</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
        <button 
          onClick={() => setLeadsSubTab('pipeline')}
          style={{ background: 'transparent', border: 'none', borderBottom: leadsSubTab === 'pipeline' ? '2px solid #D4AF37' : '2px solid transparent', color: leadsSubTab === 'pipeline' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Inquiry Lead Pipeline ({leads.length})
        </button>
        <button 
          onClick={() => setLeadsSubTab('survey-vault')}
          style={{ background: 'transparent', border: 'none', borderBottom: leadsSubTab === 'survey-vault' ? '2px solid #D4AF37' : '2px solid transparent', color: leadsSubTab === 'survey-vault' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Promoter Survey Vault ({preProfiles.length})
        </button>
        <button 
          onClick={() => setLeadsSubTab('campaigns')}
          style={{ background: 'transparent', border: 'none', borderBottom: leadsSubTab === 'campaigns' ? '2px solid #D4AF37' : '2px solid transparent', color: leadsSubTab === 'campaigns' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Marketing Campaigns ({campaigns.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: INQUIRY LEAD PIPELINE */}
      {/* ---------------------------------------------------- */}
      {leadsSubTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Public Prospective Inquiry Leads</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Assign promoters to conduct information gathering surveys and reduce investor friction.</p>
            </div>
            
            <button 
              onClick={() => setShowAddLeadForm(!showAddLeadForm)}
              style={{ background: showAddLeadForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showAddLeadForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showAddLeadForm ? '✕ Close Form' : '+ Add Lead Manually'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD LEAD FORM */}
          {showAddLeadForm && (
            <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Log New Offline / Call-In Inquiry Lead</h4>
              <form onSubmit={handleAddManualLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Lead Full Name *</label>
                  <input type="text" placeholder="e.g. Dr. Kazi Mahbub" value={addLeadForm.name} onChange={(e) => setAddLeadForm({ ...addLeadForm, name: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number *</label>
                  <input type="text" placeholder="+88017..." value={addLeadForm.phone} onChange={(e) => setAddLeadForm({ ...addLeadForm, phone: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                  <input type="email" placeholder="kazi@gmail.com" value={addLeadForm.email} onChange={(e) => setAddLeadForm({ ...addLeadForm, email: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target CapEx Range</label>
                  <select value={addLeadForm.investment_range} onChange={(e) => setAddLeadForm({ ...addLeadForm, investment_range: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="৳1L - ৳5L">৳1L - ৳5L (Retail)</option>
                    <option value="৳5L - ৳10L">৳5L - ৳10L</option>
                    <option value="৳10L - ৳50L">৳10L - ৳50L (Standard HNI)</option>
                    <option value="৳50L - ৳2Cr">৳50L - ৳2Cr (UHNWI)</option>
                    <option value="৳2Cr+">৳2Cr+ (Institutional / Family Office)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Source Channel</label>
                  <select value={addLeadForm.source_channel} onChange={(e) => setAddLeadForm({ ...addLeadForm, source_channel: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Admin_Entry">Admin Manual Intake</option>
                    <option value="Website">Public Website</option>
                    <option value="Promoter_Referral">Promoter Referral</option>
                    <option value="Event">Marketing Event</option>
                    <option value="Direct_Call">Direct Call-In</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Project Campaign (Optional)</label>
                  <select value={addLeadForm.target_project_id} onChange={(e) => setAddLeadForm({ ...addLeadForm, target_project_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- General Platform Inquiry --</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Notes</label>
                  <input type="text" placeholder="e.g. Referred by Tanvir, interested in Gulshan outlet deal" value={addLeadForm.notes} onChange={(e) => setAddLeadForm({ ...addLeadForm, notes: e.target.value })} className="form-input" />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingLead} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingLead ? 'Logging...' : 'Log Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTROLS ROW: SEARCH & STATUS PILL FILTERS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'New', 'Promoter_Assigned', 'Survey_In_Progress', 'Survey_Complete', 'Telegram_Invite_Sent', 'Converted', 'Not_Interested'].map(st => (
                <button
                  key={st}
                  onClick={() => setLeadFilter(st)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: leadFilter === st ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                    color: leadFilter === st ? '#000' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <input 
              type="text"
              placeholder="🔍 Search name or phone..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              style={{ width: '220px', padding: '0.45rem 0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
            />
          </div>

          {/* LEADS LIST */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading inquiry leads pipeline...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No inquiry leads found in this view.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                const assignedPromoter = allPromoters.find(p => p.id === lead.assigned_promoter_id);
                const assignedKam = allKams.find(k => k.id === lead.assigned_kam_id);

                return (
                  <div key={lead.id} className="glass-card" style={{ padding: '1.15rem', borderLeft: lead.status === 'New' ? '4px solid #ec4899' : lead.status === 'Converted' ? '4px solid #10b981' : '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 'bold' }}>{lead.name}</h4>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                              {lead.investment_range || 'N/A'}
                            </span>
                            {lead.funding_projects?.project_title && (
                              <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                🎯 {lead.funding_projects.businesses?.brand_name} ({lead.funding_projects.project_title})
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                            <span>📞 {lead.phone}</span>
                            {lead.email && <span>📧 {lead.email}</span>}
                            <span>Source: {lead.source_channel || 'Website'}</span>
                            <span>Captured: {new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {/* INLINE PROMOTER ASSIGNMENT DROPDOWN */}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b' }}>Assigned Promoter</span>
                          <select 
                            value={lead.assigned_promoter_id || ''}
                            onChange={(e) => handleAssignPromoter(lead.id, e.target.value)}
                            style={{ padding: '0.35rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: assignedPromoter ? '#10b981' : '#94a3b8', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                          >
                            <option value="">-- Assign Promoter --</option>
                            {allPromoters.map(p => (
                              <option key={p.id} value={p.id}>{p.alias_name || p.full_name} ({p.referral_code})</option>
                            ))}
                          </select>
                        </div>

                        {/* STATUS SELECTOR */}
                        <div>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b' }}>Pipeline Stage</span>
                          <select 
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                            style={{ padding: '0.35rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#D4AF37', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                          >
                            <option value="New">New</option>
                            <option value="Promoter_Assigned">Promoter Assigned</option>
                            <option value="Survey_In_Progress">Survey In Progress</option>
                            <option value="Survey_Complete">Survey Complete</option>
                            <option value="Telegram_Invite_Sent">Telegram Invite Sent</option>
                            <option value="Converted">Converted</option>
                            <option value="Not_Interested">Not Interested</option>
                          </select>
                        </div>

                        <button 
                          onClick={() => setSelectedLead(isSelected ? null : lead)}
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {isSelected ? 'Close ▲' : 'Inspect ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED LEAD DRAWER */}
                    {isSelected && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <div>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37', fontSize: '0.85rem' }}>📋 Lead Dossier & KAM Assignment</h5>
                          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#cbd5e1' }}>
                            <div>Meeting Preference: <strong style={{ color: '#fff' }}>{lead.meeting_preference || 'Online Call'}</strong></div>
                            <div>Referral Code Used: <strong style={{ color: '#10b981' }}>{lead.referral_code || 'None'}</strong></div>
                            
                            <div style={{ marginTop: '0.4rem' }}>
                              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Managing Partner (KAM)</label>
                              <select 
                                value={lead.assigned_kam_id || ''}
                                onChange={(e) => handleAssignKam(lead.id, e.target.value)}
                                style={{ width: '100%', padding: '0.4rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                              >
                                <option value="">-- Unassigned --</option>
                                {allKams.map(k => (
                                  <option key={k.id} value={k.id}>{k.full_name} ({k.title})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '0.85rem' }}>📝 Admin Notes & Follow-Up Date</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea 
                              rows={2} 
                              defaultValue={lead.notes || ''} 
                              onBlur={(e) => handleSaveLeadDetails(lead.id, e.target.value, lead.follow_up_date)}
                              placeholder="Enter outreach notes, investor feedback, preferred call time..." 
                              className="form-input"
                              style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Follow-Up Date:</span>
                              <input 
                                type="date" 
                                defaultValue={lead.follow_up_date || ''}
                                onChange={(e) => handleSaveLeadDetails(lead.id, lead.notes, e.target.value)}
                                style={{ padding: '0.35rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}
                              />
                            </div>
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
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Promoter Investor Survey Vault</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>
              Enriched investor profiles filled out by promoters to remove friction from the investor onboarding process.
            </p>
          </div>

          {preProfiles.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No promoter surveys submitted yet. When promoters complete investor information gathering, pre-profiles will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {preProfiles.map(profile => {
                const isSelected = selectedPreProfile?.id === profile.id;
                const isComplete = profile.survey_status === 'Complete';
                const isInviteSent = profile.survey_status === 'Telegram_Invite_Sent';
                const isConverted = profile.survey_status === 'Converted';

                return (
                  <div key={profile.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isConverted ? '4px solid #10b981' : isInviteSent ? '4px solid #3b82f6' : isComplete ? '4px solid #D4AF37' : '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>{profile.full_name}</h4>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                            {profile.investor_category || 'HNI'}
                          </span>
                          {profile.funding_projects?.project_title && (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                              🎯 {profile.funding_projects.businesses?.brand_name}
                            </span>
                          )}
                          {profile.requires_anonymity && (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                              🔒 Anonymous
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                          <span>📞 {profile.phone}</span>
                          <span>Promoter: <strong style={{ color: '#D4AF37' }}>{profile.promoters?.alias_name || 'Promoter'}</strong></span>
                          <span>Est. Capacity: <strong style={{ color: '#10b981' }}>{formatCurrency(profile.estimated_investment_capacity_bdt || 0, currency)}</strong></span>
                          <span>Status: <strong style={{ color: isConverted ? '#10b981' : isInviteSent ? '#3b82f6' : '#f59e0b' }}>{profile.survey_status.replace(/_/g, ' ')}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* DISPATCH TELEGRAM BOT INVITE */}
                        {!isConverted && (
                          <button
                            onClick={() => handleSendTelegramInvite(profile.id)}
                            disabled={sendingInviteId === profile.id}
                            style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {sendingInviteId === profile.id ? 'Sending Invite...' : isInviteSent ? '📱 Re-send Telegram Invite' : '📱 Send Telegram Invite'}
                          </button>
                        )}

                        {/* CONVERT TO VERIFIED INVESTOR */}
                        {!isConverted && (
                          <button
                            onClick={() => handleConvertPreProfileToInvestor(profile)}
                            style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            🚀 Convert to Verified Investor
                          </button>
                        )}

                        {isConverted && (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✓ Verified Investor</span>
                        )}

                        <button 
                          onClick={() => setSelectedPreProfile(isSelected ? null : profile)}
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {isSelected ? 'Close ▲' : 'Inspect Dossier ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED PROFILE DOSSIER */}
                    {isSelected && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <h5 style={{ margin: 0, color: '#D4AF37' }}>Identity & Financial Dossier</h5>
                          <div>NID Number: <strong style={{ color: '#fff' }}>{profile.nid_number || 'Unprovided'}</strong></div>
                          <div>Email: <strong style={{ color: '#fff' }}>{profile.email || 'Unprovided'}</strong></div>
                          <div>Source of Funds: <strong style={{ color: '#3b82f6' }}>{profile.source_of_funds || 'Declared Personal Savings'}</strong></div>
                          <div>Preferred Meeting Format: <strong style={{ color: '#fff' }}>{profile.preferred_meeting_type}</strong></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <h5 style={{ margin: 0, color: '#3b82f6' }}>Social Links & Verification</h5>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Marketing Campaign Tracker</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Track events, referral drives, and marketing channel investments.</p>
            </div>
            
            <button 
              onClick={() => setShowCampaignForm(!showCampaignForm)}
              style={{ background: showCampaignForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showCampaignForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showCampaignForm ? '✕ Close Form' : '+ Create Campaign'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD CAMPAIGN FORM */}
          {showCampaignForm && (
            <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Create New Marketing Campaign</h4>
              <form onSubmit={handleAddCampaign} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Campaign Name *</label>
                  <input type="text" placeholder="e.g. Q3 Franchise Expo Dhaka" value={campaignForm.campaign_name} onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Campaign Type</label>
                  <select value={campaignForm.campaign_type} onChange={(e) => setCampaignForm({ ...campaignForm, campaign_type: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Event">Event / Expo</option>
                    <option value="Social_Media">Social Media Ads</option>
                    <option value="WhatsApp_Blast">WhatsApp / Telegram Blast</option>
                    <option value="Referral_Drive">Referral Drive</option>
                    <option value="Email_Campaign">Email Newsletter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Budget BDT</label>
                  <input type="number" placeholder="e.g. 50000" value={campaignForm.budget_bdt} onChange={(e) => setCampaignForm({ ...campaignForm, budget_bdt: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Start Date</label>
                  <input type="date" value={campaignForm.start_date} onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>End Date</label>
                  <input type="date" value={campaignForm.end_date} onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Notes</label>
                  <input type="text" placeholder="Target 100 HNI leads..." value={campaignForm.notes} onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })} className="form-input" />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingCampaign} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingCampaign ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CAMPAIGN CARDS GRID */}
          {campaigns.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No marketing campaigns logged yet.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {campaigns.map(camp => {
                const isActive = camp.status === 'Active';
                return (
                  <div key={camp.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isActive ? '4px solid #D4AF37' : '4px solid #64748b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{camp.campaign_name}</h4>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', marginTop: '0.2rem', display: 'inline-block' }}>
                          {camp.campaign_type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span style={{ background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: isActive ? '#10b981' : '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
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
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', marginTop: 'auto' }}
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

function PlatformSettingsTab({ addToast }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [founderPhone, setFounderPhone] = useState('01708459008');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'owner_telegram_chat_id')
        .single();

      if (data) {
        setTelegramChatId(data.setting_value);
      }
    } catch (err) {
      // No owner Telegram Chat ID configured yet
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: 'owner_telegram_chat_id',
          setting_value: telegramChatId.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) throw error;
      addToast('Telegram Chat ID & System Settings saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem', color: '#fff' }}>Platform & Governance Settings</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Configure founder ownership profiles, system integration tokens, and automated alert dispatchers.</p>
      </div>

      {/* FOUNDER PROFILE CARD */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Founder & Super Admin</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0.2rem 0' }}>Firoz Uddin Ahmed</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Co-Founder & Managing Partner | Full Governance & System Control</p>
          </div>
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            ✓ Verified Admin
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#070a14', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Primary Contact Phone</span>
            <strong style={{ color: '#fff' }}>+880 {founderPhone}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Assigned Bot Channel</span>
            <strong style={{ color: '#D4AF37' }}>Team & Management Bot</strong>
          </div>
        </div>
      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Owner / Operational Team Telegram Chat ID</label>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
            New leads captured by LeadBot on project pages will be dispatched to this Telegram Chat ID instantly.
          </p>
          <input
            type="text"
            placeholder="e.g. 123456789 or -100123456789"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-gold" style={{ justifyContent: 'center', padding: '0.8rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function LegalComplianceTab({ currency, addToast }) {
  const [legalSubTab, setLegalSubTab] = useState('contracts'); // 'contracts' | 'spv' | 'kyc' | 'audit'
  const [legalDocs, setLegalDocs] = useState([]);
  const [spvRegistry, setSpvRegistry] = useState([]);
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [allInvestors, setAllInvestors] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms & Controls
  const [docFilter, setDocFilter] = useState('All');
  const [docSearch, setDocSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [kycStatusFilter, setKycStatusFilter] = useState('All');

  const [showIssueDocForm, setShowIssueDocForm] = useState(false);
  const [showSpvForm, setShowSpvForm] = useState(false);
  const [issuingDoc, setIssuingDoc] = useState(false);
  const [savingSpv, setSavingSpv] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [issueDocForm, setIssueDocForm] = useState({
    investor_id: '', investment_id: '', spv_id: '',
    doc_type: 'Share_Certificate', document_title: '',
    doc_url: '', expiry_date: '', notes: ''
  });

  const [spvForm, setSpvForm] = useState({
    project_id: '', spv_legal_name: '', spv_entity_type: 'Pvt Ltd',
    registration_number: '', registration_date: '', tin_number: '',
    bin_number: '', registered_address: '', authorized_capital_bdt: '',
    paid_up_capital_bdt: '', directors_raw: '', moa_url: '', aoa_url: '',
    trade_license_url: '', status: 'Active', notes: ''
  });

  useEffect(() => {
    fetchAllLegalData();
  }, []);

  const fetchAllLegalData = async () => {
    try {
      setLoading(true);

      // Fetch Legal Documents
      const { data: docsData } = await supabase
        .from('legal_documents')
        .select(`*, investors(alias_name, full_name, user_id), investments(amount_invested_bdt, funding_projects(project_title, businesses(brand_name)))`)
        .order('created_at', { ascending: false });
      setLegalDocs(docsData || []);

      // Fetch SPV Registry
      const { data: spvData } = await supabase
        .from('spv_registry')
        .select(`*, funding_projects(project_title, businesses(brand_name))`)
        .order('created_at', { ascending: false });
      setSpvRegistry(spvData || []);

      // Fetch Compliance Records
      const { data: compData } = await supabase
        .from('investor_compliance')
        .select(`*, investors(alias_name, full_name, phone, kyc_level, onboarding_status)`)
        .order('created_at', { ascending: false });
      setComplianceRecords(compData || []);

      // Helpers
      const { data: invsData } = await supabase.from('investors').select('*');
      setAllInvestors(invsData || []);

      const { data: invmentsData } = await supabase
        .from('investments')
        .select(`*, investors(alias_name, full_name), funding_projects(project_title, businesses(brand_name))`);
      setAllInvestments(invmentsData || []);

      const { data: prjData } = await supabase
        .from('funding_projects')
        .select(`*, businesses(brand_name)`);
      setAllProjects(prjData || []);

    } catch (err) {
      console.error('Error fetching legal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload PDF Handler
  const handleUploadDocumentPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `legal_doc_${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setIssueDocForm({ ...issueDocForm, doc_url: publicUrlData.publicUrl });
      addToast('Document PDF uploaded to storage bucket!', 'success');
    } catch (err) {
      console.error('Upload PDF Error:', err);
      addToast('Failed to upload PDF file', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Issue Document Handler
  const handleIssueDocument = async (e) => {
    e.preventDefault();
    if (!issueDocForm.investor_id || !issueDocForm.doc_url) {
      addToast('Investor and Document PDF URL are required.', 'error');
      return;
    }
    setIssuingDoc(true);
    try {
      const payload = {
        investor_id: issueDocForm.investor_id,
        investment_id: issueDocForm.investment_id || null,
        spv_id: issueDocForm.spv_id || null,
        doc_type: issueDocForm.doc_type,
        document_title: issueDocForm.document_title || issueDocForm.doc_type.replace(/_/g, ' '),
        doc_url: issueDocForm.doc_url,
        expiry_date: issueDocForm.expiry_date || null,
        notes: issueDocForm.notes || null,
        is_signed: false
      };

      const { error } = await supabase.from('legal_documents').insert([payload]);
      if (error) throw error;

      addToast('Legal document successfully issued to investor!', 'success');
      setIssueDocForm({ investor_id: '', investment_id: '', spv_id: '', doc_type: 'Share_Certificate', document_title: '', doc_url: '', expiry_date: '', notes: '' });
      setShowIssueDocForm(false);
      fetchAllLegalData();
    } catch (err) {
      addToast(err.message || 'Failed to issue document', 'error');
    } finally {
      setIssuingDoc(false);
    }
  };

  // Bulk Issue to Project
  const handleBulkIssueToProject = async (projectId, docType) => {
    if (!projectId || projectId === 'All') {
      addToast('Please select a specific project campaign for bulk issuance.', 'error');
      return;
    }

    const projectInvestments = allInvestments.filter(i => i.project_id === projectId);
    if (projectInvestments.length === 0) {
      addToast('No settled investments found for this project.', 'error');
      return;
    }

    try {
      const payloads = projectInvestments.map(inv => ({
        investor_id: inv.investor_id,
        investment_id: inv.id,
        spv_id: projectId,
        doc_type: docType,
        document_title: `${docType.replace(/_/g, ' ')} - ${inv.funding_projects?.project_title}`,
        doc_url: 'https://gro10x.com/templates/spv_agreement_draft.pdf',
        is_signed: false
      }));

      const { error } = await supabase.from('legal_documents').insert(payloads);
      if (error) throw error;

      addToast(`Bulk issued ${docType.replace(/_/g, ' ')} to ${projectInvestments.length} investors!`, 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed bulk issuance', 'error');
    }
  };

  // Mark Signed
  const handleMarkSigned = async (docId) => {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_signed: true, signed_at: new Date().toISOString() })
        .eq('id', docId);

      if (error) throw error;
      addToast('Document marked as E-Signed.', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed to mark document signed', 'error');
    }
  };

  // Revoke Document
  const handleRevokeDoc = async (docId) => {
    try {
      const { error } = await supabase.from('legal_documents').delete().eq('id', docId);
      if (error) throw error;
      addToast('Document revoked & deleted.', 'info');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed to revoke document', 'error');
    }
  };

  // Add SPV Handler
  const handleSaveSpv = async (e) => {
    e.preventDefault();
    if (!spvForm.spv_legal_name) {
      addToast('SPV Legal Name is required.', 'error');
      return;
    }
    setSavingSpv(true);
    try {
      const directorsList = spvForm.directors_raw ? spvForm.directors_raw.split(',').map(d => d.trim()) : [];

      const payload = {
        project_id: spvForm.project_id || null,
        spv_legal_name: spvForm.spv_legal_name,
        spv_entity_type: spvForm.spv_entity_type,
        registration_number: spvForm.registration_number || null,
        registration_date: spvForm.registration_date || null,
        tin_number: spvForm.tin_number || null,
        bin_number: spvForm.bin_number || null,
        registered_address: spvForm.registered_address || null,
        authorized_capital_bdt: spvForm.authorized_capital_bdt ? Number(spvForm.authorized_capital_bdt) : 0,
        paid_up_capital_bdt: spvForm.paid_up_capital_bdt ? Number(spvForm.paid_up_capital_bdt) : 0,
        directors: directorsList,
        moa_url: spvForm.moa_url || null,
        aoa_url: spvForm.aoa_url || null,
        trade_license_url: spvForm.trade_license_url || null,
        status: spvForm.status,
        notes: spvForm.notes || null
      };

      const { error } = await supabase.from('spv_registry').insert([payload]);
      if (error) throw error;

      addToast(`SPV Entity '${spvForm.spv_legal_name}' registered successfully!`, 'success');
      setSpvForm({ project_id: '', spv_legal_name: '', spv_entity_type: 'Pvt Ltd', registration_number: '', registration_date: '', tin_number: '', bin_number: '', registered_address: '', authorized_capital_bdt: '', paid_up_capital_bdt: '', directors_raw: '', moa_url: '', aoa_url: '', trade_license_url: '', status: 'Active', notes: '' });
      setShowSpvForm(false);
      fetchAllLegalData();
    } catch (err) {
      addToast(err.message || 'Failed to save SPV', 'error');
    } finally {
      setSavingSpv(false);
    }
  };

  // Toggle Compliance Check
  const handleToggleComplianceField = async (investorId, field, currentValue) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        const { error } = await supabase
          .from('investor_compliance')
          .update({ [field]: !currentValue, last_reviewed_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, [field]: true, last_reviewed_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast('Compliance checklist updated.', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed to update compliance checklist', 'error');
    }
  };

  // Verify Investor KYC
  const handleVerifyKyc = async (investorId) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        await supabase
          .from('investor_compliance')
          .update({ kyc_status: 'Verified', kyc_verified_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, kyc_status: 'Verified', kyc_verified_at: new Date().toISOString() }]);
      }

      await supabase
        .from('investors')
        .update({ onboarding_status: 'Active', kyc_level: 2 })
        .eq('id', investorId);

      addToast('Investor KYC verified & promoted to Active Level 2!', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed to verify KYC', 'error');
    }
  };

  // Flag AML
  const handleFlagAml = async (investorId) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        await supabase
          .from('investor_compliance')
          .update({ aml_status: 'Flagged', last_reviewed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, aml_status: 'Flagged', last_reviewed_at: new Date().toISOString() }]);
      }
      addToast('Investor flagged for AML Compliance Review.', 'warning');
      fetchAllLegalData();
    } catch (err) {
      addToast('Failed to flag AML status', 'error');
    }
  };

  // Filtered Legal Docs
  const filteredDocs = legalDocs.filter(d => {
    const matchesFilter = docFilter === 'All' || d.doc_type === docFilter;
    const matchesProject = selectedProject === 'All' || d.spv_id === selectedProject;
    const searchLower = docSearch.toLowerCase();
    const matchesSearch = !docSearch || 
      (d.document_title && d.document_title.toLowerCase().includes(searchLower)) ||
      (d.investors?.alias_name && d.investors.alias_name.toLowerCase().includes(searchLower));
    return matchesFilter && matchesProject && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4-TILE KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Docs Issued</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>{legalDocs.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Share Certs & Subscription Agrmts</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Awaiting E-Signature</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {legalDocs.filter(d => !d.is_signed).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Pending Investor Sign-off</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending KYC Reviews</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ec4899', margin: 0 }}>
            {complianceRecords.filter(c => c.kyc_status === 'Pending').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#ec4899' }}>Awaiting Compliance Sign-off</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Registered SPV Entities</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{spvRegistry.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Special Purpose Vehicles</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
        <button 
          onClick={() => setLegalSubTab('contracts')}
          style={{ background: 'transparent', border: 'none', borderBottom: legalSubTab === 'contracts' ? '2px solid #D4AF37' : '2px solid transparent', color: legalSubTab === 'contracts' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Contract Issuance Engine ({legalDocs.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('spv')}
          style={{ background: 'transparent', border: 'none', borderBottom: legalSubTab === 'spv' ? '2px solid #D4AF37' : '2px solid transparent', color: legalSubTab === 'spv' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          SPV Registry ({spvRegistry.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('kyc')}
          style={{ background: 'transparent', border: 'none', borderBottom: legalSubTab === 'kyc' ? '2px solid #D4AF37' : '2px solid transparent', color: legalSubTab === 'kyc' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          KYC / AML Compliance Queue ({complianceRecords.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('audit')}
          style={{ background: 'transparent', border: 'none', borderBottom: legalSubTab === 'audit' ? '2px solid #D4AF37' : '2px solid transparent', color: legalSubTab === 'audit' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Document Audit Log
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: CONTRACT ISSUANCE ENGINE */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>SPV Contracts & Share Certificates Engine</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Issue, upload, and track legal contracts and share certificates across SPV projects.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => handleBulkIssueToProject(selectedProject, 'Subscription_Agreement')}
                style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.4)', padding: '0.45rem 0.85rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                🗂 Bulk Issue Subscriptions
              </button>

              <button 
                onClick={() => setShowIssueDocForm(!showIssueDocForm)}
                style={{ background: showIssueDocForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showIssueDocForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {showIssueDocForm ? '✕ Close Form' : '+ Issue New Document'}
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE ISSUE DOCUMENT FORM */}
          {showIssueDocForm && (
            <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Issue Legal Contract / Share Certificate</h4>
              <form onSubmit={handleIssueDocument} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Investor *</label>
                  <select value={issueDocForm.investor_id} onChange={(e) => setIssueDocForm({ ...issueDocForm, investor_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required>
                    <option value="">-- Select Investor --</option>
                    {allInvestors.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.alias_name || inv.full_name} ({inv.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Linked Investment Booking</label>
                  <select value={issueDocForm.investment_id} onChange={(e) => setIssueDocForm({ ...issueDocForm, investment_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- Unlinked / General --</option>
                    {allInvestments.map(m => (
                      <option key={m.id} value={m.id}>{m.investors?.alias_name} - {m.funding_projects?.project_title} ({formatCurrency(m.amount_invested_bdt, currency)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document Type *</label>
                  <select value={issueDocForm.doc_type} onChange={(e) => setIssueDocForm({ ...issueDocForm, doc_type: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Share_Certificate">Share Certificate</option>
                    <option value="Subscription_Agreement">Subscription Agreement</option>
                    <option value="Tax_Document">Tax Document</option>
                    <option value="MOU">MOU / Term Sheet</option>
                    <option value="Termination_Notice">Termination Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document Title</label>
                  <input type="text" placeholder="e.g. ORO Hub 4 Share Certificate #104" value={issueDocForm.document_title} onChange={(e) => setIssueDocForm({ ...issueDocForm, document_title: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document PDF File (Upload or paste URL) *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" placeholder="https://..." value={issueDocForm.doc_url} onChange={(e) => setIssueDocForm({ ...issueDocForm, doc_url: e.target.value })} className="form-input" style={{ flex: 1 }} required />
                    <label style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {uploadingPdf ? 'Uploading...' : '📁 Upload PDF'}
                      <input type="file" accept="application/pdf" onChange={handleUploadDocumentPdf} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Expiry Date (Optional)</label>
                  <input type="date" value={issueDocForm.expiry_date} onChange={(e) => setIssueDocForm({ ...issueDocForm, expiry_date: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Internal Admin Notes</label>
                  <input type="text" placeholder="Issued upon 100% capital clearance..." value={issueDocForm.notes} onChange={(e) => setIssueDocForm({ ...issueDocForm, notes: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={issuingDoc} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {issuingDoc ? 'Issuing...' : 'Issue Document'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTROLS ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'Share_Certificate', 'Subscription_Agreement', 'Tax_Document', 'MOU', 'Termination_Notice'].map(st => (
                <button
                  key={st}
                  onClick={() => setDocFilter(st)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: docFilter === st ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                    color: docFilter === st ? '#000' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ padding: '0.45rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}>
                <option value="All">All Project Campaigns</option>
                {allProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                ))}
              </select>

              <input 
                type="text"
                placeholder="🔍 Search doc or investor..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                style={{ width: '200px', padding: '0.45rem 0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* DOCUMENTS CARDS GRID */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading legal documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No legal documents issued matching filters.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {filteredDocs.map(doc => {
                const isSigned = doc.is_signed;

                return (
                  <div key={doc.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isSigned ? '4px solid #10b981' : '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{doc.document_title || doc.doc_type.replace(/_/g, ' ')}</h4>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', marginTop: '0.2rem', display: 'inline-block' }}>
                          {doc.doc_type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span style={{ background: isSigned ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: isSigned ? '#10b981' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {isSigned ? '✓ E-Signed' : '⏳ Awaiting Sign'}
                      </span>
                    </div>

                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                      <div>Investor: <strong style={{ color: '#fff' }}>{doc.investors?.alias_name || doc.investors?.full_name}</strong></div>
                      {doc.investments?.funding_projects?.project_title && (
                        <div>Project: <strong style={{ color: '#3b82f6' }}>{doc.investments.funding_projects.businesses?.brand_name} ({doc.investments.funding_projects.project_title})</strong></div>
                      )}
                      <div>Issued: <span>{new Date(doc.created_at).toLocaleDateString()}</span></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <a href={doc.doc_url} target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📋 View PDF Contract ↗
                      </a>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!isSigned && (
                          <button onClick={() => handleMarkSigned(doc.id)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            ✓ Mark Signed
                          </button>
                        )}
                        <button onClick={() => handleRevokeDoc(doc.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: SPV REGISTRY */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'spv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Special Purpose Vehicle (SPV) Registry</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Register legal entities, CJS registration numbers, TIN/BINs, and directors rosters.</p>
            </div>

            <button 
              onClick={() => setShowSpvForm(!showSpvForm)}
              style={{ background: showSpvForm ? 'rgba(255,255,255,0.1)' : '#D4AF37', color: showSpvForm ? '#fff' : '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showSpvForm ? '✕ Close Form' : '+ Register New SPV'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD SPV FORM */}
          {showSpvForm && (
            <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Register New SPV Legal Entity</h4>
              <form onSubmit={handleSaveSpv} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>SPV Legal Entity Name *</label>
                  <input type="text" placeholder="e.g. ORO SPV4 Gulshan Ltd" value={spvForm.spv_legal_name} onChange={(e) => setSpvForm({ ...spvForm, spv_legal_name: e.target.value })} className="form-input" required />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Linked Project Deal</label>
                  <select value={spvForm.project_id} onChange={(e) => setSpvForm({ ...spvForm, project_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- Unlinked SPV --</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Entity Type</label>
                  <select value={spvForm.spv_entity_type} onChange={(e) => setSpvForm({ ...spvForm, spv_entity_type: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Pvt Ltd">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Trust">Special Purpose Trust</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>CJS Registration Number</label>
                  <input type="text" placeholder="C-198234/2026" value={spvForm.registration_number} onChange={(e) => setSpvForm({ ...spvForm, registration_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>TIN Number</label>
                  <input type="text" placeholder="1234567890" value={spvForm.tin_number} onChange={(e) => setSpvForm({ ...spvForm, tin_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>BIN Number (VAT)</label>
                  <input type="text" placeholder="001234567-0101" value={spvForm.bin_number} onChange={(e) => setSpvForm({ ...spvForm, bin_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Authorized Capital (BDT)</label>
                  <input type="number" placeholder="10000000" value={spvForm.authorized_capital_bdt} onChange={(e) => setSpvForm({ ...spvForm, authorized_capital_bdt: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Paid-Up Capital (BDT)</label>
                  <input type="number" placeholder="5000000" value={spvForm.paid_up_capital_bdt} onChange={(e) => setSpvForm({ ...spvForm, paid_up_capital_bdt: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Directors Roster (Comma separated)</label>
                  <input type="text" placeholder="Tanvir Ahmed, Kazi Mahbub" value={spvForm.directors_raw} onChange={(e) => setSpvForm({ ...spvForm, directors_raw: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingSpv} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingSpv ? 'Saving...' : 'Register SPV'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SPV CARDS GRID */}
          {spvRegistry.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No SPV entities registered yet.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {spvRegistry.map(spv => (
                <div key={spv.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{spv.spv_legal_name}</h4>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', marginTop: '0.2rem', display: 'inline-block' }}>
                        {spv.spv_entity_type}
                      </span>
                    </div>

                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      ● {spv.status}
                    </span>
                  </div>

                  <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                    <div>CJS Reg No: <strong style={{ color: '#D4AF37' }}>{spv.registration_number || 'Pending'}</strong></div>
                    <div>TIN: <span>{spv.tin_number || 'N/A'}</span> | BIN: <span>{spv.bin_number || 'N/A'}</span></div>
                    <div>Paid-Up Capital: <strong style={{ color: '#10b981' }}>{formatCurrency(spv.paid_up_capital_bdt || 0, currency)}</strong></div>
                  </div>

                  {Array.isArray(spv.directors) && spv.directors.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Directors: {spv.directors.map((d, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.3rem' }}>{d}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: KYC / AML COMPLIANCE QUEUE */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'kyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>KYC / AML Compliance Queue</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Audit investor NIDs, bank statements, source of funds, and e-signatures.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>Investor</th>
                  <th style={{ padding: '0.75rem' }}>KYC Status</th>
                  <th style={{ padding: '0.75rem' }}>NID Verified</th>
                  <th style={{ padding: '0.75rem' }}>Bank Stmt</th>
                  <th style={{ padding: '0.75rem' }}>Source Declared</th>
                  <th style={{ padding: '0.75rem' }}>E-Signed</th>
                  <th style={{ padding: '0.75rem' }}>AML Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allInvestors.map(inv => {
                  const comp = complianceRecords.find(c => c.investor_id === inv.id) || {};
                  const isVerified = inv.onboarding_status === 'Active' || comp.kyc_status === 'Verified';
                  const isFlagged = comp.aml_status === 'Flagged';

                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{inv.alias_name || inv.full_name}</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{inv.phone}</span>
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)', color: isVerified ? '#10b981' : '#ec4899', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {isVerified ? '✓ Verified L2' : 'Pending L1'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <input type="checkbox" checked={!!comp.nid_verified} onChange={() => handleToggleComplianceField(inv.id, 'nid_verified', comp.nid_verified)} />
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <input type="checkbox" checked={!!comp.bank_statement_received} onChange={() => handleToggleComplianceField(inv.id, 'bank_statement_received', comp.bank_statement_received)} />
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <input type="checkbox" checked={!!comp.source_of_funds_declared} onChange={() => handleToggleComplianceField(inv.id, 'source_of_funds_declared', comp.source_of_funds_declared)} />
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <input type="checkbox" checked={!!comp.e_signature_obtained} onChange={() => handleToggleComplianceField(inv.id, 'e_signature_obtained', comp.e_signature_obtained)} />
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: isFlagged ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: isFlagged ? '#ef4444' : '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {isFlagged ? '🚩 Flagged' : 'Clear'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {!isVerified && (
                            <button onClick={() => handleVerifyKyc(inv.id)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                              ✓ Verify KYC
                            </button>
                          )}
                          {!isFlagged && (
                            <button onClick={() => handleFlagAml(inv.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                              Flag AML
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 4: DOCUMENT AUDIT LOG */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Legal Document Audit Trail</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Immutable chronological record of all contracts and share certificates issued.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Document Title</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Investor</th>
                  <th style={{ padding: '0.75rem' }}>Signed Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Document Link</th>
                </tr>
              </thead>
              <tbody>
                {legalDocs.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{new Date(doc.created_at).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{doc.document_title || 'Contract'}</td>
                    <td style={{ padding: '0.75rem', color: '#D4AF37' }}>{doc.doc_type.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '0.75rem', color: '#fff' }}>{doc.investors?.alias_name || doc.investors?.full_name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: doc.is_signed ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {doc.is_signed ? '✓ Signed' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <a href={doc.doc_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                        View PDF ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================
// TAB 10: ANALYTICS
// ============================================================
function AnalyticsTab({
  currency, activeInvestments, allInvestors, allPromoters,
  promoterCommissions, inquiryLeads, projects, businesses,
  yieldDisbursements, allPosReports, payoutRequests, allBookings
}) {
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview');

  // ---- DERIVED METRICS ----
  const totalAum = (activeInvestments || []).reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
  const totalYieldDisbursed = (yieldDisbursements || []).reduce((acc, d) => acc + Number(d.total_disbursed_bdt || 0), 0);
  const totalCommissionsEarned = (promoterCommissions || []).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0);
  const totalLeads = (inquiryLeads || []).length;
  const activeInvestorCount = (allInvestors || []).filter(i => i.onboarding_status === 'Active').length;
  const avgInvestmentSize = (activeInvestments || []).length > 0 ? totalAum / activeInvestments.length : 0;

  // ---- MONTHLY INVESTMENT VOLUME (last 6 months) ----
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
    return months;
  };
  const months6 = getLast6Months();
  const monthlyVolume = months6.map(m => ({
    ...m,
    amount: (activeInvestments || [])
      .filter(i => i.created_at && i.created_at.startsWith(m.key))
      .reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0)
  }));
  const maxMonthlyVol = Math.max(...monthlyVolume.map(m => m.amount), 1);

  // ---- INVESTOR FUNNEL ----
  const investorStatusList = ['Lead', 'Invited', 'KYC_Pending', 'Active', 'Paused'];
  const funnelColors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#94a3b8'];
  const investorFunnel = investorStatusList.map((s, i) => ({
    label: s.replace(/_/g, ' '),
    count: (allInvestors || []).filter(inv => inv.onboarding_status === s).length,
    color: funnelColors[i]
  }));
  const maxFunnelCount = Math.max(...investorFunnel.map(f => f.count), 1);

  // ---- CATEGORY DONUT ----
  const catColorMap = { HNI: '#D4AF37', Angel: '#3b82f6', Corporate: '#10b981', Retail: '#8b5cf6' };
  const categoryBreakdown = ['HNI', 'Angel', 'Corporate', 'Retail'].map(cat => ({
    label: cat, color: catColorMap[cat],
    count: (allInvestors || []).filter(i => i.investor_category === cat).length
  })).filter(c => c.count > 0);
  const totalCatCount = categoryBreakdown.reduce((a, c) => a + c.count, 0) || 1;
  const buildDonutPaths = (data, total, cx, cy, r) => {
    let cum = 0;
    return data.map(seg => {
      const frac = seg.count / total;
      const startA = (cum / total) * 2 * Math.PI - Math.PI / 2;
      cum += seg.count;
      const endA = (cum / total) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
      const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
      return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`, color: seg.color, label: seg.label, count: seg.count };
    });
  };
  const donutPaths = buildDonutPaths(categoryBreakdown, totalCatCount, 80, 80, 65);

  // ---- DEAL PIPELINE ----
  const dealStages = ['Origination', 'Diligence', 'SPV_Structuring', 'Fundraising', 'Buildout', 'Live', 'Closed'];
  const stageColors = { Origination: '#94a3b8', Diligence: '#f59e0b', SPV_Structuring: '#3b82f6', Fundraising: '#D4AF37', Buildout: '#8b5cf6', Live: '#10b981', Closed: '#475569' };
  const dealPipeline = dealStages
    .map(s => ({ label: s.replace(/_/g, ' '), key: s, count: (projects || []).filter(p => p.status === s).length }))
    .filter(d => d.count > 0);
  const maxDealCount = Math.max(...dealPipeline.map(d => d.count), 1);

  // ---- PROMOTER LEADERBOARD ----
  const promoterLeaderboard = (allPromoters || [])
    .map(p => ({
      name: p.alias_name || p.full_name,
      id: p.id,
      tier: p.tier,
      earned: (promoterCommissions || []).filter(c => c.promoter_id === p.id).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0),
      leadCount: (inquiryLeads || []).filter(l => l.assigned_promoter_id === p.id).length
    }))
    .sort((a, b) => b.earned - a.earned)
    .slice(0, 5);
  const maxPromoterEarned = Math.max(...promoterLeaderboard.map(p => p.earned), 1);

  // ---- POS REVENUE ----
  const posRevenueByBiz = (businesses || [])
    .map(biz => ({
      name: biz.brand_name,
      revenue: (allPosReports || []).filter(r => r.business_id === biz.id).reduce((acc, r) => acc + Number(r.gross_sales_bdt || 0), 0)
    }))
    .filter(b => b.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
  const maxPosRevenue = Math.max(...posRevenueByBiz.map(b => b.revenue), 1);

  // ---- YIELD BY PROJECT ----
  const yieldByProj = {};
  (yieldDisbursements || []).forEach(d => {
    const k = d.funding_projects?.project_title || 'Unknown';
    yieldByProj[k] = (yieldByProj[k] || 0) + Number(d.total_disbursed_bdt || 0);
  });
  const yieldProjEntries = Object.entries(yieldByProj).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxYieldProj = Math.max(...yieldProjEntries.map(e => e[1]), 1);

  // ---- LEAD SOURCE ----
  const srcColorList = ['#3b82f6', '#D4AF37', '#8b5cf6', '#10b981', '#ec4899'];
  const leadSrcData = ['Organic', 'Referral', 'Promoter', 'Admin', 'Bot'].map((s, i) => ({
    label: s, color: srcColorList[i],
    count: (inquiryLeads || []).filter(l => (l.source || 'Organic') === s).length
  })).filter(l => l.count > 0);
  const maxSrcCount = Math.max(...leadSrcData.map(l => l.count), 1);

  // ---- HELPERS ----
  const fmtCompact = (n) => {
    n = Number(n || 0);
    if (n >= 10000000) return `৳${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
    return `৳${n}`;
  };

  const card = { background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.4rem' };
  const secTitle = (t, sub) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{t}</h3>
      {sub && <p style={{ color: '#475569', fontSize: '0.72rem', margin: '0.15rem 0 0 0' }}>{sub}</p>}
    </div>
  );
  const progressRow = (label, value, max, color, sub) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.28rem', fontSize: '0.8rem' }}>
        <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{label}</span>
        <span style={{ color, fontWeight: '900' }}>{sub || value}</span>
      </div>
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(value > 0 ? (value / max) * 100 : 0, value > 0 ? 3 : 0)}%`, background: color, borderRadius: '4px', transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );

  const subTabs = [
    { key: 'overview', label: 'Platform Overview' },
    { key: 'investors', label: 'Investor Analytics' },
    { key: 'deals', label: 'Deal Pipeline' },
    { key: 'growth', label: 'Growth & Promoters' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>Platform Analytics</h2>
          <p style={{ color: '#475569', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>Real-time intelligence across AUM, investors, deal pipeline, and promoter growth channels.</p>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
          Live · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* 6-TILE HERO KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.85rem' }}>
        {[
          { label: 'Total AUM', value: fmtCompact(totalAum), sub: `${(activeInvestments||[]).length} investments`, color: '#D4AF37' },
          { label: 'Active Investors', value: activeInvestorCount, sub: `of ${(allInvestors||[]).length} total`, color: '#10b981' },
          { label: 'Avg Ticket Size', value: fmtCompact(avgInvestmentSize), sub: 'per booking', color: '#3b82f6' },
          { label: 'Yield Disbursed', value: fmtCompact(totalYieldDisbursed), sub: `${(yieldDisbursements||[]).length} batches`, color: '#8b5cf6' },
          { label: 'Leads Captured', value: totalLeads, sub: 'all channels', color: '#ec4899' },
          { label: 'Commissions Out', value: fmtCompact(totalCommissionsEarned), sub: `${(allPromoters||[]).length} promoters`, color: '#f59e0b' },
        ].map((kpi, i) => (
          <div key={i} style={{ ...card, borderTop: `3px solid ${kpi.color}`, padding: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.65rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</h3>
            <span style={{ fontSize: '0.62rem', color: '#334155', display: 'block', marginTop: '0.2rem' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* SUB-TAB SELECTOR */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.35)', padding: '0.3rem', borderRadius: '10px', width: 'fit-content' }}>
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setAnalyticsSubTab(t.key)} style={{
            padding: '0.5rem 1.15rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '0.85rem',
            background: analyticsSubTab === t.key ? '#D4AF37' : 'transparent',
            color: analyticsSubTab === t.key ? '#000' : '#64748b',
            transition: 'all 0.18s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ============================================================
          SUB-TAB 1: PLATFORM OVERVIEW
      ============================================================ */}
      {analyticsSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Monthly Investment Volume Bar Chart */}
            <div style={card}>
              {secTitle('Monthly Investment Volume', 'Capital committed by investors — last 6 months')}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '150px' }}>
                {monthlyVolume.map((m, i) => {
                  const h = maxMonthlyVol > 0 ? (m.amount / maxMonthlyVol) * 100 : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '700', textAlign: 'center' }}>
                        {m.amount > 0 ? fmtCompact(m.amount) : ''}
                      </span>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: `${Math.max(h, m.amount > 0 ? 5 : 2)}%`,
                        background: m.amount > 0 ? 'linear-gradient(to top, #b8962e, #D4AF37)' : 'rgba(255,255,255,0.04)',
                        boxShadow: m.amount > 0 ? '0 0 8px rgba(212,175,55,0.3)' : 'none',
                        transition: 'height 0.5s ease'
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#475569' }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yield Disbursements by Project */}
            <div style={card}>
              {secTitle('Yield Paid Out — by Project', 'Total investor yield distributed per deal')}
              {yieldProjEntries.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem', paddingTop: '0.5rem' }}>No yield disbursements recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {yieldProjEntries.map(([proj, amount], i) => progressRow(proj, amount, maxYieldProj, '#8b5cf6', fmtCompact(amount)))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* POS Revenue by Business */}
            <div style={card}>
              {secTitle('POS Gross Revenue — by Business', 'Gross sales from POS daily reports')}
              {posRevenueByBiz.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem', paddingTop: '0.5rem' }}>No POS data recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posRevenueByBiz.map((b, i) => progressRow(b.name, b.revenue, maxPosRevenue, '#10b981', fmtCompact(b.revenue)))}
                </div>
              )}
            </div>

            {/* Platform Vitals Grid */}
            <div style={card}>
              {secTitle('Platform Vitals', 'Snapshot across all operational areas')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                {[
                  { label: 'Total Projects', value: (projects||[]).length, color: '#D4AF37' },
                  { label: 'Businesses', value: (businesses||[]).length, color: '#3b82f6' },
                  { label: 'Pending Bookings', value: (allBookings||[]).filter(b => b.status === 'Pending').length, color: '#f59e0b' },
                  { label: 'KYC Pending', value: (allInvestors||[]).filter(i => i.onboarding_status === 'KYC_Pending').length, color: '#ec4899' },
                  { label: 'Total Promoters', value: (allPromoters||[]).length, color: '#8b5cf6' },
                  { label: 'Payout Requests', value: (payoutRequests||[]).filter(r => r.status === 'Pending').length, color: '#ef4444' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.8rem', borderLeft: `3px solid ${stat.color}` }}>
                    <p style={{ color: '#475569', fontSize: '0.62rem', margin: '0 0 0.2rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 2: INVESTOR ANALYTICS
      ============================================================ */}
      {analyticsSubTab === 'investors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Onboarding Funnel */}
            <div style={card}>
              {secTitle('Investor Onboarding Funnel', 'Conversion from Lead → Active investor')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {investorFunnel.map((stage, i) => progressRow(stage.label, stage.count, maxFunnelCount, stage.color, stage.count))}
              </div>
            </div>

            {/* Investor Category Donut */}
            <div style={card}>
              {secTitle('Investor Category Mix', 'HNI · Angel · Corporate · Retail breakdown')}
              {categoryBreakdown.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No investor data.</p>
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                    {donutPaths.map((path, i) => <path key={i} d={path.d} fill={path.color} opacity={0.9} />)}
                    <circle cx="80" cy="80" r="40" fill="#0f172a" />
                    <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">{allInvestors.length}</text>
                    <text x="80" y="92" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="600">INVESTORS</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {categoryBreakdown.map((cat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: cat.color, marginLeft: 'auto' }}>
                          {cat.count} <span style={{ fontSize: '0.65rem', color: '#475569' }}>({Math.round((cat.count / totalCatCount) * 100)}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investor Table Snapshot */}
          <div style={card}>
            {secTitle('Recent Investors — Activity Snapshot', 'Latest 10 investors with investment status')}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ color: '#334155', fontSize: '0.68rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Investor', 'Category', 'Joined', 'Status', '# Investments', 'Total Committed'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(allInvestors || []).slice(0, 10).map(inv => {
                    const invInvs = (activeInvestments || []).filter(i => i.investor_id === inv.id);
                    const committed = invInvs.reduce((a, i) => a + Number(i.amount_invested_bdt || 0), 0);
                    const statusColor = { Active: '#10b981', KYC_Pending: '#f59e0b', Invited: '#3b82f6', Lead: '#94a3b8', Paused: '#ef4444' };
                    const sc = statusColor[inv.onboarding_status] || '#94a3b8';
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 'bold', color: '#fff' }}>
                          {inv.requires_anonymity ? '•••••••' : (inv.alias_name || inv.full_name)}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: catColorMap[inv.investor_category] || '#94a3b8', fontWeight: '700', fontSize: '0.75rem' }}>{inv.investor_category}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>
                          {new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span style={{ background: `${sc}22`, color: sc, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                            {(inv.onboarding_status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1', textAlign: 'center' }}>{invInvs.length}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#D4AF37', fontWeight: '800' }}>{committed > 0 ? fmtCompact(committed) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 3: DEAL PIPELINE
      ============================================================ */}
      {analyticsSubTab === 'deals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Deal Pipeline Stage Breakdown */}
            <div style={card}>
              {secTitle('Deal Pipeline by Stage', 'Active projects per pipeline stage')}
              {dealPipeline.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No project data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {dealPipeline.map((d, i) => {
                    const c = stageColors[d.key] || '#94a3b8';
                    return progressRow(d.label, d.count, maxDealCount, c, d.count);
                  })}
                </div>
              )}
            </div>

            {/* Fundraising Progress */}
            <div style={card}>
              {secTitle('Fundraising Progress per Active Deal', 'Capital raised vs. target')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(projects || []).filter(p => ['Fundraising', 'Buildout', 'Live'].includes(p.status)).slice(0, 5).map(proj => {
                  const raised = (activeInvestments || [])
                    .filter(i => i.project_id === proj.id)
                    .reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                  const target = Number(proj.target_raise_bdt || 1);
                  const pct = Math.min(Math.round((raised / target) * 100), 100);
                  return (
                    <div key={proj.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: '700' }}>{proj.businesses?.brand_name} — {proj.project_title}</span>
                        <span style={{ color: pct >= 100 ? '#10b981' : '#D4AF37', fontWeight: '900' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'linear-gradient(to right,#059669,#10b981)' : 'linear-gradient(to right,#b8962e,#D4AF37)', borderRadius: '4px', transition: 'width 0.7s ease', boxShadow: '0 0 6px rgba(212,175,55,0.3)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#334155', marginTop: '0.2rem' }}>
                        <span>Raised: {fmtCompact(raised)}</span><span>Target: {fmtCompact(target)}</span>
                      </div>
                    </div>
                  );
                })}
                {(projects || []).filter(p => ['Fundraising', 'Buildout', 'Live'].includes(p.status)).length === 0 && (
                  <p style={{ color: '#334155', fontSize: '0.82rem' }}>No active fundraising campaigns.</p>
                )}
              </div>
            </div>
          </div>

          {/* Full Projects Table */}
          <div style={card}>
            {secTitle('All Deal Records', 'Complete project portfolio with capital and yield rates')}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ color: '#334155', fontSize: '0.68rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Business / Project', 'Stage', 'Type', 'Target', 'Raised', 'Progress', 'Yield Rates'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(projects || []).map(proj => {
                    const raised = (activeInvestments || []).filter(i => i.project_id === proj.id).reduce((acc, i) => acc + Number(i.amount_invested_bdt || 0), 0);
                    const target = Number(proj.target_raise_bdt || 1);
                    const pct = Math.min(Math.round((raised / target) * 100), 100);
                    const sc = stageColors[proj.status] || '#94a3b8';
                    return (
                      <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>{proj.businesses?.brand_name}</div>
                          <div style={{ color: '#475569', fontSize: '0.7rem' }}>{proj.project_title}</div>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span style={{ background: `${sc}22`, color: sc, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                            {(proj.status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.75rem' }}>{proj.funding_type}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>{fmtCompact(target)}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#D4AF37', fontWeight: '800' }}>{fmtCompact(raised)}</td>
                        <td style={{ padding: '0.65rem 0.75rem', width: '110px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#D4AF37', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.62rem', color: '#475569', whiteSpace: 'nowrap' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.7rem', color: '#64748b' }}>
                          {proj.yield_option_1_rate}% / {proj.yield_option_2_rate}% / {proj.yield_option_3_rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: GROWTH & PROMOTERS
      ============================================================ */}
      {analyticsSubTab === 'growth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Promoter Commission Leaderboard */}
            <div style={card}>
              {secTitle('Promoter Commission Leaderboard', 'Top 5 promoters by earnings')}
              {promoterLeaderboard.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No commission data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {promoterLeaderboard.map((p, i) => {
                    const rankColor = i === 0 ? '#D4AF37' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#475569';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '900', color: rankColor, width: '22px', textAlign: 'center', flexShrink: 0 }}>#{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: '700', fontSize: '0.82rem' }}>{p.name}</span>
                            <span style={{ color: '#D4AF37', fontWeight: '900', fontSize: '0.82rem' }}>{p.earned > 0 ? fmtCompact(p.earned) : '৳0'}</span>
                          </div>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(p.earned / maxPromoterEarned) * 100}%`, background: i === 0 ? 'linear-gradient(to right,#b8962e,#D4AF37)' : 'rgba(212,175,55,0.3)', borderRadius: '4px', transition: 'width 0.7s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.62rem', color: '#334155' }}>{p.leadCount} leads assigned · {p.tier}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lead Source + Status */}
            <div style={card}>
              {secTitle('Lead Acquisition Channels', 'Where investors discover GRO10X')}
              {leadSrcData.length === 0 ? (
                <p style={{ color: '#334155', fontSize: '0.82rem' }}>No lead source data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {leadSrcData.map((src, i) => progressRow(src.label, src.count, maxSrcCount, src.color, `${src.count} leads`))}
                </div>
              )}
              <div style={{ marginTop: '1.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <p style={{ color: '#D4AF37', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.04em' }}>Lead Conversion Status</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { s: 'new', c: '#3b82f6' }, { s: 'contacted', c: '#f59e0b' }, { s: 'qualified', c: '#8b5cf6' },
                    { s: 'converted', c: '#10b981' }, { s: 'dead', c: '#ef4444' }
                  ].map(({ s, c }, i) => {
                    const cnt = (inquiryLeads || []).filter(l => (l.status || 'new') === s).length;
                    return (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '6px', borderLeft: `3px solid ${c}` }}>
                        <p style={{ color: '#475569', fontSize: '0.6rem', margin: '0 0 0.15rem 0', fontWeight: '800', textTransform: 'uppercase' }}>{s}</p>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: c, lineHeight: 1 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* All Promoters Table */}
          <div style={card}>
            {secTitle('All Promoters — Performance Overview', 'Commission, leads, tier, and payout status')}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ color: '#334155', fontSize: '0.68rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Promoter', 'Tier', 'Leads', 'Commissions Earned', 'Pending Payouts', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(allPromoters || []).map(p => {
                    const earned = (promoterCommissions || []).filter(c => c.promoter_id === p.id).reduce((acc, c) => acc + Number(c.commission_bdt || 0), 0);
                    const pending = (payoutRequests || []).filter(r => r.promoter_id === p.id && r.status === 'Pending').length;
                    const tierColor = { Master: '#D4AF37', Senior: '#3b82f6', Junior: '#10b981', Trainee: '#94a3b8' };
                    const tc = tierColor[p.tier] || '#94a3b8';
                    const leads = (inquiryLeads || []).filter(l => l.assigned_promoter_id === p.id).length;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 'bold', color: '#fff' }}>{p.alias_name || p.full_name}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span style={{ background: `${tc}22`, color: tc, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>{p.tier}</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1', textAlign: 'center' }}>{leads}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#D4AF37', fontWeight: '800' }}>{earned > 0 ? fmtCompact(earned) : '—'}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: pending > 0 ? '#f59e0b' : '#334155', fontWeight: pending > 0 ? '700' : 'normal' }}>
                          {pending > 0 ? `${pending} pending` : 'None'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>
                          {p.joined_at ? new Date(p.joined_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================
// TAB 12: BOT MANAGEMENT & TELEGRAM ACCESS CONTROL
// ============================================================
function BotManagementTab({ currency, addToast }) {
  const [botSubTab, setBotSubTab] = useState('bots'); // 'bots' | 'directory' | 'pins' | 'commands'
  const [botConfigs, setBotConfigs] = useState([]);
  const [authPins, setAuthPins] = useState([]);
  const [allUsersDirectory, setAllUsersDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bot Editing Form State
  const [editingBotKey, setEditingBotKey] = useState(null);
  const [botForm, setBotForm] = useState({
    bot_key: '', bot_name: '', bot_username: '', bot_token: '', webhook_url: '', mini_app_url: '', welcome_message: '', is_active: true
  });
  const [savingBot, setSavingBot] = useState(false);

  // PIN Generation State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinForm, setPinForm] = useState({ phone_number: '', user_role: 'investor', linked_name: '' });
  const [generatingPin, setGeneratingPin] = useState(false);

  // Filters
  const [dirSearch, setDirSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchBotData();
  }, []);

  const fetchBotData = async () => {
    try {
      setLoading(true);

      // Fetch Bot Configs
      const { data: bData } = await supabase.from('bot_configurations').select('*').order('created_at', { ascending: true });
      if (bData && bData.length > 0) {
        setBotConfigs(bData);
      } else {
        // Fallback default 3-bot structure
        setBotConfigs([
          {
            bot_key: 'team_bot',
            bot_name: 'GRO10X Team & Management Bot',
            bot_username: '@gro10xmanbot',
            bot_token: '8824027905:AAF9bJSiq6_yGNhNZ1hVNNjyYDssHXKUIcE',
            mini_app_url: 'https://t.me/gro10xmanbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=team',
            is_active: true,
            welcome_message: 'Welcome to GRO10X Management Bot. Access your web panel PIN, lead alerts, and team notifications here.'
          },
          {
            bot_key: 'investor_bot',
            bot_name: 'GRO10X Capital Investor Bot',
            bot_username: '@gro10xcapbot',
            bot_token: '8706301575:AAEoke9ZgeFAMsJqbQY-z1e4zF4aQwTnFpc',
            mini_app_url: 'https://t.me/gro10xcapbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=investor',
            is_active: true,
            welcome_message: 'Welcome to GRO10X Capital! Check your portfolio, yield statements, or request a temporary web login PIN.'
          },
          {
            bot_key: 'client_bot',
            bot_name: 'GRO10X Business & Client Bot',
            bot_username: '@gro10xbizbot',
            bot_token: '8529005937:AAF5AE7oV2YDjH3IOGfGDtuyBSFSZcPMQvI',
            mini_app_url: 'https://t.me/gro10xbizbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=client',
            is_active: true,
            welcome_message: 'Welcome Business Founder! Log daily POS sales, upload audit documents, and request your web panel access PIN.'
          }
        ]);
      }

      // Fetch Telegram Auth PINs
      const { data: pData } = await supabase.from('telegram_auth_pins').select('*').order('created_at', { ascending: false });
      setAuthPins(pData || []);

      // Fetch Unified Users for Directory
      const { data: teamMembers } = await supabase.from('team').select('id, full_name, phone, email, team_type, designation, telegram_chat_id, user_id');
      const { data: invs } = await supabase.from('investors').select('id, alias_name, full_name, phone, telegram_chat_id');

      const directory = [
        ...(teamMembers || []).map(t => ({ 
          id: t.id, 
          name: t.full_name, 
          phone: t.phone || 'N/A', 
          email: t.email || 'N/A', 
          role: t.team_type, 
          designation: t.designation || 'Team Member',
          chat_id: t.telegram_chat_id || null, 
          verified: !!t.telegram_chat_id 
        })),
        ...(invs || []).map(i => ({ 
          id: i.id, 
          name: i.alias_name || i.full_name, 
          phone: i.phone || 'N/A', 
          email: 'N/A', 
          role: 'investor', 
          designation: 'Accredited Investor',
          chat_id: i.telegram_chat_id || null, 
          verified: !!i.telegram_chat_id 
        }))
      ];
      setAllUsersDirectory(directory);

    } catch (err) {
      console.error('Error fetching bot data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register Webhook with Telegram API
  const handleRegisterWebhook = async (botKey) => {
    try {
      const res = await fetch('/api/admin/register-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_key: botKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register webhook');
      addToast(`✓ Telegram Webhook registered for ${botKey}! Endpoint: ${data.webhookUrl}`, 'success');
    } catch (err) {
      addToast(err.message || 'Webhook registration failed', 'error');
    }
  };

  // Edit Bot Config
  const handleOpenEditBot = (bot) => {
    setEditingBotKey(bot.bot_key);
    setBotForm({
      bot_key: bot.bot_key,
      bot_name: bot.bot_name || '',
      bot_username: bot.bot_username || '',
      bot_token: bot.bot_token || '',
      webhook_url: bot.webhook_url || '',
      mini_app_url: bot.mini_app_url || '',
      welcome_message: bot.welcome_message || '',
      is_active: bot.is_active ?? true
    });
  };

  // Save Bot Config
  const handleSaveBotConfig = async (e) => {
    e.preventDefault();
    setSavingBot(true);
    try {
      const payload = {
        bot_key: botForm.bot_key,
        bot_name: botForm.bot_name,
        bot_username: botForm.bot_username,
        bot_token: botForm.bot_token,
        webhook_url: botForm.webhook_url,
        mini_app_url: botForm.mini_app_url,
        welcome_message: botForm.welcome_message,
        is_active: botForm.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('bot_configurations').upsert(payload, { onConflict: 'bot_key' });
      if (error) throw error;

      addToast(`Bot Configuration '${botForm.bot_name}' saved successfully!`, 'success');
      setEditingBotKey(null);
      fetchBotData();
    } catch (err) {
      addToast(err.message || 'Failed to save bot config', 'error');
    } finally {
      setSavingBot(false);
    }
  };

  // Generate Temporary PIN for User
  const handleGeneratePin = async (e) => {
    e.preventDefault();
    if (!pinForm.phone_number) {
      addToast('Phone number is required.', 'error');
      return;
    }
    setGeneratingPin(true);
    try {
      // 4-digit random PIN
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

      const payload = {
        phone_number: pinForm.phone_number,
        user_role: pinForm.user_role,
        temp_pin: generatedPin,
        pin_expires_at: expiresAt,
        is_verified: false
      };

      const { error } = await supabase.from('telegram_auth_pins').insert([payload]);
      if (error) throw error;

      addToast(`Temporary Access PIN (${generatedPin}) generated for ${pinForm.linked_name || pinForm.phone_number}! Active for 15 mins.`, 'success');
      setShowPinModal(false);
      setPinForm({ phone_number: '', user_role: 'investor', linked_name: '' });
      fetchBotData();
    } catch (err) {
      addToast(err.message || 'Failed to generate PIN', 'error');
    } finally {
      setGeneratingPin(false);
    }
  };

  // Filtered Users Directory
  const filteredUsers = allUsersDirectory.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch = !dirSearch || u.name.toLowerCase().includes(dirSearch.toLowerCase()) || u.phone.includes(dirSearch);
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4-TILE HEADER KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Configured Telegram Bots</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>3 Active Bots</h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Team, Investor & Client Bots</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Telegram Linked Users</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {allUsersDirectory.filter(u => u.verified).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>of {allUsersDirectory.length} total platform users</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Active Auth PINs</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {authPins.filter(p => new Date(p.pin_expires_at) > new Date()).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#D4AF37' }}>Temporary 15-min Login PINs</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Management Bot Token</p>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', margin: 0, fontFamily: 'monospace' }}>
            8824027905:...
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Team Bot Configured</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '0.75rem' }}>
        <button 
          onClick={() => setBotSubTab('bots')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'bots' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'bots' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          The 3 Bots Ecosystem ({botConfigs.length})
        </button>
        <button 
          onClick={() => setBotSubTab('directory')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'directory' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'directory' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Telegram User Access Directory ({allUsersDirectory.length})
        </button>
        <button 
          onClick={() => setBotSubTab('pins')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'pins' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'pins' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          PIN & Web Security Logs ({authPins.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: THE 3 BOTS ECOSYSTEM */}
      {/* ---------------------------------------------------- */}
      {botSubTab === 'bots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>The 3 Dedicated Telegram Bots Ecosystem</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Configure API tokens, webhooks, welcome prompts, and mini-app interface endpoints for all 3 bots.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {botConfigs.map(bot => {
              const isEditing = editingBotKey === bot.bot_key;

              return (
                <div key={bot.bot_key} className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #D4AF37', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{bot.bot_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontFamily: 'monospace' }}>{bot.bot_username}</span>
                    </div>
                    <span style={{ background: bot.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: bot.is_active ? '#10b981' : '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {bot.is_active ? '● Active' : 'Inactive'}
                    </span>
                  </div>

                  {!isEditing ? (
                    <>
                      <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#cbd5e1' }}>
                        <div>Bot Token: <strong style={{ color: bot.bot_token ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{bot.bot_token ? `${bot.bot_token.slice(0, 12)}...` : 'Not Configured'}</strong></div>
                        <div>Mini-App Endpoint: <a href={bot.mini_app_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{bot.mini_app_url || 'N/A'}</a></div>
                        <div>Webhook URL: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{bot.webhook_url || 'Default'}</span></div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                        "{bot.welcome_message || 'Welcome to GRO10X Bot.'}"
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button onClick={() => handleOpenEditBot(bot)} style={{ flex: 1, background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.45rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                          ⚙ Edit Config
                        </button>
                        <button onClick={() => handleRegisterWebhook(bot.bot_key)} style={{ flex: 1, background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.45rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                          🔗 Webhook
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSaveBotConfig} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Bot API Token *</label>
                        <input type="text" value={botForm.bot_token} onChange={(e) => setBotForm({ ...botForm, bot_token: e.target.value })} className="form-input" placeholder="8824027905:AAF..." style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Telegram Username</label>
                        <input type="text" value={botForm.bot_username} onChange={(e) => setBotForm({ ...botForm, bot_username: e.target.value })} className="form-input" placeholder="@gro10x_bot" style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Mini-App Link</label>
                        <input type="text" value={botForm.mini_app_url} onChange={(e) => setBotForm({ ...botForm, mini_app_url: e.target.value })} className="form-input" style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Welcome Message</label>
                        <textarea value={botForm.welcome_message} onChange={(e) => setBotForm({ ...botForm, welcome_message: e.target.value })} className="form-input" rows={2} style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={savingBot} className="btn-gold" style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem' }}>
                          {savingBot ? 'Saving...' : 'Save Bot'}
                        </button>
                        <button type="button" onClick={() => setEditingBotKey(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: TELEGRAM USER ACCESS DIRECTORY */}
      {/* ---------------------------------------------------- */}
      {botSubTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Telegram Access & PIN Verification Directory</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Track Telegram Chat ID linkage and issue temporary web access PINs per user.</p>
            </div>

            <button 
              onClick={() => setShowPinModal(true)}
              style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🔑 Generate Temp PIN
            </button>
          </div>

          {/* CONTROLS ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['All', 'admin', 'kam', 'promoter', 'investor'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: roleFilter === r ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                    color: roleFilter === r ? '#000' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {r}s
                </button>
              ))}
            </div>

            <input 
              type="text"
              placeholder="🔍 Search name or phone..."
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              style={{ width: '220px', padding: '0.45rem 0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
            />
          </div>

          {/* DIRECTORY TABLE */}
          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Phone Number</th>
                  <th style={{ padding: '0.75rem' }}>Telegram Chat ID</th>
                  <th style={{ padding: '0.75rem' }}>Telegram Verification</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{user.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: user.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)', color: user.role === 'admin' ? '#D4AF37' : '#3b82f6', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>{user.phone}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#D4AF37' }}>{user.chat_id || 'Not Linked'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: user.verified ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {user.verified ? '✓ Verified' : '⏳ Pending Link'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          setPinForm({ phone_number: user.phone === 'N/A' ? '' : user.phone, user_role: user.role, linked_name: user.name });
                          setShowPinModal(true);
                        }}
                        style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🔑 Issue Access PIN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE PIN MODAL */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '450px', background: '#0f172a', padding: '1.75rem', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#D4AF37', fontSize: '1.1rem' }}>Generate Temporary Access PIN</h3>
              <button onClick={() => setShowPinModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleGeneratePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>User Name / Target</label>
                <input type="text" value={pinForm.linked_name} onChange={(e) => setPinForm({ ...pinForm, linked_name: e.target.value })} className="form-input" placeholder="e.g. Firoz Uddin Ahmed" />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number *</label>
                <input type="text" value={pinForm.phone_number} onChange={(e) => setPinForm({ ...pinForm, phone_number: e.target.value })} className="form-input" placeholder="01708459008" required />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Role</label>
                <select value={pinForm.user_role} onChange={(e) => setPinForm({ ...pinForm, user_role: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                  <option value="admin">Admin / Management</option>
                  <option value="kam">KAM (Managing Partner)</option>
                  <option value="promoter">Promoter</option>
                  <option value="investor">Investor</option>
                  <option value="client">Client / Business Founder</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={generatingPin} className="btn-gold" style={{ padding: '0.6rem 1.25rem' }}>
                  {generatingPin ? 'Generating...' : 'Issue 15-Min PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: PIN & WEB SECURITY LOGS */}
      {/* ---------------------------------------------------- */}
      {botSubTab === 'pins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>PIN Security & Verification Audit Logs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Real-time security log of temporary PIN generation, expiration, and web login verification.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>Issued At</th>
                  <th style={{ padding: '0.75rem' }}>Phone Number</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Generated PIN</th>
                  <th style={{ padding: '0.75rem' }}>Expires At</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {authPins.map(pin => {
                  const isExpired = new Date(pin.pin_expires_at) < new Date();

                  return (
                    <tr key={pin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{new Date(pin.created_at).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{pin.phone_number}</td>
                      <td style={{ padding: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>{pin.user_role}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.1em' }}>{pin.temp_pin}</td>
                      <td style={{ padding: '0.75rem', color: isExpired ? '#ef4444' : '#94a3b8' }}>{new Date(pin.pin_expires_at).toLocaleTimeString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <span style={{ background: pin.is_verified ? 'rgba(16,185,129,0.15)' : isExpired ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: pin.is_verified ? '#10b981' : isExpired ? '#ef4444' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {pin.is_verified ? '✓ Verified' : isExpired ? 'Expired' : 'Active 15-Min'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
