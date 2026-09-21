'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AsyncButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'gold', // 'gold' | 'outline' | 'danger' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  icon: Icon,
  className = '',
  style = {},
  ...rest
}) {
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px' };
      case 'lg':
        return { padding: '0.95rem 2rem', fontSize: '1.05rem', borderRadius: '14px' };
      case 'md':
      default:
        return { padding: '0.75rem 1.4rem', fontSize: '0.92rem', borderRadius: '10px' };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          background: 'transparent',
          color: '#D4AF37',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: 'none'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        };
      case 'gold':
      default:
        return {
          background: 'linear-gradient(135deg, #E6C657 0%, #B89028 100%)',
          color: '#070a14',
          border: 'none',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        fontWeight: '800',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        textDecoration: 'none',
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...style
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 17} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 17} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
