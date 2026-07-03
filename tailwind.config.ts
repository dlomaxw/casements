import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Public marketing site palette (unchanged)
        brand: {
          50: '#f2f7fb',
          100: '#e2edf5',
          200: '#c0dcec',
          300: '#8fc2dd',
          400: '#57a3c9',
          500: '#3287b1',
          600: '#236c95',
          700: '#1e577a',
          800: '#1d4a66',
          900: '#1d3f56',
          950: '#132a3c',
        },
        accent: {
          400: '#f5b942',
          500: '#f0a821',
          600: '#d98e0f',
        },
        steel: {
          50: '#f6f7f8',
          100: '#eceef0',
          800: '#2d3743',
          900: '#1f2833',
          950: '#141b23',
        },

        // "Industrial Precision" design system — CRM / admin dashboard
        'industrial-blue': '#1a2c3d',
        'safety-orange': '#f39c12',
        'aluminum-silver': '#bdc3c7',
        primary: '#005018',
        'primary-container': '#006b23',
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
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        // Industrial Precision typography
        work: ['"Work Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
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
