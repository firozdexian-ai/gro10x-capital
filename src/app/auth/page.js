'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Mail, LogIn, UserPlus, ArrowRight, KeyRound, CheckCircle2, Bot } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

function AuthContent() {
  const searchParams = useSearchParams();
  const isOnboardParam = searchParams.get('onboard') === '1';
  const idParam = searchParams.get('id') || searchParams.get('email') || '';

  const [isOnboarding, setIsOnboarding] = useState(isOnboardParam);
  const [isLogin, setIsLogin] = useState(!isOnboardParam);
  const [identifier, setIdentifier] = useState(idParam);
  
  // 4-digit PIN for both Onboarding and Standard Login
  const [pin, setPin] = useState(['', '', '', '']);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // First login permanent PIN setup state
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [verifiedUserInfo, setVerifiedUserInfo] = useState(null);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const newPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const confirmPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (idParam) {
      setIdentifier(idParam);
    }
    if (isOnboardParam) {
      setIsOnboarding(true);
      setIsLogin(false);
    }
  }, [idParam, isOnboardParam]);

  useEffect(() => {
    if (user?.user_metadata?.first_login) {
      setIsFirstLogin(true);
    }
  }, [user]);

  const handlePinChange = (index, value, pinArray, setPinArray, refsArray) => {
    if (value && !/^\d+$/.test(value)) return;

    const updated = [...pinArray];
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 4).split('');
      for (let i = 0; i < 4; i++) {
        updated[i] = digits[i] || '';
      }
      setPinArray(updated);
      const nextIndex = Math.min(digits.length, 3);
      refsArray[nextIndex]?.current?.focus();
      return;
    }

    updated[index] = value;
    setPinArray(updated);

    if (value && index < 3) {
      refsArray[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e, pinArray, refsArray) => {
    if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
      refsArray[index - 1]?.current?.focus();
    }
  };

  // Helper to resolve Email from Email or Phone number
  const resolveTargetEmail = async (rawId) => {
    const cleanId = rawId.trim();
    if (cleanId.includes('@')) {
      return cleanId;
    }

    let phoneClean = cleanId.replace(/[\s\-\+\(\)]/g, '');
    if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);

    const { data: teamMembers } = await supabase.from('team').select('email, phone');
    if (teamMembers && teamMembers.length > 0) {
      const found = teamMembers.find(t => {
        let p = (t.phone || '').replace(/[\s\-\+\(\)]/g, '');
        if (p.startsWith('880')) p = '0' + p.slice(3);
        return p === phoneClean;
      });
      if (found && found.email) return found.email;
    }

    const { data: invs } = await supabase.from('investors').select('email, phone');
    if (invs && invs.length > 0) {
      const found = invs.find(i => {
        let p = (i.phone || '').replace(/[\s\-\+\(\)]/g, '');
        if (p.startsWith('880')) p = '0' + p.slice(3);
        return p === phoneClean;
      });
      if (found && found.email) return found.email;
    }

    return null;
  };

  // Telegram 4-Digit PIN Onboarding Auth
  const handleOnboardAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setErrorMsg('Please enter your 4-digit Telegram temporary PIN.');
      setLoading(false);
      return;
    }

    if (!identifier) {
      setErrorMsg('Please provide your registered Email or Phone number.');
      setLoading(false);
      return;
    }

    try {
      // 1. Server-side verification & credential synchronization
      const res = await fetch('/api/telegram-auth/verify-and-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier,
          temp_pin: pinString
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      const targetEmail = data.email;
      const authPassword = pinString ? `${pinString}00` : '';

      // 2. Sign in to Supabase Auth
      let { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: authPassword
      });

      if (signInErr) {
        // Fallback: try signUp if user does not exist in auth.users
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: targetEmail,
          password: authPassword,
          options: {
            data: { first_login: true, full_name: data.name }
          }
        });

        if (signUpErr) {
          throw new Error('Authentication failed. Please verify your temporary PIN or request a new one from Telegram.');
        }
      }

      // 3. Upsert user_roles
      const authUser = (await supabase.auth.getUser())?.data?.user;
      if (authUser) {
        await supabase.from('user_roles').upsert({
          user_id: authUser.id,
          role: data.role
        }, { onConflict: 'user_id' });
      }

      setVerifiedUserInfo({
        chatId: data.chatId,
        name: data.name,
        role: data.role
      });

      setIsFirstLogin(true);
      setSuccessMsg(`✓ Temporary PIN verified for ${data.name}! Please set your permanent 4-digit security PIN below.`);
    } catch (err) {
      setErrorMsg(err.message || 'Onboarding authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Normal Login Handler (4-digit PIN)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit PIN.');
      setLoading(false);
      return;
    }

    try {
      const targetEmail = await resolveTargetEmail(identifier);
      if (!targetEmail) {
        throw new Error(`Account not found for '${identifier}'. Please verify your email or phone number.`);
      }

      const authPassword = pinString ? `${pinString}00` : '';

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: authPassword,
        });
        if (error) throw error;

        if (data?.user?.user_metadata?.first_login) {
          setIsFirstLogin(true);
          setSuccessMsg('Temporary PIN accepted. Please configure your permanent 4-digit PIN.');
        } else {
          // Role-Aware Routing for standard login
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          let userRole = roleData?.role;

          // If not yet in user_roles, query team table fallback
          if (!userRole) {
            const { data: teamUser } = await supabase
              .from('team')
              .select('team_type')
              .eq('email', targetEmail)
              .maybeSingle();
            if (teamUser) userRole = teamUser.team_type;
          }

          if (userRole === 'promoter') router.push('/promoter');
          else if (userRole === 'kam') router.push('/kam-dashboard');
          else if (userRole === 'founder') router.push('/business');
          else if (userRole === 'investor') router.push('/investor');
          else router.push('/admin');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: targetEmail,
          password: authPassword,
        });
        if (error) throw error;

        if (data?.user) {
          await supabase.from('user_roles').insert([
            { user_id: data.user.id, role: 'investor' }
          ]);
        }

        setSuccessMsg('Account created successfully! Log in with your PIN.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your 4-digit PIN.');
    } finally {
      setLoading(false);
    }
  };

  // Set Permanent 4-Digit PIN Handler
  const handleSetNewPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const np = newPin.join('');
    const cp = confirmPin.join('');

    if (np.length !== 4 || cp.length !== 4) {
      setErrorMsg('Please enter complete 4-digit PINs.');
      setLoading(false);
      return;
    }

    if (np !== cp) {
      setErrorMsg('PINs do not match. Please verify.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: `${np}00`,
        data: { first_login: false }
      });
      if (updateErr) throw updateErr;

      // Send Telegram Confirmation Notification
      if (verifiedUserInfo?.chatId) {
        try {
          await fetch('/api/telegram-auth/notify-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_chat_id: verifiedUserInfo.chatId,
              user_name: verifiedUserInfo.name,
              bot_key: 'team'
            })
          });
        } catch (nErr) {
          console.error('Failed to dispatch telegram notification:', nErr);
        }
      }

      setSuccessMsg('✓ Permanent 4-Digit Security PIN set! Redirecting to GRO10X OS...');
      setTimeout(() => {
        const userRole = verifiedUserInfo?.role;
        if (userRole === 'promoter') router.push('/promoter');
        else if (userRole === 'kam') router.push('/kam-dashboard');
        else if (userRole === 'founder') router.push('/business');
        else if (userRole === 'investor') router.push('/investor-onboard');
        else router.push('/admin');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(20px)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#070a14', margin: '0 auto 1.25rem auto' }}>
            {isFirstLogin ? <KeyRound size={28} /> : isOnboarding ? <Bot size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            GRO10X <span style={{ color: '#D4AF37' }}>OS</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            {isFirstLogin 
              ? 'Final Step: Set Permanent 4-Digit PIN'
              : isOnboarding
                ? 'Telegram Temporary PIN Onboarding'
                : isLogin 
                  ? 'Secure Terminal Access via 4-Digit Security PIN' 
                  : 'Apply for Accredited Investor Account'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {/* STEP 2: FIRST LOGIN PERMANENT PIN SETUP */}
        {isFirstLogin ? (
          <form onSubmit={handleSetNewPin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>Set Permanent 4-Digit PIN</label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {newPin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={newPinRefs[idx]}
                    type="password"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, newPin, setNewPin, newPinRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, newPin, newPinRefs)}
                    style={{
                      width: '56px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      background: '#0f172a',
                      border: '1px solid rgba(212,175,55,0.4)',
                      borderRadius: '10px',
                      color: '#D4AF37',
                      outline: 'none'
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>Confirm Permanent PIN</label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {confirmPin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={confirmPinRefs[idx]}
                    type="password"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, confirmPin, confirmPinRefs)}
                    style={{
                      width: '56px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      background: '#0f172a',
                      border: '1px solid rgba(212,175,55,0.4)',
                      borderRadius: '10px',
                      color: '#D4AF37',
                      outline: 'none'
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                color: '#070a14', 
                padding: '0.9rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: '800', 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              <CheckCircle2 size={18} />
              {loading ? 'Activating Credentials...' : 'Activate Account & Enter System'}
            </button>
          </form>
        ) : isOnboarding ? (
          /* TELEGRAM 4-DIGIT TEMPORARY PIN ONBOARDING FORM */
          <form onSubmit={handleOnboardAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Registered Email or Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <Mail size={16} />
                </span>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input" 
                  placeholder="gro10xnow@gmail.com or 01708459008" 
                  style={{ paddingLeft: '2.5rem' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                4-Digit Temporary PIN (from Telegram Bot)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="password"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, pin, setPin, inputRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, pin, inputRefs)}
                    style={{
                      width: '56px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      background: '#0f172a',
                      border: '1px solid rgba(212,175,55,0.4)',
                      borderRadius: '10px',
                      color: '#D4AF37',
                      outline: 'none'
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37, #b48a1c)', 
                color: '#070a14', 
                padding: '0.9rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: '800', 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              <Bot size={18} />
              {loading ? 'Verifying PIN...' : 'Verify PIN & Complete Onboarding'}
            </button>
          </form>
        ) : (
          /* STANDARD 4-DIGIT PIN LOGIN FORM */
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Email or Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <Mail size={16} />
                </span>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input" 
                  placeholder="gro10xnow@gmail.com or 01708459008" 
                  style={{ paddingLeft: '2.5rem' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                4-Digit Permanent Security PIN
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="password"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, pin, setPin, inputRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, pin, inputRefs)}
                    style={{
                      width: '56px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      background: '#0f172a',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '10px',
                      color: '#D4AF37',
                      outline: 'none'
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37, #b48a1c)', 
                color: '#070a14', 
                padding: '0.9rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: '800', 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? 'Authenticating...' : (isLogin ? 'Secure Terminal Access' : 'Create Account')}
            </button>
          </form>
        )}

        {!isFirstLogin && (
          <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              {isOnboarding ? 'Have a permanent PIN already?' : 'Have a temporary Telegram PIN?'}
            </p>
            <button 
              onClick={() => { setIsOnboarding(!isOnboarding); setIsLogin(isOnboarding); setErrorMsg(null); setSuccessMsg(null); }}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
            >
              {isOnboarding ? "Switch to Permanent 4-Digit Login" : "Enter Telegram Temporary 4-Digit PIN"}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ background: '#070a14', minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>Loading Auth Terminal...</div>}>
      <AuthContent />
    </Suspense>
  );
}
