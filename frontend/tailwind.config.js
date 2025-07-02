/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb',     // Blue 600
        'primary-dark': '#1d4ed8', // Blue 700
        'secondary': '#f97316',   // Orange 500
        'accent': '#10b981',      // Emerald 500
        'dark': '#1f2937',        // Gray 800
        'dark-light': '#374151',  // Gray 700
        'light': '#f3f4f6',       // Gray 100
        'white': '#ffffff',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}