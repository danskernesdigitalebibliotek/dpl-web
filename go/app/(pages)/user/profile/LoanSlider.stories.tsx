import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import LoanSlider from "@/app/(pages)/user/profile/LoanSlider"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { worksWithIdentifiersFactory } from "@/cypress/factories/fbi/factory-parts/works"
import {
  getGetV1LibraryProfileAdapterQueryKey,
  getGetV1ProductsIdentifierAdapterQueryKey,
  getGetV1UserLoansAdapterQueryKey,
} from "@/lib/rest/publizon/adapter/generated/publizon"

// Expiry dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

// One digital loan per state: expires today (warning), within the warning
// window, and comfortably in the future (plain text). The last one is a
// cost-free ("BLÅ") title.
const fixtureLoans = [
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

const fixtureWorks = worksWithIdentifiersFactory
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

const loanListResult = {
  loans: fixtureLoans.map(l => ({
    orderId: `order-${l.identifier}`,
    orderDateUtc: daysFromNow(l.expiresInDays - 30),
    loanExpireDateUtc: daysFromNow(l.expiresInDays),
    libraryBook: { identifier: l.identifier },
  })),
}

const seedClient = (loanData = loanListResult) => {
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

const withQueryClient =
  (client: QueryClient) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  )

const meta = {
  title: "profile/LoanSlider",
  component: LoanSlider,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoanSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks,
    loanData: loanListResult,
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withQueryClient(seedClient()), darkModeDecorator],
  args: {
    works: fixtureWorks,
    loanData: loanListResult,
  },
}

export const OneLoan: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks.slice(0, 1),
    loanData: { loans: loanListResult.loans.slice(0, 1) },
  },
}

// A cost-free ("BLÅ") title whose loan is running out: the orange warning
// label and the BLÅ badge render together on the same card.
export const ExpiringBlueTitle: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks.slice(4, 5),
    loanData: { loans: loanListResult.loans.slice(4, 5) },
  },
}

export const Empty: Story = {
  decorators: [withQueryClient(seedClient({ loans: [] }))],
  args: {
    works: [],
    loanData: { loans: [] },
  },
}
