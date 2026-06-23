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
        display: ['Bree Serif', 'Georgia', 'serif'],   // headings, amounts, page titles
        sans:    ['Nunito', 'system-ui', 'sans-serif'], // body, labels, buttons
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
        'neu':          '6px 6px 14px #e4dcd2, -6px -6px 14px #ffffff',
        'neu-sm':       '3px 3px 8px #e4dcd2, -3px -3px 8px #ffffff',
        'neu-lg':       '10px 10px 24px #ddd4c8, -10px -10px 24px #ffffff',
        'neu-inset':    'inset 4px 4px 10px #e4dcd2, inset -4px -4px 10px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 6px #e4dcd2, inset -2px -2px 6px #ffffff',
        'neu-orange':   '6px 6px 14px #e4dcd2, -6px -6px 14px #ffffff, 0 0 0 2.5px #FF6B2C',
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
        'slide-up':   'slideUpFade 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pop-in':     'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer':    'shimmer 2s linear infinite',
        'wiggle':     'wiggle 0.4s ease-in-out',
        'count-up':   'countUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'morph-blob': 'morphBlob 8s ease-in-out infinite',
        'ripple':     'ripple 0.5s ease-out forwards',
        'bubblePop':  'bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-label': 'fadeLabel 200ms ease-out forwards',
        'pulse-daylight': 'pulseDaylight 4s ease-in-out infinite',
        'shimmer-night':  'shimmerNight 5s ease-in-out infinite',
        'order-confirm': 'orderConfirm 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'skip-shake':    'skipShake 0.35s ease-in-out',
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
        slideUpFade: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.88)', opacity: '0' },
          '60%':  { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        countUp: {
          '0%':   { transform: 'translateY(8px)',  opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        morphBlob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)',   opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0'   },
        },
        bubblePop: {
          '0%':   { transform: 'scale(0.65) translateY(10px)', opacity: '0.5'  },
          '55%':  { transform: 'scale(1.12) translateY(-3px)', opacity: '1'    },
          '80%':  { transform: 'scale(0.97) translateY(0)',    opacity: '1'    },
          '100%': { transform: 'scale(1)    translateY(0)',    opacity: '1'    },
        },
        fadeLabel: {
          '0%':   { opacity: '0', transform: 'translateX(-4px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'     },
        },
        pulseDaylight: {
          '0%, 100%': { filter: 'brightness(1) saturate(1)'    },
          '50%':      { filter: 'brightness(1.08) saturate(1.15)' },
        },
        shimmerNight: {
          '0%, 100%': { filter: 'brightness(0.96) hue-rotate(0deg)'  },
          '50%':      { filter: 'brightness(1.04) hue-rotate(-4deg)' },
        },
        orderConfirm: {
          '0%':   { transform: 'scale(1)'     },
          '30%':  { transform: 'scale(0.94)'   },
          '55%':  { transform: 'scale(1.04)'   },
          '100%': { transform: 'scale(1)'      },
        },
        skipShake: {
          '0%, 100%': { transform: 'translateX(0)'   },
          '20%':      { transform: 'translateX(-4px)' },
          '40%':      { transform: 'translateX(3px)'  },
          '60%':      { transform: 'translateX(-2px)' },
          '80%':      { transform: 'translateX(1px)'  },
        },
      },
    },
  },
  plugins: [],
}
