/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Instrument Serif'", "Georgia", "serif"],
      },
      colors: {
        ink: {
          950: "#07090d",
          900: "#0a0e14",
          800: "#111722",
          700: "#1a2230",
          600: "#273142",
        },
        sun: {
          300: "#ffd58a",
          400: "#f5b547",
          500: "#e9a023",
        },
        sea: {
          300: "#8ff0e4",
          400: "#2dd4bf",
          500: "#14b8a6",
        },
      },
      boxShadow: {
        glass: "0 20px 60px -20px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)",
        glow: "0 0 0 1px rgba(245,181,71,0.35), 0 10px 40px -10px rgba(245,181,71,0.55)",
        glowSea: "0 0 0 1px rgba(45,212,191,0.35), 0 10px 40px -10px rgba(45,212,191,0.55)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.6)", opacity: "0.9" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.2, 0.7, 0.3, 1) infinite",
        bob: "bob 1.1s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
