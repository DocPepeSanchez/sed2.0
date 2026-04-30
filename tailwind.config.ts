import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Renacimiento Maya / Yucatán 2024-2030.
        // Berry/Magenta — Pantone 7641 C — color primario (encabezados, barras superiores, acentos).
        berry: {
          50: '#fbe9ef',
          100: '#f4cad8',
          200: '#e493ae',
          300: '#d05c84',
          400: '#b6315f',
          500: '#970e48',
          600: '#7e0a3c',
          700: '#640730',
          800: '#4a0524',
          900: '#2f0317',
        },
        // Dorado — Pantone 7562 C — color secundario (líneas decorativas, separadores, acentos).
        dorado: {
          50: '#faf5ec',
          100: '#f1e6cd',
          200: '#e3cda0',
          300: '#d3b478',
          400: '#c2995c',
          500: '#a87d44',
          600: '#876237',
          700: '#684b2c',
          800: '#4d3722',
          900: '#2e2115',
        },
        // Fondos institucionales según manual.
        crema: {
          50: '#f7f5f1',
          100: '#efedea', // off-white
          200: '#e2ded7', // crema
          300: '#cdc7bb',
          400: '#b3aa9b',
          500: '#998d7c',
          600: '#7c7062',
          700: '#5e554b',
          800: '#403a32',
          900: '#231f1a',
        },
        // Aliases retro-compatibles para no romper componentes existentes.
        // ceeey-* → mapeado a berry; maya-* → mapeado a dorado.
        ceeey: {
          50: '#fbe9ef',
          100: '#f4cad8',
          200: '#e493ae',
          300: '#d05c84',
          400: '#b6315f',
          500: '#970e48',
          600: '#7e0a3c',
          700: '#640730',
          800: '#4a0524',
          900: '#2f0317',
        },
        maya: {
          50: '#faf5ec',
          100: '#f1e6cd',
          200: '#e3cda0',
          300: '#d3b478',
          400: '#c2995c',
          500: '#a87d44',
          600: '#876237',
          700: '#684b2c',
          800: '#4d3722',
          900: '#2e2115',
        },
      },
      fontFamily: {
        // Lato — tipografía complementaria del manual Renacimiento Maya.
        sans: ['var(--font-lato)', 'Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
