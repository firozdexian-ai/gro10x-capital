'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Layers, DollarSign, Percent, ShieldCheck, Clock, CheckCircle2, 
  ArrowUpRight, Globe, PlusCircle, FileText, ChevronRight, PieChart, Landmark, Truck, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';

export default function FundingRoundsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [selectedType, setSelectedType] = useState('Franchise');

  // Form states
  const [businessesList, setBusinessesList] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [businessName, setBusinessName] = useState('ORO Roasters');
  const [roundTitle, setRoundTitle] = useState('Dhanmondi Branch Expansion');
  const [targetRaise, setTargetRaise] = useState(15000000);
  const [projectedReturn, setProjectedReturn] = useState('18.5% IRR');
  const [tenorMonths, setTenorMonths] = useState(12);
  const [collateralDetails, setCollateralDetails] = useState('7-Month Advance Rent & Espresso Machinery Lien');
  const [minTicket, setMinTicket] = useState(500000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rounds, setRounds] = useState([
    {
      id: 1,
      business: 'ORO Roasters',
      title: 'Mirpur Flagship Store',
      type: 'Franchise',
      target: 12000000,
      raised: 7800000,
      yield: '18% IRR',
      tenor: '24 Months',
      security: 'Asset Lien + Rent Deposit',
      status: 'Active'
    },
    {
      id: 2,
      business: 'ORO Roasters',
      title: 'Green Coffee Bean LC Financing',
      type: 'Short-Term Debt',
      target: 5000000,
      raised: 750000,
      yield: '24% APR',
      tenor: '6 Months',
      security: 'Bank Guarantee + Stock Pledge',
      status: 'Active'
    },
    {
      id: 3,
      business: 'Segreto Hub',
      title: 'Chittagong Regional Distribution Rights',
      type: 'Distribution',
      target: 20000000,
      raised: 15000000,
      yield: '15% Gross Sales Split',
      tenor: '36 Months',
      security: 'Exclusive Territory Lien',
      status: 'Active'
    }
  ]);

  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (role && role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    async function loadBusinessesAndProjects() {
      try {
        const { data: bData } = await supabase
          .from('businesses')
          .select('id, brand_name')
          .order('brand_name', { ascending: true });
        if (bData && bData.length > 0) {
          setBusinessesList(bData);
          setSelectedBusinessId(bData[0].id);
          setBusinessName(bData[0].brand_name);
        }

        const { data: pData } = await supabase
          .from('funding_projects')
          .select('*, businesses(brand_name)')
          .order('created_at', { ascending: false });
        if (pData && pData.length > 0) {
          const formatted = pData.map(p => ({
            id: p.id,
            business: p.businesses?.brand_name || 'Partner Outlet',
            title: p.project_title,
            type: 'Franchise',
            target: Number(p.target_raise_bdt || 0),
            raised: Number(p.amount_raised_bdt || 0),
            yield: p.yield_model || '18% IRR',
            tenor: '24 Months',
            security: 'SPV Asset-Backed',
            status: p.status || 'Active'
          }));
          setRounds(formatted);
        }
      } catch (err) {
        console.warn('Failed to load businesses/projects:', err);
      }
    }
    if (user) loadBusinessesAndProjects();
  }, [user]);

  const handleCreateRound = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const targetBdt = Number(targetRaise);

      const { data: newProject, error } = await supabase
        .from('funding_projects')
        .insert([{
          business_id: selectedBusinessId || null,
          project_title: roundTitle,
          target_raise_bdt: targetBdt,
          amount_raised_bdt: 0,
          status: 'Active',
          yield_model: projectedReturn,
          show_on_showcase: true
        }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, fallback to local state:', error);
      }

      const newRound = {
        id: newProject?.id || Date.now(),
        business: businessName,
        title: roundTitle,
        type: selectedType,
        target: targetBdt,
        raised: 0,
        yield: projectedReturn,
        tenor: `${tenorMonths} Months`,
        security: collateralDetails,
        status: 'Active'
      };
      setRounds([newRound, ...rounds]);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error creating round:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFundingIcon = (type) => {
    switch (type) {
      case 'Franchise': return <Building2 size={18} style={{ color: '#D4AF37' }} />;
      case 'Distribution': return <Truck size={18} style={{ color: '#10b981' }} />;
      case 'Equity': return <PieChart size={18} style={{ color: '#a855f7' }} />;
      case 'Short-Term Debt': return <Landmark size={18} style={{ color: '#3b82f6' }} />;
      default: return <Layers size={18} />;
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER BAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(7,10,20,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="/" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', textDecoration: 'none' }}>
            GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Architecture</span>
            <ChevronRight size={14} />
            <span style={{ color: '#f8fafc' }}>Multi-Tier Funding Rounds</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* CURRENCY SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
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
          
          <a href="/showcase" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '600' }}>
            Deal Showcase <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      {/* HERO BANNER */}
      <section style={{ padding: '3rem 3rem 2rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>v0.2.3 Multi-Tier Architecture</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Launch & Configure Funding Rounds</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '700px' }}>
            Attach tailored capital instruments to audited businesses. Select between Franchise Buildout, Distribution Rights, Direct Equity, or Short-Term Debt.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
        
        {/* CREATE FUNDING ROUND FORM */}
        <div className="glass-card" style={{ borderColor: 'rgba(212,175,55,0.3)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} style={{ color: '#D4AF37' }} /> Create New Capital Round
          </h2>

          {successMsg && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} /> New Funding Round Configured & Published!
            </div>
          )}

          <form onSubmit={handleCreateRound} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* TYPE SELECTOR */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Capital Round Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { name: 'Franchise', label: 'Franchise Buildout' },
                  { name: 'Distribution', label: 'Distribution Rights' },
                  { name: 'Equity', label: 'Direct Equity' },
                  { name: 'Short-Term Debt', label: 'Short-Term Debt' }
                ].map((type) => (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => setSelectedType(type.name)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: selectedType === type.name ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedType === type.name ? 'rgba(212,175,55,0.15)' : 'rgba(7,10,20,0.6)',
                      color: selectedType === type.name ? '#D4AF37' : '#94a3b8',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {getFundingIcon(type.name)} {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Business</label>
              <select 
                value={selectedBusinessId} 
                onChange={(e) => {
                  const bId = e.target.value;
                  setSelectedBusinessId(bId);
                  const b = businessesList.find(item => item.id === bId);
                  if (b) setBusinessName(b.brand_name);
                }} 
                className="form-input"
              >
                {businessesList.length > 0 ? (
                  businessesList.map(b => (
                    <option key={b.id} value={b.id}>{b.brand_name}</option>
                  ))
                ) : (
                  <>
                    <option value="">ORO Roasters</option>
                    <option value="">Segreto Hub</option>
                    <option value="">Kazi Farm Kitchen</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Round Title</label>
              <input type="text" value={roundTitle} onChange={(e) => setRoundTitle(e.target.value)} className="form-input" placeholder="e.g. Dhanmondi Outlet Expansion" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Raise Target</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                  <input 
                    type="number" 
                    value={Math.round(targetRaise * CURRENCY_RATES[currency].rate)} 
                    onChange={(e) => setTargetRaise(Number(e.target.value) / CURRENCY_RATES[currency].rate)} 
                    className="form-input" 
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Target Return / Yield</label>
                <input type="text" value={projectedReturn} onChange={(e) => setProjectedReturn(e.target.value)} className="form-input" placeholder="e.g. 18.5% IRR or 24% APR" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Tenor (Months)</label>
                <input type="number" value={tenorMonths} onChange={(e) => setTenorMonths(e.target.value)} className="form-input" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Min Ticket Size</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{CURRENCY_RATES[currency].symbol}</span>
                  <input 
                    type="number" 
                    value={Math.round(minTicket * CURRENCY_RATES[currency].rate)} 
                    onChange={(e) => setMinTicket(Number(e.target.value) / CURRENCY_RATES[currency].rate)} 
                    className="form-input" 
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Collateral / SPV Security Backing</label>
              <input type="text" value={collateralDetails} onChange={(e) => setCollateralDetails(e.target.value)} className="form-input" placeholder="e.g. Equipment Lien + Rent Deposit" />
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #D4AF37, #aa820a)', color: '#070a14', padding: '0.85rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} /> Publish Round to Platform
            </button>
          </form>
        </div>

        {/* ACTIVE ROUNDS LISTING */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} style={{ color: '#D4AF37' }} /> Configured Capital Rounds ({rounds.length})
          </h2>

          {rounds.map((rd) => {
            const pct = Math.round((rd.raised / rd.target) * 100);
            return (
              <div key={rd.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {getFundingIcon(rd.type)} {rd.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{rd.business}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{rd.title}</h3>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1.1rem', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                    {rd.yield}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Target</span>
                    <strong style={{ color: '#fff' }}>{formatCurrency(rd.target, currency)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Tenor</span>
                    <strong style={{ color: '#fff' }}>{rd.tenor}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Security</span>
                    <strong style={{ color: '#D4AF37' }}>{rd.security}</strong>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <span>Raised: {formatCurrency(rd.raised, currency)}</span>
                    <span>{pct}% Funded</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10b981)' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
