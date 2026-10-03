export const tokens = {
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
    borderHover: '#CBD5E1',
    text: {
      primary: '#0F172A',
      secondary: '#334155',
      muted: '#64748B',
      disabled: '#94A3B8',
    },
    status: {
      success: { bg: '#DCFCE7', text: '#15803D' },
      warn: { bg: '#FEF3C7', text: '#92400E' },
      danger: { bg: '#FEE2E2', text: '#991B1B' },
      info: { bg: '#EFF6FF', text: '#1E40AF' },
      neutral: { bg: '#F1F5F9', text: '#475569' },
    },
    notice: {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#92400E',
      icon: '#D97706',
    }
  },
  radii: {
    card: 36, // Outer card (theme.shape.borderRadius 12 * 3)
    tile: 24, // Inner tile (theme.shape.borderRadius 12 * 2)
    pill: 9999,
  },
  shadows: {
    primaryButton: '0 2px 6px rgba(37,99,235,0.2)',
    card: '0 1px 3px rgba(0,0,0,0.05)',
  }
};
