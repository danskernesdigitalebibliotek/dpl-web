import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import SearchInput from "@/components/shared/searchInput/SearchInput"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <div className="p-10">
      <Story />
    </div>
  </QueryClientProvider>
)

// The search field from the navigation; typing feeds the search machine and
// Enter (or the arrow button) navigates to the search page.
const meta = {
  title: "components/SearchInput",
  component: SearchInput,
  parameters: { layout: "fullscreen" },
  args: {
    placeholder: "Søg",
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
