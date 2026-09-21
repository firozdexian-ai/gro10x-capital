'use client';

import React from 'react';

export function SkeletonLine({ width = '100%', height = '16px', borderRadius = '4px', style = {} }) {
  return (
    <div
      className="skeleton-row"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function CardSkeleton({ count = 1 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonLine width="35%" height="20px" borderRadius="6px" />
            <SkeletonLine width="20%" height="18px" borderRadius="12px" />
          </div>
          <SkeletonLine width="80%" height="28px" borderRadius="6px" />
          <SkeletonLine width="100%" height="45px" borderRadius="8px" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            <SkeletonLine width="100%" height="50px" borderRadius="8px" />
            <SkeletonLine width="100%" height="50px" borderRadius="8px" />
          </div>
          <SkeletonLine width="100%" height="42px" borderRadius="10px" style={{ marginTop: '0.5rem' }} />
        </div>
      ))}
    </div>
  );
}

export function MetricSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '1.25rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card"
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <SkeletonLine width="45%" height="14px" />
          <SkeletonLine width="70%" height="32px" borderRadius="6px" />
          <SkeletonLine width="55%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', width: '100%', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <SkeletonLine width="30%" height="24px" />
        <SkeletonLine width="20%" height="32px" borderRadius="8px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} width={`${100 / cols}%`} height="22px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  SkeletonLine,
  CardSkeleton,
  MetricSkeleton,
  TableSkeleton
};
