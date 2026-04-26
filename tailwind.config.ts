import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional CEEEY — colores con contraste AA verificado para WCAG 2.1.
        ceeey: {
          50: '#f3f7fb',
          100: '#dde8f3',
          200: '#b7cfe5',
          300: '#88aed1',
          400: '#5a8dba',
          500: '#3a72a3',
          600: '#2c5a85',
          700: '#26496c',
          800: '#1f3b58',
          900: '#162a40',
        },
        maya: {
          50: '#fbf7f0',
          100: '#f3e7d0',
          200: '#e6cf9e',
          300: '#d6b06a',
          400: '#c4944a',
          500: '#a87832',
          600: '#876028',
          700: '#684a23',
          800: '#4d361c',
          900: '#2f2113',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
