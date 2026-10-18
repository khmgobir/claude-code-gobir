import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0a1733",
        navy2: "#13284d",
        brand: "#1f8fef",
        brand2: "#46b3ff",
        cream: "#eef3fb",
        ink: "#1b2a41",
        muted: "#5f6f88",
        line: "#d8e2f0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(12,28,60,.09)",
        lift: "0 18px 50px rgba(12,28,60,.14)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        waPulse: { "0%,100%": { boxShadow: "0 10px 26px rgba(37,211,102,.5)" }, "50%": { boxShadow: "0 10px 30px rgba(37,211,102,.8)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        waPulse: "waPulse 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
