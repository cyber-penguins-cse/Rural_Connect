/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde7c6',
          200: '#fbd48d',
          300: '#f9c154',
          400: '#f7ad1b',
          500: '#f59a00',
          600: '#e67e00',
          700: '#d46300',
          800: '#a84d00',
          900: '#7a3600',
        },
        accent: {
          50: '#fff5e6',
          100: '#ffebcc',
          200: '#ffd799',
          300: '#ffc366',
          400: '#ffaf33',
          500: '#ff9500',
          600: '#ff8500',
          700: '#e67400',
          800: '#b35a00',
          900: '#804000',
        },
        dark: {
          50: '#f5f5f5',
          100: '#ebebeb',
          200: '#d7d7d7',
          300: '#c3c3c3',
          400: '#afafaf',
          500: '#9b9b9b',
          600: '#656565',
          700: '#4f4f4f',
          800: '#373737',
          900: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
};
