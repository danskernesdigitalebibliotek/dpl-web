import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import Icon from "../icon/Icon"
import { Button } from "./Button"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "components/Button",
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
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    variant: "default",
    size: "default",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const Small: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    variant: "default",
    size: "sm",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const Medium: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    variant: "default",
    size: "md",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const Large: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    variant: "default",
    size: "lg",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const IconStory: Story = {
  name: "Icon story",
  args: {
    variant: "icon",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      <Icon className="h-[24px] w-[24px]" name="question-mark" />
    </Button>
  ),
}
