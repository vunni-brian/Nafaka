/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b7c6',
          400: '#848fa5',
          500: '#65718a',
          600: '#505a72',
          700: '#41495d',
          800: '#383f50',
          900: '#1f2330',
          950: '#13161f',
        },
        brand: {
          50: '#eefdf6',
          100: '#d6faea',
          200: '#aff3d7',
          300: '#7be8bd',
          400: '#3fd69b',
          500: '#19bd80',
          600: '#0d9a68',
          700: '#0c7a56',
          800: '#0d6147',
          900: '#0c4f3c',
          950: '#042c21',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#fddba8',
          300: '#f9bf71',
          400: '#f59938',
          500: '#f27d14',
          600: '#e0620a',
          700: '#bc4a0b',
          800: '#963a11',
          900: '#7a3212',
        },
        gold: {
          400: '#e6c34a',
          500: '#d4a82a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(19,22,31,0.08), 0 8px 32px -12px rgba(19,22,31,0.12)',
        card: '0 1px 3px rgba(19,22,31,0.06), 0 12px 28px -16px rgba(19,22,31,0.18)',
        glow: '0 0 0 1px rgba(25,189,128,0.18), 0 8px 30px -8px rgba(25,189,128,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 2s linear infinite',
      },
    },
  },
  plugins: [],
};
