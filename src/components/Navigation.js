'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { CURRENCY_RATES } from '../lib/currency';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const { user, role, signOut } = useAuth();
  const [currency, setCurrency] = useState('BDT'); // Optional: Move this to a context if needed globally
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = (
    <>
      <Link href="/showcase" style={linkStyle('#D4AF37')} onClick={() => setIsMobileMenuOpen(false)}>⭐ Showcase</Link>

      {!user && (
        <Link href="/financial-model" style={linkStyle('#a855f7')} onClick={() => setIsMobileMenuOpen(false)}>📈 Financial Model</Link>
      )}

      {(role === 'investor' || role === 'admin') && (
        <>
          <Link href="/investor" style={linkStyle('#10b981')} onClick={() => setIsMobileMenuOpen(false)}>💼 Portfolio</Link>
          <Link href="/secondary-market" style={linkStyle('#3b82f6')} onClick={() => setIsMobileMenuOpen(false)}>🔄 Secondary Market</Link>
          <Link href="/legal-contracts" style={linkStyle('#D4AF37')} onClick={() => setIsMobileMenuOpen(false)}>📜 Contracts</Link>
        </>
      )}

      {(role === 'promoter' || role === 'admin') && (
        <>
          <Link href="/promoter" style={linkStyle('#f59e0b')} onClick={() => setIsMobileMenuOpen(false)}>🤝 CRM</Link>
          <Link href="/payouts" style={linkStyle('#f59e0b')} onClick={() => setIsMobileMenuOpen(false)}>💸 Payouts</Link>
        </>
      )}

      {(role === 'kam' || role === 'admin') && (
        <>
          <Link href="/kam-dashboard" style={linkStyle('#3b82f6')} onClick={() => setIsMobileMenuOpen(false)}>👨‍💼 Audits</Link>
          <Link href="/pos-sync" style={linkStyle('#10b981')} onClick={() => setIsMobileMenuOpen(false)}>📊 POS Sync</Link>
          <Link href="/fraud-detection" style={linkStyle('#ef4444')} onClick={() => setIsMobileMenuOpen(false)}>🛡️ Fraud Engine</Link>
          <Link href="/buildout-tracker" style={linkStyle('#10b981')} onClick={() => setIsMobileMenuOpen(false)}>🏗️ Buildout</Link>
        </>
      )}

      {role === 'admin' && (
        <>
          <Link href="/funding-rounds" style={linkStyle('#a855f7')} onClick={() => setIsMobileMenuOpen(false)}>🎯 Funding Rounds</Link>
          <Link href="/admin" style={{ ...linkStyle('#D4AF37'), background: 'rgba(212,175,55,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onClick={() => setIsMobileMenuOpen(false)}>⚡ Command Center</Link>
        </>
      )}

      {(role === 'founder' || role === 'admin') && (
        <>
          <Link href="/business" style={linkStyle('#10b981')} onClick={() => setIsMobileMenuOpen(false)}>🏢 Business Portal</Link>
        </>
      )}
    </>
  );

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 100, 
      background: 'rgba(7, 10, 20, 0.85)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.25rem' }}>
            G
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
              GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              v0.4.0 {role ? `• ${role.toUpperCase()}` : ''}
            </p>
          </div>
        </Link>
      </div>

      {!isMobile && (
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {navLinks}
        </nav>
      )}

      {/* CURRENCY SELECTOR & AUTH BUTTONS */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {!isMobile && (
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
        )}

        {user && <NotificationBell />}

        {user ? (
          <button onClick={signOut} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <LogOut size={14} /> {!isMobile && 'Sign Out'}
          </button>
        ) : (
          <Link href="/auth" style={{ background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: '800', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} /> {!isMobile && 'Login'}
          </Link>
        )}

        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.5rem', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {isMobile && isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(7, 10, 20, 0.95)', backdropFilter: 'blur(16px)', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
            <Globe size={16} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', outline: 'none', width: '100%' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>
          {navLinks}
        </div>
      )}
    </header>
  );
}

function linkStyle(color) {
  return { color: color, textDecoration: 'none', fontWeight: '600', fontSize: '1rem', display: 'block' };
}
