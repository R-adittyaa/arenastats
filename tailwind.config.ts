import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        arena: {
          bg: "#050505",       // Hitam pekat ala dashboard F1
          card: "#121212",     // Card abu gelap
          border: "#262626",   // Border tipis
          accent: "#10b981",   // Emerald tegas
          accentHover: "#059669",
          textMuted: "#a3a3a3",
        },
      },
      fontFamily: {
        // Pastikan lu import font ini di layout.tsx nanti
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px", // Bikin kotak tegas, bukan kapsul
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};
export default config;