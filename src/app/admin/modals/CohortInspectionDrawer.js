'use client';

import React from 'react';
import { formatCurrency } from '../../../lib/currency';

export default function CohortInspectionDrawer({
  selectedApplication,
  onClose,
  appDrawerSubTab,
  setAppDrawerSubTab,
  allAppStakeholders = [],
  currency = 'BDT',
  allKams = [],
  handleAssignKamToApp,
  kamAuditForm,
  setKamAuditForm,
  handleSaveKamAudit,
  rejectingAppId,
  setRejectingAppId,
  rejectionReasonInput,
  setRejectionReasonInput,
  handleRejectApp,
  handleConvertCohortToDeal,
  convertingAppId
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedApplication) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ width: '640px', maxWidth: '100vw', background: '#0f172a', borderLeft: '1px solid rgba(212,175,55,0.3)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* DRAWER HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#D4AF37', fontWeight: 'bold' }}>{selectedApplication.ref_code}</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: '0.2rem 0 0.3rem 0' }}>{selectedApplication.brand_name}</h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
              {selectedApplication.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
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
              {subTab === 'brand' ? 'Brand Identity' : subTab === 'team' ? 'Team Roster' : subTab === 'audit' ? 'Audit & Onboard' : subTab}
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
  );
}
