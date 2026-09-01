import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseCaption } from "@/.storybook/showcase"
import Icon from "@/components/shared/icon/Icon"

// Every SVG in public/icons. Keep in sync when icons are added or removed.
const iconNames = [
  "adgangsplatformen",
  "adjust",
  "alert",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "book",
  "calendar-check",
  "chat",
  "check",
  "clock",
  "close",
  "comic",
  "controller",
  "document",
  "e-comic",
  "e-picturebook",
  "ebook",
  "envelope",
  "headphones",
  "lock",
  "logo-borderless",
  "logo-white-readme",
  "logo-with-outline",
  "moon",
  "picturebook",
  "pin",
  "podcast",
  "profile",
  "question-mark",
  "search",
  "sun",
  "video",
]

const IconShowcase = () => (
  <div className="grid grid-cols-2 gap-4 p-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {iconNames.map(name => (
      <div
        key={name}
        className="border-foreground/30 flex flex-col items-center gap-3 rounded-sm border
          border-dashed p-6">
        <Icon name={name} className="text-foreground h-8 w-8" />
        <ShowcaseCaption>{name}</ShowcaseCaption>
      </div>
    ))}
  </div>
)

const meta = {
  title: "design tokens/Icons",
  component: Icon,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const AllIcons: Story = {
  args: { name: "book" },
  render: () => <IconShowcase />,
}

export const AllIconsDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: { name: "book" },
  render: () => <IconShowcase />,
}
