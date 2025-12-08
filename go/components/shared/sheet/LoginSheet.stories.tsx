import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"

import LoginSheet from "./LoginSheet"

const meta = {
  title: "components/LoginSheet",
  component: LoginSheet,
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
  },
} satisfies Meta<typeof LoginSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => {
    return <LoginSheet {...args} />
  },
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <LoginSheet {...args} />,
}
