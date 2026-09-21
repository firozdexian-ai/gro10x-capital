'use client';

import React from 'react';

/**
 * Converts a BDT number into a human-readable Bangladeshi Lakh / Crore string.
 * e.g. 500000 -> "5 Lakh BDT"
 *      20000000 -> "2 Crore BDT"
 *      2500000 -> "25 Lakh BDT"
 */
export function formatLakhCrore(amount) {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return '';

  if (num >= 10000000) {
    const crore = num / 10000000;
    return `${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore BDT`;
  } else if (num >= 100000) {
    const lakh = num / 100000;
    return `${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh BDT`;
  } else if (num >= 1000) {
    const k = num / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K BDT`;
  }
  return `${num.toLocaleString('en-IN')} BDT`;
}

export default function CurrencyInput({
  label = 'Investment Amount',
  value,
  onChange,
  min,
  max,
  step = 50000,
  placeholder = 'e.g. 500,000',
  quickChips = [500000, 1000000, 2500000, 5000000],
  required = false,
  error = '',
  helperText = '',
  disabled = false
}) {
  const numericVal = Number(value) || 0;
  const lakhCroreText = formatLakhCrore(numericVal);

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw);
  };

  const handleChipClick = (amount) => {
    onChange(String(amount));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          {lakhCroreText && (
            <span
              style={{
                fontSize: '0.78rem',
                color: '#D4AF37',
                fontWeight: '700',
                background: 'rgba(212, 175, 55, 0.12)',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              ৳ {numericVal.toLocaleString('en-IN')} ({lakhCroreText})
            </span>
          )}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <span
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#D4AF37',
            fontWeight: '800',
            fontSize: '1.05rem',
            pointerEvents: 'none'
          }}
        >
          ৳
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value ? Number(value).toLocaleString('en-IN') : ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="form-input"
          style={{
            paddingLeft: '2.5rem',
            fontWeight: '700',
            fontSize: '1.05rem',
            color: '#ffffff',
            borderColor: error ? 'rgba(239, 68, 68, 0.6)' : undefined,
            background: disabled ? 'rgba(15, 23, 42, 0.5)' : 'rgba(15, 23, 42, 0.9)'
          }}
        />
      </div>

      {/* Quick Amount Chips */}
      {quickChips && quickChips.length > 0 && !disabled && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
          {quickChips.map((chip) => {
            const isSelected = numericVal === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                style={{
                  background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isSelected ? '#D4AF37' : '#94a3b8',
                  padding: '0.22rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ৳{formatLakhCrore(chip).replace(' BDT', '')}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.1rem' }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '0.1rem' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
