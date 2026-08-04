'use client';
import React, { useState } from 'react';
import { 
  Building2, Users, PlusCircle, CheckCircle, Clock, ShieldAlert, 
  TrendingUp, DollarSign, Upload, FileText, ArrowUpRight, ChevronRight,
  Filter, Search, RefreshCw, BarChart2, Layers, Award, Sparkles, Lock, ShieldCheck
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

const kanbanStages = [
  { id: 'stage-1', title: '1. Origination & Pitch Review' },
  { id: 'stage-2', title: '2. SPV Valuation (BDT 2.2 Cr)' },
  { id: 'stage-3', title: '3. Active Capital Raise (90/10)' },
  { id: 'stage-4', title: '4. Active National Grid Hub' },
];

const initialProjects = [
  { id: 'PROJ-01', stage: 'stage-4', name: 'ORO Roasters - Mirpur', capEx: 20000000, raised: 20000000, feeSpread: 1000000, status: 'Active', yieldModel: 'Partnership (5% + 35%)', spvName: 'GRO10X Mirpur SPV Ltd.' },
  { id: 'PROJ-02', stage: 'stage-3', name: 'ORO Roasters - Banani', capEx: 20000000, raised: 16000000, feeSpread: 1000000, status: 'Funding', yieldModel: 'Multiplier (12%)', spvName: 'GRO10X Banani SPV Ltd.' },
  { id: 'PROJ-03', stage: 'stage-2', name: 'Segreto Hub - Dhanmondi', capEx: 15000000, raised: 9000000, feeSpread: 750000, status: 'Diligence', yieldModel: 'Capped (10%)', spvName: 'GRO10X Dhanmondi SPV Ltd.' },
  { id: 'PROJ-04', stage: 'stage-1', name: 'ORO Roasters - Uttara', capEx: 20000000, raised: 0, feeSpread: 1000000, status: 'Origination', yieldModel: 'Partnership', spvName: 'GRO10X Uttara SPV Ltd.' },
];

const initialCashTickets = [
  { id: 'CASH-CONF-9011', aliasName: 'Director_X (HNI)', channel: 'Signal Encrypted', target: 'BDT 1.0 Crore', venue: 'GRO10X Suite', status: 'Private Meeting Scheduled', partner: 'Managing Partner A' },
  { id: 'CASH-CONF-9012', aliasName: 'UK_Expat_Syndicate', channel: 'Telegram', target: 'BDT 2.0 Crores', venue: 'Banani VIP Suite', status: 'Encrypted Contact Established', partner: 'Managing Partner B' },
  { id: 'CASH-CONF-9013', aliasName: 'Chittagong_HNI_Group', channel: 'In-Person', target: 'BDT 50 Lakhs', venue: 'Private Suite', status: 'Inquiry Received', partner: 'Unassigned' },
];

export default function AdminPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [activeTab, setActiveTab] = useState('kanban');
  const [projects, setProjects] = useState(initialProjects);
  const [cashTickets, setCashTickets] = useState(initialCashTickets);

  // Form State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', capEx: 20000000, yieldModel: 'Option 1: Capped (10%)' });

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    const created = {
      id: `PROJ-0${projects.length + 1}`,
      stage: 'stage-1',
      name: newProject.name,
      capEx: Number(newProject.capEx),
      raised: 0,
      feeSpread: Number(newProject.capEx) * 0.05,
      status: 'Origination',
      yieldModel: newProject.yieldModel,
      spvName: `GRO10X ${newProject.name.split(' ')[0]} SPV Ltd.`
    };
    setProjects([created, ...projects]);
    setShowNewProjectModal(false);
  };

  const handleUpdateTicketStatus = (id, nextStatus) => {
    setCashTickets(cashTickets.map(t => t.id === id ? { ...t, status: nextStatus, partner: 'Managing Director Assigned' } : t));
  };

  const totalFeeSpreadCaptured = projects.reduce((sum, p) => sum + p.feeSpread, 0);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', background: 'rgba(15, 23, 42, 0.8)', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900' }}>G</div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>GRO10X <span style={{ color: '#D4AF37' }}>ADMIN</span></span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Master Command Center v0.1.5</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('kanban')} style={navBtnStyle(activeTab === 'kanban')}>
            <Layers size={18} /> 100-Project Kanban
          </button>
          <button onClick={() => setActiveTab('spv-config')} style={navBtnStyle(activeTab === 'spv-config')}>
            <Building2 size={18} /> SPV & Equity Split (90/10)
          </button>
          <button onClick={() => setActiveTab('cash-pipeline')} style={navBtnStyle(activeTab === 'cash-pipeline')}>
            <Lock size={18} style={{ color: '#D4AF37' }} /> Restricted Cash Concierge ({cashTickets.length})
          </button>
        </nav>

        <div style={{ marginTop: 'auto', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>5% Deal Spread Captured</p>
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
              {activeTab === 'spv-config' && 'SPV Distributor Entity & Equity Configurator'}
              {activeTab === 'cash-pipeline' && 'Restricted Cash Concierge Advisory Pipeline'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>Managing 5% Fee Spread & Discrete HNI Settlements</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/cash-concierge" style={{ color: '#D4AF37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.6rem 1rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', fontWeight: '600' }}>
              Cash Concierge Form <ArrowUpRight size={16} />
            </a>
            <button onClick={() => setShowNewProjectModal(true)} className="btn-gold" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              <PlusCircle size={18} /> Onboard Project
            </button>
          </div>
        </header>

        {/* 1. KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {kanbanStages.map((stage) => {
              const stageProjects = projects.filter(p => p.stage === stage.id);
              return (
                <div key={stage.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#D4AF37' }}>{stage.title}</h4>
                    <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700' }}>
                      {stageProjects.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {stageProjects.map((p) => (
                      <div key={p.id} className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700' }}>{p.id}</span>
                          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>5% Spread</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{p.name}</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{p.spvName}</p>

                        <div style={{ background: 'rgba(7,10,20,0.8)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#94a3b8' }}>CapEx Target:</span>
                            <span style={{ fontWeight: '700' }}>{formatCurrency(p.capEx, currency)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Gross Fee Spread:</span>
                            <span style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(p.feeSpread, currency)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. RESTRICTED CASH CONCIERGE PIPELINE TAB */}
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

            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.75rem' }}>Client Pseudonym</th>
                  <th style={{ padding: '0.75rem' }}>Channel</th>
                  <th style={{ padding: '0.75rem' }}>Target Commitment</th>
                  <th style={{ padding: '0.75rem' }}>Meeting Venue</th>
                  <th style={{ padding: '0.75rem' }}>Assigned Director</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cashTickets.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', color: '#D4AF37', fontWeight: '600' }}>{t.id}</td>
                    <td style={{ padding: '0.85rem', fontWeight: '700' }}>{t.aliasName}</td>
                    <td style={{ padding: '0.85rem', color: '#94a3b8' }}>{t.channel}</td>
                    <td style={{ padding: '0.85rem', color: '#10b981', fontWeight: '700' }}>{t.target}</td>
                    <td style={{ padding: '0.85rem' }}>{t.venue}</td>
                    <td style={{ padding: '0.85rem', color: '#D4AF37', fontSize: '0.85rem' }}>{t.partner}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        ● {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {t.status !== 'SPV Agreement Executed' && (
                        <button onClick={() => handleUpdateTicketStatus(t.id, 'Private Meeting Scheduled')} style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                          Advance Stage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', borderColor: '#D4AF37' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Onboard Project to 100-Pipeline</h3>
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Save to Pipeline
                </button>
                <button type="button" onClick={() => setShowNewProjectModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  };
}
