/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f1ecdf',
        surface: '#fbf9f3',
        ink: '#2a2620',
        inksoft: '#6b6255',
        inkfaint: '#9a8f7d',
        line: '#e3dbc8',
        linestrong: '#cfc4a8',
        accent: '#c97a1a',
        accentink: '#5c3a0a',
        accentsoft: '#f3ddb2',
        teal: '#1e4a48',
        tealsoft: '#dce9e8',
        good: '#3e7a52',
        goodbg: '#e3efe1',
        warn: '#a2531c',
        warnbg: '#f4e3cf',
        crit: '#9c3b32',
        critbg: '#f3ddd9',
      },
      fontFamily: {
        display: ['Georgia', '"Noto Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}
