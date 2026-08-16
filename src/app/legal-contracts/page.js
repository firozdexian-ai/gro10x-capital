'use client';
import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Printer, Download, CheckCircle2, ArrowUpRight, 
  Building2, Award, Lock, Users, Sparkles, Globe
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function LegalContractsPortal() {
  const [currency, setCurrency] = useState('BDT');
  const [docType, setDocType] = useState('spv-cert');
  const [investorName, setInvestorName] = useState('Tanvir Ahmed (NRB Expatriate)');
  const [hubName, setHubName] = useState('ORO Roasters - Mirpur');
  const [spvName, setSpvName] = useState('GRO10X Mirpur SPV Ltd.');
  const [amount, setAmount] = useState(1500000);
  const [yieldOption, setYieldOption] = useState('Option 3: The Partnership (5% Floor + 35% Profit)');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header className="no-print" style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem' }}>
            <FileText size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>AUTOMATED <span style={{ color: '#D4AF37' }}>LEGAL & TERM SHEETS</span></h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>SPV Certificates & Growth Contracts v0.1.9</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handlePrint} className="btn-gold" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
            <Printer size={16} /> Print / Export PDF
          </button>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Public Portal <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 0' }}>
        
        {/* DOCUMENT TYPE SELECTOR CARDS (HIDDEN ON PRINT) */}
        <div className="no-print" style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Select Document Type to Generate:</p>
          <div className="grid-4">
            <button 
              onClick={() => setDocType('spv-cert')} 
              style={{ background: docType === 'spv-cert' ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.6)', border: docType === 'spv-cert' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', color: docType === 'spv-cert' ? '#D4AF37' : '#94a3b8', padding: '1rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}
            >
              📜 SPV Share Certificate (90/10 Split)
            </button>
            <button 
              onClick={() => setDocType('master-agreement')} 
              style={{ background: docType === 'master-agreement' ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.6)', border: docType === 'master-agreement' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', color: docType === 'master-agreement' ? '#D4AF37' : '#94a3b8', padding: '1rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}
            >
              📄 24-Mo Master Growth Agreement
            </button>
            <button 
              onClick={() => setDocType('promoter-contract')} 
              style={{ background: docType === 'promoter-contract' ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.6)', border: docType === 'promoter-contract' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', color: docType === 'promoter-contract' ? '#D4AF37' : '#94a3b8', padding: '1rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}
            >
              🤝 Promoter 0.5% Referral Contract
            </button>
            <button 
              onClick={() => setDocType('nda')} 
              style={{ background: docType === 'nda' ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.6)', border: docType === 'nda' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', color: docType === 'nda' ? '#D4AF37' : '#94a3b8', padding: '1rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}
            >
              🔒 Private Cash HNI NDA Agreement
            </button>
          </div>
        </div>

        {/* CUSTOMIZER FORM (HIDDEN ON PRINT) */}
        <div className="glass-card no-print" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#D4AF37' }}>Customize Legal Document Parameters</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Investor / Party Name</label>
              <input type="text" value={investorName} onChange={(e) => setInvestorName(e.target.value)} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Target Outlet Hub</label>
              <select value={hubName} onChange={(e) => setHubName(e.target.value)} className="form-input">
                <option>ORO Roasters - Mirpur</option>
                <option>ORO Roasters - Banani</option>
                <option>Segreto Hub - Dhanmondi</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Capital / Deal Value ({currency})</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>SPV Legal Entity Name</label>
              <input type="text" value={spvName} onChange={(e) => setSpvName(e.target.value)} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Yield / Compensation Structure</label>
              <select value={yieldOption} onChange={(e) => setYieldOption(e.target.value)} className="form-input">
                <option>Option 1: The Fast-Paced (10% Gross / 22% Cap)</option>
                <option>Option 2: The Multiplier (12% Gross / 1.5x Cap)</option>
                <option>Option 3: The Partnership (35% Net Profit / 5% Floor)</option>
                <option>Promoter Affiliate (0.50% Gross Volume)</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIVE LEGAL DOCUMENT PREVIEW CONTAINER (PRINTABLE AREA) */}
        <div className="printable-document" style={{ background: '#ffffff', color: '#0f172a', padding: '4rem 4.5rem', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', fontFamily: 'Georgia, serif', position: 'relative', border: '12px solid #0f172a' }}>
          
          {/* WATERMARK STAMP */}
          <div style={{ position: 'absolute', top: '3rem', right: '4rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', color: '#059669', border: '2px solid #059669', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 'bold' }}>
            ● Legally Executed under GRO10X SPV
          </div>

          {/* DOCUMENT HEADER */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              {docType === 'spv-cert' && 'OFFICIAL SPV SHARE CERTIFICATE'}
              {docType === 'master-agreement' && '24-MONTH MASTER GROWTH AGREEMENT'}
              {docType === 'promoter-contract' && 'PROMOTER REFERRAL COMMISSION CONTRACT'}
              {docType === 'nda' && 'INSTITUTIONAL NON-DISCLOSURE AGREEMENT (NDA)'}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
              GRO10X Capital Platform • Special Purpose Vehicle Entity Contract
            </p>
          </div>

          {/* DOCUMENT CONTENT SWITCHER */}
          {docType === 'spv-cert' && (
            <div style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                This certifies that <strong>{investorName}</strong> is the registered legal holder of <strong>{Math.round(amount / 1000)} Shares</strong> in <strong>{spvName}</strong>, representing an asset-backed investment of <strong>{formatCurrency(amount, currency)}</strong> in the <strong>{hubName}</strong> retail outlet.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>SPV Asset Protection & Capital Structure:</h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                  <li><strong>90% Cumulative Investor Equity Pool / 10% GRO10X Corporate Stake.</strong></li>
                  <li><strong>Direct SPV Asset Ownership:</strong> 7-Month Lease Contract, Specialty Coffee Machinery (6%), Commercial Kitchen Equipment (11%), and Civil Interior Fit-Out (59%).</li>
                  <li><strong>Asset Recovery Security:</strong> Guarantees 60-70% asset recovery value under all scenarios.</li>
                  <li><strong>Selected Yield Terms:</strong> {yieldOption}.</li>
                </ul>
              </div>

              <p style={{ marginBottom: '2rem' }}>
                The registered holder is entitled to monthly cash distribution payouts generated by the SPV, clear of all payroll liabilities, distributed on the 5th day of every calendar month.
              </p>
            </div>
          )}

          {docType === 'master-agreement' && (
            <div style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                This Master Growth Agreement is entered into between <strong>GRO10X Technologies Ltd.</strong> and the Operating Founders of <strong>{hubName}</strong> for a term of 24 months.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Master Contract Covenants:</h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                  <li><strong>GRO10X Management Fee:</strong> 2.5% of gross monthly network sales.</li>
                  <li><strong>GRO10X Capital Success Fee:</strong> 2.5% on total raised capital ({formatCurrency(amount, currency)}).</li>
                  <li><strong>Operational Boundary:</strong> Zero payroll, staff HR, or real estate lease liability for GRO10X.</li>
                  <li><strong>25% Net Margin Mandate:</strong> Enforced digital cost controls and POS monitoring.</li>
                </ul>
              </div>
            </div>
          )}

          {docType === 'promoter-contract' && (
            <div style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                This Growth Promoter & Deal Facilitator Agreement is entered into between <strong>GRO10X Capital Ltd.</strong> and <strong>{investorName}</strong> (the &quot;Promoter&quot;) for the introduction of qualified capital partners.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Promoter Compensation & Terms:</h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                  <li><strong>Commission Structure:</strong> 0.50% base cash referral fee on all verified investor subscription inflows ({formatCurrency(amount, currency)} volume basis).</li>
                  <li><strong>Tier Escalation:</strong> Automated progression from Starter (0.50%) to Partner (0.75%) and Senior Syndicate Lead (1.00%) upon reaching AUM milestones.</li>
                  <li><strong>Disbursement Terms:</strong> Payout requests processed via bKash, Nagad, or Bank Wire within 48 business hours of investor capital clearance.</li>
                  <li><strong>Confidentiality:</strong> Non-disclosure of proprietary SME financials and SPV deal room documentation.</li>
                </ul>
              </div>
            </div>
          )}

          {docType === 'nda' && (
            <div style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                This Institutional Non-Disclosure Agreement is executed between <strong>GRO10X Capital Ltd.</strong>, managing entity of <strong>{spvName}</strong>, and <strong>{investorName}</strong> (the &quot;Prospective Syndicate Partner&quot;).
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Confidentiality Provisions & Terms:</h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                  <li><strong>Proprietary Telemetry:</strong> All POS daily sales, COGS benchmarks, and margin metrics for <strong>{hubName}</strong> are strictly confidential.</li>
                  <li><strong>Anonymity Guarantee:</strong> GRO10X protects investor identity and tax residency across all public deal rooms.</li>
                  <li><strong>Term:</strong> 24 months from date of execution or until public prospectus listing.</li>
                  <li><strong>Jurisdiction:</strong> Governed by the laws of Bangladesh under Dhaka Commercial Arbitration guidelines.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SIGNATURE SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px dashed #cbd5e1' }}>
            <div>
              <div style={{ height: '50px', borderBottom: '1px solid #0f172a', marginBottom: '0.5rem' }}></div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{investorName}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Registered Investor / Partner</p>
            </div>
            <div>
              <div style={{ height: '50px', borderBottom: '1px solid #0f172a', marginBottom: '0.5rem' }}></div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>GRO10X SPV Managing Director</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>GRO10X Capital Technologies Ltd.</p>
            </div>
          </div>

        </div>

      </main>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .printable-document { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>

    </div>
  );
}
