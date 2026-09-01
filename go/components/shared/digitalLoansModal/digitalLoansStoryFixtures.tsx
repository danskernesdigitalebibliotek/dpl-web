import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { StoreModal } from "@/components/shared/dynamicModal/DynamicModal"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { worksWithIdentifiersFactory } from "@/cypress/factories/fbi/factory-parts/works"
import {
  getGetV1LibraryProfileAdapterQueryKey,
  getGetV1ProductsIdentifierAdapterQueryKey,
  getGetV1UserLoansAdapterQueryKey,
} from "@/lib/rest/publizon/adapter/generated/publizon"

// Shared fixtures for the digital loans stories (LoanSlider and
// DigitalLoansModal): works with alternating e-book/audiobook
// manifestations, their Publizon loans, and a seeded query client.

// Expiry dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
export const daysFromNow = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// One digital loan per state: expires today (warning), within the warning
// window, and comfortably in the future (plain text). The last one is a
// cost-free ("BLÅ") title. Deliberately NOT in expiry order — the modal
// sorts soonest-expiring first, and the stories should show that.
export const fixtureLoans = [
  { identifier: "9788711917141", expiresInDays: 0, costFree: false },
  { identifier: "9788711917142", expiresInDays: 4, costFree: false },
  { identifier: "9788711917143", expiresInDays: 14, costFree: false },
  { identifier: "9788711917144", expiresInDays: 30, costFree: true },
  // Both cost-free ("BLÅ") and expiring soon — warning label + badge together.
  // Half-day offset so the rendered day count is stable over time.
  { identifier: "9788711917145", expiresInDays: 2.5, costFree: true },
]

const identifiers = fixtureLoans.map(l => l.identifier)

// Real covers come in varying proportions; rotate through a tall, a standard
// and a near-square ratio so cover-edge-anchored details (material type icon)
// are exercised against all of them.
const coverSizes = [
  { width: 420, height: 720 },
  { width: 500, height: 720 },
  { width: 660, height: 720 },
]

const buildCover = (index: number) => {
  const { width, height } = coverSizes[index % coverSizes.length]
  const url = `https://placehold.co/${width}x${height}.jpg`
  return coverFactory.build({
    thumbnail: url,
    xSmall: { url, width, height },
    small: { url, width, height },
    medium: { url, width, height },
    large: { url, width, height },
  })
}

export const fixtureWorks = worksWithIdentifiersFactory
  .transient({ identifiers })
  .build()
  .map((work, index) => {
    const cover = buildCover(index)
    const manifestation = { ...work.manifestations.all[0], cover }
    return {
      ...work,
      manifestations: { all: [manifestation], bestRepresentation: manifestation },
    }
  })

export const loanListResult = {
  loans: fixtureLoans.map(l => ({
    orderId: `order-${l.identifier}`,
    orderDateUtc: daysFromNow(l.expiresInDays - 30),
    loanExpireDateUtc: daysFromNow(l.expiresInDays),
    libraryBook: { identifier: l.identifier },
  })),
}

export const seedClient = (loanData = loanListResult) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(getGetV1UserLoansAdapterQueryKey(), loanData)
  client.setQueryData(getGetV1LibraryProfileAdapterQueryKey(), {
    maxConcurrentEbookLoansPerBorrower: 3,
    maxConcurrentAudioLoansPerBorrower: 3,
  })
  fixtureLoans.forEach(l => {
    client.setQueryData(getGetV1ProductsIdentifierAdapterQueryKey(l.identifier), {
      product: { costFree: l.costFree },
    })
  })
  return client
}

// ServiceLayerProvider backs the "Dit lån" modal reachable from the
// digital loans list (renewal hooks resolve their config from it).
const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
}

export const withQueryClient =
  (client: QueryClient) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <ServiceLayerProvider config={storyServiceLayerConfig}>
        <Story />
        {/* Modals open through the global store, rendered by this host. */}
        <StoreModal />
      </ServiceLayerProvider>
    </QueryClientProvider>
  )
