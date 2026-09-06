'use client';
import React from 'react';
import { Crosshair } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function PromoterTargetsTab({
  selectedProjectId,
  setSelectedProjectId,
  targetAmount,
  setTargetAmount,
  isSubmittingTarget,
  handleAddTarget,
  projects = [],
  promoterTargets = [],
  currency = 'BDT'
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.4fr)', gap: '1.75rem', alignItems: 'flex-start' }}>
      
      {/* PLEDGE FORM */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crosshair size={18} color="#60a5fa" /> Pledge Campaign Raise Target
        </h3>

        <form onSubmit={handleAddTarget} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              Select CapEx Target Project *
            </label>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)} 
              className="form-input" 
              style={{ fontSize: '0.82rem' }}
              required
            >
              <option value="">Choose Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.project_title} ({p.funding_type} - Target: ৳{(p.target_raise_bdt / 10000000).toFixed(2)} Cr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              My Pledged Raise Target (BDT) *
            </label>
            <input 
              type="number" 
              value={targetAmount} 
              onChange={(e) => setTargetAmount(e.target.value)} 
              className="form-input" 
              placeholder="e.g. 50000000 (৳5 Crore)" 
              style={{ fontSize: '0.82rem' }}
              required 
            />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
              Unlocks +0.25% bonus commission upon crossing the pledged milestone
            </span>
          </div>

          <button 
            type="submit" 
            disabled={isSubmittingTarget} 
            className="btn-gold" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSubmittingTarget ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
          >
            {isSubmittingTarget ? 'Pledging...' : 'Commit Campaign Target Pledge →'}
          </button>
        </form>
      </div>

      {/* PLEDGED TARGETS LIST */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#fff' }}>
          Pledged Project Raise Targets ({promoterTargets.length})
        </h3>

        {promoterTargets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Crosshair size={38} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              No project targets committed yet. Pledge a target on the left to activate the +0.25% bonus tier.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {promoterTargets.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(7,10,20,0.6)', 
                  padding: '1.15rem', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: '3px solid #3b82f6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: '0 0 0.2rem 0' }}>
                      {t.funding_projects?.project_title || 'CapEx Funding Project'}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Committed on: {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ 
                    background: t.status === 'Target_Hit' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)', 
                    color: t.status === 'Target_Hit' ? '#10b981' : '#60a5fa', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.68rem', 
                    fontWeight: '800' 
                  }}>
                    {t.status === 'Target_Hit' ? 'Target Achieved (+0.25% Active)' : 'In Progress'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#cbd5e1' }}>Pledged Target:</span>
                  <strong style={{ color: '#D4AF37', fontSize: '1.05rem' }}>
                    {formatCurrency(t.target_raise_bdt, currency)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
