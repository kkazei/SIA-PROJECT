/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibrantGreen: '#32CD32', // A more vibrant green
        emeraldBright: '#00FF7F', // Bright emerald green
      },
      animation: {
        glow: 'glow 3s infinite ease-in-out',
      },
      keyframes: {
        glow: {
          '0%': { transform: 'translateY(-100%)', opacity: '0.5' },
          '50%': { transform: 'translateY(50%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}