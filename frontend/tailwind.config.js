/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./Pages/**/*.{js,ts,jsx,tsx}",
    "./Layout/**/*.{js,ts,jsx,tsx}",
    "./UI/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}" // Catch-all for root level files
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',      // Primary CTA (Red-600)
          navy: '#0F172A',     // Dark Mode BG / Light Mode Text (Slate-900)
          blue: '#2563EB',     // Headers (Blue-600)
          teal: '#0D9488',     // Accents (Teal-600)
          gold: '#b45309',    // Amber 700
          light: '#FFFFFF',    // Light mode BG
          dark: '#020617'      // Deep Navy for Dark mode BG
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

