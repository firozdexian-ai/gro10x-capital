'use client';

import React from 'react';

export default function BusinessFormModal({
  showNewBusinessModal,
  setShowNewBusinessModal,
  newBusinessForm,
  setNewBusinessForm,
  handleSaveNewBusiness,
  savingBusiness = false
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowNewBusinessModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowNewBusinessModal]);

  if (!showNewBusinessModal) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) setShowNewBusinessModal(false); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'grid', placeItems: 'center', padding: '1rem' }}
    >
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Create New Business Brand</h3>
          <button onClick={() => setShowNewBusinessModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSaveNewBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Brand Name</label>
            <input 
              type="text" 
              value={newBusinessForm.brand_name} 
              onChange={(e) => setNewBusinessForm({ ...newBusinessForm, brand_name: e.target.value })} 
              placeholder="e.g. ORO Roasters" 
              className="form-input" 
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Company Legal Name</label>
            <input 
              type="text" 
              value={newBusinessForm.company_legal_name} 
              onChange={(e) => setNewBusinessForm({ ...newBusinessForm, company_legal_name: e.target.value })} 
              placeholder="e.g. ORO Bangladesh Pvt Ltd" 
              className="form-input" 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Industry Sector</label>
              <select 
                value={newBusinessForm.industry_sector}
                onChange={(e) => setNewBusinessForm({ ...newBusinessForm, industry_sector: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
              >
                <option value="F&B Franchise">F&B Franchise</option>
                <option value="Retail Distribution">Retail Distribution</option>
                <option value="Services">Services</option>
                <option value="Tech & Logistics">Tech & Logistics</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Operational Months</label>
              <input 
                type="number" 
                value={newBusinessForm.operational_months} 
                onChange={(e) => setNewBusinessForm({ ...newBusinessForm, operational_months: e.target.value })} 
                className="form-input" 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Founder Full Name</label>
            <input 
              type="text" 
              value={newBusinessForm.founder_name} 
              onChange={(e) => setNewBusinessForm({ ...newBusinessForm, founder_name: e.target.value })} 
              placeholder="e.g. Tanvir Ahmed" 
              className="form-input" 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Founder LinkedIn Profile URL</label>
            <input 
              type="text" 
              value={newBusinessForm.founder_linkedin_url} 
              onChange={(e) => setNewBusinessForm({ ...newBusinessForm, founder_linkedin_url: e.target.value })} 
              placeholder="https://linkedin.com/in/..." 
              className="form-input" 
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowNewBusinessModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={savingBusiness} className="btn-gold" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
              {savingBusiness ? 'Saving...' : 'Save & Select Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
