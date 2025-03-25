/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#F8FAFC',
        text: '#111827',
        primary: '#6366F1',
        secondary: '#F59E0B',
      },
      spacing: {
        '8': '8px', // Base unit for 8pt grid
      },
      maxWidth: {
        container: '1000px',
      },
    },
  },
  plugins: [],
} 