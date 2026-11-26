import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import CarouselSlider from "@/components/shared/carouselSlider/CarouselSlider"

import { worksMock } from "../../paragraphs/VideoBundle/VideoBundle.mockData"

// The work cards inside read cost-free through the service layer.
const storyServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer story-token",
}

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <ServiceLayerProvider config={storyServiceLayerConfig}>
      <div className="content-container py-10">
        <div className="grid-go items-start">
          <Story />
        </div>
      </div>
    </ServiceLayerProvider>
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
