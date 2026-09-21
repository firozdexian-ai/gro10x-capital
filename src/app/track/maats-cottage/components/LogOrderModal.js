'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { formatLakhCrore } from '../../../../components/ui/CurrencyInput';

export default function LogOrderModal({
  onClose,
  onSubmit,
  defaultCode
}) {
  const [formData, setFormData] = useState({
    order_code: defaultCode || '',
    corporate_client: '',
    item_description: '',
    investment_amount_bdt: '',
    return_amount_bdt: '',
    duration_days: 10,
    notes: ''
  });

  const inv = Number(formData.investment_amount_bdt || 0);
  const ret = Number(formData.return_amount_bdt || 0);
  const profit = Math.max(0, ret - inv);
  const marginPct = inv > 0 ? ((profit / inv) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.corporate_client || !formData.item_description || !formData.investment_amount_bdt || !formData.return_amount_bdt) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '540px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} style={{ color: '#D4AF37' }} />
            <span style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>Log New Work Order</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Order Code</label>
              <input 
                type="text" 
                placeholder="Auto-generated if blank"
                value={formData.order_code}
                onChange={e => setFormData({ ...formData, order_code: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Turnaround Days *</label>
              <input 
                type="number" 
                required
                value={formData.duration_days}
                onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Corporate Buyer / Client *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Delta Life Insurance, Crown Cement"
              value={formData.corporate_client}
              onChange={e => setFormData({ ...formData, corporate_client: e.target.value })}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Item Description *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Jute shopping bags, Executive leather wallets"
              value={formData.item_description}
              onChange={e => setFormData({ ...formData, item_description: e.target.value })}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem' }}
            />
          </div>

          {/* Financials with Live Previews */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Required Capital (BDT) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 250000"
                  value={formData.investment_amount_bdt}
                  onChange={e => setFormData({ ...formData, investment_amount_bdt: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                />
                {inv > 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', display: 'block', marginTop: '0.2rem' }}>
                    {formatLakhCrore(inv)}
                  </span>
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Return Amount (BDT) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 287500"
                  value={formData.return_amount_bdt}
                  onChange={e => setFormData({ ...formData, return_amount_bdt: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                />
                {ret > 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'block', marginTop: '0.2rem' }}>
                    {formatLakhCrore(ret)}
                  </span>
                )}
              </div>
            </div>

            {inv > 0 && ret > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.08)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>Live Computed Cycle Margin:</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>
                  Net Profit: +৳{(profit / 1000).toFixed(1)}k ({marginPct}% ROI)
                </span>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Notes / PO Verification</label>
            <input 
              type="text" 
              placeholder="e.g. Verified client purchase order received"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', fontWeight: '700' }}>
              Submit Order
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
