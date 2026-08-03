import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Public marketing site — Casements green/yellow brand.
        // `brand` = green ramp (was blue); `accent` = brand yellow.
        brand: {
          50: '#e8f4ec',   // brand-green-light
          100: '#cbe6d5',
          200: '#a3d4b5',
          300: '#72bd92',
          400: '#3f9d68',
          500: '#1f7a3d',  // brand-green (primary)
          600: '#1a6a35',
          700: '#14572c',  // brand-green-dark
          800: '#123f22',
          900: '#0f2f1b',
          950: '#0a1f12',  // near-black green (dark sections)
        },
        accent: {
          400: '#ffc933',
          500: '#f5b800',  // brand-yellow
          600: '#d99f00',
        },
        // Warm neutral "steel" surfaces (light backgrounds)
        steel: {
          50: '#f7f8f6',
          100: '#eef0ec',
          800: '#2a2f29',
          900: '#1a1e19',
          950: '#101010',  // brand-black
        },

        // CRM / admin dashboard — aligned to the Casements green/yellow brand
        'industrial-blue': '#101010',   // near-black headings (matches public steel-950)
        'safety-orange': '#f5b800',     // brand yellow accent
        'aluminum-silver': '#bdc3c7',
        primary: '#1f7a3d',             // brand green
        'primary-container': '#14572c', // brand green dark
        'on-primary': '#ffffff',
        'on-primary-container': '#8ee991',
        secondary: '#705d00',
        'secondary-container': '#fce17e',
        'secondary-fixed-dim': '#dfc566',
        'on-secondary-container': '#766307',
        tertiary: '#444546',
        'tertiary-container': '#5c5c5d',
        surface: '#f1fdeb',
        'surface-dim': '#d1decc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#ebf7e5',
        'surface-container': '#e5f2e0',
        'surface-container-high': '#e0ecda',
        'surface-container-highest': '#dae6d4',
        'on-surface': '#141e13',
        'on-surface-variant': '#3f493e',
        outline: '#6f7a6d',
        'outline-variant': '#bfcaba',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        // CRM headings now use DM Sans (matches the public brand); mono for labels
        work: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
