/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#43408C',
        'primary-dark': '#2D2A6E',
        'primary-light': '#6A67A8',
        gold: '#C9A96A',
        'gold-light': '#E8D5A3',
        'gold-dark': '#A8894A',
        ivory: '#FAF9F6',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
