export const colors = {
  background: '#020617',
  backgroundElevated: '#0f172a',
  card: 'rgba(15, 23, 42, 0.6)',
  cardSolid: '#0f172a',
  border: 'rgba(30, 41, 59, 0.8)',
  borderLight: 'rgba(255, 255, 255, 0.08)',

  primary: '#38bdf8',
  primaryHover: '#0ea5e9',
  secondary: '#818cf8',

  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textSecondary: '#cbd5f5',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',

  userBubble: 'rgba(56, 189, 248, 0.12)',
  botBubble: 'rgba(129, 140, 248, 0.08)',

  gradientStart: '#38bdf8',
  gradientEnd: '#818cf8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  fontFamily: 'System',
  heading: { fontWeight: '700' as const, letterSpacing: -0.5 },
  body: { fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontWeight: '400' as const, fontSize: 13, color: colors.textMuted },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
