'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PlusCircle, CheckCircle, Clock, ShieldAlert, 
  TrendingUp, DollarSign, Upload, FileText, ArrowUpRight, ChevronRight, Wallet,
  Filter, Search, RefreshCw, BarChart2, Layers, Award, Sparkles, Lock, ShieldCheck, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';

const kanbanStages = [
  { id: 'Origination', title: '1. Origination & Pitch Review' },
  { id: 'Diligence', title: '2. SPV Valuation (BDT 2.2 Cr)' },
  { id: 'Funding', title: '3. Active Capital Raise (90/10)' },
  { id: 'Active', title: '4. Active National Grid Hub' },
];

export default function AdminPortal() {
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('kanban');
  const [projects, setProjects] = useState([]);
  const [cashTickets, setCashTickets] = useState([]);
  const [allKams, setAllKams] = useState([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [uploadDocUrl, setUploadDocUrl] = useState('');
  const [uploadDocType, setUploadDocType] = useState('Share_Certificate');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Dividend Engine State
  const [dividendProjectId, setDividendProjectId] = useState('');
  const [dividendMonth, setDividendMonth] = useState('Aug');
  const [dividendYear, setDividendYear] = useState('2026');
  const [grossSales, setGrossSales] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [posSyncStatus, setPosSyncStatus] = useState('');

  // 6. Cash Concierge StateForm State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', capEx: 20000000, yieldModel: 'Franchise' });

  // SPV Update State
  const [editingSpv, setEditingSpv] = useState(null); // { id, name }

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminData();
    } else if (!authLoading && role !== 'admin') {
      setLoading(false);
    }
  }, [role, authLoading]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (brand_name)
        `)
        .order('created_at', { ascending: false });

      if (projErr) throw projErr;
      setProjects(projData || []);

      // Fetch KAMs
      const { data: kamsData } = await supabase.from('kams').select('*');
      setAllKams(kamsData || []);

      // Fetch Cash Tickets
      const { data: cashData, error: cashErr } = await supabase
        .from('cash_tickets')
        .select('*, investors(id, alias_name), funding_projects(project_title), kams(full_name)')
        .order('created_at', { ascending: false });

      if (cashErr) throw cashErr;
      setCashTickets(cashData || []);

      // Fetch Payment Submissions
      const { data: paymentData, error: paymentErr } = await supabase
        .from('payment_submissions')
        .select(`
          *,
          investment_bookings (
            amount_bdt,
            yield_option,
            booking_type,
            status,
            investors (
              alias_name
            ),
            funding_projects (
              project_title,
              businesses (brand_name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (paymentErr) throw paymentErr;
      setPaymentSubmissions(paymentData || []);

      // Fetch KYC Submissions
      const { data: kycData, error: kycErr } = await supabase
        .from('kyc_submissions')
        .select(`
          *,
          investors (
            alias_name,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (kycErr) throw kycErr;
      setKycSubmissions(kycData || []);

      // Fetch Payout Requests
      const { data: payoutsData, error: payoutsErr } = await supabase
        .from('payout_requests')
        .select(`*, promoters(id, alias_name, user_id)`)
        .order('created_at', { ascending: false });
      if (payoutsErr) throw payoutsErr;
      setPayoutRequests(payoutsData || []);

      // Fetch Active Investments
      const { data: invsData, error: invsErr } = await supabase
        .from('investments')
        .select(`*, investors(id, alias_name, user_id), funding_projects(project_title)`)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      if (invsErr) throw invsErr;
      setActiveInvestments(invsData || []);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Payout / Legal handlers
  const handleClearPayout = async (payoutId, promoterUserId) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: 'Cleared', cleared_at: new Date().toISOString() })
        .eq('id', payoutId);
      if (error) throw error;
      if (promoterUserId) {
        await supabase.from('notifications').insert([{
          user_id: promoterUserId,
          title: 'Payout Cleared',
          message: 'Your payout request has been processed and cleared.',
          type: 'success'
        }]);
      }
      addToast('Payout marked as cleared.', 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Error clearing payout.', 'error');
    }
  };

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
      if (investorUserId) {
        await supabase.from('notifications').insert([{
          user_id: investorUserId,
          title: 'Legal Document Issued',
          message: 'A new official legal document has been uploaded to your Secure Vault.',
          type: 'success'
        }]);
      }
      addToast('Legal document successfully issued.', 'success');
      setUploadDocUrl('');
      fetchAdminData();
    } catch (err) {
      addToast('Error uploading legal document.', 'error');
    }
  };

  // Auto-fetch POS data when dividend form changes
  useEffect(() => {
    const fetchPosData = async () => {
      if (!dividendProjectId || !dividendMonth || !dividendYear || projects.length === 0) {
        setPosSyncStatus('');
        return;
      }
      
      const project = projects.find(p => p.id === dividendProjectId);
      if (!project || !project.business_id) return;
      
      try {
        // Find POS records for that month and year
        // We do a simple string match on the date "YYYY-MM"
        const monthMap = { 'Jan':'01', 'Feb':'02', 'Mar':'03', 'Apr':'04', 'May':'05', 'Jun':'06', 'Jul':'07', 'Aug':'08', 'Sep':'09', 'Oct':'10', 'Nov':'11', 'Dec':'12' };
        const monthNum = monthMap[dividendMonth];
        const datePrefix = `${dividendYear}-${monthNum}`;
        
        const { data, error } = await supabase
          .from('pos_daily_sales')
          .select('gross_sales_bdt, net_profit_bdt')
          .eq('business_id', project.business_id)
          .like('date', `${datePrefix}%`);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const totalGross = data.reduce((acc, curr) => acc + Number(curr.gross_sales_bdt), 0);
          const totalNet = data.reduce((acc, curr) => acc + Number(curr.net_profit_bdt), 0);
          
          setGrossSales(totalGross);
          setNetProfit(totalNet);
          setPosSyncStatus(`Auto-synced from ${data.length} daily POS records.`);
        } else {
          setGrossSales('');
          setNetProfit('');
          setPosSyncStatus('No POS data found for this period. Manual entry required.');
        }
      } catch (err) {
        console.error('POS fetch error:', err);
      }
    };
    
    fetchPosData();
  }, [dividendProjectId, dividendMonth, dividendYear, projects]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    
    try {
      setIsSubmitting(true);
      
      // 1. Create Business
      const { data: bizData, error: bizErr } = await supabase
        .from('businesses')
        .insert([{
          brand_name: newProject.name,
          ai_health_score: 50,
          is_enlisted: true,
          industry_sector: 'Retail'
        }])
        .select()
        .single();
        
      if (bizErr) throw bizErr;

      // 2. Create Funding Project
      const feeSpread = Number(newProject.capEx) * 0.05;
      const { error: projErr } = await supabase
        .from('funding_projects')
        .insert([{
          business_id: bizData.id,
          project_title: newProject.name,
          funding_type: newProject.yieldModel,
          target_raise_bdt: Number(newProject.capEx),
          amount_raised_bdt: 0,
          spv_name: `GRO10X ${newProject.name.split(' ')[0]} SPV Ltd.`,
          yield_model: newProject.yieldModel,
          status: 'Origination'
        }]);

      if (projErr) throw projErr;

      // 3. Emit Global Notification
      await supabase.from('notifications').insert([{
        title: 'New Project Onboarded',
        message: `${newProject.name} has been added to the Origination pipeline.`,
        type: 'info'
      }]);

      setShowNewProjectModal(false);
      setNewProject({ name: '', capEx: 20000000, yieldModel: 'Franchise' });
      fetchAdminData();
      addToast('Project onboarded successfully', 'success');
    } catch (err) {
      console.error('Failed to add project:', err);
      addToast('Failed to onboard project.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('cash_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      setCashTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      addToast(`Ticket marked as ${newStatus}`, 'success');
    } catch (err) {
      console.error('Failed to update ticket:', err);
      addToast('Failed to update ticket status.', 'error');
    }
  };

  const handleAssignKam = async (ticketId, investorId, kamId) => {
    try {
      // Update the investor profile's default KAM
      await supabase.from('investors').update({ assigned_kam_id: kamId }).eq('id', investorId);
      
      // Update the ticket's KAM
      await supabase.from('cash_tickets').update({ kam_id: kamId }).eq('id', ticketId);

      addToast('KAM Assigned Successfully', 'success');
      fetchAdminData();
    } catch (err) {
      console.error('Failed to assign KAM:', err);
      addToast('Failed to assign KAM.', 'error');
    }
  };

  const handleSaveSpv = async (id) => {
    if (!editingSpv || !editingSpv.name) return;
    try {
      const { error } = await supabase
        .from('funding_projects')
        .update({ spv_name: editingSpv.name })
        .eq('id', id);

      if (error) throw error;
      setEditingSpv(null);
      fetchAdminData();
      addToast('SPV Details Updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update SPV:', err);
      addToast('Failed to update SPV.', 'error');
    }
  };

  const handleKycReview = async (submissionId, investorId, targetLevel, isApproved) => {
    try {
      const newStatus = isApproved ? 'Approved' : 'Rejected';
      
      // Update submission status
      const { error: subErr } = await supabase
        .from('kyc_submissions')
        .update({ status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', submissionId);
        
      if (subErr) throw subErr;
      
      // If approved, update investor profile
      if (isApproved) {
        const { error: invErr } = await supabase
          .from('investors')
          .update({ kyc_verified: targetLevel === 3 }) // 3 is full MVP verified
          .eq('id', investorId);
        if (invErr) throw invErr;
      }
      
      // Send Notification
      const { data: invData } = await supabase.from('investors').select('user_id').eq('id', investorId).single();
      if (invData && invData.user_id) {
        await supabase.from('notifications').insert([{
          user_id: invData.user_id,
          title: isApproved ? 'KYC Approved' : 'KYC Rejected',
          message: isApproved 
            ? `Your Level ${targetLevel} verification has been approved.` 
            : `Your Level ${targetLevel} verification was rejected. Please re-submit valid documents.`,
          type: 'KYC'
        }]);
      }
      
      setKycSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: newStatus, reviewed_at: new Date().toISOString() } : s));
      addToast(`KYC submission ${newStatus}`, 'success');
    } catch (err) {
      console.error('Failed to review KYC:', err);
      addToast('Failed to process KYC review.', 'error');
    }
  };

  const handlePaymentReview = async (submissionId, bookingId, investorId, isApproved) => {
    try {
      // 1. Update Booking Status
      const newStatus = isApproved ? 'Approved' : 'Rejected';
      const { error: bookingErr } = await supabase
        .from('investment_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      if (bookingErr) throw bookingErr;

      // 2. Update Submission Record
      const { error: subErr } = await supabase
        .from('payment_submissions')
        .update({ reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', submissionId);
      if (subErr) throw subErr;

      // 3. Fetch booking to get user_id for notification
      const { data: bookingData } = await supabase
        .from('investment_bookings')
        .select(`
          *,
          funding_projects (project_title),
          investors (user_id)
        `)
        .eq('id', bookingId)
        .single();
        
      if (bookingData && bookingData.investors?.user_id) {
        await supabase.from('notifications').insert([{
          user_id: bookingData.investors.user_id,
          title: isApproved ? 'Payment Verified & Minted' : 'Payment Proof Rejected',
          message: isApproved 
            ? `Your payment for ${bookingData.funding_projects.project_title} has been approved. Asset minted.` 
            : `Your payment proof for ${bookingData.funding_projects.project_title} was rejected. Please contact support.`,
          type: 'Payment'
        }]);
      }

      // 3. If Approved, Mint Investment and update project amount
      if (isApproved) {
        // fetch booking to get details
        const { data: bookingData } = await supabase
          .from('investment_bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingData) {
          if (bookingData.booking_type === 'Secondary') {
            // -- SECONDARY MARKET: ASSET TRANSFER --
            // 1. Find the secondary order
            const { data: orderData } = await supabase
              .from('secondary_orders')
              .select('id, investment_id, seller_investor_id, investors (user_id)')
              .eq('buyer_booking_id', bookingId)
              .single();
              
            if (orderData) {
              // 2. Transfer Ownership
              await supabase
                .from('investments')
                .update({ investor_id: bookingData.investor_id })
                .eq('id', orderData.investment_id);
                
              // 3. Update Order Status
              await supabase
                .from('secondary_orders')
                .update({ status: 'Transferred' })
                .eq('id', orderData.id);
                
              // 4. Notify Seller
              if (orderData.investors?.user_id) {
                await supabase.from('notifications').insert([{
                  user_id: orderData.investors.user_id,
                  title: 'Asset Successfully Sold!',
                  message: `Your secondary market listing has been acquired and funds are being routed to your account.`,
                  type: 'success'
                }]);
              }
            }
          } else {
            // -- PRIMARY MARKET: MINT NEW ASSET --
            const { data: mintedInvData, error: invErr } = await supabase
              .from('investments')
              .insert([{
                investor_id: bookingData.investor_id,
                funding_project_id: bookingData.project_id,
                amount_invested_bdt: bookingData.amount_bdt,
                status: 'Active'
              }])
              .select()
              .single();
              
            if (invErr) throw invErr;

            // GAMIFICATION & COMMISSION ENGINE
            const { data: promoData } = await supabase.from('promoters').select('id, user_id').limit(1).single();
            if (promoData && mintedInvData) {
              const baseAmount = Number(bookingData.amount_bdt) * 0.0075;
              let earnedBonus = 0;
              let targetHitNow = false;

              // 1. Insert Base 0.75% Commission
              await supabase.from('promoter_commissions').insert([{
                promoter_id: promoData.id,
                investment_id: mintedInvData.id,
                amount_bdt: baseAmount,
                commission_type: 'Base_0.75'
              }]);

              // 2. Target Gamification Logic
              const { data: targetData } = await supabase
                .from('promoter_targets')
                .select('*')
                .eq('promoter_id', promoData.id)
                .eq('project_id', bookingData.project_id)
                .single();

              if (targetData) {
                const oldRaised = Number(targetData.amount_raised_bdt || 0);
                const newRaised = oldRaised + Number(bookingData.amount_bdt);
                const targetAmt = Number(targetData.target_raise_bdt);
                const wasHit = targetData.status === 'Target_Hit';
                const isHitNow = newRaised >= targetAmt;
                
                let newStatus = targetData.status;

                if (wasHit) {
                  // Target was already cleared before. Give 0.25% bonus for THIS investment immediately.
                  const bonusAmount = Number(bookingData.amount_bdt) * 0.0025;
                  await supabase.from('promoter_commissions').insert([{
                    promoter_id: promoData.id,
                    investment_id: mintedInvData.id,
                    amount_bdt: bonusAmount,
                    commission_type: 'Target_0.25'
                  }]);
                  earnedBonus += bonusAmount;
                } else if (!wasHit && isHitNow) {
                  // TARGET HIT JUST NOW!
                  newStatus = 'Target_Hit';
                  targetHitNow = true;
                  
                  // Retroactive Bonus for ALL investments in this project (including this one)
                  // Total raised is `newRaised`. So bonus is newRaised * 0.25%
                  const bonusAmount = newRaised * 0.0025;
                  await supabase.from('promoter_commissions').insert([{
                    promoter_id: promoData.id,
                    investment_id: mintedInvData.id,
                    amount_bdt: bonusAmount,
                    commission_type: 'Target_0.25'
                  }]);
                  earnedBonus += bonusAmount;
                }

                // Update the target progress in DB
                await supabase
                  .from('promoter_targets')
                  .update({ amount_raised_bdt: newRaised, status: newStatus })
                  .eq('id', targetData.id);
              }
              
              if (promoData.user_id) {
                // Notify Base Commission
                await supabase.from('notifications').insert([{
                  user_id: promoData.user_id,
                  title: 'Commission Earned!',
                  message: `You earned ${formatCurrency(baseAmount, currency)} base commission for an investment referral.`,
                  type: 'Payment'
                }]);

                // Notify Target Hit & Bonus
                if (targetHitNow) {
                  await supabase.from('notifications').insert([{
                    user_id: promoData.user_id,
                    title: 'PROJECT TARGET HIT! 🏆',
                    message: `Congratulations! You hit your pledged target. A retroactive bonus of ${formatCurrency(earnedBonus, currency)} has been unlocked and credited to you!`,
                    type: 'success'
                  }]);
                } else if (earnedBonus > 0 && !targetHitNow) {
                  await supabase.from('notifications').insert([{
                    user_id: promoData.user_id,
                    title: 'Bonus Tier Commission',
                    message: `You earned an extra ${formatCurrency(earnedBonus, currency)} bonus commission because you previously cleared this project's target!`,
                    type: 'success'
                  }]);
                }
              }
            }

            // Increase project amount raised
            const { data: projData } = await supabase
              .from('funding_projects')
              .select('amount_raised_bdt, businesses(brand_name)')
              .eq('id', bookingData.project_id)
              .single();

            if (projData) {
              await supabase
                .from('funding_projects')
                .update({ amount_raised_bdt: Number(projData.amount_raised_bdt) + Number(bookingData.amount_bdt) })
                .eq('id', bookingData.project_id);
                
              // Send Global Notification
              await supabase.from('notifications').insert([{
                user_id: null,
                title: 'Investment Secured',
                message: `A new investment of BDT ${Number(bookingData.amount_bdt).toLocaleString()} has been verified for ${projData.businesses?.brand_name}.`,
                type: 'success'
              }]);
            }
          }
        }
      }

      addToast(`Payment marked as ${newStatus}`, isApproved ? 'success' : 'alert');
      fetchAdminData();
    } catch (err) {
      console.error('Failed to review payment:', err);
      addToast('Failed to review payment.', 'error');
    }
  };

  const handleDistributeYield = async (e) => {
    e.preventDefault();
    if (!dividendProjectId || !grossSales || !netProfit) {
      addToast('Please fill all fields for Dividend Declaration.', 'error');
      return;
    }

    try {
      setIsDistributing(true);
      
      // 1. Insert into yield_disbursements
      const { data: disbData, error: disbErr } = await supabase
        .from('yield_disbursements')
        .insert([{
          project_id: dividendProjectId,
          month: dividendMonth,
          year: Number(dividendYear),
          gross_sales_bdt: Number(grossSales),
          net_profit_bdt: Number(netProfit)
        }])
        .select()
        .single();
        
      if (disbErr) throw disbErr;

      // 2. Fetch all Active investments for this project
      const { data: invs, error: invErr } = await supabase
        .from('investments')
        .select(`
          id,
          investor_id,
          amount_invested_bdt,
          investment_bookings!inner(yield_option)
        `)
        .eq('funding_project_id', dividendProjectId)
        .eq('status', 'Active');
        
      if (invErr) throw invErr;
      
      // 3. Calculate yields per investor based on their yield_option
      let totalPoolDistributed = 0;
      const yieldInserts = [];
      const yieldNotifications = [];
      const { data: projectData } = await supabase.from('funding_projects').select('project_title').eq('id', dividendProjectId).single();
      
      const sales = Number(grossSales);
      const profit = Number(netProfit);
      
      // Calculate total capital per yield option to find proportional share
      let capOp1 = 0, capOp2 = 0, capOp3 = 0;
      invs.forEach(inv => {
        const amt = Number(inv.amount_invested_bdt);
        const opt = inv.investment_bookings?.yield_option || 1;
        if (opt === 1) capOp1 += amt;
        if (opt === 2) capOp2 += amt;
        if (opt === 3) capOp3 += amt;
      });

      // Pool for Option 1: 10% of gross sales
      const poolOp1 = sales * 0.10;
      // Pool for Option 2: 12% of gross sales
      const poolOp2 = sales * 0.12;
      // Pool for Option 3: 5% of capEx (floor) + 35% of Net Profit
      const poolOp3 = profit * 0.35;

      for (const inv of invs) {
        const amt = Number(inv.amount_invested_bdt);
        const opt = inv.investment_bookings?.yield_option || 1;
        
        let pool = 0;
        let cap = 0;
        if (opt === 1) { pool = poolOp1; cap = capOp1; }
        else if (opt === 2) { pool = poolOp2; cap = capOp2; }
        else if (opt === 3) { pool = poolOp3; cap = capOp3; }
        
        if (cap > 0) {
          const proportionalShare = amt / cap;
          const individualYield = pool * proportionalShare;
        
          if (individualYield > 0) {
            totalPoolDistributed += individualYield;
            yieldInserts.push({
              investor_id: inv.investor_id,
              project_id: dividendProjectId,
              disbursement_id: disbData.id,
              amount_bdt: individualYield
            });
            
            // Notification Data
            const { data: invProfile } = await supabase.from('investors').select('user_id').eq('id', inv.investor_id).single();
            if (invProfile && invProfile.user_id) {
               yieldNotifications.push({
                 user_id: invProfile.user_id,
                 title: 'Dividend Disbursed',
                 message: `Your ${dividendMonth} yield for ${projectData.project_title} (${formatCurrency(individualYield, currency)}) has been released!`,
                 type: 'Yield'
               });
            }
          }
        }
      }
      
      // 4. Insert into investor_yields
      if (yieldInserts.length > 0) {
        const { error: yieldErr } = await supabase
          .from('investor_yields')
          .insert(yieldInserts);
        if (yieldErr) throw yieldErr;
      }
      
      if (yieldNotifications.length > 0) {
        await supabase.from('notifications').insert(yieldNotifications);
      }
      
      // 5. Update total_disbursed_bdt on the disbursement record
      await supabase
        .from('yield_disbursements')
        .update({ total_disbursed_bdt: totalPoolDistributed })
        .eq('id', disbData.id);

      addToast(`Distributed ${formatCurrency(totalPoolDistributed, currency)} across ${yieldInserts.length} investors!`, 'success');
      setDividendProjectId('');
      setGrossSales('');
      setNetProfit('');
      
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to distribute yield.', 'error');
    } finally {
      setIsDistributing(false);
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

  const navBtnStyle = (active) => ({
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    border: 'none',
    color: active ? '#D4AF37' : '#94a3b8',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s'
  });

  // Calculate 5% Fee Spread on all projects
  const totalFeeSpreadCaptured = projects.reduce((sum, p) => sum + (Number(p.target_raise_bdt) * 0.05), 0);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', background: 'rgba(15, 23, 42, 0.8)', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900' }}>G</div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>GRO10X <span style={{ color: '#D4AF37' }}>ADMIN</span></span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Master Command Center v0.1.7</p>
        </div>

        {/* LEFT SIDEBAR NAVIGATION */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('kanban')} style={navBtnStyle(activeTab === 'kanban')}>
            <Layers size={18} /> 100-Project Kanban
          </button>
          <button onClick={() => setActiveTab('kyc')} style={navBtnStyle(activeTab === 'kyc')}>
            <ShieldCheck size={18} /> KYC Clearance <span style={{ background: '#ef4444', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{kycSubmissions.filter(s => s.status === 'Pending').length}</span>
          </button>
          <button onClick={() => setActiveTab('payments')} style={navBtnStyle(activeTab === 'payments')}>
            <DollarSign size={18} /> Payment Clearance
          </button>
          <button onClick={() => setActiveTab('dividend')} style={navBtnStyle(activeTab === 'dividend')}>
            <TrendingUp size={18} /> Dividend Engine
          </button>
          <button onClick={() => setActiveTab('spv-config')} style={navBtnStyle(activeTab === 'spv-config')}>
            <Building2 size={18} /> SPV & Equity Split (90/10)
          </button>
          <button onClick={() => setActiveTab('cash-pipeline')} style={navBtnStyle(activeTab === 'cash-pipeline')}>
            <ArrowUpRight size={18} style={{ color: activeTab === 'cash-pipeline' ? '#10b981' : 'inherit' }} /> Cash Concierge Pipeline
          </button>
          <button onClick={() => setActiveTab('legal')} style={navBtnStyle(activeTab === 'legal')}>
            <FileText size={18} style={{ color: activeTab === 'legal' ? '#10b981' : 'inherit' }} /> Legal Compliance
          </button>
          <button onClick={() => setActiveTab('inquiry-leads')} style={navBtnStyle(activeTab === 'inquiry-leads')}>
            <MessageSquare size={18} style={{ color: activeTab === 'inquiry-leads' ? '#3b82f6' : 'inherit' }} /> Inquiry Leads
          </button>
          <button onClick={() => setActiveTab('settings')} style={navBtnStyle(activeTab === 'settings')}>
            <Sparkles size={18} style={{ color: activeTab === 'settings' ? '#D4AF37' : 'inherit' }} /> Platform Settings
          </button>
          <button onClick={() => setActiveTab('treasury')} style={navBtnStyle(activeTab === 'treasury')}>
            <Wallet size={18} style={{ color: activeTab === 'treasury' ? '#10b981' : 'inherit' }} /> Treasury & Payouts
          </button>
        </nav>

        <div style={{ marginTop: 'auto', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>5% Deal Spread Target</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(totalFeeSpreadCaptured, currency)}</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        
        {/* HEADER BAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
              {activeTab === 'kanban' && '100-Project Onboarding Kanban'}
              {activeTab === 'kyc' && 'KYC Identity Clearance Queue'}
              {activeTab === 'payments' && 'Payment Clearance Queue'}
              {activeTab === 'dividend' && 'Dividend & Yield Distribution Engine'}
              {activeTab === 'spv-config' && 'SPV Distributor Entity & Equity Configurator'}
              {activeTab === 'cash-pipeline' && 'Restricted Cash Concierge Advisory Pipeline'}
              {activeTab === 'legal' && 'SPV Legal Contracts & Issuance'}
              {activeTab === 'treasury' && 'Promoter Payouts & Treasury Clearance'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* CURRENCY SELECTOR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px', marginRight: '1rem' }}>
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
            {activeTab === 'kanban' && (
              <button onClick={() => setShowNewProjectModal(true)} className="btn-gold" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <PlusCircle size={18} /> Onboard Project
              </button>
            )}
          </div>
        </header>

        {/* 0. PAYMENTS CLEARANCE TAB */}
        {activeTab === 'payments' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {paymentSubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>All Clear!</h3>
                <p style={{ color: '#94a3b8' }}>No pending payment proofs await verification.</p>
              </div>
            ) : (
              paymentSubmissions.map(sub => {
                const booking = sub.investment_bookings;
                const isPending = booking.status === 'Proof_Submitted';
                
                return (
                  <div key={sub.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : '4px solid #334155' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isPending ? '#D4AF37' : '#94a3b8' }}>{booking.status.replace('_', ' ')}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                      </div>
                      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{booking.investors?.alias_name}</h4>
                      <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{booking.funding_projects?.businesses?.brand_name} - {booking.funding_projects?.project_title}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Amount</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>{formatCurrency(booking.amount_bdt, currency)}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Yield Option</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>Option {booking.yield_option}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Method & TXN ID</p>
                          <p style={{ fontSize: '1rem', color: '#f8fafc' }}>{sub.payment_method} | <span style={{ fontFamily: 'monospace', color: '#D4AF37' }}>{sub.transaction_id}</span></p>
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
                          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No Image</p>
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

        {/* 0.5 KYC CLEARANCE TAB */}
        {activeTab === 'kyc' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {kycSubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(7,10,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>All Clear!</h3>
                <p style={{ color: '#94a3b8' }}>No pending KYC submissions await verification.</p>
              </div>
            ) : (
              kycSubmissions.map(sub => {
                const isPending = sub.status === 'Pending';
                
                return (
                  <div key={sub.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', borderLeft: isPending ? '4px solid #D4AF37' : sub.status === 'Approved' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isPending ? '#D4AF37' : '#94a3b8' }}>{sub.status}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                      </div>
                      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{sub.investors?.alias_name}</h4>
                      <p style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '1rem' }}>Requesting: Level {sub.target_level}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        {sub.target_level === 2 && (
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>NID Front</p>
                              {sub.nid_front_url ? <a href={sub.nid_front_url} target="_blank" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>View Image</a> : 'N/A'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>NID Back</p>
                              {sub.nid_back_url ? <a href={sub.nid_back_url} target="_blank" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>View Image</a> : 'N/A'}
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
                    
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
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

        {/* DIVIDEND ENGINE */}
        {activeTab === 'dividend' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37' }}>
                <TrendingUp size={24} /> Declare Monthly Dividend
              </h3>
              
              <form onSubmit={handleDistributeYield} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Select SPV / Project</label>
                  <select 
                    value={dividendProjectId}
                    onChange={(e) => setDividendProjectId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.filter(p => p.status === 'Trading' || p.status === 'Origination').map(p => (
                      <option key={p.id} value={p.id}>{p.project_title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Operating Month</label>
                    <select 
                      value={dividendMonth}
                      onChange={(e) => setDividendMonth(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    >
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Year</label>
                    <input 
                      type="number" 
                      value={dividendYear}
                      onChange={(e) => setDividendYear(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                {posSyncStatus && (
                  <div style={{ padding: '0.75rem', background: posSyncStatus.includes('Auto-synced') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: posSyncStatus.includes('Auto-synced') ? '#10b981' : '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    {posSyncStatus}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Gross Sales (BDT)</label>
                  <input 
                    type="number" 
                    value={grossSales}
                    onChange={(e) => setGrossSales(e.target.value)}
                    placeholder="e.g. 1500000"
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Net Profit (BDT)</label>
                  <input 
                    type="number" 
                    value={netProfit}
                    onChange={(e) => setNetProfit(e.target.value)}
                    placeholder="e.g. 400000"
                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isDistributing}
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: isDistributing ? 'not-allowed' : 'pointer' }}
                >
                  {isDistributing ? 'Calculating & Distributing...' : 'Distribute Yield to Investors'}
                </button>
              </form>
            </div>
            
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#f8fafc' }}>Yield Engine Rules</h3>
              <ul style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6' }}>
                <li>
                  <strong style={{ color: '#D4AF37' }}>Option 1 (Capped Yield):</strong> The engine pulls 10% of Gross Sales and distributes it proportionally among Option 1 investors.
                </li>
                <li>
                  <strong style={{ color: '#10b981' }}>Option 2 (Multiplier):</strong> The engine pulls 12% of Gross Sales and distributes it proportionally among Option 2 investors.
                </li>
                <li>
                  <strong style={{ color: '#8b5cf6' }}>Option 3 (Partnership):</strong> The engine calculates 35% of the declared Net Profit and distributes it proportionally among Option 3 investors.
                </li>
              </ul>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>By clicking Distribute, you are permanently recording individual ledger payouts in the <code>investor_yields</code> table. These amounts will instantly reflect in the investors' Portfolio Analytics.</p>
              </div>
            </div>
          </div>
        )}

        {/* 1. KANBAN TAB */}
        {activeTab === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
            {kanbanStages.map((stage) => {
              const stageProjects = projects.filter(p => p.status === stage.id);
              return (
                <div key={stage.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#D4AF37', margin: 0 }}>{stage.title}</h4>
                    <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700' }}>
                      {stageProjects.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {stageProjects.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No projects in this stage</div>
                    ) : (
                      stageProjects.map((p) => {
                        const feeSpread = Number(p.target_raise_bdt) * 0.05;
                        return (
                          <div key={p.id} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '1rem' }}>
                            <p style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#f8fafc' }}>{p.project_title}</p>
                            <div style={{ background: 'rgba(7,10,20,0.8)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ color: '#94a3b8' }}>CapEx Target:</span>
                                <span style={{ fontWeight: '700' }}>{formatCurrency(p.target_raise_bdt, currency)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8' }}>Gross Fee Spread:</span>
                                <span style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(feeSpread, currency)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. SPV CONFIGURATOR */}
        {activeTab === 'spv-config' && (
          <div className="glass-card">
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 1.25rem 0' }}>Configure SPV Hubs & 90/10 Splits</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '1rem' }}>Project Name</th>
                  <th style={{ padding: '1rem' }}>Stage</th>
                  <th style={{ padding: '1rem' }}>CapEx Requirement</th>
                  <th style={{ padding: '1rem' }}>SPV Legal Entity Name</th>
                  <th style={{ padding: '1rem' }}>Equity Dist.</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{p.project_title}</td>
                    <td style={{ padding: '1rem' }}>
                       <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#D4AF37', fontWeight: '700' }}>{formatCurrency(p.target_raise_bdt, currency)}</td>
                    <td style={{ padding: '1rem' }}>
                      {editingSpv?.id === p.id ? (
                        <input 
                          type="text" 
                          value={editingSpv.name} 
                          onChange={(e) => setEditingSpv({ ...editingSpv, name: e.target.value })} 
                          className="form-input" 
                          style={{ padding: '0.4rem 0.8rem' }}
                        />
                      ) : (
                        <span style={{ color: p.spv_name ? '#f8fafc' : '#ef4444' }}>{p.spv_name || 'Not Configured'}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: '#10b981', fontWeight: '800' }}>90/10</td>
                    <td style={{ padding: '1rem' }}>
                      {editingSpv?.id === p.id ? (
                        <button onClick={() => handleSaveSpv(p.id)} className="btn-gold" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                          Save & Register
                        </button>
                      ) : (
                        <button onClick={() => setEditingSpv({ id: p.id, name: p.spv_name || '' })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                          Edit SPV
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RESTRICTED CASH CONCIERGE PIPELINE TAB */}
        {activeTab === 'cash-pipeline' && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge-gold" style={{ marginBottom: '0.4rem' }}>Restricted Admin View</span>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Confidential Cash Consultation Queue</h3>
              </div>
              <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                🔒 Zero Public Log Exposure
              </span>
            </div>

            {cashTickets.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No confidential inquiries pending.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Ticket Date</th>
                    <th style={{ padding: '0.75rem' }}>Client Pseudonym</th>
                    <th style={{ padding: '0.75rem' }}>Project Target</th>
                    <th style={{ padding: '0.75rem' }}>Target Commitment</th>
                    <th style={{ padding: '0.75rem' }}>Meeting Note</th>
                    <th style={{ padding: '0.75rem' }}>Assigned Director</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cashTickets.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '600' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.85rem', fontWeight: '700' }}>{t.investors?.alias_name}</td>
                      <td style={{ padding: '0.85rem', color: '#94a3b8' }}>{t.funding_projects?.project_title}</td>
                      <td style={{ padding: '0.85rem', color: '#10b981', fontWeight: '700' }}>{formatCurrency(t.ticket_amount_bdt, currency)}</td>
                      <td style={{ padding: '0.85rem' }}>{t.preferred_meeting_time}</td>
                      <td style={{ padding: '0.85rem', color: '#D4AF37', fontSize: '0.85rem' }}>
                        <select 
                          value={t.kam_id || ''} 
                          onChange={(e) => handleAssignKam(t.id, t.investor_id, e.target.value)}
                          style={{ background: '#0f172a', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.3rem', borderRadius: '4px' }}
                        >
                          <option value="">-- Assign KAM --</option>
                          {allKams.map(k => (
                            <option key={k.id} value={k.id}>{k.full_name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                          ● {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {t.status === 'Pending_Review' && (
                          <button onClick={() => handleUpdateTicketStatus(t.id, 'Meeting_Scheduled')} style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', width: '100%' }}>
                            Advance Stage
                          </button>
                        )}
                        {t.status === 'Meeting_Scheduled' && (
                          <button onClick={() => handleUpdateTicketStatus(t.id, 'Funds_Cleared')} style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', width: '100%' }}>
                            Funds Cleared
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LEGAL TAB */}
        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Pending Legal Contract Issuance</h2>
            {loading ? (
              <div style={{display:'flex', gap:'1rem', flexDirection:'column'}}>
                <div style={{height:'100px', background:'rgba(255,255,255,0.05)', borderRadius:'12px'}}></div>
                <div style={{height:'100px', background:'rgba(255,255,255,0.05)', borderRadius:'12px'}}></div>
              </div>
            ) : activeInvestments.length === 0 ? (
              <p>No active investments found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeInvestments.map(inv => (
                  <div key={inv.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold' }}>{inv.funding_projects?.project_title}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Investor: {inv.investors?.alias_name} | Amount: ৳{formatCurrency(inv.amount_invested_bdt)} | Minted: {new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                    <form onSubmit={(e) => handleUploadLegalDoc(e, inv.id, inv.investor_id, inv.investors?.user_id)} style={{ display: 'flex', gap: '0.5rem' }}>
                      <select value={uploadDocType} onChange={(e) => setUploadDocType(e.target.value)} style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                        <option value="Share_Certificate">Share Certificate</option>
                        <option value="Subscription_Agreement">Subscription Agreement</option>
                        <option value="Tax_Document">Tax Document</option>
                      </select>
                      <input type="text" placeholder="PDF URL" value={uploadDocUrl} onChange={(e) => setUploadDocUrl(e.target.value)} style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }} />
                      <button type="submit" style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Issue PDF</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TREASURY TAB */}
        {activeTab === 'treasury' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Pending Promoter Payouts</h2>
            {loading ? (
              <div style={{display:'flex', gap:'1rem', flexDirection:'column'}}>
                <div style={{height:'100px', background:'rgba(255,255,255,0.05)', borderRadius:'12px'}}></div>
                <div style={{height:'100px', background:'rgba(255,255,255,0.05)', borderRadius:'12px'}}></div>
              </div>
            ) : payoutRequests.length === 0 ? (
              <p>No payout requests found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {payoutRequests.map(req => (
                  <div key={req.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: req.status === 'Cleared' ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold' }}>৳{formatCurrency(req.amount_bdt)}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Promoter: {req.promoters?.alias_name} | Channel: {req.disbursement_channel} | Acc: {req.account_details}</p>
                      <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: req.status === 'Cleared' ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)', color: req.status === 'Cleared' ? '#10b981' : '#D4AF37' }}>{req.status}</span>
                    </div>
                    {req.status !== 'Cleared' && (
                      <button onClick={() => handleClearPayout(req.id, req.promoters?.user_id)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Mark Cleared</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INQUIRY LEADS TAB */}
        {activeTab === 'inquiry-leads' && (
          <InquiryLeadsTab currency={currency} addToast={addToast} />
        )}

        {/* PLATFORM SETTINGS TAB */}
        {activeTab === 'settings' && (
          <PlatformSettingsTab addToast={addToast} />
        )}

      </main>

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', borderColor: '#D4AF37', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: 0 }}>Onboard Project to 100-Pipeline</h3>
            <form onSubmit={handleAddProject} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Outlet Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. ORO Roasters - Gulshan" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="form-input" 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>CapEx Budget (BDT)</label>
                <input 
                  type="number" 
                  value={newProject.capEx}
                  onChange={(e) => setNewProject({ ...newProject, capEx: e.target.value })}
                  className="form-input" 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Yield Model</label>
                <select 
                  value={newProject.yieldModel}
                  onChange={(e) => setNewProject({ ...newProject, yieldModel: e.target.value })}
                  className="form-input"
                >
                  <option value="Franchise">Franchise (18%)</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Equity">Equity</option>
                  <option value="Short-Term Debt">Short-Term Debt (24%)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={isSubmitting} className="btn-gold" style={{ flex: 1, justifyContent: 'center', border: 'none', borderRadius: '8px', padding: '0.8rem', fontWeight: '700', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save to Pipeline'}
                </button>
                <button type="button" onClick={() => setShowNewProjectModal(false)} style={{ flex: 1, justifyContent: 'center', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function navBtnStyle(active) {
  return {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: 'none',
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    color: active ? '#D4AF37' : '#94a3b8',
    fontWeight: active ? '700' : '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    textAlign: 'left'
  };
}

function InquiryLeadsTab({ currency, addToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiry_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching inquiry leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('inquiry_leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      addToast('Lead status updated', 'success');
      fetchLeads();
    } catch (err) {
      addToast('Failed to update lead status', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Public Prospective Leads</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Captured via LeadBot on Website & Project Profiles</p>
        </div>
        <span className="badge-gold">Total: {leads.length}</span>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading inquiry leads...</div>
      ) : leads.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No prospective leads captured yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {leads.map(lead => (
            <div key={lead.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>{lead.name}</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>{lead.meeting_preference || 'Online Call'}</span>
                </div>
                <p style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.9rem', margin: '0 0 0.4rem 0' }}>Phone: {lead.phone} | Budget: {lead.investment_range || 'N/A'}</p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                  <span>Source: {lead.source_page || 'Website'}</span>
                  <span>Captured: {new Date(lead.created_at).toLocaleString()}</span>
                  {lead.referral_code && <span style={{ color: '#10b981' }}>Ref Code: {lead.referral_code}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                  style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Meeting Booked">Meeting Booked</option>
                  <option value="Converted">Converted</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformSettingsTab({ addToast }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [saving, setSaving] = useState(false);

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
      console.log('No Telegram Chat ID configured yet.');
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
      addToast('Telegram Chat ID saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Platform & Notification Settings</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '2rem' }}>Configure automated alerts and system integrations.</p>

      <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Owner / Team Telegram Chat ID</label>
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
