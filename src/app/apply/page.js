'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { 
  Building2, Users, TrendingUp, FileText, CheckCircle2, ChevronRight, 
  ChevronLeft, Upload, Download, Copy, Check, ShieldCheck, AlertCircle, Loader2, Plus, Trash2, Globe
} from 'lucide-react';

export default function CohortApplicationPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null); // { ref_code, application_id }
  const [copiedRef, setCopiedRef] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Brand & Legal
    brand_name: '',
    company_legal_name: '',
    company_type: 'Pvt Ltd',
    company_registration_number: '',
    tin_number: '',
    bin_number: '',
    year_established: '2022',
    industry_sector: 'F&B Franchise',
    outlet_count: 1,
    expansion_outlet_count: 2,
    headquarters_address: '',
    website_url: '',
    facebook_url: '',

    // Step 2: Founding Team
    lead_founder_name: '',
    lead_founder_title: 'Founder & CEO',
    lead_founder_phone: '',
    lead_founder_email: '',
    lead_founder_linkedin_url: '',
    lead_founder_nid_number: '',
    stakeholders: [
      // { full_name, role_title, phone, email, equity_ownership_pct, linkedin_url }
    ],

    // Step 3: Financial Performance & Use of Funds
    monthly_gross_revenue_bdt: '',
    monthly_net_profit_bdt: '',
    existing_debt_bdt: 0,
    asset_valuation_bdt: 0,
    pos_system_name: 'Petpooja',
    requested_funding_bdt: 20000000,
    preferred_funding_type: 'Franchise',
    use_of_funds_fitout: 40,
    use_of_funds_machinery: 35,
    use_of_funds_inventory: 15,
    use_of_funds_working_capital: 10,
    has_existing_franchise_agreement: false,
    franchise_brand_name: '',

    // Step 4: Pitch & Documents
    pitch_text: '',
    pitch_deck_url: '',
    trade_license_url: '',
    financial_audit_url: '',
    tin_certificate_url: '',
    outlet_photos: [] // array of urls
  });

  const [uploadingDoc, setUploadingDoc] = useState('');

  // Load auto-saved draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('gro10x_cohort_apply_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setForm(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Failed to parse apply draft');
        }
      }
    }
  }, []);

  // Save to localStorage on change
  const updateFormField = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('gro10x_cohort_apply_draft', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Add Stakeholder Row
  const handleAddStakeholder = () => {
    const newStakeholder = {
      full_name: '',
      role_title: 'Co-Founder',
      phone: '',
      email: '',
      equity_ownership_pct: 0,
      linkedin_url: ''
    };
    updateFormField('stakeholders', [...form.stakeholders, newStakeholder]);
  };

  // Update Stakeholder Row
  const handleUpdateStakeholder = (index, key, val) => {
    const updated = [...form.stakeholders];
    updated[index][key] = val;
    updateFormField('stakeholders', updated);
  };

  // Remove Stakeholder Row
  const handleRemoveStakeholder = (index) => {
    const updated = form.stakeholders.filter((_, i) => i !== index);
    updateFormField('stakeholders', updated);
  };

  // File Upload Handler
  const handleFileUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(fieldKey);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'cohort-docs');
      formData.append('folder', `applications/${form.brand_name ? form.brand_name.toLowerCase().replace(/\s+/g, '-') : 'drafts'}`);

      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (fieldKey === 'outlet_photos') {
        updateFormField('outlet_photos', [...form.outlet_photos, data.url]);
      } else {
        updateFormField(fieldKey, data.url);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc('');
    }
  };

  // Final Form Submit
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        social_links: {
          facebook: form.facebook_url
        },
        use_of_funds_breakdown: {
          civil_fitout: form.use_of_funds_fitout,
          machinery: form.use_of_funds_machinery,
          inventory: form.use_of_funds_inventory,
          working_capital: form.use_of_funds_working_capital
        }
      };

      const res = await fetch('/api/apply-cohort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Application submission failed');

      setSubmittedApp(data);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gro10x_cohort_apply_draft');
      }
    } catch (err) {
      alert(err.message || 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Download Application Summary Confirmation File
  const handleDownloadConfirmation = () => {
    if (!submittedApp) return;
    const summaryText = `====================================================
GRO10X CAPITAL — INVESTMENT COHORT APPLICATION SUMMARY
====================================================
Application Reference Code: ${submittedApp.ref_code}
Date Submitted: ${new Date().toLocaleString()}
Status: Pending Initial Triage & KAM Assignment

BRAND & LEGAL DETAILS
----------------------------------------------------
Brand Name: ${form.brand_name}
Company Legal Name: ${form.company_legal_name || 'N/A'}
Company Type: ${form.company_type}
Industry Sector: ${form.industry_sector}
Current Operating Outlets: ${form.outlet_count}

FOUNDING TEAM LEAD
----------------------------------------------------
Lead Founder Name: ${form.lead_founder_name} (${form.lead_founder_title})
Phone: ${form.lead_founder_phone}
Email: ${form.lead_founder_email}
Total Team Members Registered: ${form.stakeholders.length + 1}

CAPITAL ASK & FINANCIALS
----------------------------------------------------
Requested Capital Raise: BDT ${Number(form.requested_funding_bdt).toLocaleString()}
Preferred Funding Type: ${form.preferred_funding_type} Expansion
Monthly Gross Revenue: BDT ${Number(form.monthly_gross_revenue_bdt || 0).toLocaleString()}
Monthly Net Profit: BDT ${Number(form.monthly_net_profit_bdt || 0).toLocaleString()}
POS Software: ${form.pos_system_name}

====================================================
Keep this summary and reference code saved.
Our Key Account Management (KAM) team will reach out
within 48 hours for your physical audit scheduling.
====================================================`;

    const element = document.createElement('a');
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${submittedApp.ref_code}_Application_Summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyRefCode = () => {
    if (submittedApp?.ref_code) {
      navigator.clipboard.writeText(submittedApp.ref_code);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  // Calculated Net Profit Margin %
  const grossNum = Number(form.monthly_gross_revenue_bdt || 0);
  const netNum = Number(form.monthly_net_profit_bdt || 0);
  const calculatedMarginPct = grossNum > 0 ? ((netNum / grossNum) * 100).toFixed(1) : 0;

  // Calculated Stakeholder Equity Total
  const leadEquityEst = 100 - form.stakeholders.reduce((sum, s) => sum + Number(s.equity_ownership_pct || 0), 0);

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navigation />

      {/* HERO SECTION */}
      <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(7,10,20,1) 100%)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge-gold" style={{ marginBottom: '1rem' }}>
            <Building2 size={14} /> GRO10X SME & Franchise Capital Cohort 2026
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0 1rem 0', background: 'linear-gradient(135deg, #fff 0%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Apply for Asset-Backed Growth Capital
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
            Structured financing for high-growth SME brands and franchise outlets in Bangladesh. Raise up to ৳5 Cr with zero personal guarantee.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '900px', margin: '3rem auto 0 auto', padding: '0 1.5rem' }}>

        {/* IF ALREADY SUBMITTED — SUCCESS SCREEN */}
        {submittedApp ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderColor: '#D4AF37', boxShadow: '0 10px 40px rgba(212,175,55,0.15)' }}>
            <CheckCircle2 size={64} style={{ color: '#10b981', margin: '0 auto 1.5rem auto' }} />
            <span style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Successfully Received</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0.5rem 0 1rem 0' }}>{form.brand_name} Cohort Submission</h2>
            
            <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', borderRadius: '14px', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Your Application Reference Code</span>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#D4AF37', margin: '0.3rem 0 0.75rem 0', letterSpacing: '0.05em' }}>
                {submittedApp.ref_code}
              </h3>
              <button 
                onClick={handleCopyRefCode}
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copiedRef ? <Check size={16} /> : <Copy size={16} />}
                {copiedRef ? 'Copied to Clipboard!' : 'Copy Reference Code'}
              </button>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Please save your reference code. Your application has been logged into the GRO10X Master Command Center. An assigned Key Account Manager (KAM) will contact lead founder <strong>{form.lead_founder_name}</strong> at <strong>{form.lead_founder_phone}</strong> to schedule an on-site audit visit.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleDownloadConfirmation}
                className="btn-gold" 
                style={{ padding: '0.9rem 2rem' }}
              >
                <Download size={18} /> Download Application Summary Card (.txt)
              </button>
              <a 
                href="/showcase" 
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.9rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Explore Live Deals <ChevronRight size={18} />
              </a>
            </div>
          </div>
        ) : (

          /* STEP WIZARD FORM */
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            
            {/* STEP TRACKER HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.25rem' }}>
              {[
                { num: 1, label: 'Brand & Legal' },
                { num: 2, label: 'Founding Team' },
                { num: 3, label: 'Financials' },
                { num: 4, label: 'Pitch & Docs' },
                { num: 5, label: 'Review & Submit' }
              ].map(s => (
                <div 
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: s.num < step ? 'pointer' : 'default', opacity: step === s.num ? 1 : s.num < step ? 0.8 : 0.4 }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === s.num ? '#D4AF37' : s.num < step ? '#10b981' : 'rgba(255,255,255,0.1)', color: step === s.num ? '#000' : '#fff', fontWeight: 'bold', fontSize: '0.85rem', display: 'grid', placeItems: 'center' }}>
                    {s.num < step ? '✓' : s.num}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: step === s.num ? 'bold' : 'normal', color: step === s.num ? '#D4AF37' : '#fff', display: 'none', minWidth: '0' }} className="step-label-responsive">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitApplication}>
              
              {/* STEP 1: BRAND IDENTITY & LEGAL */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Step 1: Brand & Legal Structure</h3>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Brand Name *</label>
                    <input 
                      type="text" 
                      value={form.brand_name}
                      onChange={(e) => updateFormField('brand_name', e.target.value)}
                      placeholder="e.g. ORO Roasters"
                      className="form-input" 
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Company Legal Name</label>
                      <input 
                        type="text" 
                        value={form.company_legal_name}
                        onChange={(e) => updateFormField('company_legal_name', e.target.value)}
                        placeholder="e.g. ORO Bangladesh Pvt Ltd"
                        className="form-input" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Legal Entity Type</label>
                      <select 
                        value={form.company_type}
                        onChange={(e) => updateFormField('company_type', e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.22)', color: '#fff', borderRadius: '10px' }}
                      >
                        <option value="Pvt Ltd">Private Limited Company (Pvt Ltd)</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Public Ltd">Public Limited Company</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Trade License / Reg No</label>
                      <input 
                        type="text" 
                        value={form.company_registration_number}
                        onChange={(e) => updateFormField('company_registration_number', e.target.value)}
                        placeholder="TR/DCC/2024/9812"
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>TIN Number</label>
                      <input 
                        type="text" 
                        value={form.tin_number}
                        onChange={(e) => updateFormField('tin_number', e.target.value)}
                        placeholder="e.g. 84920194812"
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>BIN Number (VAT)</label>
                      <input 
                        type="text" 
                        value={form.bin_number}
                        onChange={(e) => updateFormField('bin_number', e.target.value)}
                        placeholder="e.g. 000294812-0101"
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Industry Sector *</label>
                      <select 
                        value={form.industry_sector}
                        onChange={(e) => updateFormField('industry_sector', e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.22)', color: '#fff', borderRadius: '10px' }}
                      >
                        <option value="F&B Franchise">F&B Franchise & Coffee Hub</option>
                        <option value="Retail Distribution">Retail & FMCG Distribution</option>
                        <option value="Services">Services & Lifestyle Outlets</option>
                        <option value="Tech & Logistics">Tech, Micro-Fulfillment & Logistics</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Current Outlets</label>
                      <input 
                        type="number" 
                        value={form.outlet_count}
                        onChange={(e) => updateFormField('outlet_count', e.target.value)}
                        className="form-input" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>New Expansion Target</label>
                      <input 
                        type="number" 
                        value={form.expansion_outlet_count}
                        onChange={(e) => updateFormField('expansion_outlet_count', e.target.value)}
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Headquarters Address</label>
                    <textarea 
                      rows={2}
                      value={form.headquarters_address}
                      onChange={(e) => updateFormField('headquarters_address', e.target.value)}
                      placeholder="e.g. Level 4, Plot 12, Road 11, Banani, Dhaka 1213"
                      className="form-input" 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Website URL</label>
                      <input 
                        type="text" 
                        value={form.website_url}
                        onChange={(e) => updateFormField('website_url', e.target.value)}
                        placeholder="https://ororoasters.com"
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Facebook Page URL</label>
                      <input 
                        type="text" 
                        value={form.facebook_url}
                        onChange={(e) => updateFormField('facebook_url', e.target.value)}
                        placeholder="https://facebook.com/ororoasters"
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!form.brand_name) return alert('Please enter your Brand Name.');
                        setStep(2);
                      }}
                      className="btn-gold"
                    >
                      Next: Founding Team <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: FOUNDING TEAM & STAKEHOLDERS */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Step 2: Founding Team & Key Stakeholders</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    Register all key individuals from the business side (Co-founders, Finance Leads, Operations Contacts).
                  </p>

                  {/* PRIMARY LEAD FOUNDER CARD */}
                  <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' }}>Primary Applicant / Lead Founder Contact</span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Lead Founder Name *</label>
                        <input 
                          type="text" 
                          value={form.lead_founder_name}
                          onChange={(e) => updateFormField('lead_founder_name', e.target.value)}
                          placeholder="e.g. Tanvir Ahmed"
                          className="form-input" 
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Title / Role</label>
                        <input 
                          type="text" 
                          value={form.lead_founder_title}
                          onChange={(e) => updateFormField('lead_founder_title', e.target.value)}
                          placeholder="e.g. Founder & Managing Director"
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number *</label>
                        <input 
                          type="text" 
                          value={form.lead_founder_phone}
                          onChange={(e) => updateFormField('lead_founder_phone', e.target.value)}
                          placeholder="+880 1711 000000"
                          className="form-input" 
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address *</label>
                        <input 
                          type="email" 
                          value={form.lead_founder_email}
                          onChange={(e) => updateFormField('lead_founder_email', e.target.value)}
                          placeholder="tanvir@ororoasters.com"
                          className="form-input" 
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>LinkedIn Profile URL</label>
                        <input 
                          type="text" 
                          value={form.lead_founder_linkedin_url}
                          onChange={(e) => updateFormField('lead_founder_linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/in/tanvir"
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>NID Number (Confidential Pre-KYC)</label>
                        <input 
                          type="text" 
                          value={form.lead_founder_nid_number}
                          onChange={(e) => updateFormField('lead_founder_nid_number', e.target.value)}
                          placeholder="e.g. 198294810294"
                          className="form-input" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADDITIONAL STAKEHOLDERS MULTI-ROW TABLE */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Additional Co-Founders & C-Suite Execs</h4>
                      <button 
                        type="button" 
                        onClick={handleAddStakeholder}
                        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Plus size={14} /> Add Co-Founder / Team Member
                      </button>
                    </div>

                    {form.stakeholders.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        No additional team members added. Click "+ Add Co-Founder" if your business has multiple equity partners.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {form.stakeholders.map((s, idx) => (
                          <div key={idx} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr auto', gap: '0.75rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              placeholder="Full Name" 
                              value={s.full_name} 
                              onChange={(e) => handleUpdateStakeholder(idx, 'full_name', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.5rem' }}
                            />
                            <input 
                              type="text" 
                              placeholder="Role (e.g. CFO)" 
                              value={s.role_title} 
                              onChange={(e) => handleUpdateStakeholder(idx, 'role_title', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.5rem' }}
                            />
                            <input 
                              type="text" 
                              placeholder="Phone / Email" 
                              value={s.phone} 
                              onChange={(e) => handleUpdateStakeholder(idx, 'phone', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.5rem' }}
                            />
                            <input 
                              type="number" 
                              placeholder="Equity %" 
                              value={s.equity_ownership_pct} 
                              onChange={(e) => handleUpdateStakeholder(idx, 'equity_ownership_pct', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.5rem' }}
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveStakeholder(idx)}
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!form.lead_founder_name || !form.lead_founder_phone || !form.lead_founder_email) {
                          return alert('Please complete the Lead Founder contact details.');
                        }
                        setStep(3);
                      }}
                      className="btn-gold"
                    >
                      Next: Financials <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCIAL PERFORMANCE & USE OF FUNDS */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Step 3: Financial Performance & Capital Ask</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Monthly Gross Revenue (BDT) *</label>
                      <input 
                        type="number" 
                        value={form.monthly_gross_revenue_bdt}
                        onChange={(e) => updateFormField('monthly_gross_revenue_bdt', e.target.value)}
                        placeholder="e.g. 1850000"
                        className="form-input" 
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Monthly Net Profit (BDT) *</label>
                      <input 
                        type="number" 
                        value={form.monthly_net_profit_bdt}
                        onChange={(e) => updateFormField('monthly_net_profit_bdt', e.target.value)}
                        placeholder="e.g. 420000"
                        className="form-input" 
                        required
                      />
                    </div>
                  </div>

                  {grossNum > 0 && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Auto-Calculated Operating Net Margin:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{calculatedMarginPct}% Net Margin</strong>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Outstanding Debt (BDT)</label>
                      <input 
                        type="number" 
                        value={form.existing_debt_bdt}
                        onChange={(e) => updateFormField('existing_debt_bdt', e.target.value)}
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Asset Valuation (BDT)</label>
                      <input 
                        type="number" 
                        value={form.asset_valuation_bdt}
                        onChange={(e) => updateFormField('asset_valuation_bdt', e.target.value)}
                        className="form-input" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>POS Software System</label>
                      <select 
                        value={form.pos_system_name}
                        onChange={(e) => updateFormField('pos_system_name', e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.22)', color: '#fff', borderRadius: '10px' }}
                      >
                        <option value="Petpooja">Petpooja POS</option>
                        <option value="Odoo">Odoo ERP / POS</option>
                        <option value="Toast">Toast POS</option>
                        <option value="Square">Square POS</option>
                        <option value="Custom POS">Custom POS Software</option>
                        <option value="Manual Ledger">Manual Paper / Excel Ledger</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Requested Funding Ask (BDT) *</label>
                      <input 
                        type="number" 
                        value={form.requested_funding_bdt}
                        onChange={(e) => updateFormField('requested_funding_bdt', e.target.value)}
                        className="form-input" 
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Preferred Funding Model</label>
                      <select 
                        value={form.preferred_funding_type}
                        onChange={(e) => updateFormField('preferred_funding_type', e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', background: '#0f172a', border: '1px solid rgba(212,175,55,0.22)', color: '#fff', borderRadius: '10px' }}
                      >
                        <option value="Franchise">Franchise Outlet Expansion</option>
                        <option value="Distribution">Distribution Hub Expansion</option>
                        <option value="Equity">Equity SPV Placement</option>
                        <option value="Short-Term Debt">Short-Term Debt Facility</option>
                      </select>
                    </div>
                  </div>

                  {/* USE OF FUNDS BREAKDOWN SLIDERS */}
                  <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#D4AF37', marginBottom: '1rem' }}>Use of Funds Allocation (% Split)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Civil Fit-out & Interior ({form.use_of_funds_fitout}%)</label>
                        <input type="range" min="0" max="100" value={form.use_of_funds_fitout} onChange={(e) => updateFormField('use_of_funds_fitout', Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Machinery & Kitchen Tech ({form.use_of_funds_machinery}%)</label>
                        <input type="range" min="0" max="100" value={form.use_of_funds_machinery} onChange={(e) => updateFormField('use_of_funds_machinery', Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Initial Inventory ({form.use_of_funds_inventory}%)</label>
                        <input type="range" min="0" max="100" value={form.use_of_funds_inventory} onChange={(e) => updateFormField('use_of_funds_inventory', Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Working Capital Reserve ({form.use_of_funds_working_capital}%)</label>
                        <input type="range" min="0" max="100" value={form.use_of_funds_working_capital} onChange={(e) => updateFormField('use_of_funds_working_capital', Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!form.monthly_gross_revenue_bdt || !form.monthly_net_profit_bdt) {
                          return alert('Please fill in your monthly gross revenue and net profit.');
                        }
                        setStep(4);
                      }}
                      className="btn-gold"
                    >
                      Next: Pitch & Documents <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PITCH & DOCUMENTS */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Step 4: Pitch & Document Vault</h3>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Short Pitch / Value Proposition</label>
                    <textarea 
                      rows={3}
                      value={form.pitch_text}
                      onChange={(e) => updateFormField('pitch_text', e.target.value)}
                      placeholder="Why is your brand unique? Tell us about your unit economics, expansion plans, and market traction..."
                      className="form-input" 
                    />
                  </div>

                  {/* DOCUMENT UPLOAD TILES */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Pitch Deck (PDF)</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.2rem 0 0.75rem 0' }}>Presentation slides or business plan</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          {uploadingDoc === 'pitch_deck_url' ? 'Uploading...' : form.pitch_deck_url ? '✓ Replace PDF' : '+ Upload PDF'}
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pitch_deck_url')} style={{ display: 'none' }} />
                        </label>
                        {form.pitch_deck_url && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Uploaded ✓</span>}
                      </div>
                    </div>

                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Trade License / Reg Scan</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.2rem 0 0.75rem 0' }}>City Corporation license scan</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          {uploadingDoc === 'trade_license_url' ? 'Uploading...' : form.trade_license_url ? '✓ Replace Scan' : '+ Upload File'}
                          <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, 'trade_license_url')} style={{ display: 'none' }} />
                        </label>
                        {form.trade_license_url && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Uploaded ✓</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Financial Audit / P&L (1 Yr)</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.2rem 0 0.75rem 0' }}>Audited P&L statement or bank report</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          {uploadingDoc === 'financial_audit_url' ? 'Uploading...' : form.financial_audit_url ? '✓ Replace PDF' : '+ Upload PDF'}
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'financial_audit_url')} style={{ display: 'none' }} />
                        </label>
                        {form.financial_audit_url && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Uploaded ✓</span>}
                      </div>
                    </div>

                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Outlet Photos</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.2rem 0 0.75rem 0' }}>Interior, machinery & store front</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          {uploadingDoc === 'outlet_photos' ? 'Uploading...' : '+ Add Outlet Photos'}
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'outlet_photos')} style={{ display: 'none' }} />
                        </label>
                        <span style={{ color: '#10b981', fontSize: '0.75rem' }}>{form.outlet_photos.length} photos</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setStep(3)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button type="button" onClick={() => setStep(5)} className="btn-gold">
                      Review & Submit <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & FINAL SUBMIT */}
              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D4AF37', margin: 0 }}>Step 5: Review Application Summary</h3>

                  <div style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Brand & Legal Identity</span>
                      <h4 style={{ fontSize: '1.1rem', color: '#D4AF37', margin: '0.1rem 0' }}>{form.brand_name} ({form.company_type})</h4>
                      <p style={{ margin: 0, color: '#64748b' }}>Trade Lic: {form.company_registration_number || 'N/A'} | Sector: {form.industry_sector}</p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Lead Founder Contact</span>
                      <p style={{ margin: '0.1rem 0', fontWeight: 'bold' }}>{form.lead_founder_name} ({form.lead_founder_title})</p>
                      <p style={{ margin: 0, color: '#64748b' }}>Phone: {form.lead_founder_phone} | Email: {form.lead_founder_email}</p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Financial Ask</span>
                      <p style={{ margin: '0.1rem 0', color: '#10b981', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        Ask: BDT {Number(form.requested_funding_bdt).toLocaleString()} ({form.preferred_funding_type})
                      </p>
                      <p style={{ margin: 0, color: '#64748b' }}>
                        Monthly Gross: BDT {Number(form.monthly_gross_revenue_bdt).toLocaleString()} | Net Profit: BDT {Number(form.monthly_net_profit_bdt).toLocaleString()} ({calculatedMarginPct}% Margin)
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" id="terms_agree" required defaultChecked />
                    <label htmlFor="terms_agree" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      I certify that all provided financial and operational information is accurate for GRO10X KAM audit verification.
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setStep(4)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="btn-gold" 
                      style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem', boxShadow: '0 4px 25px rgba(212,175,55,0.4)' }}
                    >
                      {submitting ? 'Submitting Application...' : '🚀 Submit Cohort Application'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}

      </main>
    </div>
  );
}
