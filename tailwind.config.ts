import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === PRIMARY BRAND COLORS ===
        primary: {
          DEFAULT: "#1A9FD4",
          dark: "#1585B5",
          light: "#E8F6FC",
          50:  "#E8F6FC",
          100: "#C5E9F7",
          200: "#9ED8F1",
          300: "#6DC5E9",
          400: "#45B5E3",
          500: "#1A9FD4",  // ← warna utama
          600: "#1585B5",
          700: "#106B93",
          800: "#0B5070",
          900: "#063550",
        },
        // === NEUTRAL / GRAY ===
        gray: {
          50:  "#F8F9FA",
          100: "#F1F3F5",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
        // === STATUS COLORS ===
        success: "#28A745",
        danger:  "#DC3545",
        warning: "#FD7E14",
        promo:   "#FFC107",
        preorder:"#6F42C1",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        "card": "12px",
        "pill": "999px",
      },
      boxShadow: {
        "card":       "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.14)",
        "header":     "0 2px 12px rgba(26,159,212,0.2)",
      },
      screens: {
        "xs": "480px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1536px",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-skeleton": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in":        "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-skeleton": "pulse-skeleton 1.5s ease-in-out infinite",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
