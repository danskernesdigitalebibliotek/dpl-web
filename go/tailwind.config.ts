import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
      base: "var(--base-radius)",
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
        border: "hsl(var(--border))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))"
        }
      },
      transitionDuration: {
        "dark-mode": "var(--dark-mode-transition)"
      },
      spacing: {
        "navigation-top-height": "var(--navigation-top-height)",
        "navigation-height": "var(--navigation-height)",
        "navigation-search-height": "var(--navigation-search-height)",
        "navigation-combined-height": "calc(var(--navigation-combined-height))",
        "screen-minus-navigation-height":
          "var(--screen-minus-navigation-height)",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")]
};
export default config;
