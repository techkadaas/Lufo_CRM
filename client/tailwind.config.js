/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090e',
          900: '#0b0f17',
          850: '#111726',
          800: '#161f33',
          700: '#1f2b45',
          600: '#2d3b59',
        },
        gold: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ebd3',
          300: '#edd9ae',
          400: '#e2c082',
          500: '#d5a356', // Atelier Luxury Gold
          600: '#be8741',
          700: '#9d6734',
          800: '#805230',
          900: '#69432a',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          900: '#064e3b',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        script: ['"Reenie Beanie"', '"Caveat"', '"Alex Brush"', '"Dancing Script"', 'cursive'],
        signature: ['"Reenie Beanie"', '"Caveat"', '"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(213, 163, 86, 0.25)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
