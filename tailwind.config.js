// tailwind.config.js
import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0f0f0f",
          hover: "#1a1a1a",
          active: "#222222",
        },
        primary: {
          DEFAULT: "#b6ff00",
          hover: "#a3e600",
          dim: "rgba(182, 255, 0, 0.1)",
        },
        border: {
          DEFAULT: "#333333",
          light: "#444444",
        },
        text: {
          main: "#ffffff",
          muted: "#9ca3af",
        },
      },
      fontFamily: {
        sans: [
          "Vazirmatn",
          "Segoe UI",
          "Tahoma",
          "Geneva",
          "Verdana",
          "sans-serif",
        ],
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(182, 255, 0, 0.1)",
        "neon-hover": "0 0 25px rgba(182, 255, 0, 0.3)",
      },
    },
  },
  plugins: [tailwindAnimate],
};
