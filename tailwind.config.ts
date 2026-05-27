import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark velvet + chrome (Y2K metal gothic) palette.
        paper: "#14163a", // base velvet (page bg)
        ink: "#eef0fb", // chrome white (primary text / chrome buttons)
        muted: "#9aa0d0", // muted lavender-grey
        line: "#3b3f78", // hairlines on dark
        sand: "#1e2150", // lifted panel / card surface
        accent: "#aeb6ee", // steel highlight
        velvetDeep: "#0a0b22",
        velvetGlow: "#39409a",
        chrome: "#d7dbec",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        gothic: ["var(--font-gothic)", "var(--font-serif)", "serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      maxWidth: {
        page: "1280px",
      },
      dropShadow: {
        chrome: "0 2px 10px rgba(120,130,220,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
