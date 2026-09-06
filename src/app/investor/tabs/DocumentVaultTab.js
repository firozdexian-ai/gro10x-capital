'use client';
import React from 'react';
import { FileText, Download } from 'lucide-react';
import Skeleton from '../../../components/Skeleton';

export default function DocumentVaultTab({
  legalDocuments = [],
  loadingData = false
}) {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.75rem' }}>
      
      {/* TAB HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
            Legal & Regulatory Document Vault
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Securely access your executed SPV Share Certificates, Subscription Agreements, and Tax Statements
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(212,175,55,0.15)', 
            color: '#D4AF37', 
            border: '1px solid rgba(212,175,55,0.3)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800' 
          }}>
            ● {legalDocuments.length} Document{legalDocuments.length !== 1 ? 's' : ''} Secured
          </span>
        </div>
      </div>

      {loadingData ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Skeleton width="100%" height="80px" borderRadius="12px" />
          <Skeleton width="100%" height="80px" borderRadius="12px" />
        </div>
      ) : legalDocuments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileText size={44} style={{ color: '#334155', margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#fff' }}>No Legal Documents Issued Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
            Your executed SPV Share Certificates, Subscription Agreements, and Tax Disclosures will appear here once your investments are fully cleared and minted by the GRO10X legal desk.
          </p>
          <a 
            href="/showcase" 
            style={{ 
              background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
              color: '#070a14', 
              padding: '0.55rem 1.25rem', 
              borderRadius: '6px', 
              fontWeight: '800', 
              fontSize: '0.82rem', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Explore Live Rounds →
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {legalDocuments.map(doc => {
            const isCert = doc.doc_type === 'Share_Certificate';
            const isSub = doc.doc_type === 'Subscription_Agreement';
            const docColor = isCert ? '#D4AF37' : isSub ? '#60a5fa' : '#10b981';
            const docBorder = isCert ? '#D4AF37' : isSub ? '#3b82f6' : '#10b981';
            const docBg = isCert ? 'rgba(212,175,55,0.15)' : isSub ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';
            const docTitle = isCert ? 'SPV Share Certificate' : isSub ? 'Subscription Agreement' : 'Tax & Compliance Document';
            const docPillLabel = isCert ? 'Share Ownership' : isSub ? 'Legal Contract' : 'Compliance';

            return (
              <div 
                key={doc.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.5rem',
                  borderLeft: `4px solid ${docBorder}`,
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                  <div style={{ background: docBg, padding: '0.85rem', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                    <FileText size={24} style={{ color: docColor }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontWeight: '800', fontSize: '1rem', margin: 0, color: '#fff' }}>
                        {docTitle}
                      </h4>
                      <span style={{ background: docBg, color: docColor, border: `1px solid ${docColor}40`, padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                        {docPillLabel}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                      <strong style={{ color: '#cbd5e1' }}>{doc.investments?.funding_projects?.project_title || 'General Account SPV'}</strong>
                      <span style={{ margin: '0 0.4rem', color: '#475569' }}>•</span>
                      Issued on {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a 
                  href={doc.doc_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', 
                    color: '#070a14', 
                    padding: '0.55rem 1.15rem', 
                    borderRadius: '6px', 
                    fontSize: '0.82rem', 
                    fontWeight: '800', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.45rem', 
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(212,175,55,0.2)'
                  }}
                >
                  <Download size={15} /> Download PDF
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
