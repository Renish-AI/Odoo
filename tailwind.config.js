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
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        aqua: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ocean-glow': '0 0 25px -5px rgba(14, 165, 233, 0.4)',
        'aqua-glow': '0 0 25px -5px rgba(34, 211, 238, 0.4)',
        'glass-ocean': '0 8px 32px 0 rgba(2, 44, 73, 0.35)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
        'ocean-dark': 'radial-gradient(ellipse at top, #0c4a6e 0%, #082f49 40%, #030712 100%)',
      }
    },
  },
  plugins: [],
}