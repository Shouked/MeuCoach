/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        background: "#FFFFFF",
        card: "#F1F5F9",
        text: "#0F172A",
        border: "#E2E8F0",
        notification: "#EF4444",
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B"
      },
      fontFamily: {
        sans: ['Roboto_400Regular'],
        medium: ['Roboto_500Medium'],
        bold: ['Roboto_700Bold'],
      }
    },
  },
  plugins: [],
} 