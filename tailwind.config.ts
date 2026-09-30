import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "#2F6BFF",
          hover: "#2557D6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#667085",
          foreground: "#111827",
        },
        muted: {
          DEFAULT: "#F1F4F9",
          foreground: "#667085",
        },
        border: "var(--border)",
        success: {
          DEFAULT: "#22B573",
          light: "#E8F8F1",
        },
        idea: {
          DEFAULT: "#E7A71A",
          light: "#FEF7E6",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#E5484D",
          light: "#FEE2E2",
        },
        purple: {
          DEFAULT: "#7D63D8",
          light: "#F2EFFC",
        },
      },
      borderRadius: {
        "xl": "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.025)",
        card: "0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 4px 10px -2px rgba(0, 0, 0, 0.02)",
        float: "0 20px 40px -10px rgba(47, 107, 255, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
