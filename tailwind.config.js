/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fbf6e9",
          100: "#f3ead3",
          200: "#ede2c4",
          300: "#e2d3ac",
          400: "#d4c08d",
          500: "#c9b98f",
        },
        ink: {
          900: "#2a2118",
          700: "#443626",
          500: "#5f4c33",
          300: "#8a7250",
        },
        wax: {
          700: "#6e1f1f",
          500: "#a83232",
          300: "#c97b7b",
        },
        forest: {
          700: "#2f4a1e",
          500: "#4a6b2a",
          300: "#8fae6b",
        },
        gilt: {
          600: "#8a6a1f",
          500: "#b08d2f",
          300: "#d9bc6b",
        },
        azure: {
          600: "#1f4e79",
          400: "#4a7bb0",
        },
      },
      fontFamily: {
        display: ["'IM Fell English'", "Georgia", "serif"],
      },
      keyframes: {
        numberIn: {
          "0%": { opacity: "0", transform: "translateY(0.2em) rotate(-2deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
        },
        inkStamp: {
          "0%": {
            transform: "scale(1.15)",
            boxShadow: "0 0 0 0 rgba(68, 54, 38, 0.35)",
          },
          "60%": { transform: "scale(0.97)" },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 12px rgba(68, 54, 38, 0)",
          },
        },
        quillFade: {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "number-in": "numberIn 280ms ease-out",
        "ink-stamp": "inkStamp 350ms ease-out",
        "quill-fade": "quillFade 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
