import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import MaterialSlider from "@/components/paragraphs/MaterialSlider/MaterialSlider"

import { worksMock } from "./MaterialSlider.mockData"

// The work cards inside read cost-free through the service layer.
const storyServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer story-token",
}

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <ServiceLayerProvider config={storyServiceLayerConfig}>
      <Story />
    </ServiceLayerProvider>
  </QueryClientProvider>
)

const meta = {
  title: "paragraphs/MaterialSlider",
  component: MaterialSlider,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Material Slider",
    works: worksMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof MaterialSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
