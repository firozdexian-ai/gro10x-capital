// bKash-style Design Tokens for Telegram MiniApp
export const STYLES = {
  bg: '#0f1a2e',
  cardBg: '#1a2d4a',
  cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
  gold: '#f0b429',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  purple: '#a855f7',
  textMuted: '#94a3b8'
};

export const actionCircleStyle = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  padding: 0
};

export const circleIconStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  marginBottom: '0.35rem'
};

export const circleLabelStyle = {
  fontSize: '0.68rem',
  fontWeight: '700',
  color: '#fff'
};

export const navTabStyle = (active) => ({
  background: 'none',
  border: 'none',
  color: active ? STYLES.gold : STYLES.textMuted,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: '0.3rem 0'
});

export const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
};

export const modalNextBtn = {
  width: '100%',
  padding: '0.85rem',
  background: STYLES.blue,
  color: '#fff',
  fontWeight: '800',
  border: 'none',
  borderRadius: '12px',
  fontSize: '0.85rem',
  marginTop: '1rem',
  cursor: 'pointer'
};

export const modalBackBtn = {
  flex: 1,
  padding: '0.85rem',
  background: 'rgba(255,255,255,0.05)',
  color: STYLES.textMuted,
  fontWeight: '700',
  border: STYLES.cardBorder,
  borderRadius: '12px',
  fontSize: '0.85rem',
  cursor: 'pointer'
};

export const bottomNavStyle = (cols = 5) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(26, 45, 74, 0.95)',
  backdropFilter: 'blur(10px)',
  borderTop: STYLES.cardBorder,
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  paddingTop: '0.5rem',
  paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
  zIndex: 50
});
