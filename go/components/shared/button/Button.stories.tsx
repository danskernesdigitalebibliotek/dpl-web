import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import Icon from "../icon/Icon"
import { Button } from "./Button"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  argTypes: {
    variant: {
      options: ["default", "icon"],
      control: { type: "radio" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    variant: "default",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const Secondary: Story = {
  args: {
    variant: "icon",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      <Icon name="question-mark"></Icon>
    </Button>
  ),
}

export const Large: Story = {
  args: {
    size: "lg",
    label: "Button",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      as.djasdkljhasd
    </Button>
  ),
}

export const Small: Story = {
  args: {
    size: "small",
    label: "Button",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      as.djasdkljhasd
    </Button>
  ),
}
