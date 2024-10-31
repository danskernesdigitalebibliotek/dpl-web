import type { Preview } from "@storybook/react"
import React from "react"

import "@/styles/globals.css"

import FontsProvider from "../lib/providers/FontsProvider"

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
  },
}

export const decorators = [
  Story => {
    return (
      <FontsProvider>
        <Story />
      </FontsProvider>
    )
  },
]

export default preview
