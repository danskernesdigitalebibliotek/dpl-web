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
  decorators: [
    // 👇 Defining the decorator in the preview file applies it to all stories
    (Story, { parameters }) => {
      return (
        <div>
          <FontsProvider />
          <Story {...parameters} />
        </div>
      )
    },
  ],
}

export default preview
