/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          900: "#0b0e16",
          800: "#10131c",
          700: "#171c29",
          600: "#1b2130",
          500: "#232a3d",
          400: "#2b3450",
        },
        arcane: {
          600: "#534ab7",
          500: "#7f77dd",
          300: "#afa9ec",
          200: "#cecbf6",
        },
        rune: {
          500: "#1d9e75",
          300: "#5dcaa5",
        },
        emberx: {
          500: "#d85a30",
          300: "#f0997b",
        },
        sky: {
          500: "#378add",
          300: "#85b7eb",
        },
        rose: {
          500: "#993556",
          300: "#ed93b1",
        },
        mist: {
          100: "#e8eaf2",
          300: "#b8bdd0",
          500: "#7d84a0",
        },
      },
      fontFamily: {
        display: ["'Chakra Petch'", "system-ui", "sans-serif"],
      },
      keyframes: {
        numberIn: {
          "0%": { opacity: "0", transform: "scale(1.35)" },
          "60%": { transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        popIn: {
          "0%": { transform: "scale(1.1)" },
          "55%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        runePulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(93, 202, 165, 0.25)" },
          "50%": { boxShadow: "0 0 18px rgba(93, 202, 165, 0.55)" },
        },
        rosePulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(237, 147, 177, 0.25)" },
          "50%": { boxShadow: "0 0 18px rgba(237, 147, 177, 0.5)" },
        },
        glowDrift: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "number-in": "numberIn 260ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pop-in": "popIn 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "rune-pulse": "runePulse 2.4s ease-in-out infinite",
        "rose-pulse": "rosePulse 2.4s ease-in-out infinite",
        "glow-drift": "glowDrift 3.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
