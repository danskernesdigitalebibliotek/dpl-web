import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import { cn } from "@/lib/helpers/helper.cn"

// Visual reference for the border radius scale defined in styles/theme.css.
// The boxes use the actual rounded-* utilities, so the story always reflects
// the current token values.
const radiusTokens = [
  { className: "rounded-xs", token: "--radius-xs", value: "4px" },
  { className: "rounded-sm", token: "--radius-sm", value: "8px" },
  { className: "rounded-base", token: "--radius-base", value: "12px" },
  { className: "rounded-md", token: "--radius-md", value: "16px" },
  { className: "rounded-lg", token: "--radius-lg", value: "24px" },
  { className: "rounded-xl", token: "--radius-xl", value: "32px" },
  { className: "rounded-2xl", token: "--radius-2xl", value: "48px" },
  { className: "rounded-full", token: "--radius-full", value: "9999px" },
]

const BorderRadiusShowcase = () => (
  <div className="flex flex-wrap gap-10 p-10">
    {radiusTokens.map(({ className, token, value }) => (
      <ShowcaseItem key={className} title={className} description={`${token}: ${value}`}>
        <div className={cn("bg-foreground h-36 w-60", className)} />
      </ShowcaseItem>
    ))}
  </div>
)

const meta = {
  title: "design tokens/Border radius",
  component: BorderRadiusShowcase,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BorderRadiusShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
}
