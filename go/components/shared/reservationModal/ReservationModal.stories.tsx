import {
  MaterialAvailability,
  Patron,
  ServiceLayerProvider,
  materialAvailabilityQueryKey,
  patronQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ReservationModal from "@/components/shared/reservationModal/ReservationModal"
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
  preferredPickupBranchId: "DK-761500",
  emailAddress: "test@example.com",
  phoneNumber: "+4512345678",
}

const fixtureAvailability: MaterialAvailability = {
  totalCopies: 14,
  reservationCount: 3,
}

const wid = physicalWork.workId
const pid = physicalManifestation.pid

const seedClient = ({
  patron,
  availability,
}: {
  patron?: Patron
  availability?: MaterialAvailability
} = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(useGetMaterialQuery.getKey({ wid }), { work: physicalWork })
  if (patron) client.setQueryData(patronQueryKey(), patron)
  if (availability) client.setQueryData(materialAvailabilityQueryKey(wid), availability)
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
  title: "components/ReservationModal",
  component: ReservationModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ReservationModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    withQueryClient(seedClient({ patron: fixturePatron, availability: fixtureAvailability })),
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
    withQueryClient(seedClient({ patron: fixturePatron, availability: fixtureAvailability })),
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
