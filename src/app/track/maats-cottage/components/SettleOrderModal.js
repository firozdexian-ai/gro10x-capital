'use client';

import React, { useState } from 'react';
import { CheckSquare, X, Landmark, FileText, CheckCircle2 } from 'lucide-react';

export default function SettleOrderModal({
  order,
  onClose,
  onConfirmSettle
}) {
  const [repaymentFile, setRepaymentFile] = useState(order?.settlement_repayment_receipt_url || null);
  const [challanFile, setChallanFile] = useState(order?.delivery_challan_url || null);
  const [settleNote, setSettleNote] = useState('');
  const [settling, setSettling] = useState(false);

  if (!order) return null;

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;
  const profit = Number(order.profit_bdt || (order.return_amount_bdt - order.investment_amount_bdt) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSettling(true);
    await onConfirmSettle(order.order_code, {
      repayment_receipt_url: repaymentFile || order.settlement_repayment_receipt_url || '/receipts/msp-001-tranche-1.png',
      challan_receipt_url: challanFile || order.delivery_challan_url || '/docs/msp-001-delta-po.png',
      note: settleNote
    });
    setSettling(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.5)', borderRadius: '16px', maxWidth: '560px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.9) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={18} style={{ color: '#10b981' }} />
            <div>
              <span style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>Dual-Document Settlement &amp; Close</span>
              <span style={{ color: '#10b981', fontSize: '0.72rem', display: 'block', fontWeight: '600' }}>
                {order.order_code} — {order.corporate_client}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Financial Summary Card */}
        <div style={{ padding: '1rem 1.25rem', background: '#070a14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Disbursed Principal</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{fmtLakhs(order.investment_amount_bdt)}</strong>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ color: '#10b981', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>Full Return Due</span>
              <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{fmtLakhs(order.return_amount_bdt)}</strong>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.08)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>Fund Net Profit</span>
              <strong style={{ color: '#D4AF37', fontSize: '0.95rem' }}>
                +৳{(profit / 1000).toFixed(1)}k
              </strong>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Document 1: Repayment Transfer Slip */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Landmark size={15} style={{ color: '#10b981' }} /> Document 1: Proof of Repayment Bank Transfer *
            </label>
            <p style={{ color: '#94a3b8', fontSize: '0.73rem', margin: '0 0 0.5rem 0' }}>
              EFT/NPSB slip from Aysha Siddika returning <strong>{fmtLakhs(order.return_amount_bdt)}</strong> to Safe Plan account.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setRepaymentFile(reader.result);
                  reader.readAsDataURL(file);
                }}
                style={{ fontSize: '0.78rem', color: '#94a3b8' }}
              />
              <button 
                type="button" 
                onClick={() => setRepaymentFile('/receipts/msp-001-full-repayment-slips.png')}
                className="btn-outline" 
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Quick Attach Verified CityTouch Slip
              </button>
            </div>
            {repaymentFile && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Repayment Slip Attached &amp; Ready</span>
              </div>
            )}
          </div>

          {/* Document 2: Delivery Challan / Invoice */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <FileText size={15} style={{ color: '#38bdf8' }} /> Document 2: Corporate Delivery Challan / Invoice *
            </label>
            <p style={{ color: '#94a3b8', fontSize: '0.73rem', margin: '0 0 0.5rem 0' }}>
              Signed acknowledgment of delivery from {order.corporate_client} warehouse.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setChallanFile(reader.result);
                  reader.readAsDataURL(file);
                }}
                style={{ fontSize: '0.78rem', color: '#94a3b8' }}
              />
              <button 
                type="button" 
                onClick={() => setChallanFile(order?.delivery_challan_url || '/docs/msp-001-delta-delivery-challan.png')}
                className="btn-outline" 
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Quick Attach Delivery Challan
              </button>
            </div>
            {challanFile && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,189,248,0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                <CheckCircle2 size={14} style={{ color: '#38bdf8' }} />
                <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '600' }}>Delivery Challan Attached &amp; Ready</span>
              </div>
            )}
          </div>

          {/* Settlement Note */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
              Settlement Verification Note
            </label>
            <input 
              type="text"
              placeholder="e.g. Full repayment received via NPSB; delivery confirmed at warehouse"
              value={settleNote}
              onChange={e => setSettleNote(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '0.5rem' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-outline" 
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={settling}
              className="btn-gold" 
              style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem', fontWeight: '700', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
            >
              {settling ? 'Settling & Notifying...' : 'Confirm Settlement & Notify Telegram'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
