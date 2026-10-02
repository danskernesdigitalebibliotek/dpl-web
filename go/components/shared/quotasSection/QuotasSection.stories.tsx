import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import QuotasSection from "@/components/shared/quotasSection/QuotasSection"
import { getGetV1LibraryProfileAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"

const seedClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(getGetV1LibraryProfileAdapterQueryKey(), {
    maxConcurrentEbookLoansPerBorrower: 3,
    maxConcurrentAudioLoansPerBorrower: 3,
  })
  return client
}

// The quota hooks resolve their config from the provider even when the
// Biblio adapter is off (as it is in stories, where no DplCmsConfig exists).
const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
}

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={seedClient()}>
    <ServiceLayerProvider config={storyServiceLayerConfig}>
      <Story />
    </ServiceLayerProvider>
  </QueryClientProvider>
)

const meta = {
  title: "profile/QuotasSection",
  component: QuotasSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof QuotasSection>

export default meta
type Story = StoryObj<typeof meta>

// Digital loan quotas: e-book and audiobook usage against the library's
// limits, plus the cost-free ("BLÅ") titles overview.
export const Default: Story = {
  decorators: [withQueryClient],
  args: {
    audioLoans: ["9788711917141", "9788711917142"],
    ebookLoans: ["9788711917143"],
    blueLoans: ["9788711917144"],
    onViewAll: () => {},
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withQueryClient, darkModeDecorator],
  args: {
    audioLoans: ["9788711917141", "9788711917142"],
    ebookLoans: ["9788711917143"],
    blueLoans: ["9788711917144"],
    onViewAll: () => {},
  },
}
