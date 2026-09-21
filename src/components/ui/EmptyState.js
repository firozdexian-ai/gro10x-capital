'use client';

import React from 'react';
import { AlertCircle, PlusCircle } from 'lucide-react';
import AsyncButton from './AsyncButton';

export default function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'There are currently no items to display.',
  actionText,
  onAction,
  actionIcon: ActionIcon = PlusCircle,
  secondaryActionText,
  onSecondaryAction,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        maxWidth: '560px',
        margin: '1.5rem auto',
        borderRadius: '16px',
        border: '1px dashed rgba(212, 175, 55, 0.25)',
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'grid',
          placeItems: 'center',
          color: '#D4AF37',
          marginBottom: '1.25rem'
        }}
      >
        <Icon size={26} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
        {title}
      </h3>

      <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', maxWidth: '420px', margin: '0 0 1.5rem 0' }}>
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionText && onAction && (
            <AsyncButton onClick={onAction} icon={ActionIcon} variant="gold">
              {actionText}
            </AsyncButton>
          )}
          {secondaryActionText && onSecondaryAction && (
            <AsyncButton onClick={onSecondaryAction} variant="outline">
              {secondaryActionText}
            </AsyncButton>
          )}
        </div>
      )}
    </div>
  );
}
