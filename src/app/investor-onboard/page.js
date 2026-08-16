'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, MessageCircle, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function InvestorOnboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [investor, setInvestor] = useState(null);
  const [kycLevel, setKycLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else {
        fetchProfile();
      }
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const { data: inv } = await supabase
        .from('investors')
        .select('*, kyc_submissions(target_level, status)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (inv) {
        setInvestor(inv);
        const verified = (inv.kyc_submissions || []).filter(k => k.status === 'Approved');
        if (verified.find(k => k.target_level === 3)) setKycLevel(3);
        else if (verified.find(k => k.target_level === 2)) setKycLevel(2);
        else setKycLevel(1);
      }
    } catch (err) {
      console.error('Investor onboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTelegramLinked = Boolean(investor?.telegram_chat_id);

  const steps = [
    {
      done: isTelegramLinked,
      icon: <MessageCircle size={20} />,
      title: isTelegramLinked ? 'Telegram Account Linked' : 'Link Telegram Account (Optional)',
      desc: isTelegramLinked
        ? 'Your Telegram identity has been verified and linked to your portfolio.'
        : 'Connect via @gro10xcapbot to receive real-time yield payout alerts and trade updates.',
      color: isTelegramLinked ? '#10b981' : '#f59e0b'
    },
    {
      done: true,
      icon: <Shield size={20} />,
      title: 'Web Login Activated',
      desc: 'Your 4-digit PIN is set. You can access your dashboard from any browser.',
      color: '#3b82f6'
    },
    {
      done: kycLevel >= 2,
      icon: <Shield size={20} />,
      title: 'KYC Level 2 Verification',
      desc: 'Upload your NID front & back to unlock the P2P Secondary Market.',
      color: '#f59e0b',
      action: () => router.push('/investor#kyc')
    },
    {
      done: false,
      icon: <TrendingUp size={20} />,
      title: 'Make Your First Investment',
      desc: 'Browse active projects and commit capital to start earning yields.',
      color: '#D4AF37',
      action: () => router.push('/showcase')
    }
  ];

  if (loading) {
    return (
      <div style={{ background: '#070a14', minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
        Loading your profile...
      </div>
    );
  }

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>

        {/* WELCOME HERO */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '20px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '2rem', margin: '0 auto 1.25rem auto' }}>
            🎉
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
            Welcome to <span style={{ color: '#D4AF37' }}>GRO10X Capital</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {investor?.alias_name || investor?.full_name
              ? `Your portfolio access is active, ${investor.alias_name || investor.full_name}.`
              : 'Your private investment portfolio access has been activated.'}
          </p>
        </div>

        {/* INVESTOR PROFILE CARD */}
        {investor && (
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Name</div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{investor.alias_name || investor.full_name || 'Private Investor'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KYC Status</div>
                <div style={{ fontWeight: '700', color: '#10b981' }}>Level {kycLevel} — {kycLevel === 1 ? 'Basic Access' : kycLevel === 2 ? 'P2P Unlocked' : 'Full HNW Access'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Onboarding Status</div>
                <div style={{ fontWeight: '700', color: '#D4AF37' }}>{investor.onboarding_status || 'Active'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telegram</div>
                <div style={{ fontWeight: '700', color: investor.telegram_chat_id ? '#10b981' : '#f59e0b' }}>
                  {investor.telegram_chat_id ? '✓ Linked' : 'Pending Link'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEXT STEPS CHECKLIST */}
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Getting Started Checklist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={step.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: step.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${step.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px', padding: '1rem',
                  cursor: step.action ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: step.done ? 'rgba(16,185,129,0.15)' : `rgba(${step.color === '#10b981' ? '16,185,129' : '255,255,255'},0.06)`,
                  border: `1px solid ${step.done ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'grid', placeItems: 'center',
                  color: step.done ? '#10b981' : '#64748b'
                }}>
                  {step.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: step.done ? '#10b981' : '#f8fafc', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>{step.desc}</div>
                </div>
                {step.action && !step.done && (
                  <ChevronRight size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/investor')}
            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', fontWeight: '800', border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            💼 Open My Portfolio Dashboard
          </button>
          <button
            onClick={() => router.push('/showcase')}
            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            🏗️ Browse Active Investment Deals
          </button>
        </div>
      </div>
    </div>
  );
}
