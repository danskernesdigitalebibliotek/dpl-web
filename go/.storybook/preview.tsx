import type { Preview } from "@storybook/nextjs"
import localFont from "next/font/local"
import React from "react"

import "@/styles/globals.css"

import { useDarkMode, useLightMode } from "../lib/helpers/helper.theme"

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
      options: {
        sm: {
          name: "Small",
          styles: { width: "640px", height: "900px" },
        },
        md: {
          name: "Medium",
          styles: { width: "768px", height: "900px" },
        },
        lg: {
          name: "Large",
          styles: { width: "1024px", height: "900px" },
        },
        xl: {
          name: "Extra large",
          styles: { width: "1280px", height: "900px" },
        },
        "2xl": {
          name: "2 Extra large",
          styles: { width: "1536px", height: "900px" },
        },
      },
    },
    chromatic: {
      // Test each story in different viewport modes
      modes: {
        mobile: {
          viewport: "sm",
        },
        desktop: {
          viewport: "xl",
        },
      },
    },
    a11y: {
      config: {
        // Add a global 2-second delay for accessibility tests to make sure
        // all animations are completed before the tests run
        delay: 3000,
      },
    },
  },
  decorators: [
    // 👇 Defining the decorator in the preview file applies it to all stories
    (Story, { parameters }) => {
      // Set the default theme to light mode
      useLightMode()
      // Add dark mode to the context of the story. This can be called later in the story decorator.
      const params = { useDarkMode, ...parameters }

      return (
        <div className={`${GTFlexa.variable} antialiased`}>
          <Story {...params} />
        </div>
      )
    },
  ],
}

export default preview
