'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'gold', // 'gold' | 'danger' | 'success'
  isLoading = false,
  children
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} style={{ color: '#ef4444' }} />,
          bg: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} style={{ color: '#10b981' }} />,
          bg: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'gold':
      default:
        return {
          icon: <Info size={24} style={{ color: '#D4AF37' }} />,
          bg: 'linear-gradient(135deg, #D4AF37, #8A6D1B)',
          color: '#070a14',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
          borderColor: 'rgba(212, 175, 55, 0.3)'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(7, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem',
          position: 'relative',
          border: `1px solid ${vStyles.borderColor}`,
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          animation: 'fadeSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        )}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}
          >
            {vStyles.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.4rem 0' }}>
              {title}
            </h3>
            {description && (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {children && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {children}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              background: vStyles.bg,
              color: vStyles.color,
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: vStyles.boxShadow,
              opacity: isLoading ? 0.75 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
