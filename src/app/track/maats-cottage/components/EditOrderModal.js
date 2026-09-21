'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, X, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatLakhCrore } from '../../../../components/ui/CurrencyInput';

export default function EditOrderModal({
  order,
  onClose,
  onSave
}) {
  const [formData, setFormData] = useState({ ...order });

  useEffect(() => {
    setFormData({ ...order });
  }, [order]);

  if (!order) return null;

  const inv = Number(formData.investment_amount_bdt || 0);
  const ret = Number(formData.return_amount_bdt || 0);
  const profit = Math.max(0, ret - inv);
  const marginPct = inv > 0 ? ((profit / inv) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      investment_amount_bdt: inv,
      return_amount_bdt: ret,
      profit_bdt: profit,
      po_value_bdt: Number(formData.po_value_bdt || 0),
      duration_days: Number(formData.duration_days || 7)
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0b1120' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit2 size={16} style={{ color: '#D4AF37' }} />
            <span style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
              Edit Work Order — {formData.order_code}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Row 1: Code & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Order Code</label>
              <input 
                type="text" 
                value={formData.order_code || ''}
                disabled
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem', opacity: 0.7 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Status *</label>
              <select 
                value={formData.status || 'Pending_Approval'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem', background: '#1e293b', color: '#fff' }}
              >
                <option value="Pending_Approval">Pending Approval</option>
                <option value="Disbursed_Active">Disbursed &amp; Active</option>
                <option value="Settled_Repaid">Settled &amp; Repaid</option>
              </select>
            </div>
          </div>

          {/* Row 2: Client & PO Ref */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Corporate Client *</label>
              <input 
                type="text" 
                required
                value={formData.corporate_client || ''}
                onChange={e => setFormData({ ...formData, corporate_client: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>PO Reference #</label>
              <input 
                type="text" 
                placeholder="e.g. DL/PO/2026/1058"
                value={formData.po_ref_number || ''}
                onChange={e => setFormData({ ...formData, po_ref_number: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
          </div>

          {/* Row 3: Items */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Item Description *</label>
            <input 
              type="text" 
              required
              value={formData.item_description || ''}
              onChange={e => setFormData({ ...formData, item_description: e.target.value })}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem' }}
            />
          </div>

          {/* Row 4: Financials with Lakh Preview */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>PO Value (৳)</label>
                <input 
                  type="number" 
                  value={formData.po_value_bdt || ''}
                  onChange={e => setFormData({ ...formData, po_value_bdt: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                />
                {formData.po_value_bdt > 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#D4AF37', display: 'block', marginTop: '0.2rem' }}>
                    {formatLakhCrore(formData.po_value_bdt)}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Investment (৳) *</label>
                <input 
                  type="number" 
                  value={formData.investment_amount_bdt || ''}
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
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Return Amount (৳) *</label>
                <input 
                  type="number" 
                  value={formData.return_amount_bdt || ''}
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

            {/* Live Profit Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.08)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.75rem' }}>
              <span style={{ color: '#94a3b8' }}>Live Computed Cycle Margin:</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>
                Net Profit: +৳{(profit / 1000).toFixed(1)}k ({marginPct}% ROI)
              </span>
            </div>
          </div>

          {/* Row 5: Dates & Tenor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Tenor (Days)</label>
              <input 
                type="number" 
                value={formData.duration_days || 7}
                onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Start Date</label>
              <input 
                type="date" 
                value={formData.start_date || ''}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Due Date</label>
              <input 
                type="date" 
                value={formData.due_date || formData.return_date || ''}
                onChange={e => setFormData({ ...formData, due_date: e.target.value, return_date: e.target.value })}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              />
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Notes &amp; Internal Audit Trail</label>
            <textarea 
              rows={3}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem', resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-outline" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-gold" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', fontWeight: '700' }}
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
