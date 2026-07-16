import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"

import Header from "./Header"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
)

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
export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
