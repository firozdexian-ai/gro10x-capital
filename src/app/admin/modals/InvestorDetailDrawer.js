'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function InvestorDetailDrawer({
  selectedInvestor,
  onClose,
  investorDrawerTab,
  setInvestorDrawerTab,
  handleUpdateInvestorStatus,
  handleToggleAnonymity,
  handleAssignKamToInvestor,
  allKams = [],
  activeInvestments = [],
  currency = 'BDT',
  yieldDisbursements = [],
  kycSubmissions = [],
  allInvestorNotes = [],
  newNoteForm,
  setNewNoteForm,
  handleSaveInvestorNote,
  savingNote = false
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedInvestor) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ width: '580px', maxWidth: '100vw', background: '#0f172a', borderLeft: '1px solid rgba(212,175,55,0.3)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
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
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
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
  );
}
