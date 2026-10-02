/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gather: {
          canvas: "var(--canvas)",
          ink: "var(--ink)",
          muted: "var(--muted)",
          line: "var(--line)",
          lime: "var(--green)",
          forest: "var(--forest)",
          "forest-deep": "var(--forest-deep)",
        },
      },
      fontFamily: {
        body: ["DM Sans", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
}