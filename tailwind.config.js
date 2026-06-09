/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FFFCF8',
          100: '#FBF7F0',
          200: '#F5EDE0',
          300: '#EDE0CC',
        },
        breakfast: { bg: '#FEF9EC', ring: '#F59E0B', text: '#92400E', pill: '#FDE68A' },
        lunch: { bg: '#FFF0E8', ring: '#FF6B2C', text: '#7C2D12', pill: '#FED7AA' },
        dinner: { bg: '#EEF2FF', ring: '#6366F1', text: '#3730A3', pill: '#C7D2FE' },
        primary: {
          50:  '#FFF4EE',
          100: '#FFE4D0',
          200: '#FFC4A0',
          400: '#FF8C52',
          DEFAULT: '#FF6B2C',
          600: '#E55A1C',
          800: '#A03A0C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FFF9F3',
          dark: '#1C1C1E',
          'dark-secondary': '#2C2C2E',
        },
        accent: {
          coral: '#FF7979',
          mint: '#5AD2A0',
          sky: '#56B4F9',
          violet: '#9B6DFF',
          lemon: '#FFD93D',
          peach: '#FFB088',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
        '6xl': '48px',
      },
      boxShadow: {
        'soft':    '0 2px 8px rgba(28, 20, 10, 0.06)',
        'card':    '0 4px 16px rgba(28, 20, 10, 0.08)',
        'card-hover': '0 8px 25px -3px rgba(0,0,0,0.08)',
        arty: '0 14px 40px -8px rgba(255, 107, 44, 0.18)',
        'arty-sm': '0 6px 20px -3px rgba(255, 107, 44, 0.12)',
        'lifted':  '0 8px 28px rgba(28, 20, 10, 0.12)',
        'orange':  '0 6px 20px rgba(255, 107, 44, 0.22)',
        'float':   '0 -2px 24px rgba(28, 20, 10, 0.08), 0 2px 8px rgba(28, 20, 10, 0.04)',
        glow: '0 0 30px -5px rgba(255, 107, 44, 0.25)',
        'inset-sm':'inset 0 1px 3px rgba(28, 20, 10, 0.06)',
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out',
        bounceSoft: 'bounceSoft 2s infinite ease-in-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scaleIn: 'scaleIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        slideUp: 'slideUp 0.4s ease-out',
        wiggle: 'wiggle 0.6s ease-in-out',
        'press':      'press 0.1s ease-out forwards',
        'bounce-in':  'bounceIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up':    'fadeUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        press: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.965)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
