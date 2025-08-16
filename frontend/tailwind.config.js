/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // we'll control dark mode via an <html class="dark">
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};