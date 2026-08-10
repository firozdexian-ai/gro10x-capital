'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ClipboardCheck, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, BarChart2, DollarSign, Camera, FileText, ChevronRight, Globe,
  Briefcase, Star, Clock, AlertTriangle, ArrowRight, LineChart, Loader2
} from 'lucide-react';
import { CURRENCY_RATES, formatCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import Navigation from '../../components/Navigation';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { X } from 'lucide-react';

export default function BusinessShowcase() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currency, setCurrency] = useState('BDT');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingProject, setBookingProject] = useState(null);
  const [bookingAmount, setBookingAmount] = useState('');
  const [yieldOption, setYieldOption] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchActiveDeals();
  }, []);

  const fetchActiveDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('funding_projects')
        .select(`
          *,
          businesses (
            brand_name,
            industry_sector,
            ai_health_score,
            operational_months,
            founders (
              full_name,
              track_record_score
            )
          )
        `)
        .eq('status', 'Origination'); // Only show active deals

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (project) => {
    if (!user) {
      addToast('You must be logged in as an Investor to book a deal.', 'error');
      return;
    }
    setBookingProject(project);
    setBookingAmount('');
    setYieldOption(1);
  };

  const handleSubmitBooking = async () => {
    if (!bookingAmount || Number(bookingAmount) <= 0) {
      addToast('Please enter a valid amount.', 'error');
      return;
    }

    setIsBooking(true);
    try {
      // Get Investor ID
      const { data: invData, error: invError } = await supabase
        .from('investors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (invError || !invData) {
        throw new Error('Investor profile not found. Make sure you are logged in as an investor.');
      }

      const numAmount = Number(bookingAmount);

      // Overbooking limit check (120%)
      const maxAllowed = Number(bookingProject.target_raise_bdt) * 1.2;
      const currentRaised = Number(bookingProject.amount_raised_bdt);
      
      if (currentRaised + numAmount > maxAllowed) {
        throw new Error(`This deal is fully oversubscribed. You can invest up to ${formatCurrency(maxAllowed - currentRaised, 'BDT')} more.`);
      }

      const { error } = await supabase
        .from('investment_bookings')
        .insert([{
          investor_id: invData.id,
          project_id: bookingProject.id,
          amount_bdt: numAmount,
          yield_option: yieldOption
        }]);

      if (error) throw error;

      addToast('Booking Intent submitted! Proceed to your Portfolio to upload payment proof.', 'success');
      setBookingProject(null);
      fetchActiveDeals();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to submit booking.', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <section style={{ padding: '3rem 3rem 1rem 3rem', background: 'radial-gradient(circle at top right, rgba(212,175,55,0.08), transparent 50%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
              Deal <span style={{ color: '#D4AF37' }}>Showcase</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0 }}>
              Live investment opportunities vetted by GRO10X Key Account Managers.
            </p>
          </div>
          
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
        </div>
      </section>

      {/* DETAILED SHOWCASE LIST */}
      <section style={{ padding: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              {[1, 2].map((i) => (
                <div key={i} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', padding: '2.5rem' }}>
                  <div>
                    <Skeleton width="120px" height="24px" className="mb-4" />
                    <Skeleton width="60%" height="40px" className="mb-4" />
                    <Skeleton width="80%" height="24px" className="mb-8" />
                    <Skeleton width="100%" height="80px" />
                  </div>
                  <div>
                    <Skeleton width="100%" height="100%" borderRadius="12px" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderColor: 'rgba(212,175,55,0.2)' }}>
              <Briefcase size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Active Deals</h3>
              <p style={{ color: '#94a3b8' }}>Check back later as KAMs finalize the audit process for the next cohort of businesses.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              {projects.map(project => {
                const business = project.businesses;
                const founder = business?.founders;
                const percentRaised = Math.min((project.amount_raised_bdt / project.target_raise_bdt) * 100, 100);

                return (
                  <div key={project.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Left Column: Business Details */}
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span className="badge-gold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <CheckCircle2 size={12} /> KAM Audited
                        </span>
                        <span className="badge-gold">{business?.industry_sector || 'Business'}</span>
                      </div>
                      
                      <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{business?.brand_name || 'Unnamed Business'}</h2>
                      <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
                        {project.project_title}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Target Raise</p>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#D4AF37' }}>{formatCurrency(project.target_raise_bdt, currency)}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Funding Type</p>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{project.funding_type}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Health Score</p>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={18} color="#10b981" /> {business?.ai_health_score}/100
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                          <Users size={20} color="#94a3b8" />
                        </div>
                        <div>
                          <p style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.95rem', margin: '0 0 0.1rem 0' }}>{founder?.full_name || 'Unknown Founder'}</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Founder Track Record: {founder?.track_record_score}/100</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Funding Progress & Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(7,10,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
                        <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', fontWeight: '700' }}>Investment Round Status</h4>
                        
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                          <div style={{ width: `${percentRaised}%`, height: '100%', background: '#D4AF37' }}></div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
                          <span>{formatCurrency(project.amount_raised_bdt, currency)} raised</span>
                          <span style={{ color: '#D4AF37', fontWeight: '700' }}>{percentRaised.toFixed(1)}%</span>
                        </div>
                        
                        <button 
                          onClick={() => handleOpenBooking(project)}
                          style={{ width: '100%', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', padding: '1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Review Deal & Invest <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingProject && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7, 10, 20, 0.8)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div className="glass-card-premium" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative' }}>
            <button 
              onClick={() => setBookingProject(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#f8fafc' }}>Book Investment</h2>
            <p style={{ color: '#D4AF37', fontWeight: '700', marginBottom: '1.5rem' }}>{bookingProject.businesses?.brand_name} - {bookingProject.project_title}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Select Yield Structure</label>
              <select 
                value={yieldOption}
                onChange={(e) => setYieldOption(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', outline: 'none' }}
              >
                <option value={1}>Option 1: Capped Yield (10% Sales)</option>
                <option value={2}>Option 2: Multiplier (12% Sales)</option>
                <option value={3}>Option 3: Partnership (5% Floor + 35% Profit)</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Investment Amount (BDT)</label>
              <input 
                type="number" 
                value={bookingAmount}
                onChange={(e) => setBookingAmount(e.target.value)}
                placeholder="e.g. 500000"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', outline: 'none', fontSize: '1.1rem' }}
              />
            </div>

            <button 
              onClick={handleSubmitBooking}
              disabled={isBooking}
              style={{ width: '100%', background: '#10b981', color: '#070a14', padding: '1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '800', border: 'none', cursor: isBooking ? 'not-allowed' : 'pointer', opacity: isBooking ? 0.7 : 1 }}
            >
              {isBooking ? 'Processing...' : 'Confirm Intent & Proceed to Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
