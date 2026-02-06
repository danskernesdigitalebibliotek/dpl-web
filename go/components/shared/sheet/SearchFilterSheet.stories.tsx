import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"

import SearchFilterSheet from "./SearchFilterSheet"
import { searchFilterFacetsMock } from "./searchFilterFacets.mock"

const queryClient = new QueryClient()

// TODO: fix this typing of StoryComponent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withQueryClient = (StoryComponent: any) => (
  <QueryClientProvider client={queryClient}>
    <StoryComponent />
  </QueryClientProvider>
)

const meta = {
  title: "components/SearchFilterSheet",
  component: SearchFilterSheet,
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    facets: searchFilterFacetsMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof SearchFilterSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => {
    return <SearchFilterSheet {...args} />
  },
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <SearchFilterSheet {...args} />,
}
