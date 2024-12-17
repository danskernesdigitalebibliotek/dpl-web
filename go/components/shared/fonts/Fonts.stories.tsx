import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"

import Fonts from "./Fonts"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "components/Fonts",
  component: Fonts,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Fonts>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {}

export const FontsDarkMode: Story = {
  decorators: [darkModeDecorator],
}
