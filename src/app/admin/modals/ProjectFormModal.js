'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function ProjectFormModal({
  showProjectModal,
  setShowProjectModal,
  editingProjectId,
  projectModalTab,
  setProjectModalTab,
  projectForm,
  setProjectForm,
  handleSaveProject,
  setShowNewBusinessModal,
  businesses = [],
  kanbanStages = [],
  allKams = [],
  currency = 'BDT',
  uploadingCover = false,
  handleUploadCoverImage,
  uploadingGallery = false,
  handleUploadGalleryImage,
  handleDeleteGalleryMedia
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowProjectModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowProjectModal]);

  if (!showProjectModal) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) setShowProjectModal(false); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '1rem' }}
    >
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
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Booked / Reserved Capital (BDT)</label>
                  <input 
                    type="number" 
                    value={projectForm.booked_amount_bdt}
                    onChange={(e) => setProjectForm({ ...projectForm, booked_amount_bdt: e.target.value })}
                    placeholder="Includes 10% GRO10X stake + lead bookings"
                    className="form-input" 
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Includes GRO10X 10% co-invest stake + active lead intent bookings</span>
                </div>

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

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Verified Monthly Gross Sales (BDT)</label>
                  <input 
                    type="number" 
                    value={projectForm.avg_monthly_gross_sales}
                    onChange={(e) => setProjectForm({ ...projectForm, avg_monthly_gross_sales: e.target.value })}
                    placeholder="e.g. 3160000"
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Used for Investor ROI Calculator (Option 1 & 2)</span>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Verified Monthly Net Profit (BDT)</label>
                  <input 
                    type="number" 
                    value={projectForm.avg_monthly_net_profit}
                    onChange={(e) => setProjectForm({ ...projectForm, avg_monthly_net_profit: e.target.value })}
                    placeholder="e.g. 534000"
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Used for Option 3 Partnership Net Profit calculation</span>
                </div>
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

              {(!projectForm.media_list || projectForm.media_list.length === 0) ? (
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
                <CheckCircle2 size={16} /> Gallery Photos: {projectForm.media_list?.length || 0} assets
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
  );
}
