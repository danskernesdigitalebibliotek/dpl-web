import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import { Badge } from "@/components/shared/badge/Badge"

const meta = {
  title: "components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: { type: "select", options: ["default", "outline", "destructive", "blue-title"] },
    },
  },
  args: {
    variant: "blue-title",
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <Badge {...args}>Badge</Badge>,
}
