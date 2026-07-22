/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        iron: {
          900: "#0e0c0a",
          800: "#171411",
          700: "#1c1916",
          600: "#26221d",
          500: "#332d26",
          400: "#4a4238",
          300: "#6b6152",
        },
        ember: {
          600: "#ba7517",
          500: "#ef9f27",
          400: "#fac775",
          300: "#fbe3b5",
        },
        blood: {
          700: "#521b1b",
          600: "#791f1f",
          500: "#a32d2d",
          400: "#e24b4a",
          300: "#f09595",
        },
        steel: {
          500: "#378add",
          300: "#85b7eb",
        },
        moss: {
          700: "#27500a",
          500: "#639922",
          300: "#c0dd97",
        },
        bone: {
          100: "#f2ecdd",
          300: "#d8ceb8",
          500: "#a99f8a",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
      },
      keyframes: {
        numberIn: {
          "0%": { opacity: "0", transform: "translateY(-0.3em) scale(1.2)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        emberPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(239, 159, 39, 0.25)" },
          "50%": { boxShadow: "0 0 18px rgba(239, 159, 39, 0.55)" },
        },
        bloodPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(163, 45, 45, 0.3)" },
          "50%": { boxShadow: "0 0 18px rgba(163, 45, 45, 0.6)" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.85" },
          "25%": { opacity: "0.65" },
          "50%": { opacity: "1" },
          "75%": { opacity: "0.8" },
        },
      },
      animation: {
        "number-in": "numberIn 250ms ease-out",
        "ember-pulse": "emberPulse 2.2s ease-in-out infinite",
        "blood-pulse": "bloodPulse 2.2s ease-in-out infinite",
        flicker: "flicker 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
