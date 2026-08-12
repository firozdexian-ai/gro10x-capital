'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { CURRENCY_RATES } from '../lib/currency';
import NotificationBell from './NotificationBell';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, role, signOut } = useAuth();
  const [currency, setCurrency] = useState('BDT');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── ROLE-SPECIFIC NAV LINKS ─────────────────────────────────────────────────
  // Admin: sidebar handles full navigation — show only 2 clean shortcuts
  // Each other role: show only their own portal links (not all roles combined)

  const adminLinks = (
    <>
      <Link href="/showcase" style={linkStyle('#D4AF37')} onClick={() => setIsMobileMenuOpen(false)}>
        Showcase
      </Link>
      <Link href="/admin" style={activeLink(pathname === '/admin')} onClick={() => setIsMobileMenuOpen(false)}>
        ⚡ Command Center
      </Link>
    </>
  );

  const investorLinks = (
    <>
      <Link href="/showcase"    style={linkStyle('#D4AF37')}  onClick={() => setIsMobileMenuOpen(false)}>Showcase</Link>
      <Link href="/investor"    style={linkStyle('#10b981')}  onClick={() => setIsMobileMenuOpen(false)}>💼 Portfolio</Link>
      <Link href="/secondary-market" style={linkStyle('#3b82f6')} onClick={() => setIsMobileMenuOpen(false)}>🔄 Secondary Market</Link>
      <Link href="/legal-contracts"  style={linkStyle('#D4AF37')} onClick={() => setIsMobileMenuOpen(false)}>📜 Contracts</Link>
      <Link href="/cash-concierge"   style={linkStyle('#a855f7')} onClick={() => setIsMobileMenuOpen(false)}>💎 Concierge</Link>
    </>
  );

  const kamLinks = (
    <>
      <Link href="/showcase"        style={linkStyle('#D4AF37')}  onClick={() => setIsMobileMenuOpen(false)}>Showcase</Link>
      <Link href="/kam-dashboard"   style={linkStyle('#3b82f6')}  onClick={() => setIsMobileMenuOpen(false)}>📋 Dashboard</Link>
      <Link href="/pos-sync"        style={linkStyle('#10b981')}  onClick={() => setIsMobileMenuOpen(false)}>📊 POS Sync</Link>
      <Link href="/fraud-detection" style={linkStyle('#ef4444')}  onClick={() => setIsMobileMenuOpen(false)}>🛡️ Fraud</Link>
      <Link href="/buildout-tracker" style={linkStyle('#10b981')} onClick={() => setIsMobileMenuOpen(false)}>🏗️ Buildout</Link>
    </>
  );

  const promoterLinks = (
    <>
      <Link href="/showcase"  style={linkStyle('#D4AF37')}  onClick={() => setIsMobileMenuOpen(false)}>Showcase</Link>
      <Link href="/promoter"  style={linkStyle('#f59e0b')}  onClick={() => setIsMobileMenuOpen(false)}>🤝 My Hub</Link>
      <Link href="/payouts"   style={linkStyle('#f59e0b')}  onClick={() => setIsMobileMenuOpen(false)}>💸 Payouts</Link>
    </>
  );

  const founderLinks = (
    <>
      <Link href="/showcase"  style={linkStyle('#D4AF37')}  onClick={() => setIsMobileMenuOpen(false)}>Showcase</Link>
      <Link href="/business"  style={linkStyle('#10b981')}  onClick={() => setIsMobileMenuOpen(false)}>🏢 Business Portal</Link>
    </>
  );

  const publicLinks = (
    <>
      <Link href="/showcase"         style={linkStyle('#D4AF37')}  onClick={() => setIsMobileMenuOpen(false)}>Showcase</Link>
      <Link href="/financial-model"  style={linkStyle('#a855f7')}  onClick={() => setIsMobileMenuOpen(false)}>📈 Financial Model</Link>
    </>
  );

  const navLinks = role === 'admin'    ? adminLinks
                 : role === 'investor' ? investorLinks
                 : role === 'kam'      ? kamLinks
                 : role === 'promoter' ? promoterLinks
                 : role === 'founder'  ? founderLinks
                 : publicLinks;

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.75rem 2rem', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 100, 
      background: 'rgba(7, 10, 20, 0.92)', 
      backdropFilter: 'blur(14px)', 
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: '64px'
    }}>
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#070a14', fontWeight: '900', fontSize: '1.2rem', flexShrink: 0 }}>
            G
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
            </h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              v0.4.0{role ? ` • ${role.toUpperCase()}` : ''}
            </p>
          </div>
        </Link>
      </div>

      {/* NAV LINKS — desktop only, role-scoped */}
      {!isMobile && (
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {navLinks}
        </nav>
      )}

      {/* RIGHT CONTROLS */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', padding: '0.3rem 0.65rem', borderRadius: '8px' }}>
            <Globe size={14} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', outline: 'none' }}
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
          <button 
            onClick={signOut} 
            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <LogOut size={13} /> {!isMobile && 'Sign Out'}
          </button>
        ) : (
          <Link 
            href="/auth" 
            style={{ background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)', color: '#070a14', padding: '0.45rem 1.1rem', borderRadius: '8px', fontWeight: '800', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <User size={14} /> {!isMobile && 'Login'}
          </Link>
        )}

        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.5rem', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* MOBILE DRAWER */}
      {isMobile && isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(7, 10, 20, 0.97)', backdropFilter: 'blur(16px)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <Globe size={14} style={{ color: '#D4AF37' }} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', outline: 'none', width: '100%' }}
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
  return { 
    color: color, 
    textDecoration: 'none', 
    fontWeight: '600', 
    fontSize: '0.88rem', 
    padding: '0.4rem 0.75rem', 
    borderRadius: '7px', 
    whiteSpace: 'nowrap',
    transition: 'background 0.15s'
  };
}

function activeLink(isActive) {
  return {
    ...linkStyle('#D4AF37'),
    background: isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
    border: isActive ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
  };
}
