import type { Preview } from "@storybook/react"
import localFont from "next/font/local"
import React from "react"

import "@/styles/globals.css"

import { allModes } from "../.storybook/modes"
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
