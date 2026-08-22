/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deepOcean: '#063B5C',
        oceanBlue: '#087EA4',
        aqua: '#12B8C4',
        turquoise: '#19C3B1',
        seafoam: '#DFF8F5',
        sky: '#E8F7FC',
        background: '#F5FBFD',
        navyText: '#073B4C',
        mutedText: '#62808C',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}
