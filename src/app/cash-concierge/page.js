'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Database, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, Lock, Briefcase, ChevronRight, Loader2, DollarSign, Calendar
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/Toast';
import Link from 'next/link';

export default function CashConciergePortal() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [investorProfile, setInvestorProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProject, setSelectedProject] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConciergeData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchConciergeData = async () => {
    try {
      setLoading(true);
      // Fetch Investor Profile
      const { data: profile, error: profErr } = await supabase
        .from('investors')
        .select('*, kams(full_name)')
        .eq('user_id', user.id)
        .single();
        
      if (profErr) {
        if (profErr.code !== 'PGRST116') throw profErr;
        setLoading(false);
        return; // Not an investor
      }
      
      // We must fetch KYC level
      const { data: kycData } = await supabase
        .from('kyc_submissions')
        .select('target_level, status')
        .eq('investor_id', profile.id)
        .eq('status', 'Approved')
        .order('target_level', { ascending: false })
        .limit(1)
        .single();
        
      const kycLevel = kycData ? kycData.target_level : 1;
      profile.kycLevel = kycLevel;
      setInvestorProfile(profile);

      // Only fetch more data if Level 3
      if (kycLevel >= 3) {
        // Fetch eligible projects
        const { data: projData, error: projErr } = await supabase
          .from('funding_projects')
          .select('*, businesses(brand_name)')
          .in('status', ['Origination', 'Trading']);
          
        if (projErr) throw projErr;
        setProjects(projData || []);

        // Fetch user's cash tickets
        const { data: ticketData, error: ticketErr } = await supabase
          .from('cash_tickets')
          .select('*, funding_projects(project_title, min_otc_investment_bdt), kams(full_name)')
          .eq('investor_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (ticketErr) throw ticketErr;
        setMyTickets(ticketData || []);
      }

    } catch (err) {
      console.error('Error fetching concierge data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !ticketAmount || !meetingTime || !investorProfile) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    const proj = projects.find(p => p.id === selectedProject);
    const minLimit = proj ? Number(proj.min_otc_investment_bdt) : 5000000;

    if (Number(ticketAmount) < minLimit) {
      addToast(`Minimum OTC Ticket for this project is ${formatCurrency(minLimit, currency)}.`, 'alert');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('cash_tickets')
        .insert([{
          investor_id: investorProfile.id,
          kam_id: investorProfile.assigned_kam_id || null, // Auto-assign to their KAM
          target_project_id: selectedProject,
          ticket_amount_bdt: ticketAmount,
          preferred_meeting_time: meetingTime,
          status: 'Pending_Review'
        }])
        .select('*, funding_projects(project_title), kams(full_name)')
        .single();

      if (error) throw error;

      addToast('OTC Block Trade Request Submitted!', 'success');
      
      // Update local history
      setMyTickets([data, ...myTickets]);
      
      // Reset form
      setSelectedProject('');
      setTicketAmount('');
      setMeetingTime('');
      
      // Send notification to Admin (or KAM if we had their user_id)
      await supabase.from('notifications').insert([{
        user_id: user.id, // For demo, we just notify the user it was received
        title: 'Concierge Request Received',
        message: `Your OTC request for ${formatCurrency(ticketAmount, currency)} is under review. Your Managing Partner will contact you shortly.`,
        type: 'info'
      }]);

    } catch (err) {
      console.error('Ticket Sync Error:', err);
      addToast('Failed to submit ticket.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#05070a', display: 'grid', placeItems: 'center' }}><Loader2 className="spin" size={48} color="#D4AF37" /></div>;
  }

  if (!investorProfile || investorProfile.kycLevel < 3) {
    return (
      <div style={{ minHeight: '100vh', background: '#05070a', color: '#f8fafc', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '550px', border: '1px solid rgba(212,175,55,0.2)' }}>
          <Lock size={48} color="#D4AF37" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#D4AF37' }}>Restricted Advisory Access</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
            The Cash Concierge & OTC Desk is exclusively available to <strong>KYC Level 3 (HNW)</strong> verified members.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', margin: '2rem 0', textAlign: 'left' }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, display: 'flex', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#10b981" /> <strong>Level 3 Requirement:</strong> Verified Source of Funds Declaration.
            </p>
          </div>
          <Link href="/investor" className="btn-gold" style={{ display: 'inline-block', textDecoration: 'none' }}>Go to Portfolio to Upgrade</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#05070a', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(5,7,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,175,55,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #D4AF37', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', color: '#D4AF37' }}>Cash Concierge & OTC Desk</h1>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>HNW Block Trading Advisory</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Assigned Partner</p>
            <p style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 'bold', margin: 0 }}>{investorProfile.kams?.full_name || 'Pending Assignment'}</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', padding: '0 2rem' }}>
        
        <div className="grid-2" style={{ gap: '2rem' }}>
          
          {/* TICKET FORM */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Request OTC Block Trade</h2>
            <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(7,10,20,0.8) 100%)' }}>
              <form onSubmit={handleTicketSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Target Asset / Project</label>
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '1rem' }}
                    required
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title} (Min: {formatCurrency(p.min_otc_investment_bdt, currency)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Ticket Amount (BDT)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                    <input 
                      type="number" 
                      value={ticketAmount}
                      onChange={(e) => setTicketAmount(e.target.value)}
                      placeholder="e.g. 5000000"
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                  {selectedProject && (
                    <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                      Minimum Block Size: {formatCurrency(projects.find(p => p.id === selectedProject)?.min_otc_investment_bdt, currency)}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Preferred Meeting Time</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      placeholder="e.g. Tomorrow at 3 PM (Banani Office)"
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '1rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} color="#D4AF37" style={{ flexShrink: 0 }} />
                    Submitting this ticket notifies your assigned Managing Partner. Cash Concierge deals are processed off-chain and require a physical or secure virtual signature.
                  </p>
                </div>

                <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Submitting Request...' : 'Open Concierge Ticket'}
                </button>
              </form>
            </div>
          </div>

          {/* TICKET HISTORY */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Active Advisory Tickets</h2>
            {myTickets.length === 0 ? (
               <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                 <p style={{ color: '#94a3b8' }}>No active block trades or advisory tickets.</p>
               </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {myTickets.map(ticket => {
                  let statusColor = '#94a3b8';
                  if (ticket.status === 'Pending_Review') statusColor = '#f59e0b';
                  if (ticket.status === 'Meeting_Scheduled') statusColor = '#3b82f6';
                  if (ticket.status === 'Funds_Cleared') statusColor = '#10b981';
                  if (ticket.status === 'Rejected') statusColor = '#ef4444';

                  return (
                    <div key={ticket.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${statusColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: statusColor, background: `${statusColor}22`, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{ticket.funding_projects?.project_title}</h4>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 1rem 0' }}>
                        {formatCurrency(ticket.ticket_amount_bdt, currency)}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                        <span>Partner: {ticket.kams?.full_name || 'TBD'}</span>
                        <span>{ticket.preferred_meeting_time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
