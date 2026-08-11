'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/currency';

/**
 * LegalComplianceTab Component (Tab 8)
 * Handles Contract Issuance Engine, SPV Registry, KYC/AML Compliance Queue,
 * and Document Audit Log.
 */
export default function LegalComplianceTab({ currency = 'BDT', addToast }) {
  const [legalSubTab, setLegalSubTab] = useState('contracts'); // 'contracts' | 'spv' | 'kyc' | 'audit'
  const [legalDocs, setLegalDocs] = useState([]);
  const [spvRegistry, setSpvRegistry] = useState([]);
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [allInvestors, setAllInvestors] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms & Controls
  const [docFilter, setDocFilter] = useState('All');
  const [docSearch, setDocSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [kycStatusFilter, setKycStatusFilter] = useState('All');

  const [showIssueDocForm, setShowIssueDocForm] = useState(false);
  const [showSpvForm, setShowSpvForm] = useState(false);
  const [issuingDoc, setIssuingDoc] = useState(false);
  const [savingSpv, setSavingSpv] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [issueDocForm, setIssueDocForm] = useState({
    investor_id: '', investment_id: '', spv_id: '',
    doc_type: 'Share_Certificate', document_title: '',
    doc_url: '', expiry_date: '', notes: ''
  });

  const [spvForm, setSpvForm] = useState({
    project_id: '', spv_legal_name: '', spv_entity_type: 'Pvt Ltd',
    registration_number: '', registration_date: '', tin_number: '',
    bin_number: '', registered_address: '', authorized_capital_bdt: '',
    paid_up_capital_bdt: '', directors_raw: '', moa_url: '', aoa_url: '',
    trade_license_url: '', status: 'Active', notes: ''
  });

  useEffect(() => {
    fetchAllLegalData();
  }, []);

  const fetchAllLegalData = async () => {
    try {
      setLoading(true);

      // Fetch Legal Documents
      const { data: docsData } = await supabase
        .from('legal_documents')
        .select(`*, investors(alias_name, full_name, user_id), investments(amount_invested_bdt, funding_projects(project_title, businesses(brand_name)))`)
        .order('created_at', { ascending: false });
      setLegalDocs(docsData || []);

      // Fetch SPV Registry
      const { data: spvData } = await supabase
        .from('spv_registry')
        .select(`*, funding_projects(project_title, businesses(brand_name))`)
        .order('created_at', { ascending: false });
      setSpvRegistry(spvData || []);

      // Fetch Compliance Records
      const { data: compData } = await supabase
        .from('investor_compliance')
        .select(`*, investors(alias_name, full_name, phone, kyc_level, onboarding_status)`)
        .order('created_at', { ascending: false });
      setComplianceRecords(compData || []);

      // Helpers
      const { data: invsData } = await supabase.from('investors').select('*');
      setAllInvestors(invsData || []);

      const { data: invmentsData } = await supabase
        .from('investments')
        .select(`*, investors(alias_name, full_name), funding_projects(project_title, businesses(brand_name))`);
      setAllInvestments(invmentsData || []);

      const { data: prjData } = await supabase
        .from('funding_projects')
        .select(`*, businesses(brand_name)`);
      setAllProjects(prjData || []);

    } catch (err) {
      console.error('Error fetching legal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload PDF Handler
  const handleUploadDocumentPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `legal_doc_${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setIssueDocForm({ ...issueDocForm, doc_url: publicUrlData.publicUrl });
      addToast && addToast('Document PDF uploaded to storage bucket!', 'success');
    } catch (err) {
      console.error('Upload PDF Error:', err);
      addToast && addToast('Failed to upload PDF file', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Issue Document Handler
  const handleIssueDocument = async (e) => {
    e.preventDefault();
    if (!issueDocForm.investor_id || !issueDocForm.doc_url) {
      addToast && addToast('Investor and Document PDF URL are required.', 'error');
      return;
    }
    setIssuingDoc(true);
    try {
      const payload = {
        investor_id: issueDocForm.investor_id,
        investment_id: issueDocForm.investment_id || null,
        spv_id: issueDocForm.spv_id || null,
        doc_type: issueDocForm.doc_type,
        document_title: issueDocForm.document_title || issueDocForm.doc_type.replace(/_/g, ' '),
        doc_url: issueDocForm.doc_url,
        expiry_date: issueDocForm.expiry_date || null,
        notes: issueDocForm.notes || null,
        is_signed: false
      };

      const { error } = await supabase.from('legal_documents').insert([payload]);
      if (error) throw error;

      addToast && addToast('Legal document successfully issued to investor!', 'success');
      setIssueDocForm({ investor_id: '', investment_id: '', spv_id: '', doc_type: 'Share_Certificate', document_title: '', doc_url: '', expiry_date: '', notes: '' });
      setShowIssueDocForm(false);
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to issue document', 'error');
    } finally {
      setIssuingDoc(false);
    }
  };

  // Bulk Issue to Project
  const handleBulkIssueToProject = async (projectId, docType) => {
    if (!projectId || projectId === 'All') {
      addToast && addToast('Please select a specific project campaign for bulk issuance.', 'error');
      return;
    }

    const projectInvestments = allInvestments.filter(i => i.project_id === projectId);
    if (projectInvestments.length === 0) {
      addToast && addToast('No settled investments found for this project.', 'error');
      return;
    }

    try {
      const payloads = projectInvestments.map(inv => ({
        investor_id: inv.investor_id,
        investment_id: inv.id,
        spv_id: projectId,
        doc_type: docType,
        document_title: `${docType.replace(/_/g, ' ')} - ${inv.funding_projects?.project_title}`,
        doc_url: 'https://gro10x.com/templates/spv_agreement_draft.pdf',
        is_signed: false
      }));

      const { error } = await supabase.from('legal_documents').insert(payloads);
      if (error) throw error;

      addToast && addToast(`Bulk issued ${docType.replace(/_/g, ' ')} to ${projectInvestments.length} investors!`, 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed bulk issuance', 'error');
    }
  };

  // Mark Signed
  const handleMarkSigned = async (docId) => {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_signed: true, signed_at: new Date().toISOString() })
        .eq('id', docId);

      if (error) throw error;
      addToast && addToast('Document marked as E-Signed.', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed to mark document signed', 'error');
    }
  };

  // Revoke Document
  const handleRevokeDoc = async (docId) => {
    try {
      const { error } = await supabase.from('legal_documents').delete().eq('id', docId);
      if (error) throw error;
      addToast && addToast('Document revoked & deleted.', 'info');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed to revoke document', 'error');
    }
  };

  // Add SPV Handler
  const handleSaveSpv = async (e) => {
    e.preventDefault();
    if (!spvForm.spv_legal_name) {
      addToast && addToast('SPV Legal Name is required.', 'error');
      return;
    }
    setSavingSpv(true);
    try {
      const directorsList = spvForm.directors_raw ? spvForm.directors_raw.split(',').map(d => d.trim()) : [];

      const payload = {
        project_id: spvForm.project_id || null,
        spv_legal_name: spvForm.spv_legal_name,
        spv_entity_type: spvForm.spv_entity_type,
        registration_number: spvForm.registration_number || null,
        registration_date: spvForm.registration_date || null,
        tin_number: spvForm.tin_number || null,
        bin_number: spvForm.bin_number || null,
        registered_address: spvForm.registered_address || null,
        authorized_capital_bdt: spvForm.authorized_capital_bdt ? Number(spvForm.authorized_capital_bdt) : 0,
        paid_up_capital_bdt: spvForm.paid_up_capital_bdt ? Number(spvForm.paid_up_capital_bdt) : 0,
        directors: directorsList,
        moa_url: spvForm.moa_url || null,
        aoa_url: spvForm.aoa_url || null,
        trade_license_url: spvForm.trade_license_url || null,
        status: spvForm.status,
        notes: spvForm.notes || null
      };

      const { error } = await supabase.from('spv_registry').insert([payload]);
      if (error) throw error;

      addToast && addToast(`SPV Entity '${spvForm.spv_legal_name}' registered successfully!`, 'success');
      setSpvForm({ project_id: '', spv_legal_name: '', spv_entity_type: 'Pvt Ltd', registration_number: '', registration_date: '', tin_number: '', bin_number: '', registered_address: '', authorized_capital_bdt: '', paid_up_capital_bdt: '', directors_raw: '', moa_url: '', aoa_url: '', trade_license_url: '', status: 'Active', notes: '' });
      setShowSpvForm(false);
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast(err.message || 'Failed to save SPV', 'error');
    } finally {
      setSavingSpv(false);
    }
  };

  // Toggle Compliance Check
  const handleToggleComplianceField = async (investorId, field, currentValue) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        const { error } = await supabase
          .from('investor_compliance')
          .update({ [field]: !currentValue, last_reviewed_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, [field]: true, last_reviewed_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast && addToast('Compliance checklist updated.', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed to update compliance checklist', 'error');
    }
  };

  // Verify Investor KYC
  const handleVerifyKyc = async (investorId) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        await supabase
          .from('investor_compliance')
          .update({ kyc_status: 'Verified', kyc_verified_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, kyc_status: 'Verified', kyc_verified_at: new Date().toISOString() }]);
      }

      await supabase
        .from('investors')
        .update({ onboarding_status: 'Active', kyc_level: 2 })
        .eq('id', investorId);

      addToast && addToast('Investor KYC verified & promoted to Active Level 2!', 'success');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed to verify KYC', 'error');
    }
  };

  // Flag AML
  const handleFlagAml = async (investorId) => {
    try {
      const existing = complianceRecords.find(c => c.investor_id === investorId);
      if (existing) {
        await supabase
          .from('investor_compliance')
          .update({ aml_status: 'Flagged', last_reviewed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('investor_compliance')
          .insert([{ investor_id: investorId, aml_status: 'Flagged', last_reviewed_at: new Date().toISOString() }]);
      }
      addToast && addToast('Investor flagged for AML Compliance Review.', 'warning');
      fetchAllLegalData();
    } catch (err) {
      addToast && addToast('Failed to flag AML status', 'error');
    }
  };

  // Filtered Legal Docs
  const filteredDocs = legalDocs.filter(d => {
    const matchesFilter = docFilter === 'All' || d.doc_type === docFilter;
    const matchesProject = selectedProject === 'All' || d.spv_id === selectedProject;
    const searchLower = docSearch.toLowerCase();
    const matchesSearch = !docSearch || 
      (d.document_title && d.document_title.toLowerCase().includes(searchLower)) ||
      (d.investors?.alias_name && d.investors.alias_name.toLowerCase().includes(searchLower));
    return matchesFilter && matchesProject && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4-TILE KPI STRIP */}
      <div className="kpi-grid">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Total Docs Issued</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>{legalDocs.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Share Certs & Subscription Agrmts</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Awaiting E-Signature</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {legalDocs.filter(d => !d.is_signed).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Pending Investor Sign-off</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Pending KYC Reviews</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ec4899', margin: 0 }}>
            {complianceRecords.filter(c => c.kyc_status === 'Pending').length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#ec4899' }}>Awaiting Compliance Sign-off</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Registered SPV Entities</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{spvRegistry.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Special Purpose Vehicles</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="tab-toggle-group" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setLegalSubTab('contracts')}
          className={`tab-toggle-btn ${legalSubTab === 'contracts' ? 'active' : ''}`}
        >
          Contract Issuance Engine ({legalDocs.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('spv')}
          className={`tab-toggle-btn ${legalSubTab === 'spv' ? 'active' : ''}`}
        >
          SPV Registry ({spvRegistry.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('kyc')}
          className={`tab-toggle-btn ${legalSubTab === 'kyc' ? 'active' : ''}`}
        >
          KYC / AML Compliance Queue ({complianceRecords.length})
        </button>
        <button 
          onClick={() => setLegalSubTab('audit')}
          className={`tab-toggle-btn ${legalSubTab === 'audit' ? 'active' : ''}`}
        >
          Document Audit Log
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: CONTRACT ISSUANCE ENGINE */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>SPV Contracts & Share Certificates Engine</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Issue, upload, and track legal contracts and share certificates across SPV projects.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => handleBulkIssueToProject(selectedProject, 'Subscription_Agreement')}
                className="btn-sm"
                style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.4)', padding: '0.45rem 0.85rem' }}
              >
                🗂 Bulk Issue Subscriptions
              </button>

              <button 
                onClick={() => setShowIssueDocForm(!showIssueDocForm)}
                className={showIssueDocForm ? 'btn-sm' : 'btn-sm btn-gold'}
                style={{ background: showIssueDocForm ? 'rgba(255,255,255,0.1)' : undefined, color: showIssueDocForm ? '#fff' : undefined, padding: '0.45rem 0.95rem' }}
              >
                {showIssueDocForm ? '✕ Close Form' : '+ Issue New Document'}
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE ISSUE DOCUMENT FORM */}
          {showIssueDocForm && (
            <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Issue Legal Contract / Share Certificate</h4>
              <form onSubmit={handleIssueDocument} className="form-grid-3col" style={{ fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select Investor *</label>
                  <select value={issueDocForm.investor_id} onChange={(e) => setIssueDocForm({ ...issueDocForm, investor_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required>
                    <option value="">-- Select Investor --</option>
                    {allInvestors.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.alias_name || inv.full_name} ({inv.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Linked Investment Booking</label>
                  <select value={issueDocForm.investment_id} onChange={(e) => setIssueDocForm({ ...issueDocForm, investment_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- Unlinked / General --</option>
                    {allInvestments.map(m => (
                      <option key={m.id} value={m.id}>{m.investors?.alias_name} - {m.funding_projects?.project_title} ({formatCurrency(m.amount_invested_bdt, currency)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document Type *</label>
                  <select value={issueDocForm.doc_type} onChange={(e) => setIssueDocForm({ ...issueDocForm, doc_type: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Share_Certificate">Share Certificate</option>
                    <option value="Subscription_Agreement">Subscription Agreement</option>
                    <option value="Tax_Document">Tax Document</option>
                    <option value="MOU">MOU / Term Sheet</option>
                    <option value="Termination_Notice">Termination Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document Title</label>
                  <input type="text" placeholder="e.g. ORO Hub 4 Share Certificate #104" value={issueDocForm.document_title} onChange={(e) => setIssueDocForm({ ...issueDocForm, document_title: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Document PDF File (Upload or paste URL) *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" placeholder="https://..." value={issueDocForm.doc_url} onChange={(e) => setIssueDocForm({ ...issueDocForm, doc_url: e.target.value })} className="form-input" style={{ flex: 1 }} required />
                    <label style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {uploadingPdf ? 'Uploading...' : '📁 Upload PDF'}
                      <input type="file" accept="application/pdf" onChange={handleUploadDocumentPdf} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Expiry Date (Optional)</label>
                  <input type="date" value={issueDocForm.expiry_date} onChange={(e) => setIssueDocForm({ ...issueDocForm, expiry_date: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Internal Admin Notes</label>
                  <input type="text" placeholder="Issued upon 100% capital clearance..." value={issueDocForm.notes} onChange={(e) => setIssueDocForm({ ...issueDocForm, notes: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={issuingDoc} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {issuingDoc ? 'Issuing...' : 'Issue Document'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTROLS ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div className="doc-filter-pills">
              {['All', 'Share_Certificate', 'Subscription_Agreement', 'Tax_Document', 'MOU', 'Termination_Notice'].map(st => (
                <button
                  key={st}
                  onClick={() => setDocFilter(st)}
                  className={`btn-sm ${docFilter === st ? 'btn-gold' : ''}`}
                  style={{
                    background: docFilter === st ? undefined : 'rgba(255,255,255,0.05)',
                    color: docFilter === st ? undefined : '#94a3b8'
                  }}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ padding: '0.45rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}>
                <option value="All">All Project Campaigns</option>
                {allProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                ))}
              </select>

              <input 
                type="text"
                placeholder="🔍 Search doc or investor..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                style={{ width: '200px', padding: '0.45rem 0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* DOCUMENTS CARDS GRID */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading legal documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No legal documents issued matching filters.</div>
          ) : (
            <div className="campaign-grid">
              {filteredDocs.map(doc => {
                const isSigned = doc.is_signed;

                return (
                  <div key={doc.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: isSigned ? '4px solid #10b981' : '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{doc.document_title || doc.doc_type.replace(/_/g, ' ')}</h4>
                        <span className="status-badge status-badge--gold" style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                          {doc.doc_type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className={isSigned ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>
                        {isSigned ? '✓ E-Signed' : '⏳ Awaiting Sign'}
                      </span>
                    </div>

                    <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                      <div>Investor: <strong style={{ color: '#fff' }}>{doc.investors?.alias_name || doc.investors?.full_name}</strong></div>
                      {doc.investments?.funding_projects?.project_title && (
                        <div>Project: <strong style={{ color: '#3b82f6' }}>{doc.investments.funding_projects.businesses?.brand_name} ({doc.investments.funding_projects.project_title})</strong></div>
                      )}
                      <div>Issued: <span>{new Date(doc.created_at).toLocaleDateString()}</span></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <a href={doc.doc_url} target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📋 View PDF Contract ↗
                      </a>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!isSigned && (
                          <button onClick={() => handleMarkSigned(doc.id)} className="btn-sm btn-gold">
                            ✓ Mark Signed
                          </button>
                        )}
                        <button onClick={() => handleRevokeDoc(doc.id)} className="btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: SPV REGISTRY */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'spv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Special Purpose Vehicle (SPV) Registry</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Register legal entities, CJS registration numbers, TIN/BINs, and directors rosters.</p>
            </div>

            <button 
              onClick={() => setShowSpvForm(!showSpvForm)}
              className={showSpvForm ? 'btn-sm' : 'btn-sm btn-gold'}
              style={{ background: showSpvForm ? 'rgba(255,255,255,0.1)' : undefined, color: showSpvForm ? '#fff' : undefined, padding: '0.45rem 0.95rem' }}
            >
              {showSpvForm ? '✕ Close Form' : '+ Register New SPV'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD SPV FORM */}
          {showSpvForm && (
            <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#D4AF37', fontSize: '0.95rem' }}>Register New SPV Legal Entity</h4>
              <form onSubmit={handleSaveSpv} className="form-grid-3col" style={{ fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>SPV Legal Entity Name *</label>
                  <input type="text" placeholder="e.g. ORO SPV4 Gulshan Ltd" value={spvForm.spv_legal_name} onChange={(e) => setSpvForm({ ...spvForm, spv_legal_name: e.target.value })} className="form-input" required />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Linked Project Deal</label>
                  <select value={spvForm.project_id} onChange={(e) => setSpvForm({ ...spvForm, project_id: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="">-- Unlinked SPV --</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.businesses?.brand_name} - {p.project_title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Entity Type</label>
                  <select value={spvForm.spv_entity_type} onChange={(e) => setSpvForm({ ...spvForm, spv_entity_type: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Pvt Ltd">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Trust">Special Purpose Trust</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>CJS Registration Number</label>
                  <input type="text" placeholder="C-198234/2026" value={spvForm.registration_number} onChange={(e) => setSpvForm({ ...spvForm, registration_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>TIN Number</label>
                  <input type="text" placeholder="1234567890" value={spvForm.tin_number} onChange={(e) => setSpvForm({ ...spvForm, tin_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>BIN Number (VAT)</label>
                  <input type="text" placeholder="001234567-0101" value={spvForm.bin_number} onChange={(e) => setSpvForm({ ...spvForm, bin_number: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Authorized Capital (BDT)</label>
                  <input type="number" placeholder="10000000" value={spvForm.authorized_capital_bdt} onChange={(e) => setSpvForm({ ...spvForm, authorized_capital_bdt: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Paid-Up Capital (BDT)</label>
                  <input type="number" placeholder="5000000" value={spvForm.paid_up_capital_bdt} onChange={(e) => setSpvForm({ ...spvForm, paid_up_capital_bdt: e.target.value })} className="form-input" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Directors Roster (Comma separated)</label>
                  <input type="text" placeholder="Tanvir Ahmed, Kazi Mahbub" value={spvForm.directors_raw} onChange={(e) => setSpvForm({ ...spvForm, directors_raw: e.target.value })} className="form-input" />
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={savingSpv} className="btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                    {savingSpv ? 'Saving...' : 'Register SPV'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SPV CARDS GRID */}
          {spvRegistry.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No SPV entities registered yet.</div>
          ) : (
            <div className="campaign-grid">
              {spvRegistry.map(spv => (
                <div key={spv.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{spv.spv_legal_name}</h4>
                      <span className="status-badge status-badge--info" style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                        {spv.spv_entity_type}
                      </span>
                    </div>

                    <span className="status-badge status-badge--success">
                      ● {spv.status}
                    </span>
                  </div>

                  <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
                    <div>CJS Reg No: <strong style={{ color: '#D4AF37' }}>{spv.registration_number || 'Pending'}</strong></div>
                    <div>TIN: <span>{spv.tin_number || 'N/A'}</span> | BIN: <span>{spv.bin_number || 'N/A'}</span></div>
                    <div>Paid-Up Capital: <strong style={{ color: '#10b981' }}>{formatCurrency(spv.paid_up_capital_bdt || 0, currency)}</strong></div>
                  </div>

                  {Array.isArray(spv.directors) && spv.directors.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Directors: {spv.directors.map((d, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.3rem' }}>{d}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: KYC / AML COMPLIANCE QUEUE */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'kyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>KYC / AML Compliance Queue</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Audit investor NIDs, bank statements, source of funds, and e-signatures.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>KYC Status</th>
                  <th>NID Verified</th>
                  <th>Bank Stmt</th>
                  <th>Source Declared</th>
                  <th>E-Signed</th>
                  <th>AML Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allInvestors.map(inv => {
                  const comp = complianceRecords.find(c => c.investor_id === inv.id) || {};
                  const isVerified = inv.onboarding_status === 'Active' || comp.kyc_status === 'Verified';
                  const isFlagged = comp.aml_status === 'Flagged';

                  return (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{inv.alias_name || inv.full_name}</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{inv.phone}</span>
                      </td>

                      <td>
                        <span className={isVerified ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>
                          {isVerified ? '✓ Verified L2' : 'Pending L1'}
                        </span>
                      </td>

                      <td>
                        <input type="checkbox" checked={!!comp.nid_verified} onChange={() => handleToggleComplianceField(inv.id, 'nid_verified', comp.nid_verified)} />
                      </td>

                      <td>
                        <input type="checkbox" checked={!!comp.bank_statement_received} onChange={() => handleToggleComplianceField(inv.id, 'bank_statement_received', comp.bank_statement_received)} />
                      </td>

                      <td>
                        <input type="checkbox" checked={!!comp.source_of_funds_declared} onChange={() => handleToggleComplianceField(inv.id, 'source_of_funds_declared', comp.source_of_funds_declared)} />
                      </td>

                      <td>
                        <input type="checkbox" checked={!!comp.e_signature_obtained} onChange={() => handleToggleComplianceField(inv.id, 'e_signature_obtained', comp.e_signature_obtained)} />
                      </td>

                      <td>
                        <span className={isFlagged ? 'status-badge status-badge--danger' : 'status-badge status-badge--success'}>
                          {isFlagged ? '🚩 Flagged' : 'Clear'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {!isVerified && (
                            <button onClick={() => handleVerifyKyc(inv.id)} className="btn-sm btn-gold">
                              ✓ Verify KYC
                            </button>
                          )}
                          {!isFlagged && (
                            <button onClick={() => handleFlagAml(inv.id)} className="btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                              Flag AML
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 4: DOCUMENT AUDIT LOG */}
      {/* ---------------------------------------------------- */}
      {legalSubTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Legal Document Audit Trail</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Immutable chronological record of all contracts and share certificates issued.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Document Title</th>
                  <th>Type</th>
                  <th>Investor</th>
                  <th>Signed Status</th>
                  <th style={{ textAlign: 'right' }}>Document Link</th>
                </tr>
              </thead>
              <tbody>
                {legalDocs.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ color: '#94a3b8' }}>{new Date(doc.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{doc.document_title || 'Contract'}</td>
                    <td style={{ color: '#D4AF37' }}>{doc.doc_type.replace(/_/g, ' ')}</td>
                    <td style={{ color: '#fff' }}>{doc.investors?.alias_name || doc.investors?.full_name}</td>
                    <td>
                      <span className={doc.is_signed ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>
                        {doc.is_signed ? '✓ Signed' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={doc.doc_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                        View PDF ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
