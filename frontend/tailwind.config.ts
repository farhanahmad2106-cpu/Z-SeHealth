import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: "#8A9A5B",
        moss: "#6B7A3A",       // Darker green for high-contrast text
        terracotta: "#E2725B",   // Red-orange accent for warning chips
        cream: "#F9F9F6",        // Off-white organic background
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
} as Config