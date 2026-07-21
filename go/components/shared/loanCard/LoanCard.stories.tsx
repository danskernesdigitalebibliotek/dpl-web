import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import LoanCard from "@/components/shared/loanCard/LoanCard"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"
import {
  getGetV1ProductsIdentifierAdapterQueryKey,
  getGetV1UserLoansAdapterQueryKey,
} from "@/lib/rest/publizon/adapter/generated/publizon"

// Expiry dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

let isbnCounter = 9788711917200

type Fixture = {
  props: React.ComponentProps<typeof LoanCard>
  isbn: string
  expiresInDays: number
  costFree: boolean
}

const buildFixture = ({
  title,
  materialType,
  expiresInDays,
  costFree = false,
}: {
  title: string
  materialType: { code: string; display: string; general: GeneralMaterialTypeCodeEnum }
  expiresInDays: number
  costFree?: boolean
}): Fixture => {
  const isbn = String(isbnCounter++)
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${isbn}`,
    identifiers: [{ type: "ISBN", value: isbn }],
    materialTypes: [
      {
        materialTypeGeneral: { display: materialType.display, code: materialType.general },
        materialTypeSpecific: materialType,
      },
    ],
  })
  return {
    props: {
      manifestation,
      title,
      setAudioLoans: () => {},
      setEbookLoans: () => {},
      setBlueLoans: () => {},
    },
    isbn,
    expiresInDays,
    costFree,
  }
}

const seedClient = (fixtures: Fixture[]) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(getGetV1UserLoansAdapterQueryKey(), {
    loans: fixtures.map(f => ({
      orderId: `order-${f.isbn}`,
      orderDateUtc: daysFromNow(f.expiresInDays - 30),
      loanExpireDateUtc: daysFromNow(f.expiresInDays),
      libraryBook: { identifier: f.isbn },
    })),
  })
  fixtures.forEach(f => {
    client.setQueryData(getGetV1ProductsIdentifierAdapterQueryKey(f.isbn), {
      product: { costFree: f.costFree },
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

const CardGrid = ({ fixtures }: { fixtures: Fixture[] }) => (
  <div className="flex flex-wrap gap-8 p-10">
    {fixtures.map(f => (
      <div key={f.isbn} className="w-72">
        <ShowcaseItem title={f.props.title} boxClassName="items-stretch">
          <LoanCard {...f.props} />
        </ShowcaseItem>
      </div>
    ))}
  </div>
)

const meta = {
  title: "profile/LoanCard",
  component: LoanCard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoanCard>

export default meta
type Story = StoryObj<typeof meta>

// One card per digital material type, showing each material icon.
// The podcast is cost-free by definition and renders the BLÅ badge.
const materialTypeFixtures = [
  buildFixture({
    title: "E-bog",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 14,
  }),
  buildFixture({
    title: "Lydbog (online)",
    materialType: { code: "AUDIO_BOOK_ONLINE", display: "lydbog (online)", general: "AUDIO_BOOKS" },
    expiresInDays: 14,
  }),
  buildFixture({
    title: "Tegneserie (online)",
    materialType: { code: "COMIC_ONLINE", display: "tegneserie (online)", general: "COMICS" },
    expiresInDays: 14,
  }),
  buildFixture({
    title: "Billedbog (online)",
    materialType: { code: "PICTURE_BOOK_ONLINE", display: "billedbog (online)", general: "BOOKS" },
    expiresInDays: 14,
  }),
  buildFixture({
    title: "Podcast",
    materialType: { code: "PODCAST", display: "podcast", general: "PODCASTS" },
    expiresInDays: 14,
  }),
]

export const MaterialTypes: Story = {
  decorators: [withQueryClient(seedClient(materialTypeFixtures))],
  args: materialTypeFixtures[0].props,
  render: () => <CardGrid fixtures={materialTypeFixtures} />,
}

// Every expiry presentation: expires today / expiring soon (orange label),
// neutral (plain text), and a cost-free ("BLÅ") title with the blue icon
// and badge.
const stateFixtures = [
  buildFixture({
    title: "Udløber i dag",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 0,
  }),
  buildFixture({
    title: "Udløber om 1 dag",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    // 1.5 days so differenceInDays yields a full day and the card shows the
    // singular "om 1 dag" state instead of rounding down to "i dag".
    expiresInDays: 1.5,
  }),
  buildFixture({
    title: "Udløber om 5 dage",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 5.5,
  }),
  buildFixture({
    title: "Neutral",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 24,
  }),
  buildFixture({
    title: "Blå titel",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 24,
    costFree: true,
  }),
  buildFixture({
    title: "Blå titel der udløber",
    materialType: { code: "EBOOK", display: "e-bog", general: "EBOOKS" },
    expiresInDays: 2.5,
    costFree: true,
  }),
]

export const States: Story = {
  decorators: [withQueryClient(seedClient(stateFixtures))],
  args: stateFixtures[0].props,
  render: () => <CardGrid fixtures={stateFixtures} />,
}

export const StatesDarkMode: Story = {
  decorators: [withQueryClient(seedClient(stateFixtures)), darkModeDecorator],
  args: stateFixtures[0].props,
  render: () => <CardGrid fixtures={stateFixtures} />,
}
