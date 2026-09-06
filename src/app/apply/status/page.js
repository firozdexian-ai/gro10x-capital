'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import { supabase } from '../../../lib/supabase';
import { 
  Building2, Search, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  ChevronRight, ArrowRight, Bot, Phone, Mail, ExternalLink, Calendar,
  FileText, Activity, RefreshCw, XCircle
} from 'lucide-react';

const COHORT_STAGES = [
  { id: 1, key: 'submitted', label: '1. Application Submitted', desc: 'Received by Admissions Desk' },
  { id: 2, key: 'review', label: '2. Director & KAM Triage', desc: 'Initial Criteria & Eligibility Screening' },
  { id: 3, key: 'diligence', label: '3. Diligence & POS Audit', desc: 'Financial verification and store visit' },
  { id: 4, key: 'committee', label: '4. Investment Committee', desc: 'Syndication Cohort & Term Sheet' },
];

function determineStageIndex(status) {
  switch (status) {
    case 'Approved':
      return 4;
    case 'Committee_Review':
    case 'Investment_Committee':
      return 3;
    case 'Diligence_In_Progress':
    case 'Under Review':
      return 2;
    case 'Under_Director_Review':
    case 'KAM_Assigned':
      return 1;
    case 'Rejected':
      return -1;
    case 'New_Submission':
    case 'Submitted':
    default:
      return 0;
  }
}

function StatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [refCodeInput, setRefCodeInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [application, setApplication] = useState(null);

  const fetchApplicationStatus = async (ref) => {
    const cleanRef = (ref || '').trim();
    if (!cleanRef) return;

    setLoading(true);
    setErrorMsg('');
    setApplication(null);

    try {
      const { data, error } = await supabase
        .from('business_cohort_applications')
        .select(`
          *,
          business_stakeholders (*)
        `)
        .or(`ref_code.eq.${cleanRef},reference_code.eq.${cleanRef}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg(`No cohort application found for reference code "${cleanRef}". Please check the code and try again.`);
      } else {
        setApplication(data);
      }
    } catch (err) {
      console.error('Error fetching application status:', err);
      setErrorMsg('Failed to query application status. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchApplicationStatus(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApplicationStatus(refCodeInput);
  };

  const currentStageIndex = application ? determineStageIndex(application.status || application.application_status) : 0;
  const isRejected = currentStageIndex === -1;
  const displayRef = application ? (application.ref_code || application.reference_code) : '';
  const displayStatus = application ? (application.status || application.application_status || 'Under Review') : '';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '20px', padding: '0.35rem 1rem', color: '#D4AF37',
          fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '1rem'
        }}>
          <Building2 size={14} /> Founder Portal
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 0.75rem 0', color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Cohort Application Status Tracker
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
          Track real-time evaluation, review notes, and Key Account Manager (KAM) audit milestones for your SME fundraising submission.
        </p>
      </div>

      {/* ── SEARCH INPUT FORM ── */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid rgba(212,175,55,0.25)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="e.g. GRO-COHORT-1042"
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
              className="input-field"
              style={{ width: '100%', paddingLeft: '42px', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.03em' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !refCodeInput.trim()}
            className="action-btn action-btn--primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            Check Status
          </button>
        </form>

        {errorMsg && (
          <div style={{ marginTop: '1.25rem', padding: '0.9rem 1.1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ── RESULT VIEW ── */}
      {application && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Main Status Header Card */}
          <div className="glass-card" style={{ padding: '1.75rem', borderLeft: isRejected ? '4px solid #ef4444' : '4px solid #D4AF37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Application Reference
                </span>
                <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '1.6rem', fontWeight: '800', color: '#D4AF37' }}>
                  {displayRef}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: '700' }}>
                  {application.brand_name} {application.company_legal_name && <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>({application.company_legal_name})</span>}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${isRejected ? 'status-badge--danger' : displayStatus === 'Approved' ? 'status-badge--success' : 'status-badge--gold'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                  {displayStatus}
                </span>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Submitted on {new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* STAGES PROGRESS BAR */}
            {!isRejected ? (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {COHORT_STAGES.map((s, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                          height: '6px', borderRadius: '3px',
                          background: isCompleted ? '#10b981' : isCurrent ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                          boxShadow: isCurrent ? '0 0 10px rgba(212,175,55,0.5)' : 'none',
                          transition: 'all 0.3s ease'
                        }} />
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: isCurrent ? '800' : '600',
                          color: isCompleted ? '#10b981' : isCurrent ? '#D4AF37' : '#64748b'
                        }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={20} style={{ color: '#D4AF37', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>
                      Current Milestone: {COHORT_STAGES[currentStageIndex]?.desc || 'Evaluation'}
                    </span>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      {currentStageIndex === 0 && 'Your pitch deck and company profile are in queue for Director review.'}
                      {currentStageIndex === 1 && 'A Key Account Manager is auditing your financial submissions and trade license.'}
                      {currentStageIndex === 2 && 'On-site POS audit and financial verification in progress with our field ops team.'}
                      {currentStageIndex >= 3 && 'Final syndication structuring and investment committee approval.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <XCircle size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ef4444' }}>
                    Application Not Selected for Current Cohort
                  </span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {application.reviewer_notes || 'Thank you for your application. At this stage, your business does not meet our active cohort syndicate criteria. You are welcome to reapply after two quarters of audited revenue.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details & Stakeholder Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Key Information */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} style={{ color: '#D4AF37' }} /> Submission Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Industry Sector:</span>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>{application.industry_sector || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Requested Capital:</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>
                    BDT {Number(application.funding_amount_requested_bdt || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Monthly Gross Revenue:</span>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>
                    BDT {Number(application.monthly_gross_revenue_bdt || application.monthly_revenue_bdt || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Lead Founder:</span>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>{application.lead_founder_name || 'Registered Founder'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Headquarters:</span>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>{application.headquarters_address || application.headquarters || 'Dhaka, Bangladesh'}</span>
                </div>
              </div>
            </div>

            {/* Telegram Live Alerts Box */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <Bot size={20} style={{ color: '#60a5fa' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                  Telegram Live Notifications
                </h3>
              </div>
              <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Connect directly with <b>@gro10xbizbot</b> on Telegram. Once connected with your phone number, our investment committee updates will ping your Telegram instantly.
              </p>
              <a
                href={`https://t.me/gro10xbizbot?start=${encodeURIComponent(displayRef)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn--primary"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem' }}
              >
                <Bot size={16} /> Open @gro10xbizbot on Telegram
                <ExternalLink size={14} />
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default function CohortStatusPage() {
  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navigation />
      <div style={{ paddingTop: '3rem' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            Loading status portal...
          </div>
        }>
          <StatusContent />
        </Suspense>
      </div>
    </div>
  );
}
