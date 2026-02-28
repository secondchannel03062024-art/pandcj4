/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Magentish-Violet
        'magenta': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4ff',
          400: '#c084fc',
          500: '#a855f7',  // Primary magenta
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Olive-Green
        'olive': {
          50: '#fafaf9',
          100: '#f5f5f0',
          200: '#e7e5e0',
          300: '#d3cec5',
          400: '#a19a8f',
          500: '#7c7c3b',  // Primary olive
          600: '#6b6b2f',
          700: '#5a5a28',
          800: '#4a4a1f',
          900: '#3a3a15',
        },
        // Golden
        'golden': {
          50: '#fffbea',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Primary golden
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      backgroundImage: {
        'gradient-auth': 'linear-gradient(135deg, #a855f7 0%, #f59e0b 100%)',
        'gradient-text': 'linear-gradient(135deg, #a855f7 0%, #7c7c3b 50%, #f59e0b 100%)',
      },
    },
  },
  plugins: [],
}
