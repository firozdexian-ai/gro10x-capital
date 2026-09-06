'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, ShieldCheck, ArrowLeft, Upload, FileText, 
  CheckCircle2, AlertTriangle, Landmark, Sparkles, Image as ImageIcon,
  DollarSign, Clock, Phone, ChevronRight, HelpCircle
} from 'lucide-react';
import { MAATS_COTTAGE_PROFILE, getWorkOrders, createWorkOrder } from '../../../../lib/workOrders';
import { formatCurrency } from '../../../../lib/currency';

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [orderCode, setOrderCode] = useState('');
  const [corporateClient, setCorporateClient] = useState('');
  const [poRefNumber, setPoRefNumber] = useState('');
  const [poValueBdt, setPoValueBdt] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [investmentAmountBdt, setInvestmentAmountBdt] = useState('');
  const [returnAmountBdt, setReturnAmountBdt] = useState('');
  const [durationDays, setDurationDays] = useState(10);
  const [deliveryLocation, setDeliveryLocation] = useState('Delta Warehouse, Mohakhali, Dhaka');
  const [notes, setNotes] = useState('');

  // Upload previews
  const [poDocPreview, setPoDocPreview] = useState(null);
  const [poDocName, setPoDocName] = useState('');
  const [samplePhotoPreview, setSamplePhotoPreview] = useState(null);
  const [samplePhotoName, setSamplePhotoName] = useState('');

  // Derived financial calculations
  const inv = Number(investmentAmountBdt || 0);
  const ret = Number(returnAmountBdt || 0);
  const profit = ret > inv ? ret - inv : 0;
  const marginPct = inv > 0 ? ((profit / inv) * 100).toFixed(2) : '0.00';

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'po') {
        setPoDocPreview(reader.result);
        setPoDocName(file.name);
      } else {
        setSamplePhotoPreview(reader.result);
        setSamplePhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!corporateClient || !itemDescription || !investmentAmountBdt || !returnAmountBdt) {
      alert('Please fill all required financing fields.');
      return;
    }

    setSubmitting(true);
    try {
      const existing = await getWorkOrders();
      const code = orderCode.trim() || `MSP-0${existing.length + 1}`;
      const today = new Date().toISOString().split('T')[0];
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + Number(durationDays || 10));
      const dueDate = dueDateObj.toISOString().split('T')[0];

      const newOrderObj = {
        id: `wo-${Date.now()}`,
        order_code: code,
        corporate_client: corporateClient,
        po_ref_number: poRefNumber || `PO-${Date.now().toString().slice(-6)}`,
        po_value_bdt: Number(poValueBdt || ret),
        item_description: itemDescription,
        investment_amount_bdt: inv,
        return_amount_bdt: ret,
        profit_bdt: profit,
        duration_days: Number(durationDays || 10),
        start_date: today,
        due_date: dueDate,
        status: 'Pending_Approval',
        payment_mode: 'EFT/NPSB',
        bank_account_info: `${MAATS_COTTAGE_PROFILE.accountName} (A/C: ${MAATS_COTTAGE_PROFILE.accountNumber})`,
        po_document_url: poDocPreview || '/docs/sample-po.png',
        reference_photos: samplePhotoPreview ? [samplePhotoPreview] : [],
        notes: notes ? `${notes} (Delivery: ${deliveryLocation})` : `Delivery: ${deliveryLocation}`,
        due_note: 'Awaiting Partner Disbursal',
        created_at: new Date().toISOString()
      };

      await createWorkOrder(newOrderObj);
      setSuccess(true);
      setTimeout(() => {
        router.push('/track/maats-cottage');
      }, 2000);
    } catch (err) {
      alert(`Error submitting work order: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* ── TOP NAVIGATION STRIP ── */}
      <div style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(212,175,55,0.25)', padding: '0.75rem 1.25rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link 
            href="/track/maats-cottage" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#D4AF37', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
          >
            <ArrowLeft size={16} /> Back to Live Tracker
          </Link>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Facility: <strong>Safe Home ৳20 Cr Fund</strong>
          </span>
        </div>
      </div>

      {/* ── HEADER HERO ── */}
      <header style={{ background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.1) 0%, rgba(7,10,20,0.98) 75%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.25rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.75rem' }}>
            <ShieldCheck size={13} /> Official Work-Order Financing Submission
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#fff' }}>
            Submit New Corporate Work Order
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
            Upload verified buyer Purchase Orders, specify revolving capital requirements, and submit for direct sign-off by <strong>Faiz Ahmed</strong> &amp; <strong>Firoz</strong>.
          </p>
        </div>
      </header>

      {/* ── MAIN FORM CONTAINER ── */}
      <main style={{ maxWidth: '800px', margin: '2rem auto 0 auto', padding: '0 1.25rem' }}>
        
        {success ? (
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', borderColor: 'rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981', display: 'grid', placeItems: 'center', color: '#10b981', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0' }}>
              Work Order Logged Successfully!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Automated Telegram alert dispatched to Managing Partner <strong>Faiz Ahmed</strong> and <strong>Firoz</strong> for disbursement review.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
              <span>Redirecting to live tracker...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            {/* 1. CORPORATE CLIENT & PO IDENTIFICATION */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <Building2 size={18} style={{ color: '#D4AF37' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  1. Corporate Buyer &amp; Purchase Order Details
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Corporate Buyer / Institutional Client *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Delta Limited, National Life, Unique Group" 
                    value={corporateClient} 
                    onChange={e => setCorporateClient(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Client PO Reference Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DL/Laptop Bag/2026/1014" 
                    value={poRefNumber} 
                    onChange={e => setPoRefNumber(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Total PO Contract Value (BDT) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 442000" 
                    value={poValueBdt} 
                    onChange={e => setPoValueBdt(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Order Tracking Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated (e.g. MSP-010)" 
                    value={orderCode} 
                    onChange={e => setOrderCode(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Item Description &amp; Specifications *</label>
                <textarea 
                  rows={2} 
                  required 
                  placeholder="e.g. 680 pcs Jute Laptop Bags (As per approved client sample) with custom embroidery" 
                  value={itemDescription} 
                  onChange={e => setItemDescription(e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: '0.88rem', padding: '0.65rem', resize: 'vertical' }} 
                />
              </div>
            </div>

            {/* 2. FINANCING CAPITAL & CYCLE */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <DollarSign size={18} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  2. Financing Requirements &amp; Commercial Terms
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Requested Financing Capital (BDT) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 375000" 
                    value={investmentAmountBdt} 
                    onChange={e => setInvestmentAmountBdt(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Offered Repayment Return (BDT) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 430000" 
                    value={returnAmountBdt} 
                    onChange={e => setReturnAmountBdt(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Turnaround Cycle (Days) *</label>
                  <input 
                    type="number" 
                    required 
                    value={durationDays} 
                    onChange={e => setDurationDays(e.target.value)} 
                    className="form-input" 
                    style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                  />
                </div>
              </div>

              {/* Dynamic Margin Indicator */}
              {inv > 0 && ret > 0 && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Gross Spread to Fund:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>+৳{(profit / 1000).toFixed(1)}k</strong>
                    <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                      {marginPct}% Yield
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Delivery Warehouse &amp; Terms</label>
                <input 
                  type="text" 
                  placeholder="e.g. Delta Warehouse, Road-34, New DOHS, Mohakhali" 
                  value={deliveryLocation} 
                  onChange={e => setDeliveryLocation(e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: '0.88rem', padding: '0.65rem' }} 
                />
              </div>
            </div>

            {/* 3. DOCUMENT UPLOADS */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <Upload size={18} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  3. Verification Document Uploads
                </h3>
              </div>

              {/* Upload 1: PO Document */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                  Signed Client Purchase Order (PO / Work Order Scan) *
                </label>
                <div style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    id="po-upload" 
                    style={{ display: 'none' }} 
                    onChange={e => handleFileUpload(e, 'po')} 
                  />
                  <label htmlFor="po-upload" style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={28} style={{ color: '#D4AF37' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                      {poDocName ? `Selected: ${poDocName}` : 'Click to Upload Signed Purchase Order (PNG, JPG, PDF)'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Must show buyer signature, quantity, and delivery timeline</span>
                  </label>

                  {poDocPreview && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={poDocPreview} 
                        alt="PO Preview" 
                        style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload 2: Reference Product Sample Photo */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                  Product Sample / Reference Photo (Optional)
                </label>
                <div style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="sample-upload" 
                    style={{ display: 'none' }} 
                    onChange={e => handleFileUpload(e, 'sample')} 
                  />
                  <label htmlFor="sample-upload" style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <ImageIcon size={24} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1' }}>
                      {samplePhotoName ? `Selected: ${samplePhotoName}` : 'Upload Reference Product Sample or Fabric Spec'}
                    </span>
                  </label>

                  {samplePhotoPreview && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={samplePhotoPreview} 
                        alt="Sample Preview" 
                        style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} 
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 4. SETTLEMENT BANK & SUBMISSION */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(15,23,42,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: '#D4AF37', flexShrink: 0 }}>
                  <Landmark size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Designated Settlement Account</span>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.88rem' }}>{MAATS_COTTAGE_PROFILE.accountName}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>A/C: <code style={{ color: '#D4AF37' }}>{MAATS_COTTAGE_PROFILE.accountNumber}</code> ({MAATS_COTTAGE_PROFILE.paymentMode})</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Link 
                href="/track/maats-cottage" 
                className="btn-outline" 
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none' }}
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-gold" 
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitting ? 'Submitting & Dispatching Alert...' : 'Submit Work Order for Approval'}
              </button>
            </div>

          </form>
        )}

      </main>

    </div>
  );
}
