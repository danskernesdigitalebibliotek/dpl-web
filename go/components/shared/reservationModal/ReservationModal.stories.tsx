import {
  MaterialAvailability,
  Patron,
  Reservation,
  ServiceLayerProvider,
  materialAvailabilityQueryKey,
  patronQueryKey,
  reservationsQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ReservationModal from "@/components/shared/reservationModal/ReservationModal"
import { useGetBranchQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
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

const fixturePatron: Patron = {
  name: "Test Bruger",
  isLocked: false,
  pickupBranchId: "DK-761500",
  emailAddress: "test@example.com",
  phoneNumber: "+4512345678",
}

const fixtureAvailability: MaterialAvailability = {
  totalCopies: 14,
  reservationCount: 3,
}

const wid = physicalWork.workId
const pid = physicalManifestation.pid

const fixtureBranch = { isilId: "DK-761500", title: "Hovedbiblioteket" }

const seedClient = ({
  patron,
  availability,
  reservations,
}: {
  patron?: Patron
  availability?: MaterialAvailability
  reservations?: Reservation[]
} = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(useGetMaterialQuery.getKey({ wid }), { work: physicalWork })
  if (patron) client.setQueryData(patronQueryKey(), patron)
  if (availability) client.setQueryData(materialAvailabilityQueryKey(wid), availability)
  if (reservations) client.setQueryData(reservationsQueryKey(), reservations)
  // Seed the CMS branch lookup so both the form (patron's pickup branch) and
  // the receipt ("Bogen skal hentes på") render with a friendly name.
  client.setQueryData(useGetBranchQuery.getKey({ isilId: fixtureBranch.isilId }), {
    getBranch: fixtureBranch,
  })
  return client
}

const fixtureReservation: Reservation = {
  reservationId: 987654,
  recordId: "12345678",
  pickupBranchId: "DK-761500",
  numberInQueue: 3,
  state: "reserved",
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
  title: "components/ReservationModal",
  component: ReservationModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ReservationModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    withQueryClient(
      seedClient({ patron: fixturePatron, availability: fixtureAvailability, reservations: [] })
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

export const DefaultDarkMode: Story = {
  decorators: [
    withQueryClient(
      seedClient({ patron: fixturePatron, availability: fixtureAvailability, reservations: [] })
    ),
    darkModeDecorator,
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

export const PatronWithoutContactInfo: Story = {
  decorators: [
    withQueryClient(
      seedClient({
        patron: { ...fixturePatron, emailAddress: undefined, phoneNumber: undefined },
        availability: fixtureAvailability,
        reservations: [],
      })
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

export const PatronWithoutEmail: Story = {
  decorators: [
    withQueryClient(
      seedClient({
        patron: { ...fixturePatron, emailAddress: undefined },
        availability: fixtureAvailability,
        reservations: [],
      })
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

export const PatronWithoutPhone: Story = {
  decorators: [
    withQueryClient(
      seedClient({
        patron: { ...fixturePatron, phoneNumber: undefined },
        availability: fixtureAvailability,
        reservations: [],
      })
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}

// Receipt step is derived from server state: when a reservation for the
// manifestation already exists in cache, the modal renders the receipt
// instead of the form.
export const ReceiptStep: Story = {
  decorators: [
    withQueryClient(
      seedClient({
        patron: fixturePatron,
        availability: fixtureAvailability,
        reservations: [fixtureReservation],
      })
    ),
  ],
  args: {
    open: true,
    onClose: () => {},
    wid,
    pid,
  },
}
