'use client';

import React, { useState } from 'react';
import { X, FileText, ExternalLink, Download, Maximize2, Minimize2 } from 'lucide-react';
import { MAATS_COTTAGE_PROFILE } from '../../../../lib/workOrders';

export default function DocumentInspectorModal({
  order,
  activeTab = 0,
  onClose
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!order) return null;

  const fmtLakhs = (val) => `৳${(Number(val || 0) / 100000).toFixed(2)}L`;

  // Build document list
  const docList = [];
  
  // 1. Client PO Contract
  if (order.po_document_url || order.po_ref_number || order.po_document_pdf) {
    docList.push({
      id: 'po',
      badge: 'Contract PO',
      title: 'Client Purchase Order (PO)',
      url: order.po_document_url || order.po_document_pdf || '/docs/msp-001-delta-po.png',
      pdfUrl: order.po_document_pdf,
      meta: `Ref: ${order.po_ref_number || 'DL/PO/2026'} • Client: ${order.corporate_client}`,
      note: `PO Value: ${fmtLakhs(order.po_value_bdt || order.return_amount_bdt)} • Officially signed purchase contract.`
    });
  }

  // 2. Disbursement Tranches
  if (order.disbursement_transfers && order.disbursement_transfers.length > 0) {
    order.disbursement_transfers.forEach((t) => {
      docList.push({
        id: `tranche-${t.tranche_no}`,
        badge: t.is_combined ? 'Combined Transfer' : `Tranche ${t.tranche_no}`,
        title: t.is_combined ? `Combined Transfer Slip (${fmtLakhs(t.amount_bdt)})` : `Tranche #${t.tranche_no} — ${fmtLakhs(t.amount_bdt)}`,
        url: t.receipt_url,
        meta: `${t.method} • Ref: ${t.ref_no}`,
        note: t.note || `Date: ${t.date} • Sent to ${MAATS_COTTAGE_PROFILE.accountName} (${MAATS_COTTAGE_PROFILE.accountNumber})`
      });
    });
  } else if (order.disbursement_receipt_url) {
    docList.push({
      id: 'disbursement-slip',
      badge: 'Disbursement',
      title: `Transfer Slip (${fmtLakhs(order.investment_amount_bdt)})`,
      url: order.disbursement_receipt_url,
      meta: `Verified Bank Transfer • Ref: CityTouch`,
      note: `Disbursed to ${order.bank_account_info}`
    });
  }

  // 3. Product Sample Photo
  if (order.product_sample_photo_url || (order.reference_photos && order.reference_photos.length > 0)) {
    docList.push({
      id: 'sample',
      badge: 'Sample Spec',
      title: 'Product Reference Sample',
      url: order.product_sample_photo_url || order.reference_photos[0],
      meta: `Item: ${order.item_description}`,
      note: 'Physical merchandise sample approved by corporate buyer.'
    });
  }

  // 4. Settle Repayment Slip(s)
  if (order.repayment_transfers && order.repayment_transfers.length > 0) {
    order.repayment_transfers.forEach((t, idx) => {
      docList.push({
        id: `repayment-${idx + 1}`,
        badge: `Repayment Slip ${idx + 1}`,
        title: `Repayment Slip (${fmtLakhs(t.amount_bdt)})`,
        url: t.receipt_url,
        meta: `${t.method} • Ref: ${t.ref_no}`,
        note: `Received into AHMED FAIZ account on ${t.date} (${fmtLakhs(t.amount_bdt)})`
      });
    });
  } else if (order.settlement_repayment_receipt_url) {
    docList.push({
      id: 'repayment',
      badge: 'Proof of Repayment',
      title: 'Repayment Bank Transfer Slip',
      url: order.settlement_repayment_receipt_url,
      meta: `EFT/NPSB Repayment to Safe Plan Fund • ${fmtLakhs(order.return_amount_bdt)}`,
      note: 'Document 1 of Dual Verification: Bank acknowledgment of full capital + profit return.'
    });
  }

  // 5. Delivery Challan / Corporate Bill Copy
  if (order.delivery_challan_url || order.settlement_challan_receipt_url) {
    docList.push({
      id: 'challan',
      badge: 'Delivery Challan',
      title: 'Corporate Delivery Challan & Bill Copy',
      url: order.delivery_challan_url || order.settlement_challan_receipt_url,
      meta: `Stamped & Received by ${order.corporate_client} • Inv: ${order.delivery_challan_invoice_no || 'MCL-INVOICE'}`,
      note: order.delivery_received_by 
        ? `Goods physically received and officially stamped by ${order.delivery_received_by} on ${order.delivery_received_date}.`
        : 'Document 2 of Dual Verification: Signed delivery challan acknowledging physical receipt of goods.'
    });
  }

  const currentDoc = docList[currentTab] || docList[0];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: isFullscreen ? '0' : '1rem' }}>
      <div 
        style={{ 
          background: '#0f172a', 
          border: isFullscreen ? 'none' : '1px solid rgba(212,175,55,0.4)', 
          borderRadius: isFullscreen ? '0' : '16px', 
          maxWidth: isFullscreen ? '100vw' : '720px', 
          width: '100%', 
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '92vh',
          overflow: 'hidden', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0b1120' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>{order.order_code}</span>
              <span className="status-badge status-badge--gold" style={{ fontSize: '0.7rem' }}>
                Document Audit Package
              </span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              {order.corporate_client} — {order.item_description}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Document Tabs Strip */}
        {docList.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.65rem 1rem', background: '#070a14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {docList.map((doc, idx) => {
              const isSelected = currentTab === idx;
              return (
                <button
                  key={doc.id || idx}
                  onClick={() => setCurrentTab(idx)}
                  style={{
                    background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                    color: isSelected ? '#D4AF37' : '#94a3b8',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{doc.badge || doc.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Document Content Body */}
        <div style={{ padding: '1rem', overflowY: 'auto', textAlign: 'center', background: '#05070f', flex: 1 }}>
          {currentDoc ? (
            <div>
              <div style={{ marginBottom: '0.75rem', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{currentDoc.title}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {currentDoc.meta}
                  </span>
                </div>
                {currentDoc.note && (
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.35rem 0 0 0' }}>
                    {currentDoc.note}
                  </p>
                )}
              </div>

              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', width: '100%' }}>
                {currentDoc.url?.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={currentDoc.url} 
                    title={currentDoc.title} 
                    style={{ width: '100%', height: isFullscreen ? '75vh' : '50vh', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                ) : (
                  <img 
                    src={currentDoc.url} 
                    alt={currentDoc.title} 
                    style={{ maxWidth: '100%', maxHeight: isFullscreen ? '75vh' : '50vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <a 
                  href={currentDoc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} /> View Full Document
                </a>
                {currentDoc.pdfUrl && (
                  <a 
                    href={currentDoc.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: '#38bdf8', color: '#38bdf8', textDecoration: 'none' }}
                  >
                    <FileText size={13} /> View / Download PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No documents attached to this order.</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#0b1120', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
            Safe Plan Wealth Management Fund • Institutional Audit Trail
          </span>
          <button 
            onClick={onClose} 
            className="btn-outline" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
          >
            Close Audit Package
          </button>
        </div>

      </div>
    </div>
  );
}
