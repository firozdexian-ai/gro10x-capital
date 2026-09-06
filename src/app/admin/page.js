'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import CommandCenterTab from './tabs/CommandCenterTab';
import DealPipelineTab from './tabs/DealPipelineTab';
import BusinessRegistryTab from './tabs/BusinessRegistryTab';
import ValuationModelTab from './tabs/ValuationModelTab';
import InvestorHubTab from './tabs/InvestorHubTab';
import YieldEngineTab from './tabs/YieldEngineTab';
import CashConciergeTab from './tabs/CashConciergeTab';
import TeamPromotersTab from './tabs/TeamPromotersTab';
import LegalComplianceTab from './tabs/LegalComplianceTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import InquiryLeadsTab from './tabs/InquiryLeadsTab';
import BotManagementTab from './tabs/BotManagementTab';
import AdminSettingsTab from './tabs/AdminSettingsTab';
import SecondaryClearanceTab from './tabs/SecondaryClearanceTab';
import WorkOrdersTab from './tabs/WorkOrdersTab';
import { getWorkOrders } from '../../lib/workOrders';
import CohortInspectionDrawer from './modals/CohortInspectionDrawer';
import InvestorDetailDrawer from './modals/InvestorDetailDrawer';
import ProjectFormModal from './modals/ProjectFormModal';
import BusinessFormModal from './modals/BusinessFormModal';

const kanbanStages = [
  { id: 'Origination', title: '1. Origination & Pitch Review' },
  { id: 'Diligence', title: '2. Diligence & Valuation' },
  { id: 'Funding', title: '3. Active Capital Raise (90/10)' },
  { id: 'Active', title: '4. Active National Grid Hub' },
  { id: 'Closed', title: '5. Closed / Matured' },
];

export default function AdminPortal() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Role Guard: Redirect unauthenticated or non-Admin users
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (role && role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, role, authLoading, router]);
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
  const [secondaryOrders, setSecondaryOrders] = useState([]);
  const [isClearingSecondary, setIsClearingSecondary] = useState(false);
  const [allInvestorNotes, setAllInvestorNotes] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});
  const [workOrders, setWorkOrders] = useState([]);
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
    referral_code_used: '', onboarding_status: 'Invited',
    preferred_channel: 'WhatsApp', initial_note: ''
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

      // Fetch Secondary Orders
      const { data: secOrdersData } = await supabase
        .from('secondary_orders')
        .select(`*, investments(*, funding_projects(id, project_title, businesses(brand_name)))`)
        .order('created_at', { ascending: false });
      setSecondaryOrders(secOrdersData || []);

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

      // Fetch Platform Settings
      const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('*');
      if (settingsData && settingsData.length > 0) {
        const sMap = {};
        settingsData.forEach(item => {
          if (item.setting_key) sMap[item.setting_key] = item.setting_value;
        });
        setPlatformSettings(sMap);
      }

      // Fetch Work Orders (Safe Home Fund / Maats Cottage)
      try {
        const woData = await getWorkOrders();
        setWorkOrders(woData || []);
      } catch (e) {}

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

  // Global Escape key dismiss handler for all modals and slide-over drawers
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProjectModal(false);
        setShowNewBusinessModal(false);
        setShowAddInvestorModal(false);
        setSelectedInvestor(null);
        setSelectedApplication(null);
        setSelectedProjectForInvestors(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Stage Advance Handler
  const logPlatformActivity = async (title, message, type = 'info') => {
    const newActivity = {
      id: 'act-' + Date.now(),
      title,
      message,
      type,
      created_at: new Date().toISOString()
    };
    setRecentNotifications(prev => [newActivity, ...prev].slice(0, 20));
    try {
      if (user?.id) {
        await supabase.from('notifications').insert([{
          user_id: user.id,
          title,
          message,
          type,
          is_read: false
        }]);
      }
    } catch (e) {
      console.warn('Activity stream non-blocking insert notice:', e?.message);
    }
  };

  const handleConfirmAdvanceStage = async () => {
    if (!advanceModal.project || !advanceModal.targetStage) return;
    const stageDisplayTitle = advanceModal.targetStageTitle || 
      kanbanStages.find(s => s.id === advanceModal.targetStage)?.title || 
      advanceModal.targetStage;
    try {
      const { error } = await supabase
        .from('funding_projects')
        .update({ status: advanceModal.targetStage })
        .eq('id', advanceModal.project.id);

      if (error) throw error;

      addToast(`Project advanced to ${stageDisplayTitle}`, 'success');
      logPlatformActivity('Project Stage Advanced', `"${advanceModal.project.project_title}" advanced to ${stageDisplayTitle}`, 'info');
      setAdvanceModal({ open: false, project: null, targetStage: '', targetStageTitle: '' });
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to advance stage', 'error');
    }
  };

  // Open Project Modal for Create or Edit (with optional default status)
  const handleOpenProjectModal = async (projectToEdit = null, defaultStatus = 'Origination') => {
    if (projectToEdit && typeof projectToEdit === 'object') {
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
        video_url: projectToEdit.youtube_url || projectToEdit.video_url || '',
        avg_monthly_gross_sales: projectToEdit.avg_monthly_gross_sales || 0,
        avg_monthly_net_profit: projectToEdit.avg_monthly_net_profit || 0,
        booked_amount_bdt: projectToEdit.booked_amount_bdt || 0,
        show_on_showcase: projectToEdit.show_on_showcase !== false,
        media_list: mediaData || []
      });
    } else {
      const initialStatus = typeof projectToEdit === 'string' ? projectToEdit : (defaultStatus || 'Origination');
      setEditingProjectId(null);
      setProjectForm({
        project_title: '',
        business_id: businesses[0]?.id || '',
        funding_type: 'Franchise',
        status: initialStatus || 'Origination',
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
        avg_monthly_gross_sales: 0,
        avg_monthly_net_profit: 0,
        booked_amount_bdt: 0,
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
      logPlatformActivity('New Brand Enlisted', `Brand "${newBusinessForm.brand_name}" created in business registry.`, 'success');
      
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
        youtube_url: projectForm.video_url,
        avg_monthly_gross_sales: Number(projectForm.avg_monthly_gross_sales || 0),
        avg_monthly_net_profit: Number(projectForm.avg_monthly_net_profit || 0),
        booked_amount_bdt: Number(projectForm.booked_amount_bdt || 0),
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
      logPlatformActivity(
        editingProjectId ? 'Project Updated' : 'New Project Onboarded',
        `"${projectForm.project_title}" ${editingProjectId ? 'details updated' : 'onboarded to pipeline'}`,
        'success'
      );
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

      // Dispatch Telegram push notification to Investor
      try {
        await fetch('/api/telegram-notify-investor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investorId: investorId,
            title: approve ? `🎉 KYC Level ${targetLevel} Approved!` : `⚠️ KYC Level ${targetLevel} Update Required`,
            message: approve
              ? `Your identity verification Level ${targetLevel} has been officially approved. You can now access higher allocation tiers and secondary market features.`
              : `Your Level ${targetLevel} submission requires revision. Please re-upload valid documents in the Investor Portal.`,
            actionUrl: `${window.location.origin}/investor`
          })
        });
      } catch (e) {
        console.warn('Failed to notify investor of KYC review:', e);
      }

      addToast(`KYC submission ${status.toLowerCase()}.`, 'success');
      logPlatformActivity(`KYC ${status}`, `Investor KYC Level ${targetLevel} verification was ${status.toLowerCase()}.`, approve ? 'success' : 'warning');
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

      // Dispatch Telegram push notification to Investor
      try {
        await fetch('/api/telegram-notify-investor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investorId: investorId,
            title: approve ? '✅ Payment Proof Verified & Approved' : '⚠️ Payment Proof Needs Revision',
            message: approve
              ? `Your investment payment for booking #${bookingId.slice(0, 8)} has been confirmed. Your SPV allocation is now Active and generating yields.`
              : `Your payment proof for booking #${bookingId.slice(0, 8)} could not be verified. Please check your transaction details or contact your relationship manager.`,
            actionUrl: `${window.location.origin}/investor`
          })
        });
      } catch (e) {
        console.warn('Failed to notify investor of payment review:', e);
      }

      addToast(`Payment proof ${approve ? 'approved' : 'rejected'}.`, 'success');
      logPlatformActivity(
        `Payment ${approve ? 'Approved' : 'Rejected'}`,
        `Payment verification for booking was ${approve ? 'approved and allocated' : 'rejected'}.`,
        approve ? 'success' : 'warning'
      );
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Payment review failed', 'error');
    }
  };

  // Secondary Order Clearance Handler
  const handleClearSecondaryOrder = async (order, approve) => {
    setIsClearingSecondary(true);
    try {
      if (approve) {
        // Resolve buyer from linked booking
        const buyerBooking = allBookings.find(b => b.id === order.buyer_booking_id);
        const buyerInvestorId = buyerBooking?.investor_id;
        if (!buyerInvestorId) {
          throw new Error('No matched buyer booking found for this secondary order.');
        }

        // 1. Update secondary_orders status to Transferred
        const { error: secErr } = await supabase
          .from('secondary_orders')
          .update({ status: 'Transferred' })
          .eq('id', order.id);
        if (secErr) throw secErr;

        // 2. Transfer ownership in investments table to buyer
        const { error: invErr } = await supabase
          .from('investments')
          .update({ investor_id: buyerInvestorId })
          .eq('id', order.investment_id);
        if (invErr) throw invErr;

        // 3. Mark buyer booking as Approved
        if (order.buyer_booking_id) {
          await supabase
            .from('investment_bookings')
            .update({ status: 'Approved' })
            .eq('id', order.buyer_booking_id);
        }

        const projectTitle = order.investments?.funding_projects?.project_title || 'Syndicate Deal';
        const dealAmount = Number(order.seller_price_bdt).toLocaleString();

        // 4. Notify Buyer via Telegram
        try {
          await fetch('/api/telegram-notify-investor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              investorId: buyerInvestorId,
              title: '🎉 Secondary Share Ownership Transferred!',
              message: `Your acquisition of secondary shares in ${projectTitle} for ৳${dealAmount} BDT has been officially cleared by GRO10X Admin.\n\nOwnership is now active in your Portfolio, and upcoming yield disbursements will be credited directly to you.`,
              actionUrl: `${window.location.origin}/investor`
            })
          });
        } catch (e) {
          console.warn('Failed to notify buyer of secondary transfer:', e);
        }

        // 5. Notify Seller via Telegram
        try {
          await fetch('/api/telegram-notify-investor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              investorId: order.seller_investor_id,
              title: '💰 Secondary Share Proceeds Settled!',
              message: `Your secondary sale of shares in ${projectTitle} for ৳${dealAmount} BDT has been settled and approved by GRO10X Admin.\n\nThe net proceeds have been cleared for disbursement.`,
              actionUrl: `${window.location.origin}/investor`
            })
          });
        } catch (e) {
          console.warn('Failed to notify seller of secondary clearance:', e);
        }

        addToast('Secondary share transfer approved and settled!', 'success');
        logPlatformActivity('Secondary Transfer Cleared', `Share in ${projectTitle} transferred from seller to buyer.`, 'success');
      } else {
        // Reject / Cancel order
        await supabase
          .from('secondary_orders')
          .update({ status: 'Cancelled' })
          .eq('id', order.id);

        if (order.buyer_booking_id) {
          await supabase
            .from('investment_bookings')
            .update({ status: 'Rejected' })
            .eq('id', order.buyer_booking_id);
        }

        addToast('Secondary order rejected / cancelled.', 'info');
        logPlatformActivity('Secondary Order Rejected', `Order #${order.id.slice(0, 8)} rejected.`, 'warning');
      }

      fetchAdminData();
    } catch (err) {
      console.error('Error clearing secondary order:', err);
      addToast(err.message || 'Failed to process secondary transfer.', 'error');
    } finally {
      setIsClearingSecondary(false);
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
      logPlatformActivity('Yield Batch Declared', `${disMonth} yield batch declared for "${proj?.project_title || 'Project'}": ${formatCurrency(totalDistributed, currency)} allocated across ${yieldInserts.length} investors.`, 'success');
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
      logPlatformActivity(
        'POS Report Ingested',
        `Manual POS sales report for "${proj?.businesses?.brand_name || 'Campaign'}" (${posEntryForm.report_month}) submitted: ${formatCurrency(posEntryForm.gross_sales_bdt, currency)} gross sales`,
        'success'
      );
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
      logPlatformActivity(
        'POS CSV Batch Ingested',
        `Batch uploaded ${records.length} daily POS sales records for "${proj?.businesses?.brand_name || 'Campaign'}"`,
        'success'
      );
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
      logPlatformActivity(
        'Disbursement Proof Saved',
        `Attached banking reference (${disbPaymentForm.payment_txn_ref || 'Ref'}) & settlement receipt to disbursement batch`,
        'info'
      );
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
      logPlatformActivity(
        'Yield Disbursement Finalised',
        `Disbursement batch ${disbId} marked as Finalised and locked for payouts`,
        'success'
      );
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
      logPlatformActivity(
        'Telegram Yield Push Sent',
        `Broadcasted yield distribution notifications to ${data.notified_count} investors via Telegram Bot`,
        'success'
      );
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

      // Dispatch Telegram push notification to Investor for Cash Concierge
      try {
        const ticket = cashTickets.find(t => t.id === ticketId) || selectedCashTicket;
        if (ticket && ticket.investor_id) {
          await fetch('/api/telegram-notify-investor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              investorId: ticket.investor_id,
              title: `💼 Cash Concierge: ${newStatus.replace('_', ' ')}`,
              message: newStatus === 'Meeting_Scheduled'
                ? `A meeting has been scheduled for your OTC Block Trade request (Ticket #${ticketId.slice(0, 8)}). Your Managing Partner will reach out to you.`
                : newStatus === 'Funds_Cleared'
                ? `Funds have been cleared for your OTC Block Trade (Ticket #${ticketId.slice(0, 8)}). Your SPV allocation has been recorded.`
                : `Your OTC Concierge Ticket #${ticketId.slice(0, 8)} status is now ${newStatus.replace('_', ' ')}.`,
              actionUrl: `${window.location.origin}/cash-concierge`
            })
          });
        }
      } catch (e) {
        console.warn('Failed to notify investor of cash status update:', e);
      }

      addToast(`Cash ticket status updated to ${newStatus.replace('_', ' ')}.`, 'success');
      logPlatformActivity(
        'OTC Ticket Status Updated',
        `Cash concierge advisory ticket #${ticketId} status changed to ${newStatus.replace('_', ' ')}`,
        newStatus === 'Closed' ? 'info' : newStatus === 'Rejected' ? 'warning' : 'success'
      );
      
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
      logPlatformActivity(
        'Managing Partner Assigned',
        `Assigned ${assignedKam?.full_name || 'Managing Partner'} to OTC consultation ticket #${ticketId}`,
        'info'
      );
      
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
      logPlatformActivity(
        'OTC Consultation Scheduled',
        `Confirmed ${cashMeetingForm.format.replace('_', ' ')} consultation on ${new Date(cashMeetingForm.date).toLocaleString()} for ticket #${ticketId}`,
        'success'
      );
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
      logPlatformActivity(
        'OTC Advisory Note Added',
        `Internal diligence note logged on OTC consultation ticket #${ticketId}`,
        'info'
      );
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
      logPlatformActivity(
        'OTC Escrow Funds Cleared',
        `Cleared & verified funds transfer reference (${cashFundsRef}) for OTC ticket #${ticketId}`,
        'success'
      );
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
      const proj = projects.find(p => p.id === adminTicketForm.target_project_id);
      
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
      logPlatformActivity(
        'OTC Ticket Created',
        `New confidential OTC advisory ticket created for ${inv?.alias_name || 'HNI Investor'} (${formatCurrency(adminTicketForm.ticket_amount_bdt, currency)}) targeting "${proj?.businesses?.brand_name || 'Project'}"`,
        'success'
      );
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
        logPlatformActivity(
          'Telegram Cash Push Sent',
          `Dispatched ${messageType.replace('_', ' ')} Telegram alert to investor ${ticket.investors?.alias_name}`,
          'success'
        );
      } else {
        addToast(`Notification logged in portal (${data.has_telegram_id ? 'Telegram push failed' : 'No Telegram chat ID registered'}).`, 'info');
        logPlatformActivity(
          'OTC Advisory Notice Recorded',
          `Notification recorded for ticket #${ticket.id} (${data.has_telegram_id ? 'Telegram push failed' : 'No Telegram chat ID'})`,
          'info'
        );
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
      const { data: clearedReq } = await supabase
        .from('payout_requests')
        .select('*, team(telegram_chat_id, phone), promoters(phone)')
        .eq('id', payoutId)
        .maybeSingle();

      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Cleared', cleared_at: new Date().toISOString() })
        .eq('id', payoutId);
      if (error) throw error;
      addToast('Payout marked as cleared.', 'success');
      logPlatformActivity(
        'Commission Payout Cleared',
        `Cleared promoter commission withdrawal request #${payoutId}`,
        'success'
      );

      // Send Telegram alert to promoter
      if (clearedReq) {
        fetch('/api/telegram-notify-promoter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promoterId: clearedReq.promoter_id,
            phone: clearedReq.team?.phone || clearedReq.promoters?.phone,
            title: '🎉 Commission Payout Disbursed!',
            message: `Your commission withdrawal request for ৳${Number(clearedReq.amount_bdt || 0).toLocaleString()} via ${clearedReq.disbursement_channel || 'bKash'} has been Approved & Cleared.`
          })
        }).catch(err => console.error('Error notifying promoter:', err));
      }

      fetchAdminData();
    } catch (err) {
      addToast('Error clearing payout.', 'error');
    }
  };

  // Reject Payout Request Handler
  const handleRejectPayout = async (payoutId) => {
    try {
      const { data: rejectedReq } = await supabase
        .from('payout_requests')
        .select('*, team(telegram_chat_id, phone), promoters(phone)')
        .eq('id', payoutId)
        .maybeSingle();

      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Rejected' })
        .eq('id', payoutId);
      if (error) throw error;
      addToast('Payout request rejected.', 'info');
      logPlatformActivity(
        'Commission Payout Rejected',
        `Declined promoter commission payout request #${payoutId}`,
        'warning'
      );

      // Send Telegram alert to promoter
      if (rejectedReq) {
        fetch('/api/telegram-notify-promoter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promoterId: rejectedReq.promoter_id,
            phone: rejectedReq.team?.phone || rejectedReq.promoters?.phone,
            title: '⚠️ Commission Payout Declined',
            message: `Your withdrawal request for ৳${Number(rejectedReq.amount_bdt || 0).toLocaleString()} via ${rejectedReq.disbursement_channel || 'bKash'} could not be processed at this time.`
          })
        }).catch(err => console.error('Error notifying promoter:', err));
      }

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

      const roleDisplay = payload.team_type === 'admin' ? 'Director / Principal' : payload.team_type === 'manager' ? 'Managing Partner' : payload.team_type === 'support' ? 'Operations Support' : 'Key Account Manager';

      addToast(`Team Member '${kamForm.full_name}' pre-registered as ${roleDisplay}! Ask them to send /start to @gro10xmanbot.`, 'success');
      logPlatformActivity(
        'Team Member Pre-Registered',
        `Onboarded ${kamForm.full_name} as ${roleDisplay} (${payload.region})`,
        'success'
      );
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
      const kamObj = allKams.find(k => k.id === kamId);
      addToast(`Team Member '${kamObj?.full_name || 'Member'}' status updated to ${!currentActive ? 'Active' : 'Inactive'}.`, 'success');
      logPlatformActivity(
        'Team Member Status Toggled',
        `Toggled ${kamObj?.full_name || 'Team member #' + kamId} status to ${!currentActive ? 'Active' : 'Inactive'}`,
        'info'
      );
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
      logPlatformActivity(
        'Growth Promoter Onboarded',
        `Registered promoter ${promoterForm.alias_name} (${promoterForm.full_name}) with referral code ${referralCode} and tier ${payload.tier}`,
        'success'
      );
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
      const promObj = allPromoters.find(p => p.id === promoterId);
      addToast(`Deal promotion access ${!currentCanPromote ? 'granted' : 'revoked'} for ${promObj?.alias_name || 'Promoter'}.`, 'success');
      logPlatformActivity(
        'Promoter Deal Permission Updated',
        `Deal sharing access ${!currentCanPromote ? 'unlocked' : 'locked'} for promoter ${promObj?.alias_name || '#' + promoterId}`,
        'info'
      );
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
      const promObj = allPromoters.find(p => p.id === promoterId);
      addToast(`Promoter '${promObj?.alias_name || 'Promoter'}' status updated to ${!currentActive ? 'Active' : 'Inactive'}.`, 'success');
      logPlatformActivity(
        'Promoter Status Toggled',
        `Toggled promoter ${promObj?.alias_name || '#' + promoterId} status to ${!currentActive ? 'Active' : 'Inactive'}`,
        'info'
      );
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
      const promObj = allPromoters.find(p => p.id === promoterId);
      addToast(`Promoter '${promObj?.alias_name || 'Promoter'}' tier updated to ${newTier.replace('_', ' ')}.`, 'success');
      logPlatformActivity(
        'Promoter Tier Overridden',
        `Manually updated promoter ${promObj?.alias_name || '#' + promoterId} tier to ${newTier.replace('_', ' ')}`,
        'info'
      );

      // Notify promoter via Telegram
      fetch('/api/telegram-notify-promoter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoterId,
          title: '🏆 Partner Tier Updated!',
          message: `Your growth partner tier has been updated to ${newTier.replace('_', ' ')}.`
        })
      }).catch(err => console.error('Error notifying promoter:', err));

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

          // Notify promoter of automatic upgrade
          fetch('/api/telegram-notify-promoter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promoterId: p.id,
              title: '🏆 Milestone Achieved — Tier Upgraded!',
              message: `Congratulations! Based on your verified leads and raised capital, your partner tier has been upgraded to ${targetTier.replace('_', ' ')}!`
            })
          }).catch(err => console.error('Error notifying promoter:', err));
        }
      }

      addToast(`Scanned all promoters. Upgraded ${upgradedCount} promoter(s) based on live milestones!`, 'success');
      logPlatformActivity(
        'Promoter Tiers Auto-Scanned',
        `Automated milestone scan completed: upgraded ${upgradedCount} growth promoter(s) based on verified leads & raised capital`,
        'success'
      );
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
      const assignedKam = allKams.find(k => k.id === kamId);
      const targetInv = allInvestors.find(i => i.id === investorId);
      addToast('KAM assigned to investor.', 'success');
      logPlatformActivity(
        'KAM Assigned to Investor',
        `Assigned ${assignedKam ? assignedKam.full_name : 'Unassigned'} to investor "${targetInv ? targetInv.alias_name : 'Investor'}"`,
        'info'
      );
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

      const { data: newInv, error } = await supabase
        .from('investors')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      // Log initial note if provided
      if (newInvestorForm.initial_note.trim() && newInv?.id) {
        await supabase.from('investor_notes').insert([{
          investor_id: newInv.id,
          created_by_kam_id: null,
          note_type: 'General',
          content: `Preferred Channel: ${newInvestorForm.preferred_channel} | Note: ${newInvestorForm.initial_note.trim()}`
        }]);
      }

      addToast(`Investor "${newInvestorForm.alias_name}" onboarded successfully!`, 'success');
      logPlatformActivity(
        'Investor Onboarded',
        `Directly onboarded investor "${newInvestorForm.alias_name}" (${newInvestorForm.investor_category}) via Admin Console`,
        'success'
      );
      setShowAddInvestorModal(false);
      setNewInvestorForm({
        alias_name: '', phone: '', email: '',
        investor_category: 'HNI', requires_anonymity: false,
        origin_source: 'Admin', origin_promoter_id: '',
        referral_code_used: '', onboarding_status: 'Invited',
        preferred_channel: 'WhatsApp', initial_note: ''
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
      const targetInv = allInvestors.find(i => i.id === investorId);
      addToast(`Investor status updated to ${newStatus.replace('_', ' ')}`, 'success');
      logPlatformActivity(
        'Investor Status Updated',
        `Investor "${targetInv ? targetInv.alias_name : 'Investor'}" status moved to ${newStatus.replace('_', ' ')}`,
        'info'
      );
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
      const targetInv = allInvestors.find(i => i.id === investorId);
      addToast(`Privacy coverage ${newVal ? 'ENABLED (Alias Only)' : 'DISABLED'}`, 'success');
      logPlatformActivity(
        'Investor Privacy Toggled',
        `Privacy coverage for "${targetInv ? targetInv.alias_name : 'Investor'}" was ${newVal ? 'ENABLED' : 'DISABLED'}`,
        'info'
      );
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
      logPlatformActivity(
        'Investor Note Added',
        `Logged a new ${newNoteForm.note_type} note on investor file`,
        'info'
      );
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
      logPlatformActivity(
        'Booking Status Updated',
        `Investment booking marked as ${newStatus.replace('_', ' ')}`,
        'info'
      );
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
      const targetKam = allKams.find(k => k.id === kamId);
      const targetApp = cohortApplications.find(a => a.id === appId);
      const appName = targetApp?.brand_name || 'Cohort Application';
      
      addToast('KAM assigned to cohort application', 'success');
      logPlatformActivity(
        'KAM Assigned to Application',
        `${targetKam ? targetKam.full_name : 'Unassigned'} assigned to ${appName}`,
        'info'
      );

      // Dispatch real-time Telegram alert to assigned KAM
      if (kamId) {
        try {
          const appUrl = window.location.origin;
          fetch('/api/telegram-notify-kam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kamId,
              title: `📑 Cohort Diligence Assigned: ${appName}`,
              message: `You have been assigned to conduct physical site diligence on "${appName}".\nRef: ${targetApp?.ref_code || ''}\nFounder: ${targetApp?.lead_founder_name || ''} (${targetApp?.lead_founder_phone || ''})`,
              actionUrl: `${appUrl}/kam-dashboard`
            })
          }).catch(err => console.warn('Non-fatal KAM diligence dispatch error:', err));
        } catch (e) {
          console.warn('Non-fatal KAM assignment alert error:', e);
        }
      }

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
      const targetApp = cohortApplications.find(a => a.id === appId);
      const appName = targetApp?.brand_name || 'Cohort Application';

      addToast(`KAM audit saved! Computed AI Health Score: ${computedScore}/100`, 'success');
      logPlatformActivity(
        'KAM Audit Completed',
        `Site audit for ${appName} saved with AI Health Score ${computedScore}/100`,
        'success'
      );
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
      const targetApp = cohortApplications.find(a => a.id === appId);
      const appName = targetApp?.brand_name || 'Cohort Application';

      addToast('Cohort application rejected', 'success');
      logPlatformActivity(
        'Cohort Application Rejected',
        `${appName} marked as Rejected: "${rejectionReasonInput}"`,
        'warning'
      );
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
      logPlatformActivity(
        'Business Onboarded to Pipeline',
        `"${app.brand_name}" provisioned into Deal Pipeline at Origination stage`,
        'success'
      );

      // 6. Cross-stakeholder notification to the Founder via @gro10xbizbot
      if (fData?.id || app.lead_founder_phone) {
        try {
          const appUrl = window.location.origin;
          fetch('/api/telegram-notify-founder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              founderId: fData?.id,
              phone: app.lead_founder_phone,
              title: '🎉 Application Approved — Deal Originated',
              message: `Congratulations! "${app.brand_name}" has been officially approved and provisioned into the GRO10X Deal Pipeline.\n\nProject: ${projData.project_title}\nTarget Capital Ask: ৳${Number(projData.target_raise_bdt).toLocaleString()} BDT.`,
              actionUrl: `${appUrl}/business`
            })
          }).catch(err => console.warn('Non-fatal founder onboarding alert warning:', err));
        } catch (fErr) {
          console.warn('Non-fatal founder alert error:', fErr);
        }
      }

      // 7. Notification to assigned KAM via @gro10xmanbot
      if (app.assigned_kam_id) {
        try {
          const appUrl = window.location.origin;
          fetch('/api/telegram-notify-kam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kamId: app.assigned_kam_id,
              title: '🚀 Cohort Deal Onboarded to Pipeline',
              message: `"${app.brand_name}" has successfully converted from Cohort Application to Deal Pipeline at Origination stage.\nTarget: ৳${Number(projData.target_raise_bdt).toLocaleString()} BDT.`,
              actionUrl: `${appUrl}/kam-dashboard`
            })
          }).catch(err => console.warn('Non-fatal KAM onboarding alert warning:', err));
        } catch (kErr) {
          console.warn('Non-fatal KAM alert error:', kErr);
        }
      }

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
  const activeProjectsCount = projects.filter(p => 
    ['Active', 'Trading', 'Funding', 'Active Capital Raise', 'Diligence', 'Origination'].includes(p.status) && p.status !== 'Closed'
  ).length;
  const totalYieldDisbursed = yieldDisbursements.reduce((sum, y) => sum + Number(y.total_disbursed_bdt || 0), 0);
  const activeSpreadPct = Number(platformSettings?.deal_spread_pct || 5);
  const totalFeeSpreadCaptured = projects.reduce((sum, p) => sum + (Number(p.amount_raised_bdt || 0) * (activeSpreadPct / 100)), 0);
  const totalPipelineSpreadTarget = projects.reduce((sum, p) => sum + (Number(p.target_raise_bdt || 0) * (activeSpreadPct / 100)), 0);

  const pendingKycCount = kycSubmissions.filter(s => s.status === 'Pending').length;
  const pendingPaymentsCount = paymentSubmissions.filter(s => s.investment_bookings?.status === 'Proof_Submitted').length;
  const pendingLeadsCount = inquiryLeads.filter(l => l.status === 'New').length;
  const pendingCashTicketsCount = cashTickets.filter(t => t.status === 'Pending_Review').length;
  const pendingCohortCount = cohortApplications.filter(a => ['New_Submission', 'Under_Director_Review', 'KAM_Assigned', 'Diligence_In_Progress'].includes(a.status)).length;
  const pendingSecondaryCount = secondaryOrders.filter(o => o.status === 'Pending_Clearance').length;

  // Synthesize rich Activity Stream from real records + logged events
  const synthesizedActivityStream = [
    ...recentNotifications,
    ...paymentSubmissions.map(p => ({
      id: 'pay-' + p.id,
      title: 'Payment Proof Submitted',
      message: `৳${Number(p.investment_bookings?.amount_bdt || 0).toLocaleString()} proof uploaded via ${p.payment_method || 'Bank Transfer'}.`,
      type: p.investment_bookings?.status === 'Approved' ? 'success' : 'warning',
      created_at: p.created_at
    })),
    ...inquiryLeads.map(l => ({
      id: 'lead-' + l.id,
      title: 'New Prospective Lead',
      message: `${l.name} inquired for ${l.investment_range || 'deal access'} via ${
        l.source_channel?.startsWith('/') ? 'Platform Website' :
        l.source_channel?.startsWith('http') ? new URL(l.source_channel).hostname.replace('www.', '') :
        (l.source_channel || 'Web')
      }.`,
      type: 'info',
      created_at: l.created_at
    })),
    ...kycSubmissions.map(k => ({
      id: 'kyc-' + k.id,
      title: `KYC Level ${k.target_level} Submission`,
      message: `${k.investors?.alias_name || 'Investor'} submitted identity verification documents.`,
      type: k.status === 'Approved' ? 'success' : 'warning',
      created_at: k.created_at
    })),
    ...yieldDisbursements.map(y => ({
      id: 'yield-' + y.id,
      title: `Yield Batch Declared`,
      message: `৳${Number(y.total_disbursed_bdt || 0).toLocaleString()} allocated for ${y.disbursement_month || 'month'}.`,
      type: 'success',
      created_at: y.created_at
    })),
    ...cohortApplications.map(a => ({
      id: 'app-' + a.id,
      title: `Cohort SME Application`,
      message: `"${a.brand_name}" submitted SME expansion pitch for ৳${Number(a.requested_funding_bdt || 0).toLocaleString()}.`,
      type: 'info',
      created_at: a.created_at
    }))
  ]
  .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice(0, 10);

  // Global Search Items Computation
  const searchResults = globalSearchQuery.trim() === '' ? [] : [
    ...allInvestors.filter(i => (i.alias_name || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (i.phone || '').includes(globalSearchQuery) || (i.email || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3).map(i => ({ type: 'Investor', title: i.alias_name || 'Investor', sub: i.phone || i.email || 'KYC User', tab: 'investors', item: i })),
    ...projects.filter(p => (p.project_title || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (p.businesses?.brand_name || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3).map(p => ({ type: 'Project', title: p.project_title, sub: p.businesses?.brand_name || 'Deal', tab: 'kanban', item: p })),
    ...inquiryLeads.filter(l => (l.name || '').toLowerCase().includes(globalSearchQuery.toLowerCase()) || (l.phone || '').includes(globalSearchQuery)).slice(0, 3).map(l => ({ type: 'Lead', title: l.name, sub: l.phone || 'Inquiry Lead', tab: 'leads-marketing', item: l }))
  ];

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 className="animate-spin" size={36} />
          <div style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.05em' }}>AUTHENTICATING ADMIN PRIVILEGES...</div>
        </div>
      </div>
    );
  }

  if (!user || (role && role !== 'admin')) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center', color: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2.5rem', maxWidth: '420px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          <ShieldAlert size={52} style={{ color: '#ef4444', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Restricted Command Center</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Administrative security clearance required. Redirecting to authentication portal...
          </p>
          <button 
            onClick={() => router.push('/auth')} 
            style={{ background: '#D4AF37', color: '#000', fontWeight: '800', padding: '0.65rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Authenticate via Web PIN
          </button>
        </div>
      </div>
    );
  }

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
        dealSpreadPct={activeSpreadPct}
        totalFeeSpreadCaptured={totalPipelineSpreadTarget}
        pendingCounts={{
          kycPayments: pendingKycCount + pendingPaymentsCount,
          cohort: pendingCohortCount,
          leads: pendingLeadsCount,
          secondaryClearance: secondaryOrders.filter(o => o.status === 'Pending_Clearance').length,
          workOrders: workOrders.filter(o => o.status === 'Pending_Approval').length,
        }}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">

        {/* HEADER */}
        <AdminHeader
          activeTab={activeTab}
          onAddProject={() => handleOpenProjectModal()}
          onRefresh={() => fetchAdminData()}
          isRefreshing={loading}
        />

        {/* ---------------------------------------------------- */}
        {/* TAB 1: COMMAND CENTER (dashboard) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <CommandCenterTab
            totalAumRaised={totalAumRaised}
            activeInvestorsCount={activeInvestorsCount}
            activeProjectsCount={activeProjectsCount}
            totalYieldDisbursed={totalYieldDisbursed}
            totalFeeSpreadCaptured={totalFeeSpreadCaptured}
            totalPipelineSpreadTarget={totalPipelineSpreadTarget}
            inquiryLeads={inquiryLeads}
            pendingKycCount={pendingKycCount}
            pendingPaymentsCount={pendingPaymentsCount}
            pendingLeadsCount={pendingLeadsCount}
            pendingCashTicketsCount={pendingCashTicketsCount}
            pendingSecondaryCount={pendingSecondaryCount}
            projects={projects}
            allKams={allKams}
            recentNotifications={synthesizedActivityStream}
            currency={currency}
            setActiveTab={setActiveTab}
            setInvestorSubTab={setInvestorSubTab}
            onOpenProjectModal={() => handleOpenProjectModal()}
            onRefresh={() => fetchAdminData()}
            isRefreshing={loading}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: DEAL PIPELINE (kanban) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'kanban' && (
          <DealPipelineTab
            projects={projects}
            kanbanStages={kanbanStages}
            activeInvestments={activeInvestments}
            allKams={allKams}
            currency={currency}
            pipelineView={pipelineView}
            setPipelineView={setPipelineView}
            handleOpenProjectModal={handleOpenProjectModal}
            setSelectedProjectForInvestors={setSelectedProjectForInvestors}
            setAdvanceModal={setAdvanceModal}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: BUSINESS REGISTRY (business-registry) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'business-registry' && (
          <BusinessRegistryTab
            cohortApplications={cohortApplications}
            allKams={allKams}
            currency={currency}
            appFilterStatus={appFilterStatus}
            setAppFilterStatus={setAppFilterStatus}
            appSearchQuery={appSearchQuery}
            setAppSearchQuery={setAppSearchQuery}
            handleAssignKamToApp={handleAssignKamToApp}
            setSelectedApplication={setSelectedApplication}
            setAppDrawerSubTab={setAppDrawerSubTab}
            setKamAuditForm={setKamAuditForm}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3.5: VALUATION MODEL (valuation-model) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'valuation-model' && (
          <ValuationModelTab
            projects={projects}
            businesses={businesses}
            currency={currency}
            setCurrency={setCurrency}
            addToast={addToast}
            logPlatformActivity={logPlatformActivity}
            fetchAdminData={fetchAdminData}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3.6: WORK ORDERS DESK (work-orders) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'work-orders' && (
          <WorkOrdersTab
            currency={currency}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: INVESTOR HUB (investors) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'investors' && (
          <InvestorHubTab
            allInvestors={allInvestors}
            totalAumRaised={totalAumRaised}
            pendingKycCount={pendingKycCount}
            pendingPaymentsCount={pendingPaymentsCount}
            investorSubTab={investorSubTab}
            setInvestorSubTab={setInvestorSubTab}
            activeInvestments={activeInvestments}
            allKams={allKams}
            investorSearch={investorSearch}
            setInvestorSearch={setInvestorSearch}
            investorStatusFilter={investorStatusFilter}
            setInvestorStatusFilter={setInvestorStatusFilter}
            setShowAddInvestorModal={setShowAddInvestorModal}
            handleAssignKamToInvestor={handleAssignKamToInvestor}
            setSelectedInvestor={setSelectedInvestor}
            setInvestorDrawerTab={setInvestorDrawerTab}
            allBookings={allBookings}
            bookingStatusFilter={bookingStatusFilter}
            setBookingStatusFilter={setBookingStatusFilter}
            handleUpdateBookingStatus={handleUpdateBookingStatus}
            kycSubmissions={kycSubmissions}
            handleKycReview={handleKycReview}
            paymentSubmissions={paymentSubmissions}
            handlePaymentReview={handlePaymentReview}
            currency={currency}
            addToast={addToast}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: YIELD ENGINE & DISBURSEMENT LEDGER (dividend) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dividend' && (
          <YieldEngineTab
            yieldDisbursements={yieldDisbursements}
            allInvestorYields={allInvestorYields}
            allPosReports={allPosReports}
            yieldSubTab={yieldSubTab}
            setYieldSubTab={setYieldSubTab}
            projects={projects}
            dividendProjectId={dividendProjectId}
            setDividendProjectId={setDividendProjectId}
            dividendMonth={dividendMonth}
            setDividendMonth={setDividendMonth}
            dividendYear={dividendYear}
            setDividendYear={setDividendYear}
            grossSales={grossSales}
            setGrossSales={setGrossSales}
            netProfit={netProfit}
            setNetProfit={setNetProfit}
            handleDistributeYield={handleDistributeYield}
            handlePullPosData={handlePullPosData}
            posSyncStatus={posSyncStatus}
            isDistributing={isDistributing}
            activeInvestments={activeInvestments}
            selectedDisbursement={selectedDisbursement}
            setSelectedDisbursement={setSelectedDisbursement}
            disbPaymentForm={disbPaymentForm}
            setDisbPaymentForm={setDisbPaymentForm}
            setDisbPaymentFile={setDisbPaymentFile}
            uploadingDisbProof={uploadingDisbProof}
            handleSaveDisbursementProof={handleSaveDisbursementProof}
            handleFinaliseDisbursement={handleFinaliseDisbursement}
            handlePushYieldToTelegram={handlePushYieldToTelegram}
            pushingToTelegram={pushingToTelegram}
            handleDownloadYieldCSV={handleDownloadYieldCSV}
            posReportSubTab={posReportSubTab}
            setPosReportSubTab={setPosReportSubTab}
            posEntryForm={posEntryForm}
            setPosEntryForm={setPosEntryForm}
            savingPosReport={savingPosReport}
            handleSubmitPosManual={handleSubmitPosManual}
            setPosCSVFile={setPosCSVFile}
            uploadingCSV={uploadingCSV}
            handleUploadPosCSV={handleUploadPosCSV}
            currency={currency}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CASH CONCIERGE & OTC ADVISORY DESK (cash-pipeline) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'cash-pipeline' && (
          <CashConciergeTab
            cashTickets={cashTickets}
            cashSubTab={cashSubTab}
            setCashSubTab={setCashSubTab}
            cashStatusFilter={cashStatusFilter}
            setCashStatusFilter={setCashStatusFilter}
            selectedCashTicket={selectedCashTicket}
            setSelectedCashTicket={setSelectedCashTicket}
            cashMeetingForm={cashMeetingForm}
            setCashMeetingForm={setCashMeetingForm}
            cashNoteInput={cashNoteInput}
            setCashNoteInput={setCashNoteInput}
            cashFundsRef={cashFundsRef}
            setCashFundsRef={setCashFundsRef}
            savingCashAction={savingCashAction}
            pushingCashTelegram={pushingCashTelegram}
            allKams={allKams}
            handleCashKamAssign={handleCashKamAssign}
            handleCashMeetingConfirm={handleCashMeetingConfirm}
            handleCashFundsCleared={handleCashFundsCleared}
            handleCashStatusUpdate={handleCashStatusUpdate}
            handleSaveCashNote={handleSaveCashNote}
            handlePushCashTelegramNotif={handlePushCashTelegramNotif}
            adminTicketForm={adminTicketForm}
            setAdminTicketForm={setAdminTicketForm}
            handleCreateCashTicket={handleCreateCashTicket}
            allInvestors={allInvestors}
            projects={projects}
            currency={currency}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: SECONDARY MARKET CLEARANCE DESK */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'secondary-clearance' && (
          <SecondaryClearanceTab
            secondaryOrders={secondaryOrders}
            allBookings={allBookings}
            allInvestors={allInvestors}
            currency={currency}
            onClearOrder={handleClearSecondaryOrder}
            onRefresh={fetchAdminData}
            isClearing={isClearingSecondary}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: TEAM & PROMOTERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'team-promoters' && (
          <TeamPromotersTab
            allKams={allKams}
            allPromoters={allPromoters}
            payoutRequests={payoutRequests}
            promoterCommissions={promoterCommissions}
            promoterLeads={promoterLeads}
            promoterTargets={promoterTargets}
            activeInvestments={activeInvestments}
            allInvestors={allInvestors}
            businesses={businesses}
            allAppStakeholders={allAppStakeholders}
            currency={currency}
            teamSubTab={teamSubTab}
            setTeamSubTab={setTeamSubTab}
            showKamForm={showKamForm}
            setShowKamForm={setShowKamForm}
            kamForm={kamForm}
            setKamForm={setKamForm}
            showPromoterForm={showPromoterForm}
            setShowPromoterForm={setShowPromoterForm}
            promoterForm={promoterForm}
            setPromoterForm={setPromoterForm}
            selectedPromoter={selectedPromoter}
            setSelectedPromoter={setSelectedPromoter}
            savingTeamAction={savingTeamAction}
            handleAddKam={handleAddKam}
            handleToggleKamActive={handleToggleKamActive}
            handleAutoCheckPromoterTiers={handleAutoCheckPromoterTiers}
            handleAddPromoter={handleAddPromoter}
            handleTogglePromoterDeals={handleTogglePromoterDeals}
            handleTogglePromoterActive={handleTogglePromoterActive}
            handlePromoterTierOverride={handlePromoterTierOverride}
            handleClearPayout={handleClearPayout}
            handleRejectPayout={handleRejectPayout}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'legal' && (
          <LegalComplianceTab currency={currency} addToast={addToast} logPlatformActivity={logPlatformActivity} />
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
          <InquiryLeadsTab currency={currency} addToast={addToast} logPlatformActivity={logPlatformActivity} />
        )}

        {/* BOT MANAGEMENT & ACCESS CONTROL TAB */}
        {activeTab === 'bot-management' && (
          <BotManagementTab 
            currency={currency} 
            addToast={addToast} 
            logPlatformActivity={logPlatformActivity}
            pinExpiryMinutes={Number(platformSettings?.pin_expiry_minutes || 15)}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <AdminSettingsTab 
            currency={currency} 
            addToast={addToast} 
            logPlatformActivity={logPlatformActivity}
            onSettingsUpdated={(newSettings) => setPlatformSettings(newSettings)}
          />
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* COHORT APPLICATION INSPECTION DRAWER */}
      <CohortInspectionDrawer
        selectedApplication={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        appDrawerSubTab={appDrawerSubTab}
        setAppDrawerSubTab={setAppDrawerSubTab}
        allAppStakeholders={allAppStakeholders}
        currency={currency}
        allKams={allKams}
        handleAssignKamToApp={handleAssignKamToApp}
        kamAuditForm={kamAuditForm}
        setKamAuditForm={setKamAuditForm}
        handleSaveKamAudit={handleSaveKamAudit}
        rejectingAppId={rejectingAppId}
        setRejectingAppId={setRejectingAppId}
        rejectionReasonInput={rejectionReasonInput}
        setRejectionReasonInput={setRejectionReasonInput}
        handleRejectApp={handleRejectApp}
        handleConvertCohortToDeal={handleConvertCohortToDeal}
        convertingAppId={convertingAppId}
      />

      {/* ---------------------------------------------------- */}
      {/* INVESTOR PORTFOLIO DRAWER */}
      {/* ---------------------------------------------------- */}

      {/* ---------------------------------------------------- */}
      {/* 5-TAB INVESTOR INSPECTION DRAWER */}
      <InvestorDetailDrawer
        selectedInvestor={selectedInvestor}
        onClose={() => setSelectedInvestor(null)}
        investorDrawerTab={investorDrawerTab}
        setInvestorDrawerTab={setInvestorDrawerTab}
        handleUpdateInvestorStatus={handleUpdateInvestorStatus}
        handleToggleAnonymity={handleToggleAnonymity}
        handleAssignKamToInvestor={handleAssignKamToInvestor}
        allKams={allKams}
        activeInvestments={activeInvestments}
        currency={currency}
        yieldDisbursements={yieldDisbursements}
        kycSubmissions={kycSubmissions}
        allInvestorNotes={allInvestorNotes}
        newNoteForm={newNoteForm}
        setNewNoteForm={setNewNoteForm}
        handleSaveInvestorNote={handleSaveInvestorNote}
        savingNote={savingNote}
      />

      {/* ---------------------------------------------------- */}
      {/* MANUAL ADD INVESTOR SUB-MODAL */}
      {/* ---------------------------------------------------- */}
      {showAddInvestorModal && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddInvestorModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'grid', placeItems: 'center', padding: '2rem' }}
        >
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

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Preferred Contact Channel</label>
                  <select 
                    value={newInvestorForm.preferred_channel}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, preferred_channel: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Phone">Phone / Direct Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Initial Internal Note (Optional)</label>
                  <input 
                    type="text" 
                    value={newInvestorForm.initial_note}
                    onChange={(e) => setNewInvestorForm({ ...newInvestorForm, initial_note: e.target.value })}
                    placeholder="e.g. Met at Dhaka Angel Summit, ৳50L ticket"
                    className="form-input"
                  />
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
              Are you sure you want to move <strong>"{advanceModal.project?.project_title}"</strong> to the <strong>"{advanceModal.targetStageTitle || kanbanStages.find(s => s.id === advanceModal.targetStage)?.title || advanceModal.targetStage}"</strong> stage?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setAdvanceModal({ open: false, project: null, targetStage: '', targetStageTitle: '' })} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
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
      <ProjectFormModal
        showProjectModal={showProjectModal}
        setShowProjectModal={setShowProjectModal}
        editingProjectId={editingProjectId}
        projectModalTab={projectModalTab}
        setProjectModalTab={setProjectModalTab}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleSaveProject={handleSaveProject}
        setShowNewBusinessModal={setShowNewBusinessModal}
        businesses={businesses}
        kanbanStages={kanbanStages}
        allKams={allKams}
        currency={currency}
        uploadingCover={uploadingCover}
        handleUploadCoverImage={handleUploadCoverImage}
        uploadingGallery={uploadingGallery}
        handleUploadGalleryImage={handleUploadGalleryImage}
        handleDeleteGalleryMedia={handleDeleteGalleryMedia}
      />

      {/* ---------------------------------------------------- */}
      {/* INLINE NEW BUSINESS SUB-MODAL */}
      <BusinessFormModal
        showNewBusinessModal={showNewBusinessModal}
        setShowNewBusinessModal={setShowNewBusinessModal}
        newBusinessForm={newBusinessForm}
        setNewBusinessForm={setNewBusinessForm}
        handleSaveNewBusiness={handleSaveNewBusiness}
        savingBusiness={savingBusiness}
      />

    </div>
  );
}
