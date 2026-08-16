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

const initialMilestones = [
  {
    id: 'M1',
    title: 'Milestone 1: Security Advance Rent & Location Handover',
    pct: '11% CapEx',
    amount: 2200000,
    status: 'Verified & Released',
    items: ['7-Month Lease Advance Deposit (BDT 16.1L)', 'Landlord Agreement & Legal Handover'],
    completedDate: 'May 12, 2026'
  },
  {
    id: 'M2',
    title: 'Milestone 2: Cafe Civil Interior & Architecture',
    pct: '59% CapEx',
    amount: 11800000,
    status: 'Verified & Released',
    items: ['Woodwork & Panelling (BDT 10.3L)', 'M.S. Steel Design Net & Switch Wiring (BDT 13.8L)', 'Media 5-Ton AC Cassettes & Fitting (BDT 8.9L)'],
    completedDate: 'June 01, 2026'
  },
  {
    id: 'M3',
    title: 'Milestone 3: Specialty Coffee Machinery & Kitchen Setup',
    pct: '17% CapEx',
    amount: 3400000,
    status: 'Tranche Released (In Progress)',
    items: ['Coffee Planet Espresso Machine (BDT 6.9L)', 'IHW Ice Machine & Deep Chillers (BDT 6.35L)', 'Walton Stand Chillers & Fryers (BDT 4.2L)'],
    completedDate: 'In Progress (Target: Aug 15)'
  },
  {
    id: 'M4',
    title: 'Milestone 4: POS IT, CCTV Grid & Grand Opening',
    pct: '13% CapEx',
    amount: 2600000,
    status: 'Pending Milestone 3 Completion',
    items: ['Canon & Counter POS Printers (BDT 0.64L)', 'CCTV Cameras, Monitor & Security Grid (BDT 1.05L)', 'Initial Staff Uniforms & Launch Marketing'],
    completedDate: 'Scheduled: Aug 25'
  }
];

export default function BuildoutTrackerPortal() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [selectedHub, setSelectedHub] = useState('ORO Roasters - Banani (Flagship)');
  const [milestones, setMilestones] = useState(initialMilestones);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadFounderBiz() {
      if (!user) return;
      try {
        const { data: founder } = await supabase
          .from('founders')
          .select('id, businesses(brand_name)')
          .eq('user_id', user.id)
          .maybeSingle();

        if (founder?.businesses?.brand_name) {
          setBusinessName(founder.businesses.brand_name);
          setSelectedHub(`${founder.businesses.brand_name} (Expansion Outlet)`);
        }
      } catch (err) {
        console.warn('Could not load founder business name:', err);
      }
    }
    loadFounderBiz();
  }, [user]);

  const totalCapEx = 20000000;
  const releasedCapEx = milestones.filter(m => m.status.includes('Released')).reduce((sum, m) => sum + m.amount, 0);
  const overallProgress = Math.round((releasedCapEx / totalCapEx) * 100);

  if (authLoading) {
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
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Milestone Tranche Disbursement Engine v0.1.6</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.4rem' }}>Physical Asset Disbursement</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{selectedHub}</h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Estimated Grand Opening</span>
              <h3 style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '800' }}>August 25, 2026</h3>
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
              <p style={{ color: '#3b82f6', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(totalCapEx - releasedCapEx, currency)}</p>
            </div>
          </div>
        </div>

        {/* 4 MILESTONE CARDS TIMELINE */}
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>CapEx Disbursement Milestones</h3>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {milestones.map((m, idx) => (
            <div key={m.id} className="glass-card" style={{ borderLeft: `5px solid ${m.status.includes('Released') ? '#10b981' : (m.status.includes('Progress') ? '#D4AF37' : 'rgba(255,255,255,0.2)')}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
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
