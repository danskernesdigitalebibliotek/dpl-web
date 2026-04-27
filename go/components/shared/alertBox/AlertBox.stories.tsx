import type { Meta, StoryObj } from "@storybook/nextjs"

import AlertBox from "./AlertBox"

const meta = {
  title: "components/AlertBox",
  component: AlertBox,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof AlertBox>

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {
  args: {
    message: "Du har allerede lånt denne e-bog. Find den på Min side",
    variant: "error",
    icon: "alert",
  },
}

export const Warning: Story = {
  args: {
    message: "Dette er en fysisk bog. Den kan lånes på dit lokale bibliotek",
    variant: "warning",
    icon: "alert",
  },
}

export const Success: Story = {
  args: {
    message: "Du har lånt denne e-bog",
    variant: "success",
    icon: "alert",
  },
}
