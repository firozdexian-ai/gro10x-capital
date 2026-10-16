'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#070a14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'grid',
              placeItems: 'center',
              color: '#ef4444',
              margin: '0 auto 1.5rem auto'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.6rem 0', color: '#f8fafc' }}>
              Critical Platform Hitch
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.75rem 0' }}>
              The application encountered a critical runtime exception in the root layout.
            </p>

            <button
              onClick={() => reset()}
              style={{
                background: '#D4AF37',
                color: '#070a14',
                fontWeight: '700',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} /> Recover Platform
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
