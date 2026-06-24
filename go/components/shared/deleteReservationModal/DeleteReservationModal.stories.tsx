import {
  Reservation,
  ServiceLayerProvider,
  reservationsQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { Button } from "@/components/shared/button/Button"
import DeleteReservationModal from "@/components/shared/deleteReservationModal/DeleteReservationModal"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import manifestationMock from "@/lib/mocks/manifestation/infoBox.mock"
import workMock from "@/lib/mocks/work/infoBox.mock"

const physicalManifestation = {
  ...manifestationMock,
  pid: "870970-basis:12345678",
  materialTypes: [
    {
      materialTypeGeneral: { display: "bøger", code: "BOOKS" },
      materialTypeSpecific: { code: "BOOK", display: "bog" },
    },
  ],
  titles: { full: ["Ravnenes hvisken. Bog 1"], original: [] },
}

const physicalWork = {
  ...workMock,
  workId: "work-of:870970-basis:12345678",
  manifestations: {
    ...workMock.manifestations,
    all: [physicalManifestation],
    bestRepresentation: physicalManifestation,
    latest: physicalManifestation,
  },
}

const wid = physicalWork.workId
const pid = physicalManifestation.pid

const fixtureReservation: Reservation = {
  reservationId: 987654,
  recordId: "12345678",
  pickupBranchId: "DK-761500",
  numberInQueue: 3,
  state: "reserved",
}

const seedClient = ({ reservations }: { reservations?: Reservation[] } = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(useGetMaterialQuery.getKey({ wid }), { work: physicalWork })
  if (reservations) client.setQueryData(reservationsQueryKey(), reservations)
  return client
}

const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
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
  title: "components/DeleteReservationModal",
  component: DeleteReservationModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DeleteReservationModal>

export default meta
type Story = StoryObj<typeof meta>

// Confirm step: reservation exists for the manifestation.
export const Confirm: Story = {
  decorators: [withQueryClient(seedClient({ reservations: [fixtureReservation] }))],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

export const ConfirmDarkMode: Story = {
  decorators: [
    withQueryClient(seedClient({ reservations: [fixtureReservation] })),
    darkModeDecorator,
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

// The receipt step is internal state only reachable after a successful delete,
// so the presentational receipt is shown inside the modal chrome directly.
export const Receipt: StoryObj<typeof DeleteReservationReceiptContent> = {
  render: args => (
    <ResponsiveDialog open onClose={() => {}} title="Slet reservering">
      <DeleteReservationReceiptContent {...args} />
      <ResponsiveDialog.Actions>
        <Button theme="primary" size="lg" onClick={() => {}}>
          OK
        </Button>
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  ),
  args: { cover: physicalManifestation.cover },
}

// Failure case: stub the DELETE to fail, then click "Slet reservering" so the
// real modal advances to its error step on load (mirrors the make-reservation
// modal's error stories).
export const Failure: Story = {
  decorators: [withQueryClient(seedClient({ reservations: [fixtureReservation] }))],
  beforeEach: () => {
    const original = window.fetch
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "DELETE") {
        return Promise.resolve(new Response(null, { status: 500 }))
      }
      return original(input, init)
    }) as typeof fetch
    return () => {
      // Restore original fetch when story unmounts so other stories aren't affected.
      window.fetch = original
    }
  },
  play: async () => {
    // ResponsiveDialog renders to a portal, so query document.body via screen.
    const { screen, userEvent } = await import("@storybook/test")
    const button = await screen.findByRole("button", { name: /slet reservering/i })
    await userEvent.click(button)
  },
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}
