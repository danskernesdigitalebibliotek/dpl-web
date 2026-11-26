import {
  type ServiceLayerConfig,
  ServiceLayerProvider,
  digitalLoanDecisionQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { storyServiceLayerConfig } from "@/components/shared/editionsSelectModal/stories.fixtures"
import WorkTeaser from "@/components/shared/workTeaser/WorkTeaser"
import { getWorkTeaserProps } from "@/components/shared/workTeaser/helper"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const NEWEST_ISBN = "9788700000022"
const OLDER_ISBN = "9788700000015"

// Two e-book manifestations of one work. Each has its own title, so the story
// shows which one the teaser picked.
const ebook = (isbn: string, year: number, title: string) =>
  eBookManifestationFactory.build({
    pid: `870970-basis:${isbn}`,
    identifiers: [{ type: "PUBLIZON", value: isbn }],
    titles: { full: [title], main: [title] },
    edition: {
      publicationYear: { display: String(year), year },
      edition: "",
      summary: String(year),
    },
  })

const newest = ebook(NEWEST_ISBN, 2024, "Nyeste udgave (ikke BLÅ)")
const older = ebook(OLDER_ISBN, 2019, "Ældre udgave (BLÅ)")

const work = {
  workId: "work-of:870970-basis:stories",
  titles: { full: ["Værkets titel"] },
  creators: [{ __typename: "Person", display: "Forfatter Forfattersen" }],
  materialTypes: [],
  manifestations: { all: [newest, older], bestRepresentation: newest },
} as unknown as WorkTeaserSearchPageFragment

type SeedOptions = {
  // The material id Biblio answers with the cost-free ("BLÅ") loan provider.
  blueIdentifier?: string
  // Leave every decision in flight, which is what the skeleton stands for.
  pending?: boolean
}

const seedClient = ({ blueIdentifier, pending }: SeedOptions = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })

  // React Query reports a disabled query as settled, so the waiting state
  // needs a real in-flight query rather than an absent one.
  ;[NEWEST_ISBN, OLDER_ISBN].forEach(identifier => {
    if (pending) {
      // Not awaited: the promise never settles, which is the point.
      void client.prefetchQuery({
        queryKey: digitalLoanDecisionQueryKey(identifier),
        queryFn: () => new Promise(() => {}),
      })
      return
    }
    client.setQueryData(digitalLoanDecisionQueryKey(identifier), {
      status: "loanable",
      loanProvider: identifier === blueIdentifier ? "selection" : "click",
    })
  })

  return client
}

const withQueryClient =
  (client: QueryClient, config: ServiceLayerConfig = storyServiceLayerConfig) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <ServiceLayerProvider config={config}>
        <div className="w-72 p-10">
          <Story />
        </div>
      </ServiceLayerProvider>
    </QueryClientProvider>
  )

// The teaser listed in search results and sliders. It shows the manifestation
// the work page lands on: the newest BLÅ one of the linked type, else the
// newest.
const meta = {
  title: "components/WorkTeaser",
  component: WorkTeaser,
  parameters: { layout: "centered" },
  args: getWorkTeaserProps(work),
} satisfies Meta<typeof WorkTeaser>

export default meta
type Story = StoryObj<typeof meta>

// An older manifestation is BLÅ, so its title and cover are shown and the
// e-book icon and badge are blue.
export const OlderBlueManifestation: Story = {
  decorators: [withQueryClient(seedClient({ blueIdentifier: OLDER_ISBN }))],
}

export const OlderBlueManifestationDarkMode: Story = {
  decorators: [withQueryClient(seedClient({ blueIdentifier: OLDER_ISBN })), darkModeDecorator],
}

// No manifestation is BLÅ, so the newest is shown.
export const NoBlueManifestation: Story = {
  decorators: [withQueryClient(seedClient())],
}

// Without a borrowing session nothing is asked, so the newest is shown at
// once.
export const Anonymous: Story = {
  decorators: [
    withQueryClient(seedClient({ pending: true }), {
      ...storyServiceLayerConfig,
      canUseDigitalLoans: false,
    }),
  ],
}

// The decisions are still in flight, so the teaser holds its skeleton.
export const Waiting: Story = {
  decorators: [withQueryClient(seedClient({ pending: true }))],
}
