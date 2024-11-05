import type { Preview } from "@storybook/react"
import localFont from "next/font/local"
import React from "react"

import "@/styles/globals.css"

import { addDarkMode, removeDarkMode } from "../lib/helpers/helper.theme"

// When adding or changing fonts, remember to update the imports in the Layout file
const GTFlexa = localFont({
  src: [
    {
      path: "../fonts/GT-Flexa-Expanded-Regular.woff2",
      weight: "400",
    },
    {
      path: "../fonts/GT-Flexa-Expanded-Medium.woff2",
      weight: "500",
    },
  ],
  variable: "--font-headline",
  display: "swap",
})

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}

export const allModes = {
  sm: { name: "Small", styles: { width: breakpoints["sm"], height: "900px" } },
  md: {
    name: "Medium",
    styles: { width: breakpoints["md"], height: "900px" },
  },
  lg: { name: "Large", styles: { width: breakpoints["lg"], height: "900px" } },
  xl: {
    name: "Extra large",
    styles: { width: breakpoints["xl"], height: "900px" },
  },
  "2xl": {
    name: "2 Extra large",
    styles: { width: breakpoints["2xl"], height: "900px" },
  },
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: {
        ...allModes,
      },
    },
    chromatic: {
      // Test each story in different viewport modes
      modes: {
        mobile: allModes["small"],
        desktop: allModes["large"],
      },
    },
  },
  decorators: [
    // 👇 Defining the decorator in the preview file applies it to all stories
    (Story, { parameters }) => {
      removeDarkMode()
      const params = { addDarkMode, ...parameters }

      return (
        <div className={`${GTFlexa.variable} antialiased`}>
          <Story {...params} />
        </div>
      )
    },
  ],
}

export default preview
