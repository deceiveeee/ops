import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#0a0e18",
          800: "#0f1422",
          700: "#161c2e",
          600: "#1f2740",
          500: "#2a3450",
        },
        accent: {
          cyan: "#22d3ee",
          green: "#34d399",
          purple: "#a78bfa",
          amber: "#fbbf24",
          red: "#f87171",
        },
        /*
         * Studio's semantic palette.
         *
         * Every value is a CSS variable so one set of class names renders in
         * either appearance: the variables are defined dark in globals.css,
         * redefined under `.ops-theme-light`, and darkened again under
         * `prefers-contrast: more`. A component says what a colour *means* —
         * `text-st-muted`, `border-st-hair` — and never which colour it is.
         *
         * `hair` and `bound` are deliberately two tokens rather than one.
         * A hairline only groups and carries no contrast duty; a boundary is
         * what identifies an interactive control and has to clear 3:1. Keeping
         * them apart means the wrong one cannot be reached for by accident.
         */
        st: {
          canvas: "var(--st-canvas)",
          paper: "var(--st-paper)",
          side: "var(--st-side)",
          select: "var(--st-select)",
          ink: "var(--st-ink)",
          body: "var(--st-body)",
          sub: "var(--st-sub)",
          muted: "var(--st-muted)",
          faint: "var(--st-faint)",
          blue: "var(--st-blue)",
          hair: "var(--st-hair)",
          bound: "var(--st-bound)",
          good: "var(--st-good)",
          warn: "var(--st-warn)",
          bad: "var(--st-bad)",
          "blue-soft": "var(--st-blue-soft)",
          "blue-edge": "var(--st-blue-edge)",
          "good-soft": "var(--st-good-soft)",
          "good-edge": "var(--st-good-edge)",
          "warn-soft": "var(--st-warn-soft)",
          "warn-edge": "var(--st-warn-edge)",
          "bad-soft": "var(--st-bad-soft)",
          "bad-edge": "var(--st-bad-edge)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.15), 0 0 40px -10px rgba(34,211,238,0.35)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-12px,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseGlow: {
            "0%,100%": { opacity: "0.6" },
            "50%": { opacity: "1" },
        },
      },
      animation: {
        drift: "drift 8s ease-in-out infinite",
        scan: "scan 4s linear infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
