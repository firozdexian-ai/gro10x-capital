'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, ShieldAlert, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      background: '#070a14',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{ maxWidth: '520px', padding: '3rem 2rem', border: '1px solid rgba(212,175,55,0.3)', background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(7,10,20,0.95) 100%)', borderRadius: '20px' }}>
        
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem auto', color: '#D4AF37' }}>
          <ShieldAlert size={32} />
        </div>

        <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#D4AF37', lineHeight: 1, letterSpacing: '-0.03em', display: 'block', marginBottom: '0.5rem' }}>
          404
        </span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0' }}>
          Resource Not Found
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
          The requested page or terminal route could not be located on the GRO10X Capital network.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}>
            <Home size={15} /> Platform Home
          </Link>
          <Link href="/showcase" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.85rem', padding: '0.6rem 1.25rem', fontWeight: '700' }}>
            <Sparkles size={15} /> Active Deals
          </Link>
        </div>

      </div>
    </div>
  );
}
