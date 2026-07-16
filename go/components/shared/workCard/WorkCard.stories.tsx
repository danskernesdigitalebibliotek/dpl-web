import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import WorkCard from "@/components/shared/workCard/WorkCard"

import { worksMock } from "../../paragraphs/VideoBundle/VideoBundle.mockData"

const work = worksMock[0]

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <div className="w-72 p-10">
      <Story />
    </div>
  </QueryClientProvider>
)

// The card used across sliders and search results: cover on the overlay
// background with material-type icons along the bottom.
const meta = {
  title: "components/WorkCard",
  component: WorkCard,
  parameters: { layout: "centered" },
  args: {
    workId: work.workId,
    title: work.titles.full[0],
    manifestations: work.manifestations.all,
    bestRepresentation: work.manifestations.bestRepresentation,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof WorkCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
}

// The tilt animation used when cards scroll into view in sliders.
export const WithTilt: Story = {
  args: { isWithTilt: true },
}
