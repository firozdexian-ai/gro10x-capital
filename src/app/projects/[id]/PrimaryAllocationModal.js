'use client';

import React, { useState } from 'react';
import { 
  Lock, ShieldCheck, TrendingUp, X, CheckCircle2, 
  Loader2, MessageSquare, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '../../../lib/currency';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/Toast';

export default function PrimaryAllocationModal({
  project,
  user,
  refCode,
  onClose
}) {
  const { addToast } = useToast();
  const minTicket = Number(project?.min_otc_investment_bdt) || 500000;
  
  const [ticketAmount, setTicketAmount] = useState(Math.max(minTicket, 1000000));
  const [yieldOption, setYieldOption] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const isWealth = project?.funding_type === 'Wealth Management' || 
                   project?.project_title?.includes('Safe Plan') || 
                   project?.project_title?.includes('Safe Home');

  const presetTickets = [
    { label: '৳5 Lakh', value: 500000 },
    { label: '৳10 Lakh', value: 1000000 },
    { label: '৳25 Lakh', value: 2500000 },
    { label: '৳50 Lakh', value: 5000000 },
    { label: '৳1 Crore', value: 10000000 }
  ].filter(p => p.value >= minTicket);

  const yieldOptions = isWealth ? [
    { id: 1, title: 'Option 1: Monthly Cashflow', rate: '18% p.a.', desc: 'Paid 7th of every month directly to your bank account' },
    { id: 2, title: 'Option 2: Semi-Annual', rate: '20% p.a.', desc: 'Distributed every 6 months for higher compounding' },
    { id: 3, title: 'Option 3: Annual Maturity', rate: '22% p.a.', desc: '12-month lump-sum payout backed by corporate POs' },
  ] : [
    { id: 1, title: 'Option 1: Capped Yield', rate: '10% Gross', desc: '22% Total ROI cap, monthly POS revenue disbursements' },
    { id: 2, title: 'Option 2: Multiplier', rate: '12% Gross', desc: '1.5X Guaranteed Buyout exit from franchise cashflow' },
    { id: 3, title: 'Option 3: Partnership', rate: '35% Net', desc: 'Net Profit share with 5% monthly gross revenue floor' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = Number(ticketAmount);

    if (numericAmount < minTicket) {
      addToast(`Minimum investment ticket for this round is ${formatCurrency(minTicket, 'BDT')}`, 'error');
      return;
    }

    if (!user && (!guestName.trim() || !guestPhone.trim())) {
      addToast('Please provide your name and phone number to record commitment.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let createdBooking = null;

      if (user) {
        // 1. Resolve investor DB record
        let investorId = null;
        const { data: invData, error: invError } = await supabase
          .from('investors')
          .select('id, alias_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (invData) {
          investorId = invData.id;
        } else {
          // Auto-provision investor record for logged-in user
          const { data: newInv, error: createInvErr } = await supabase
            .from('investors')
            .insert([{
              user_id: user.id,
              alias_name: user.email?.split('@')[0] || 'Syndicate Member',
              email: user.email,
              kyc_verified: false
            }])
            .select()
            .single();

          if (!createInvErr && newInv) {
            investorId = newInv.id;
          }
        }

        if (investorId) {
          // 2. Insert primary booking
          const { data: booking, error: bookErr } = await supabase
            .from('investment_bookings')
            .insert([{
              investor_id: investorId,
              project_id: project.id,
              amount_bdt: numericAmount,
              yield_option: yieldOption,
              booking_type: 'Primary',
              status: 'Pending_Proof'
            }])
            .select()
            .single();

          if (bookErr) throw bookErr;
          createdBooking = booking;
          setBookingResult(booking);
        }
      } else {
        // 3. Unauthenticated guest prospect: Log structured booking lead
        await supabase.from('inquiry_leads').insert([{
          full_name: guestName,
          phone_number: guestPhone,
          email: guestEmail || null,
          inquiry_type: 'Primary Allocation Intent',
          notes: `Deal Booking Intent: ৳${numericAmount.toLocaleString()} BDT on Option ${yieldOption} for ${project.project_title || project.id}`,
          lead_status: 'Booking_Intent',
          referral_code: refCode || null
        }]);

        createdBooking = { id: `PROSPECT-${Date.now().toString(36).toUpperCase()}` };
        setBookingResult(createdBooking);
      }

      // 4. Dispatch Telegram Notification to Admin
      try {
        await fetch('/api/telegram-notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '💼 New Primary Allocation Booked',
            message: `Deal: <b>${project.project_title || 'CapEx Round'}</b>\nAmount: ৳${numericAmount.toLocaleString()} BDT\nYield: Option ${yieldOption}\nInvestor: ${user?.email || guestName}\nPhone: ${guestPhone || 'Logged-In Account'}\nRef Code: <code>${refCode || 'Direct'}</code>`,
            actionUrl: `${window.location.origin}/admin`
          })
        });
      } catch (tErr) {
        console.warn('Telegram notification alert skipped:', tErr);
      }

      setBookingSuccess(true);
      addToast('Allocation reserved! Please upload payment proof in your portfolio.', 'success');
    } catch (err) {
      console.error('Failed to book allocation:', err);
      addToast(err.message || 'Failed to submit allocation booking.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="booking-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(7,10,20,0.98) 100%)',
          border: '1px solid rgba(212,175,55,0.35)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center'
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {bookingSuccess ? (
          /* SUCCESS SCREEN */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid #10b981',
              color: '#10b981',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', margin: '0 0 0.5rem 0' }}>
              Allocation Reserved!
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Your commitment for <strong style={{ color: '#D4AF37' }}>{formatCurrency(ticketAmount, 'BDT')}</strong> in <strong>{project.project_title}</strong> has been logged.
            </p>

            <div style={{
              background: 'rgba(7,10,20,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.75rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Booking Reference:</span>
                <strong style={{ color: '#f8fafc' }}>#{bookingResult?.id?.slice(0, 12)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Yield Option:</span>
                <strong style={{ color: '#10b981' }}>Option {yieldOption}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ color: '#f59e0b', fontWeight: '700' }}>● Awaiting Payment Proof</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user ? (
                <Link
                  href="/investor#portfolio"
                  className="btn-gold"
                  style={{
                    padding: '0.9rem',
                    borderRadius: '8px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Upload Payment Proof Now <ArrowUpRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="btn-gold"
                  style={{
                    padding: '0.9rem',
                    borderRadius: '8px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Create Investor Account to Upload Proof <ArrowUpRight size={16} />
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                style={{ padding: '0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Return to Deal Room
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary Syndicate Allocation
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', margin: '0.25rem 0 0.35rem 0' }}>
                Book Capital Allocation
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                {project.project_title} · {project.spv_name || 'GRO10X SPV Ltd.'}
              </p>
            </div>

            {/* TICKET AMOUNT INPUT */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Commitment Ticket (BDT) *
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Min: {formatCurrency(minTicket, 'BDT')}
                </span>
              </div>
              
              <input
                type="number"
                min={minTicket}
                step={50000}
                value={ticketAmount}
                onChange={(e) => setTicketAmount(e.target.value)}
                className="form-input"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#D4AF37',
                  background: 'rgba(7,10,20,0.8)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '8px'
                }}
              />

              {/* PRESET CHIPS */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {presetTickets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setTicketAmount(preset.value)}
                    style={{
                      background: Number(ticketAmount) === preset.value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${Number(ticketAmount) === preset.value ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                      color: Number(ticketAmount) === preset.value ? '#D4AF37' : '#94a3b8',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* YIELD OPTION SELECTOR */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '0.4rem' }}>
                Select Preferred Yield Structure *
              </label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {yieldOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setYieldOption(opt.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: yieldOption === opt.id ? 'rgba(212,175,55,0.12)' : 'rgba(7,10,20,0.6)',
                      border: `1px solid ${yieldOption === opt.id ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: yieldOption === opt.id ? '#fff' : '#cbd5e1' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {opt.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: yieldOption === opt.id ? '#D4AF37' : '#10b981' }}>
                      {opt.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GUEST FIELDS IF NOT AUTHENTICATED */}
            {!user && (
              <div style={{
                background: 'rgba(7,10,20,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                display: 'grid',
                gap: '0.65rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700' }}>
                  Investor Contact Details
                </div>
                <input
                  type="text"
                  placeholder="Your Full Name *"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="form-input"
                  required
                  style={{ padding: '0.55rem', fontSize: '0.82rem' }}
                />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp Number *"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="form-input"
                  required
                  style={{ padding: '0.55rem', fontSize: '0.82rem' }}
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.55rem', fontSize: '0.82rem' }}
                />
              </div>
            )}

            {/* KYC NOTICE FOR TICKET > 10L */}
            {Number(ticketAmount) > 1000000 && (
              <div style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#93c5fd'
              }}>
                <ShieldCheck size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span>Bookings over ৳10 Lakh require KYC Level 2 verification before fund settlement.</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold"
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} /> Confirm Allocation Booking
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
