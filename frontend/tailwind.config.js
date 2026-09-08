/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#18181b',
          100: '#1e1e22',
          200: '#27272a',
          300: '#2e2e33',
          400: '#3f3f46',
          500: '#52525b',
          600: '#71717a',
          700: '#a1a1aa',
          800: '#d4d4d8',
          900: '#f4f4f5',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        gold: {
          300: '#d4a853',
          400: '#c9952e',
          500: '#b8860b',
          600: '#9a7209',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
