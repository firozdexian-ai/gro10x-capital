'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';
import { 
  Building2, CheckCircle2, Clock, ShieldCheck, ArrowUpRight, DollarSign, 
  FileText, Upload, ChevronRight, AlertCircle, Wrench, Coffee, Lock, Globe, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function BuildoutTrackerPortal() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        // If founder, fetch their projects
        let query = supabase.from('funding_projects').select('*, businesses(brand_name)');
        
        if (user && role === 'founder') {
          const { data: founder } = await supabase
            .from('founders')
            .select('id, businesses(id)')
            .eq('user_id', user.id)
            .maybeSingle();

          if (founder?.businesses?.id) {
            query = query.eq('business_id', founder.businesses.id);
          }
        }

        const { data: projData, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        if (projData && projData.length > 0) {
          setProjects(projData);
          setSelectedProjectId(projData[0].id);
        }
      } catch (err) {
        console.warn('Error loading projects for buildout tracker:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProjects();
    }
  }, [user, role]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || {
    project_title: 'ORO Roasters - Banani (Flagship)',
    target_raise_bdt: 20000000,
    amount_raised_bdt: 14000000,
    status: 'Funding',
    expected_close_date: '2026-08-25'
  };

  const totalCapEx = Number(activeProject.target_raise_bdt) || 20000000;
  const raisedCapEx = Number(activeProject.amount_raised_bdt) || 0;
  const fundingRatio = totalCapEx > 0 ? (raisedCapEx / totalCapEx) : 0;

  // Dynamically calculate milestones based on actual project target CapEx and funding progression
  const m1Amount = Math.round(totalCapEx * 0.11);
  const m2Amount = Math.round(totalCapEx * 0.59);
  const m3Amount = Math.round(totalCapEx * 0.17);
  const m4Amount = Math.round(totalCapEx * 0.13);

  const m1Done = fundingRatio >= 0.11;
  const m2Done = fundingRatio >= 0.70;
  const m3Done = fundingRatio >= 0.87;
  const m4Done = fundingRatio >= 1.0;

  const milestones = [
    {
      id: 'M1',
      title: 'Milestone 1: Security Advance Rent & Location Handover',
      pct: '11% CapEx',
      amount: m1Amount,
      status: m1Done ? 'Verified & Released' : 'Pending Funding Allocation',
      items: [
        `Advance Lease Escrow (${formatCurrency(m1Amount * 0.73, currency)})`,
        'Landlord Agreement, Tenancy Contract & Legal Handover'
      ],
      completedDate: m1Done ? 'Verified' : 'Target: Phase 1'
    },
    {
      id: 'M2',
      title: 'Milestone 2: Outlet Civil Interior & Architecture',
      pct: '59% CapEx',
      amount: m2Amount,
      status: m2Done ? 'Verified & Released' : (m1Done ? 'Tranche In Progress' : 'Pending Milestone 1'),
      items: [
        `Architectural Woodwork & Interior Fitout (${formatCurrency(m2Amount * 0.45, currency)})`,
        `HVAC Electrical Grid & Ducting Installation (${formatCurrency(m2Amount * 0.35, currency)})`,
        `Commercial Flooring, Plumbing & Sanitary Setup (${formatCurrency(m2Amount * 0.20, currency)})`
      ],
      completedDate: m2Done ? 'Verified' : 'Target: Phase 2'
    },
    {
      id: 'M3',
      title: 'Milestone 3: Commercial Equipment & Machinery Setup',
      pct: '17% CapEx',
      amount: m3Amount,
      status: m3Done ? 'Verified & Released' : (m2Done ? 'Tranche In Progress' : 'Pending Milestone 2'),
      items: [
        `Core Commercial Machinery Import (${formatCurrency(m3Amount * 0.55, currency)})`,
        `Refrigeration, Chiller Units & Deep Freezers (${formatCurrency(m3Amount * 0.30, currency)})`,
        `Kitchen Countertop Appliances & Utensils (${formatCurrency(m3Amount * 0.15, currency)})`
      ],
      completedDate: m3Done ? 'Verified' : 'Target: Phase 3'
    },
    {
      id: 'M4',
      title: 'Milestone 4: POS IT, CCTV Grid & Grand Opening',
      pct: '13% CapEx',
      amount: m4Amount,
      status: m4Done ? 'Verified & Released' : (m3Done ? 'Tranche In Progress' : 'Pending Milestone 3'),
      items: [
        `Thermal Receipt POS Terminals & Scanner Grid (${formatCurrency(m4Amount * 0.35, currency)})`,
        `High-Definition Security Surveillance CCTV Cameras (${formatCurrency(m4Amount * 0.35, currency)})`,
        `Initial Staff Uniforms, Launch Collateral & Opening Stock (${formatCurrency(m4Amount * 0.30, currency)})`
      ],
      completedDate: m4Done ? 'Grand Opening Complete' : 'Target: Launch'
    }
  ];

  const releasedCapEx = milestones.filter(m => m.status.includes('Released')).reduce((sum, m) => sum + m.amount, 0);
  const overallProgress = totalCapEx > 0 ? Math.round((releasedCapEx / totalCapEx) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a14', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
        <Loader2 className="spin" size={40} />
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            <Wrench size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>CAPEX BUILDOUT <span style={{ color: '#D4AF37' }}>TRACKER</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Milestone Tranche Disbursement Engine</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* PROJECT PICKER IF MULTIPLE */}
          {projects.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_title}</option>
                ))}
              </select>
            </div>
          )}

          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
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

          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '3rem 0' }}>
        
        {/* TOP STATUS CARD */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', borderColor: 'rgba(212,175,55,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.4rem' }}>Physical Asset Disbursement</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{activeProject.project_title}</h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                SPV: <strong style={{ color: '#cbd5e1' }}>{activeProject.spv_name || 'GRO10X SPV Entity'}</strong> • Stage: <strong style={{ color: '#D4AF37' }}>{activeProject.status}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expected Close / Opening</span>
              <h3 style={{ color: '#10b981', fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                {activeProject.expected_close_date ? new Date(activeProject.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled'}
              </h3>
            </div>
          </div>

          {/* OVERALL BUILDOUT PROGRESS BAR */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#94a3b8' }}>Overall Construction & Procurement Progress:</span>
              <strong style={{ color: '#D4AF37', fontSize: '1.1rem' }}>{overallProgress}% Completed</strong>
            </div>
            <div style={{ background: 'rgba(7,10,20,0.8)', height: '14px', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ background: 'linear-gradient(90deg, #D4AF37, #10b981)', width: `${overallProgress}%`, height: '100%', borderRadius: '7px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>

          <div className="grid-3" style={{ background: 'rgba(7,10,20,0.6)', padding: '1.25rem', borderRadius: '14px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total Raised CapEx Budget:</span>
              <p style={{ color: '#f8fafc', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(totalCapEx, currency)}</p>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Audited Tranches Released:</span>
              <p style={{ color: '#10b981', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(releasedCapEx, currency)}</p>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Escrow Capital Held in SPV:</span>
              <p style={{ color: '#3b82f6', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(Math.max(0, totalCapEx - releasedCapEx), currency)}</p>
            </div>
          </div>
        </div>

        {/* 4 MILESTONE CARDS TIMELINE */}
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>CapEx Disbursement Milestones</h3>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {milestones.map((m) => (
            <div key={m.id} className="glass-card" style={{ borderLeft: `5px solid ${m.status.includes('Released') ? '#10b981' : (m.status.includes('Progress') ? '#D4AF37' : 'rgba(255,255,255,0.2)')}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: '#D4AF37', fontWeight: '700', fontSize: '0.85rem' }}>{m.pct} ({formatCurrency(m.amount, currency)})</span>
                  <h3 style={{ fontSize: '1.35rem', margin: '0.2rem 0' }}>{m.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Completion / Target: <strong>{m.completedDate}</strong></p>
                </div>

                <span style={{ 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  background: m.status.includes('Released') ? 'rgba(16,185,129,0.15)' : (m.status.includes('Progress') ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)'),
                  color: m.status.includes('Released') ? '#10b981' : (m.status.includes('Progress') ? '#D4AF37' : '#94a3b8')
                }}>
                  ● {m.status}
                </span>
              </div>

              {/* ITEMIZED ASSET LIST */}
              <div style={{ background: 'rgba(7,10,20,0.6)', padding: '1rem', borderRadius: '10px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>Audited Line-Item Expenses:</p>
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  {m.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#f8fafc' }}>
                      <CheckCircle2 size={16} style={{ color: m.status.includes('Released') ? '#10b981' : '#D4AF37' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
