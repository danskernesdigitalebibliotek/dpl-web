import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import SearchFiltersDesktop from "@/components/shared/searchFilters/SearchFiltersDesktop"

import { searchFilterFacetsMock } from "../sheet/searchFilterFacets.mock"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <div className="p-10">
      <Story />
    </div>
  </QueryClientProvider>
)

// The filter columns shown on the search page on desktop; each column
// expands with "Vis flere" past the first few terms. The mobile equivalent
// lives in the SearchFilterSheet story.
const meta = {
  title: "components/SearchFilters",
  component: SearchFiltersDesktop,
  parameters: { layout: "fullscreen" },
  args: {
    facets: searchFilterFacetsMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof SearchFiltersDesktop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
