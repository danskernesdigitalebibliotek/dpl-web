import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import Theme from "@/components/global/theme/Theme"

import DarkModeToggle from "./DarkModeToggle"

// Wrapped in the real Theme provider, so clicking the toggle switches the
// canvas between light and dark exactly like in the app (state persists in
// localStorage through the theme store).
const withTheme = (Story: React.ComponentType): React.ReactElement => (
  <Theme>
    <Story />
  </Theme>
)

const meta = {
  title: "components/DarkModeToggle",
  component: DarkModeToggle,
  parameters: { layout: "centered" },
  decorators: [withTheme],
} satisfies Meta<typeof DarkModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
