import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F4F6",
        surface: "#FFFFFF",
        "surface-2": "#ECECEF",
        line: "rgba(21,23,26,.09)",
        "line-strong": "rgba(21,23,26,.17)",
        ember: "#EA5C00",
        orange: "#F97316",
        grey: "#5D5D64",
        silver: "#3A3A40",
        ink: "#15171A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
