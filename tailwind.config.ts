import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F2EC",
        ink: "#1A1A18",
        muted: "#8A857C",
        line: "#E5E0D6",
        sand: "#EFE9DD",
        accent: "#C44A2D",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      maxWidth: {
        page: "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;
