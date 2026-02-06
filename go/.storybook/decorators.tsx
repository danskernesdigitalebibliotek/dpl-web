import { Decorator } from "@storybook/nextjs"
import React from "react"

export const darkModeDecorator: Decorator = (Story, context) => {
  context.useDarkMode()
  return <Story />
}
