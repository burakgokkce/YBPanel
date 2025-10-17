/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e5e7ff',
          200: '#d0d4ff',
          300: '#b4bbff',
          400: '#9c9aff',
          500: '#8b7fff',
          600: '#5635D7',
          700: '#4c2db8',
          800: '#3d2494',
          900: '#341f77',
        },
        dark: {
          bg: '#24384D',
          card: '#2a4052',
          border: '#3a505e',
        },
        accent: '#5635D7',
        highlight: '#C5A3FF',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
