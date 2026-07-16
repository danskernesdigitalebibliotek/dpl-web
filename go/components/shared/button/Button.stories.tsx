import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"
import { fn } from "storybook/test"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"

import Icon from "../icon/Icon"
import { Button } from "./Button"

const sizes = ["sm", "md", "lg"] as const
const themes = ["secondary", "primary"] as const

// Content per variant: icon-only buttons render just the icon, icon-text
// takes the icon name as a prop, default is text only.
const variantContent = {
  default: { children: "Prøv Lydbogen" },
  icon: { children: <Icon className="h-[24px] w-[24px]" name="question-mark" /> },
  "icon-text": { children: "Lyt til lydbog", icon: "headphones" },
} as const

// Every variant crossed with every size and theme, plus the loading state.
const AllVariantsShowcase = () => (
  <div className="space-y-10 p-10">
    {(Object.keys(variantContent) as (keyof typeof variantContent)[]).map(variant => (
      <div key={variant} className="space-y-4">
        {themes.map(theme => (
          <ShowcaseItem
            key={theme}
            title={`${variant} · ${theme}`}
            boxClassName="flex-row flex-wrap items-center gap-4">
            {sizes.map(size => (
              <Button
                key={size}
                variant={variant}
                size={size}
                theme={theme}
                icon={"icon" in variantContent[variant] ? variantContent[variant].icon : undefined}
                ariaLabel={`${variant} ${theme} ${size}`}
                onClick={fn()}>
                {variantContent[variant].children}
              </Button>
            ))}
            <Button
              variant={variant}
              theme={theme}
              icon={"icon" in variantContent[variant] ? variantContent[variant].icon : undefined}
              ariaLabel={`${variant} ${theme} disabled`}
              disabled
              onClick={fn()}>
              {variantContent[variant].children}
            </Button>
            {/* Icon buttons are never used with isLoading. */}
            {variant !== "icon" && (
              <Button
                variant={variant}
                theme={theme}
                icon={"icon" in variantContent[variant] ? variantContent[variant].icon : undefined}
                ariaLabel={`${variant} ${theme} loading`}
                isLoading
                onClick={fn()}>
                {variantContent[variant].children}
              </Button>
            )}
          </ShowcaseItem>
        ))}
      </div>
    ))}
  </div>
)

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

// One grid with every variant × theme × size, plus disabled and loading.
export const AllVariants: Story = {
  parameters: { layout: "fullscreen" },
  args: { ariaLabel: "Knap" },
  render: () => <AllVariantsShowcase />,
}

export const AllVariantsDarkMode: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [darkModeDecorator],
  args: { ariaLabel: "Knap" },
  render: () => <AllVariantsShowcase />,
}

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

export const IconText: Story = {
  name: "Icon text",
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
  },
  args: {
    ariaLabel: "Lyt til lydbog",
    variant: "icon-text",
    icon: "headphones",
    size: "default",
  },
  render: args => (
    <Button {...args} onClick={fn()}>
      Lyt til lydbog
    </Button>
  ),
}

export const IconTextDark: Story = {
  name: "Icon text dark",
  args: {
    ariaLabel: "Lyt til lydbog",
    variant: "icon-text",
    icon: "headphones",
    size: "default",
  },
  decorators: [darkModeDecorator],
  render: args => (
    <Button {...args} onClick={fn()}>
      Lyt til lydbog
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
