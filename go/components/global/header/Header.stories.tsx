import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { themeStore } from "@/store/theme.store"

import Header from "./Header"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
)

// The dark mode decorator only sets the body class; the toggle itself reads
// the theme store, so align the store with the story's mode to show the
// matching knob position and icon (sun in light, moon in dark).
const withStoreTheme =
  (theme: "light" | "dark") =>
  (Story: React.ComponentType): React.ReactElement => {
    if (themeStore.getSnapshot().context.theme !== theme) {
      themeStore.trigger.toggleTheme()
    }
    return <Story />
  }

const meta = {
  title: "globals/Navigation",
  component: Header,
  parameters: { layout: "fullscreen" },
  decorators: [withQueryClient],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

// The site navigation: parent library banner, logo, dark mode toggle,
// profile entry and the search field.
export const Default: Story = {
  decorators: [withStoreTheme("light")],
}

export const DarkMode: Story = {
  decorators: [withStoreTheme("dark"), darkModeDecorator],
}
