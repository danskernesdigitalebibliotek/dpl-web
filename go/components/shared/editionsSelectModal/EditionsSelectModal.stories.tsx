import {
  ServiceLayerProvider,
  digitalLoanDecisionQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import EditionsSelectModal from "@/components/shared/editionsSelectModal/EditionsSelectModal"
import {
  buildEditions,
  getMaterialId,
  storyServiceLayerConfig,
} from "@/components/shared/editionsSelectModal/stories.fixtures"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import workMock from "@/lib/mocks/work/infoBox.mock"

const WID = "work-of:870970-basis:12345678"
const MATERIAL_TYPE_CODE = "EBOOK"

const editions = buildEditions()

type SeedOptions = {
  // The material id of an edition the reader cannot borrow right now.
  unavailableIdentifier?: string
  // Leave every decision in flight, which is what the skeletons stand for.
  pending?: boolean
}

// The modal reads the work's editions out of the query cache, the same place
// the work page fills from.
const seedClient = ({ unavailableIdentifier, pending }: SeedOptions = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })

  client.setQueryData(useGetMaterialQuery.getKey({ wid: WID }), {
    work: {
      ...workMock,
      workId: WID,
      manifestations: {
        ...workMock.manifestations,
        all: editions,
        bestRepresentation: editions[0],
      },
    },
  })

  // Every digital edition needs an answer, or the grid stays on skeletons.
  // React Query reports a disabled query as settled, so the waiting state
  // needs a real in-flight query rather than an absent one.
  editions.forEach(edition => {
    const identifier = getMaterialId(edition)
    if (pending) {
      // Not awaited: the promise never settles, which is the point. It stays
      // in memory and never reaches the network.
      void client.prefetchQuery({
        queryKey: digitalLoanDecisionQueryKey(identifier),
        queryFn: () => new Promise(() => {}),
      })
      return
    }
    client.setQueryData(digitalLoanDecisionQueryKey(identifier), {
      status: identifier === unavailableIdentifier ? "unavailable" : "loanable",
    })
  })

  return client
}

const withQueryClient =
  (client: QueryClient) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <ServiceLayerProvider config={storyServiceLayerConfig}>
        <Story />
      </ServiceLayerProvider>
    </QueryClientProvider>
  )

const meta = {
  title: "modals/EditionsSelectModal",
  component: EditionsSelectModal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EditionsSelectModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  open: true,
  onClose: () => {},
  wid: WID,
  materialTypeCode: MATERIAL_TYPE_CODE,
  choicePid: "pid-1",
  onChoiceConfirm: () => {},
}

// The real dialog, so the grid's own breakpoint classes are what gets looked
// at. Resize the preview to see the column count change.
export const Default: Story = {
  decorators: [withQueryClient(seedClient())],
  args: baseArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [withQueryClient(seedClient()), darkModeDecorator],
  args: baseArgs,
}

// A digital edition the reader cannot borrow right now, which stays
// selectable. The modal words this as "Udlånt til dig".
export const EditionUnavailable: Story = {
  decorators: [withQueryClient(seedClient({ unavailableIdentifier: "9788762722882" }))],
  args: baseArgs,
}

// The editions are known but no availability answer is, so the grid holds its
// skeletons.
export const Loading: Story = {
  decorators: [withQueryClient(seedClient({ pending: true }))],
  args: baseArgs,
}
