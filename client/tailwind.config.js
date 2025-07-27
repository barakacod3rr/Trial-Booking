/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golf: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#89d089',
          400: '#4fb54f',
          500: '#2c5530',
          600: '#1e3a21',
          700: '#172d19',
          800: '#142516',
          900: '#111f13',
        }
      }
    },
  },
  plugins: [],
}