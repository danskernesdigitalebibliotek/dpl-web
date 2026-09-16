import {
  type DigitalLoan,
  ServiceLayerProvider,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
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

// Loans made through the Biblio adapter, shown merged with the Publizon ones
// while the two providers coexist. One e-book and one audiobook (the works
// factory alternates, e-book first); expiries interleave with the Publizon
// fixtures so the merged list demonstrates cross-provider sorting.
export const fixtureBiblioLoans: DigitalLoan[] = [
  {
    loanId: "biblio-loan-ebook",
    materialId: "9788711917146",
    materialType: "ebook",
    startDate: daysFromNow(-10),
    endDate: daysFromNow(1),
    active: true,
    title: "Dette er titlen på en e-bog",
    author: "Forfatter Fornavnsen",
    publisher: "Forlaget",
    publishDate: "2024-01-01",
    loanProvider: "free",
  },
  {
    loanId: "biblio-loan-audiobook",
    materialId: "9788711917147",
    materialType: "audiobook",
    startDate: daysFromNow(-10),
    endDate: daysFromNow(20),
    active: true,
    title: "Dette er titlen på en lydbog",
    author: "Forfatter Fornavnsen",
    publisher: "Forlaget",
    publishDate: "2024-01-01",
    loanProvider: "free",
  },
]

const identifiers = fixtureLoans.map(l => l.identifier)
const biblioIdentifiers = fixtureBiblioLoans.map(l => l.materialId)

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

const buildWorks = (ids: string[]) =>
  worksWithIdentifiersFactory
    .transient({ identifiers: ids })
    .build()
    .map((work, index) => {
      const cover = buildCover(index)
      const manifestation = { ...work.manifestations.all[0], cover }
      return {
        ...work,
        manifestations: { all: [manifestation], bestRepresentation: manifestation },
      }
    })

export const fixtureWorks = buildWorks(identifiers)

// The works behind the Biblio loans, and both providers' works side by side —
// only the merged stories use these, so the Publizon-only stories stay stable.
export const fixtureBiblioWorks = buildWorks(biblioIdentifiers)
export const fixtureMergedWorks = [...fixtureWorks, ...fixtureBiblioWorks]

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
  // The "BLÅ" lookup runs per shown material, so the Biblio works need an
  // answer too — seeded as not cost-free.
  biblioIdentifiers.forEach(identifier => {
    client.setQueryData(getGetV1ProductsIdentifierAdapterQueryKey(identifier), {
      product: { costFree: false },
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
