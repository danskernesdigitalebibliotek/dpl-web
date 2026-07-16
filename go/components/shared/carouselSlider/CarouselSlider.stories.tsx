import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import CarouselSlider from "@/components/shared/carouselSlider/CarouselSlider"

import { worksMock } from "../../paragraphs/VideoBundle/VideoBundle.mockData"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <div className="content-container py-10">
      <div className="grid-go items-start">
        <Story />
      </div>
    </div>
  </QueryClientProvider>
)

// The stacked work carousel from the video bundles: auto-advances on a
// timer, with prev/next controls and the deck shuffling behind the front
// card.
const meta = {
  title: "components/CarouselSlider",
  component: CarouselSlider,
  parameters: { layout: "fullscreen" },
  args: {
    works: worksMock,
    className: "lg:col-span-4 lg:col-start-5 xl:col-span-3",
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof CarouselSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}

// Without works the controls disable and the deck is empty (loading state).
export const Loading: Story = {
  args: { works: undefined },
}
