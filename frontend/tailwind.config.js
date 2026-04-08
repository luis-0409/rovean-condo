/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border: "var(--border)",
        "border-2": "var(--border-2)",
        gold: "var(--gold)",
        "gold-l": "var(--gold-l)",
        "gold-dim": "var(--gold-dim)",
        "gold-dim2": "var(--gold-dim2)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        green: "var(--green)",
        "green-bg": "var(--green-bg)",
        amber: "var(--amber)",
        "amber-bg": "var(--amber-bg)",
        red: "var(--red)",
        "red-bg": "var(--red-bg)",
        blue: "var(--blue)",
        "blue-bg": "var(--blue-bg)",
        purple: "var(--purple)",
        "purple-bg": "var(--purple-bg)",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
