import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
