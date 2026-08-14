'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Globe, LogOut, User, Menu, X, Search } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { CURRENCY_RATES } from '../lib/currency';
import NotificationBell from './NotificationBell';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// ── Role accent colours ───────────────────────────────────────────────────────
const ROLE_COLOR = {
  investor: '#10b981',
  kam:      '#3b82f6',
  promoter: '#f59e0b',
  founder:  '#a855f7',
  admin:    '#D4AF37',
};

// ── Per-role portal tab definitions ──────────────────────────────────────────
const ROLE_TABS = {
  investor: [
    { href: '/investor',          label: 'Portfolio',    icon: '💼' },
    { href: '/secondary-market',  label: 'Market',       icon: '🔄' },
    { href: '/legal-contracts',   label: 'Contracts',    icon: '📜' },
    { href: '/cash-concierge',    label: 'Concierge',    icon: '💎' },
    { href: '/showcase',          label: 'Showcase',     icon: '⭐' },
  ],
  kam: [
    { href: '/kam-dashboard',     label: 'Dashboard',   icon: '📋' },
    { href: '/pos-sync',          label: 'POS Sync',    icon: '📊' },
    { href: '/fraud-detection',   label: 'Fraud',       icon: '🛡️' },
    { href: '/buildout-tracker',  label: 'Buildout',    icon: '🏗️' },
    { href: '/showcase',          label: 'Showcase',    icon: '⭐' },
  ],
  promoter: [
    { href: '/promoter',  label: 'My Hub',   icon: '🤝' },
    { href: '/payouts',   label: 'Payouts',  icon: '💸' },
    { href: '/showcase',  label: 'Showcase', icon: '⭐' },
  ],
  founder: [
    { href: '/business',  label: 'Business Portal', icon: '🏢' },
    { href: '/showcase',  label: 'Showcase',        icon: '⭐' },
  ],
};

const PUBLIC_TABS = [
  { href: '/showcase', label: 'Showcase', icon: '⭐' },
];

// ── Pill nav link (non-admin roles) ──────────────────────────────────────────
function PillLink({ href, icon, label, color, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.38rem 0.85rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontWeight: isActive ? '700' : '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.18s ease',
    border: isActive
      ? `1px solid ${color}66`
      : hovered
        ? '1px solid rgba(255,255,255,0.1)'
        : '1px solid transparent',
    background: isActive
      ? `${color}1a`
      : hovered
        ? 'rgba(255,255,255,0.05)'
        : 'transparent',
    color: isActive ? color : hovered ? '#e2e8f0' : '#94a3b8',
    boxShadow: isActive ? `0 0 14px ${color}20` : 'none',
  };

  return (
    <Link
      href={href}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      {label}
    </Link>
  );
}

// ── Admin global search bar ───────────────────────────────────────────────────
function AdminSearchBar() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const router                  = useRouter();
  const ref                     = useRef(null);
  const debounceRef             = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const pattern = `%${q}%`;
      const [{ data: invs }, { data: deals }, { data: leads }] = await Promise.all([
        supabase.from('investors').select('id, alias_name, full_name, phone').or(`alias_name.ilike.${pattern},full_name.ilike.${pattern},phone.ilike.${pattern}`).limit(3),
        supabase.from('funding_projects').select('id, project_title').ilike('project_title', pattern).limit(2),
        supabase.from('inquiry_leads').select('id, name, phone').or(`name.ilike.${pattern},phone.ilike.${pattern}`).limit(2),
      ]);

      const combined = [
        ...(invs  || []).map(r => ({ type: 'investor', label: r.alias_name || r.full_name, sub: r.phone || '', id: r.id, icon: '👤' })),
        ...(deals || []).map(r => ({ type: 'deal',     label: r.project_title,              sub: 'Active Deal',   id: r.id, icon: '📊' })),
        ...(leads || []).map(r => ({ type: 'lead',     label: r.name,                       sub: r.phone || '',   id: r.id, icon: '📥' })),
      ];
      setResults(combined);
      setOpen(combined.length > 0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const handleSelect = (result) => {
    setOpen(false);
    setQuery('');
    if (result.type === 'investor') router.push(`/admin?tab=investors`);
    else if (result.type === 'deal')  router.push(`/admin?tab=pipeline`);
    else if (result.type === 'lead')  router.push(`/admin?tab=leads`);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: '460px', margin: '0 2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${open ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        padding: '0.4rem 0.9rem',
        transition: 'border-color 0.2s',
        boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.08)' : 'none',
      }}>
        <Search size={15} style={{ color: loading ? '#D4AF37' : '#475569', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search investors, deals, leads..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#f1f5f9', fontSize: '0.85rem', width: '100%',
            '::placeholder': { color: '#475569' }
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* RESULTS DROPDOWN */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 999,
          background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.7rem 1rem', background: 'transparent', border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>{r.icon}</span>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: '600' }}>{r.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{r.sub} · {r.type}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Navigation ───────────────────────────────────────────────────────────
export default function Navigation() {
  const { user, role, signOut } = useAuth();
  const [currency, setCurrency]       = useState('BDT');
  const [isMobileMenuOpen, setMobile] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobile(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const color = ROLE_COLOR[role] || '#D4AF37';
  const tabs  = role && ROLE_TABS[role] ? ROLE_TABS[role] : (!user ? PUBLIC_TABS : null);

  const pillNav = tabs && (
    <nav style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
      {tabs.map(t => (
        <PillLink
          key={t.href}
          href={t.href}
          icon={t.icon}
          label={t.label}
          color={color}
          isActive={pathname === t.href || (t.href !== '/' && pathname?.startsWith(t.href))}
          onClick={() => setMobile(false)}
        />
      ))}
    </nav>
  );

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '0 1rem' : '0 2rem',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      height: '62px',
      background: 'rgba(7, 10, 20, 0.94)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(212,175,55,0.12)',
    }}>

      {/* LOGO */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
          borderRadius: '9px', display: 'grid', placeItems: 'center',
          color: '#070a14', fontWeight: '900', fontSize: '1.1rem',
        }}>G</div>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc', lineHeight: 1.1 }}>
            GRO10X <span style={{ color: '#D4AF37' }}>CAPITAL</span>
          </div>
          <div className="hide-mobile" style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            v0.5.5{role ? ` • ${role.toUpperCase()}` : ''}
          </div>
        </div>
      </Link>

      {/* CENTER — Admin gets search bar, everyone else gets pill tabs */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {role === 'admin' ? (
            <AdminSearchBar />
          ) : (
            pillNav
          )}
        </div>
      )}

      {/* RIGHT CONTROLS */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
            padding: '0.28rem 0.6rem', borderRadius: '7px',
          }}>
            <Globe size={13} style={{ color: '#D4AF37' }} />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', outline: 'none' }}
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
            style={{
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              padding: '0.35rem 0.8rem',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.8rem', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
          >
            <LogOut size={13} />
            {!isMobile && 'Sign Out'}
          </button>
        ) : (
          <Link
            href="/auth"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
              color: '#070a14',
              padding: '0.38rem 1rem',
              borderRadius: '7px',
              fontWeight: '800',
              textDecoration: 'none',
              fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              whiteSpace: 'nowrap',
            }}
          >
            <User size={13} />
            {!isMobile && 'Login'}
          </Link>
        )}

        {isMobile && (
          <button
            onClick={() => setMobile(!isMobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.4rem', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* MOBILE DRAWER */}
      {isMobile && isMobileMenuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(7, 10, 20, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '1.25rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.25s ease-out forwards',
        }}>
          {/* Mobile currency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
            <Globe size={15} style={{ color: '#D4AF37' }} />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', outline: 'none', width: '100%' }}
            >
              {Object.keys(CURRENCY_RATES).map(code => (
                <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                  {CURRENCY_RATES[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile nav tabs */}
          {tabs && tabs.map(t => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMobile(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: '10px',
                  textDecoration: 'none',
                  background: isActive ? `${color}20` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? `${color}55` : 'rgba(255,255,255,0.05)'}`,
                  color: isActive ? color : '#cbd5e1',
                  fontWeight: isActive ? '800' : '500',
                  fontSize: '0.92rem',
                  boxShadow: isActive ? `0 0 16px ${color}15` : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{t.icon}</span> {t.label}
              </Link>
            );
          })}

          {/* Admin mobile: link to admin panel */}
          {role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobile(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '10px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37',
                fontWeight: '800',
                fontSize: '0.92rem',
                boxShadow: '0 0 20px rgba(212,175,55,0.15)',
              }}
            >
              ⚡ Master Command Center
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
