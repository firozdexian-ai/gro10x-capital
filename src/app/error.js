'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled platform error caught by boundary:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#070a14',
        color: '#f8fafc'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          borderRadius: '20px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'grid',
            placeItems: 'center',
            color: '#ef4444',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.6rem 0', color: '#f8fafc' }}>
          System Experience Guard
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.75rem 0' }}>
          We encountered an unexpected operational hitch while rendering this page. Our telemetry has logged the issue for immediate review.
        </p>

        {error?.message && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              color: '#fca5a5',
              fontFamily: 'monospace',
              textAlign: 'left',
              marginBottom: '1.75rem',
              overflowX: 'auto'
            }}
          >
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn-gold"
            style={{
              fontSize: '0.9rem',
              padding: '0.75rem 1.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={16} /> Try Again
          </button>

          <Link
            href="/"
            className="btn-outline"
            style={{
              fontSize: '0.9rem',
              padding: '0.75rem 1.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none'
            }}
          >
            <Home size={16} /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
