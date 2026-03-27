/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#050505',
          secondary: '#0a0a0a',
          tertiary: '#141414',
        },
        border: {
          subtle: '#1a1a1a',
          default: '#262626',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1a1',
          tertiary: '#525252',
        },
        accent: {
          blue: '#3b82f6',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
