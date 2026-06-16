import {
  Reservation,
  ServiceLayerProvider,
  reservationsQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import DeleteReservationModal from "@/components/shared/reservationModal/DeleteReservationModal"
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

// Receipt step is derived from absence of reservation in cache.
export const Receipt: Story = {
  decorators: [withQueryClient(seedClient({ reservations: [] }))],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}
