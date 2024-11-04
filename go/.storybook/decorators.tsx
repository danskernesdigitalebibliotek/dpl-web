import { Decorator } from "@storybook/react"
import React from "react"

export const darkModeDecorator: Decorator = (Story, context) => {
  context.addDarkMode()
  return <Story />
}
