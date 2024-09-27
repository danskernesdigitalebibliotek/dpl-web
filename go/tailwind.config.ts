import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px"
    },
    borderRadius: {
      full: "9999px",
      lg: "calc(var(--base-radius) + 10px)",
      md: "calc(var(--base-radius) + 5px)",
      base: "var(--base-radius)", // 15px
      sm: "calc(var(--base-radius) - 5px)",
      input: "var(--input-radius)"
    },
    zIndex: {
      "-1": "-1"
    },
    aspectRatio: {
      "1/1": "var(--aspect-1-1)",
      "1/2": "var(--aspect-1-2)",
      "2/1": "var(--aspect-2-1)",
      "2/3": "var(--aspect-2-3)",
      "3/2": "var(--aspect-3-2)",
      "3/4": "var(--aspect-3-4)",
      "4/3": "var(--aspect-4-3)",
      "4/5": "var(--aspect-4-5)",
      "5/2": "var(--aspect-5-2)",
      "5/4": "var(--aspect-5-4)",
      "16/9": "var(--aspect-16-9)"
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--background-foreground))"
        },
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))"
      },
      transitionDuration: {
        "dark-mode": "var(--dark-mode-transition)"
      },
      spacing: {
        "grid-column-12": "var(--grid-column-12)",
        "grid-column-11": "var(--grid-column-11)",
        "grid-column-10": "var(--grid-column-10)",
        "grid-column-9": "var(--grid-column-9)",
        "grid-column-8": "var(--grid-column-8)",
        "grid-column-7": "var(--grid-column-7)",
        "grid-column-6": "var(--grid-column-6)",
        "grid-column-5": "var(--grid-column-5)",
        "grid-column-4": "var(--grid-column-4)",
        "grid-column-3": "var(--grid-column-3)",
        "grid-column-2": "var(--grid-column-2)",
        "grid-column": "var(--grid-column)",
        "grid-column-half": "calc(var(--grid-column)/2)",
        "grid-column-quarter": "calc(var(--grid-column)/4)"
      }
    }
  },
  plugins: []
};
export default config;
