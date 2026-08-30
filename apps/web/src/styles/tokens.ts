export const tokens = {
  colors: {
    primary: '#43408C',
    primaryDark: '#332E6E',
    primaryLight: '#6A67A8',
    secondary: '#C9A96A',
    background: '#FAF9F6',
    backgroundWhite: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#4A4A4A',
    border: '#E5E0D8',
    success: '#2D7D46',
    error: '#B33A3A',
    warning: '#B8860B',
  },
  fonts: {
    serif: "'Playfair Display', Georgia, serif",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    20: '80px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
  }
} as const;

export type Tokens = typeof tokens;
