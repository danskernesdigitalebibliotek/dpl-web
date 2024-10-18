import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    borderRadius: {
      full: "9999px",
      lg: "calc(var(--base-radius) + 10px)",
      md: "calc(var(--base-radius) + 5px)",
      base: "var(--base-radius)", // 15px
      sm: "calc(var(--base-radius) - 5px)",
      input: "var(--input-radius)",
    },
    zIndex: {
      "-1": "-1",
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
      "16/9": "var(--aspect-16-9)",
    },
    fontFamily: {
      headline: "var(--font-headline)",
      body: "var(--font-body)",
    },
    fontSize: {
      "typo-huge": [
        "var(--typo-huge-size)",
        {
          lineHeight: "var(--typo-huge-lineHeight)",
          fontWeight: "var(--typo-huge-fontWeight)",
          letterSpacing: "var(--typo-huge-letterSpacing)",
        },
      ],
      "typo-heading-1": [
        "var(--typo-heading-1-size)",
        {
          lineHeight: "var(--typo-heading-1-lineHeight)",
          fontWeight: "var(--typo-heading-1-fontWeight)",
          letterSpacing: "var(--typo-heading-1-letterSpacing)",
        },
      ],
      "typo-heading-2": [
        "var(--typo-heading-2-size)",
        {
          lineHeight: "var(--typo-heading-2-lineHeight)",
          fontWeight: "var(--typo-heading-2-fontWeight)",
          letterSpacing: "var(--typo-heading-2-letterSpacing)",
        },
      ],
      "typo-heading-3": [
        "var(--typo-heading-3-size)",
        {
          lineHeight: "var(--typo-heading-3-lineHeight)",
          fontWeight: "var(--typo-heading-3-fontWeight)",
          letterSpacing: "var(--typo-heading-3-letterSpacing)",
        },
      ],
      "typo-heading-4": [
        "var(--typo-heading-4-size)",
        {
          lineHeight: "var(--typo-heading-4-lineHeight)",
          fontWeight: "var(--typo-heading-4-fontWeight)",
          letterSpacing: "var(--typo-heading-4-letterSpacing)",
        },
      ],
      "typo-heading-5": [
        "var(--typo-heading-5-size)",
        {
          lineHeight: "var(--typo-heading-5-lineHeight)",
          fontWeight: "var(--typo-heading-5-fontWeight)",
          letterSpacing: "var(--typo-heading-5-letterSpacing)",
        },
      ],
      "typo-subtitle-lg": [
        "var(--typo-subtitle-lg-size)",
        {
          lineHeight: "var(--typo-subtitle-lg-lineHeight)",
          fontWeight: "var(--typo-subtitle-lg-fontWeight)",
          letterSpacing: "var(--typo-subtitle-lg-letterSpacing)",
        },
      ],
      "typo-subtitle-md": [
        "var(--typo-subtitle-md-size)",
        {
          lineHeight: "var(--typo-subtitle-md-lineHeight)",
          fontWeight: "var(--typo-subtitle-md-fontWeight)",
          letterSpacing: "var(--typo-subtitle-md-letterSpacing)",
        },
      ],
      "typo-subtitle-sm": [
        "var(--typo-subtitle-sm-size)",
        {
          lineHeight: "var(--typo-subtitle-sm-lineHeight)",
          fontWeight: "var(--typo-subtitle-sm-fontWeight)",
          letterSpacing: "var(--typo-subtitle-sm-letterSpacing)",
        },
      ],
      "typo-body-lg": [
        "var(--typo-body-lg-size)",
        {
          lineHeight: "var(--typo-body-lg-lineHeight)",
          fontWeight: "var(--typo-body-lg-fontWeight)",
          letterSpacing: "var(--typo-body-lg-letterSpacing)",
        },
      ],
      "typo-body-md": [
        "var(--typo-body-md-size)",
        {
          lineHeight: "var(--typo-body-md-lineHeight)",
          fontWeight: "var(--typo-body-md-fontWeight)",
          letterSpacing: "var(--typo-body-md-letterSpacing)",
        },
      ],
      "typo-body-sm": [
        "var(--typo-body-sm-size)",
        {
          lineHeight: "var(--typo-body-sm-lineHeight)",
          fontWeight: "var(--typo-body-sm-fontWeight)",
          letterSpacing: "var(--typo-body-sm-letterSpacing)",
        },
      ],
      "typo-button-lg": [
        "var(--typo-button-lg-size)",
        {
          lineHeight: "var(--typo-button-lg-lineHeight)",
          fontWeight: "var(--typo-button-lg-fontWeight)",
          letterSpacing: "var(--typo-button-lg-letterSpacing)",
        },
      ],
      "typo-button-md": [
        "var(--typo-button-md-size)",
        {
          lineHeight: "var(--typo-button-md-lineHeight)",
          fontWeight: "var(--typo-button-md-fontWeight)",
          letterSpacing: "var(--typo-button-md-letterSpacing)",
        },
      ],
      "typo-link": [
        "var(--typo-link-size)",
        {
          lineHeight: "var(--typo-link-lineHeight)",
          fontWeight: "var(--typo-link-fontWeight)",
          letterSpacing: "var(--typo-link-letterSpacing)",
        },
      ],
      "typo-tag-lg": [
        "var(--typo-tag-lg-size)",
        {
          lineHeight: "var(--typo-tag-lg-lineHeight)",
          fontWeight: "var(--typo-tag-lg-fontWeight)",
          letterSpacing: "var(--typo-tag-lg-letterSpacing)",
        },
      ],
      "typo-tag-sm": [
        "var(--typo-tag-sm-size)",
        {
          lineHeight: "var(--typo-tag-sm-lineHeight)",
          fontWeight: "var(--typo-tag-sm-fontWeight)",
          letterSpacing: "var(--typo-tag-sm-letterSpacing)",
        },
      ],
      "typo-caption": [
        "var(--typo-caption-size)",
        {
          lineHeight: "var(--typo-caption-lineHeight)",
          fontWeight: "var(--typo-caption-fontWeight)",
          letterSpacing: "var(--typo-caption-letterSpacing)",
        },
      ],
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          overlay: "var(--background-overlay)",
        },
        foreground: "var(--foreground)",
        border: "var(--border)",

        // shadcn colors
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover))",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary))",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary))",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted))",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent))",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive))",
          foreground: "var(--destructive-foreground)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      transitionDuration: {
        "dark-mode": "var(--dark-mode-transition)",
      },
      spacing: {
        "navigation-top-height": "var(--navigation-top-height)",
        "navigation-height": "var(--navigation-height)",
        "navigation-search-height": "var(--navigation-search-height)",
        "navigation-combined-height": "calc(var(--navigation-combined-height))",
        "screen-minus-navigation-height": "var(--screen-minus-navigation-height)",
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
        "grid-column-quarter": "calc(var(--grid-column)/4)",
        "grid-gap-x": "var(--grid-gap-x)",
      },
      boxShadow: {
        button: "2px 2px 0 0px var(--foreground)",
        buttonHover: "1px 1px 0 0px var(--foreground)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
}
export default config
