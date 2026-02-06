import type { Meta, StoryObj } from "@storybook/nextjs"
import { fn } from "storybook/test"

import { darkModeDecorator } from "@/.storybook/decorators"

import Icon from "../icon/Icon"
import { Button } from "./Button"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
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
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "default",
  },
  render: args => {
    return (
      <Button {...args} onClick={fn()}>
        Prøv Lydbogen
      </Button>
    )
  },
}

export const Small: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "sm",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const SmallDark: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "sm",
  },
  decorators: [darkModeDecorator],
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
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "md",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const MediumDark: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "md",
  },
  decorators: [darkModeDecorator],
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
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "lg",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const LargeDark: Story = {
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    ariaLabel: "Prøv Lydbogen",
    variant: "default",
    size: "lg",
  },
  decorators: [darkModeDecorator],
  render: args => (
    <Button {...args} onClick={fn()}>
      Prøv Lydbogen
    </Button>
  ),
}

export const IconStory: Story = {
  name: "Icon",
  args: {
    ariaLabel: "Tilgå hjælpesiden",
    variant: "icon",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      <Icon className="h-[24px] w-[24px]" name="question-mark" />
    </Button>
  ),
}

export const IconStoryDark: Story = {
  name: "Icon dark",
  args: {
    ariaLabel: "Tilgå hjælpesiden",
    variant: "icon",
  },
  decorators: [darkModeDecorator],
  render: args => (
    <Button {...args} onClick={fn()}>
      <Icon className="h-[24px] w-[24px]" name="question-mark" />
    </Button>
  ),
}
