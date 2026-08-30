export const designSystem = {
  colors: {
    brand: {
      primary: '#43408C',
      primaryDark: '#2D2A6E',
      primaryLight: '#6A67A8',
      gold: '#C9A96A',
      goldLight: '#E8D5A3',
      goldDark: '#A8894A',
    },
    neutral: {
      white: '#FFFFFF',
      ivory: '#FAF9F6',
      cream: '#F5F0E8',
      charcoal: '#1A1A1A',
      darkGrey: '#2D2D2D',
      midGrey: '#4A4A4A',
      lightGrey: '#E5E0D8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #43408C 0%, #2D2A6E 40%, #1A1A2E 100%)',
      gold: 'linear-gradient(135deg, #C9A96A 0%, #E8D5A3 50%, #A8894A 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #FAF9F6 100%)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0,0,0,0.12)',
    }
  },
  typography: {
    serif: "'Playfair Display', Georgia, serif",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      h1: '4rem',
      h2: '3rem',
      h3: '2rem',
      h4: '1.5rem',
      body: '1rem',
      small: '0.875rem',
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  spacing: {
    section: '6rem',
    container: '2rem',
    card: '1.5rem',
    element: '1rem',
  },
  effects: {
    shadow: {
      sm: '0 2px 8px rgba(67, 64, 140, 0.08)',
      md: '0 8px 24px rgba(67, 64, 140, 0.12)',
      lg: '0 16px 48px rgba(67, 64, 140, 0.15)',
      gold: '0 8px 24px rgba(201, 169, 106, 0.2)',
    },
    blur: 'backdrop-filter: blur(12px);',
    radius: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      full: '9999px',
    }
  }
};
