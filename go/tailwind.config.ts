import type { Config } from "tailwindcss"

export const extendedTheme = {
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
    none: "0",
  },
  zIndex: {
    "-1": "-1",
    dialog: "50",
    drawer: "50",
    sheet: "50",
    "slide-select": "10",
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
    "7/9": "var(--aspect-7-9)",
    "8/15": "var(--aspect-8-15)",
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
        lineHeight: "var(--typo-huge-line-height)",
        fontWeight: "var(--typo-huge-weight)",
        letterSpacing: "var(--typo-huge-letter-spacing)",
      },
    ],
    "typo-heading-1": [
      "var(--typo-heading-1-size)",
      {
        lineHeight: "var(--typo-heading-1-line-height)",
        fontWeight: "var(--typo-heading-1-weight)",
        letterSpacing: "var(--typo-heading-1-letter-spacing)",
      },
    ],
    "typo-heading-2": [
      "var(--typo-heading-2-size)",
      {
        lineHeight: "var(--typo-heading-2-line-height)",
        fontWeight: "var(--typo-heading-2-weight)",
        letterSpacing: "var(--typo-heading-2-letter-spacing)",
      },
    ],
    "typo-heading-3": [
      "var(--typo-heading-3-size)",
      {
        lineHeight: "var(--typo-heading-3-line-height)",
        fontWeight: "var(--typo-heading-3-weight)",
        letterSpacing: "var(--typo-heading-3-letter-spacing)",
      },
    ],
    "typo-heading-4": [
      "var(--typo-heading-4-size)",
      {
        lineHeight: "var(--typo-heading-4-line-height)",
        fontWeight: "var(--typo-heading-4-weight)",
        letterSpacing: "var(--typo-heading-4-letter-spacing)",
      },
    ],
    "typo-heading-5": [
      "var(--typo-heading-5-size)",
      {
        lineHeight: "var(--typo-heading-5-line-height)",
        fontWeight: "var(--typo-heading-5-weight)",
        letterSpacing: "var(--typo-heading-5-letter-spacing)",
      },
    ],
    "typo-subtitle-lg": [
      "var(--typo-subtitle-lg-size)",
      {
        lineHeight: "var(--typo-subtitle-lg-line-height)",
        fontWeight: "var(--typo-subtitle-lg-weight)",
        letterSpacing: "var(--typo-subtitle-lg-letter-spacing)",
      },
    ],
    "typo-subtitle-md": [
      "var(--typo-subtitle-md-size)",
      {
        lineHeight: "var(--typo-subtitle-md-line-height)",
        fontWeight: "var(--typo-subtitle-md-weight)",
        letterSpacing: "var(--typo-subtitle-md-letter-spacing)",
      },
    ],
    "typo-subtitle-sm": [
      "var(--typo-subtitle-sm-size)",
      {
        lineHeight: "var(--typo-subtitle-sm-line-height)",
        fontWeight: "var(--typo-subtitle-sm-weight)",
        letterSpacing: "var(--typo-subtitle-sm-letter-spacing)",
      },
    ],
    "typo-body-lg": [
      "var(--typo-body-lg-size)",
      {
        lineHeight: "var(--typo-body-lg-line-height)",
        fontWeight: "var(--typo-body-lg-weight)",
        letterSpacing: "var(--typo-body-lg-letter-spacing)",
      },
    ],
    "typo-body-md": [
      "var(--typo-body-md-size)",
      {
        lineHeight: "var(--typo-body-md-line-height)",
        fontWeight: "var(--typo-body-md-weight)",
        letterSpacing: "var(--typo-body-md-letter-spacing)",
      },
    ],
    "typo-body-sm": [
      "var(--typo-body-sm-size)",
      {
        lineHeight: "var(--typo-body-sm-line-height)",
        fontWeight: "var(--typo-body-sm-weight)",
        letterSpacing: "var(--typo-body-sm-letter-spacing)",
      },
    ],
    "typo-button-lg": [
      "var(--typo-button-lg-size)",
      {
        lineHeight: "var(--typo-button-lg-line-height)",
        fontWeight: "var(--typo-button-lg-weight)",
        letterSpacing: "var(--typo-button-lg-letter-spacing)",
      },
    ],
    "typo-button-sm": [
      "var(--typo-button-sm-size)",
      {
        lineHeight: "var(--typo-button-sm-line-height)",
        fontWeight: "var(--typo-button-sm-weight)",
        letterSpacing: "var(--typo-button-sm-letter-spacing)",
      },
    ],
    "typo-link": [
      "var(--typo-link-size)",
      {
        lineHeight: "var(--typo-link-line-height)",
        fontWeight: "var(--typo-link-weight)",
        letterSpacing: "var(--typo-link-letter-spacing)",
      },
    ],
    "typo-tag-lg": [
      "var(--typo-tag-lg-size)",
      {
        lineHeight: "var(--typo-tag-lg-line-height)",
        fontWeight: "var(--typo-tag-lg-weight)",
        letterSpacing: "var(--typo-tag-lg-letter-spacing)",
      },
    ],
    "typo-tag-sm": [
      "var(--typo-tag-sm-size)",
      {
        lineHeight: "var(--typo-tag-sm-line-height)",
        fontWeight: "var(--typo-tag-sm-weight)",
        letterSpacing: "var(--typo-tag-sm-letter-spacing)",
      },
    ],
    "typo-caption": [
      "var(--typo-caption-size)",
      {
        lineHeight: "var(--typo-caption-line-height)",
        fontWeight: "var(--typo-caption-weight)",
        letterSpacing: "var(--typo-caption-letter-spacing)",
      },
    ],
  },
  extend: {
    colors: {
      background: {
        DEFAULT: "var(--background)",
        overlay: "var(--background-overlay)",
        skeleton: "var(--background-skeleton)",
      },
      foreground: "var(--foreground)",
      blue: "var(--blue)",
      border: "var(--border)",
      "reader-grey": "var(--reader-grey)",
      content: {
        "pink-100": "var(--content-pink-100)",
        "pink-200": "var(--content-pink-200)",
        "pink-300": "var(--content-pink-300)",
        "blue-50": "var(--content-blue-50)",
        "blue-100": "var(--content-blue-100)",
        "blue-200": "var(--content-blue-200)",
        "blue-300": "var(--content-blue-300)",
        "orange-100": "var(--content-orange-100)",
        "orange-200": "var(--content-orange-200)",
        "orange-300": "var(--content-orange-300)",
        "purple-100": "var(--content-purple-100)",
        "purple-200": "var(--content-purple-200)",
        "purple-300": "var(--content-purple-300)",
      },
      "blue-title": {
        DEFAULT: "var(--blue-title)",
        dark: "var(--blue-title-dark)",
      },
      // shadcn colors
      card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)",
      },
      popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)",
      },
      primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
      },
      secondary: {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)",
      },
      muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)",
      },
      accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)",
      },
      destructive: {
        DEFAULT: "var(--destructive)",
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
      theme: {
        extend: {
          keyframes: {
            "accordion-down": {
              from: {
                height: "0",
              },
              to: {
                height: "var(--radix-accordion-content-height)",
              },
            },
            "accordion-up": {
              from: {
                height: "var(--radix-accordion-content-height)",
              },
              to: {
                height: "0",
              },
            },
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
          },
          hyphens: {
            auto: "auto",
            manual: "manual",
            none: "none",
          },
        },
      },
    },
    transitionDuration: {
      "dark-mode": "var(--dark-mode-transition)",
    },
    keyframes: {
      wiggle: {
        "10% 90%": { transform: "rotate(10.0deg)" },
        "20%, 80%": { transform: "rotate(-4.0deg)" },
        "30%, 50%, 70%": { transform: "rotate(14.0deg)" },
        "40%, 60%": { transform: "rotate(-8.0deg)" },
      },
    },
    animation: {
      wiggle: "wiggle 900ms linear 1",
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
      "grid-gap": "var(--grid-gap)",
      "grid-gap-half": "var(--grid-gap-half)",
      "grid-gap-2": "var(--grid-gap-2)",
      "grid-gap-3": "var(--grid-gap-3)",
      "grid-gap-x": "var(--grid-gap-x)",
      "grid-edge": "var(--grid-edge)",
      "space-y": "var(--space-y)",
      "paragraph-spacing": "var(--paragraph-spacing)",
      "paragraph-spacing-inner": "var(--paragraph-spacing-inner)",
    },
    boxShadow: {
      button: "2px 2px 0 0px var(--foreground)",
      buttonHover: "1px 1px 0 0px var(--foreground)",
      "cover-picture": "-1px 1px 10px 0 var(--shadow-1), -3px 3px 20px 0 var(--shadow-2)",
      "stacked-card": "-1px 1px 5px 0px var(--shadow-2), -1px 1px 10px 3px var(--shadow-2);",
    },
  },
} satisfies Config["theme"]

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: extendedTheme,
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
    function ({ addVariant }: { addVariant: (name: string, generator: string) => void }) {
      addVariant("not-first", "&:not(:first-child)")
    },
  ],
}
export default config
