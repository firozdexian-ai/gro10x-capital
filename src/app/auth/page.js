'use client';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Mail, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); // Redirect to home/dashboard
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          // Optional: we can pass data to automatically create user_roles via trigger later,
          // or just rely on the AuthProvider fallback of 'investor' until an admin upgrades them.
        });
        if (error) throw error;
        
        // Auto-assign 'investor' role to new signups manually for now
        if (data?.user) {
          await supabase.from('user_roles').insert([
            { user_id: data.user.id, role: 'investor' }
          ]);
        }

        setSuccessMsg('Registration successful! Please check your email to verify your account.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative background glow */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(20px)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#070a14', margin: '0 auto 1.25rem auto' }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            {isLogin ? 'Secure Gateway for Accredited Investors & Partners' : 'Apply for Accredited Investor Access'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input" 
                placeholder="investor@domain.com" 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Secure Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
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
            {loading ? 'Authenticating...' : (isLogin ? 'Secure Login' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
          >
            {isLogin ? "Don't have an account? Apply for access" : "Already an investor? Secure Login"}
            <ArrowRight size={14} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
