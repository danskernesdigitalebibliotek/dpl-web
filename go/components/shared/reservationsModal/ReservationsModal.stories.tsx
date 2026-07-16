import {
  type Reservation,
  ServiceLayerProvider,
  materialAvailabilityQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import {
  ExpiredPickup,
  PickupInfo,
  QueueStatus,
} from "@/components/shared/reservationsModal/ReservationsModal"
import { branchTitleQueryKey } from "@/hooks/useBranchTitle.keys"

const KNOWN_BRANCH = "DK-761500"
const UNKNOWN_BRANCH = "DK-000000"

const baseReservation: Reservation = {
  reservationId: 1,
  recordId: "143130762",
  pickupBranchId: KNOWN_BRANCH,
  numberInQueue: undefined,
  state: "readyForPickup",
  pickupDeadline: "2026-04-14",
  pickupNumber: "Reol 13",
}

// Every data shape the pickup info can receive: FBS may omit the shelf
// (pickupNumber), the deadline, or the branch title lookup may fail.
const cases: { name: string; description: string; reservation: Reservation }[] = [
  {
    name: "Alle oplysninger",
    description: "Bibliotek, reol og afhentningsfrist",
    reservation: baseReservation,
  },
  {
    name: "Uden reol",
    description: "pickupNumber mangler fra FBS",
    reservation: { ...baseReservation, pickupNumber: undefined },
  },
  {
    name: "Uden frist",
    description: "pickupDeadline mangler — ingen fed subline",
    reservation: { ...baseReservation, pickupDeadline: undefined },
  },
  {
    name: "Ukendt afhentningssted",
    description: "Filialtitlen kunne ikke slås op",
    reservation: { ...baseReservation, pickupBranchId: UNKNOWN_BRANCH },
  },
  {
    name: "Kun frist",
    description: "Hverken filial eller reol",
    reservation: {
      ...baseReservation,
      pickupBranchId: UNKNOWN_BRANCH,
      pickupNumber: undefined,
    },
  },
]

const WORK_ID = "work-of:870970-basis:143130762"

const seedClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(branchTitleQueryKey(KNOWN_BRANCH), "Bibliotekshuset")
  client.setQueryData(branchTitleQueryKey(UNKNOWN_BRANCH), null)
  client.setQueryData(materialAvailabilityQueryKey(WORK_ID), {
    totalCopies: 128,
    reservationCount: 9,
  })
  return client
}

const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
}

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={seedClient()}>
    <ServiceLayerProvider config={storyServiceLayerConfig}>
      <Story />
    </ServiceLayerProvider>
  </QueryClientProvider>
)

const PickupInfoShowcase = () => (
  <div className="space-y-8 p-10">
    <ShowcaseItem title="I kø" description="Eksemplarer og kø-position, uden boks (nummer 8 = 7 foran dig)">
      <QueueStatus
        reservation={{ ...baseReservation, state: "reserved", numberInQueue: 8 }}
        workId={WORK_ID}
      />
    </ShowcaseItem>
    <ShowcaseItem title="Næste i køen" description="numberInQueue = 1 — ingen foran dig">
      <QueueStatus
        reservation={{ ...baseReservation, state: "reserved", numberInQueue: 1 }}
        workId={WORK_ID}
      />
    </ShowcaseItem>
    {cases.map(({ name, description, reservation }) => (
      <ShowcaseItem key={name} title={name} description={description}>
        <PickupInfo reservation={reservation} />
      </ShowcaseItem>
    ))}
    <ShowcaseItem
      title="Frist overskredet"
      description="Afhentningsfristen er passeret — reserver igen">
      <ExpiredPickup />
    </ShowcaseItem>
  </div>
)

const meta = {
  title: "modals/ReservationsModal",
  component: PickupInfo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PickupInfo>

export default meta
type Story = StoryObj<typeof meta>

export const PickupInfoCases: Story = {
  decorators: [withQueryClient],
  args: { reservation: baseReservation },
  render: () => <PickupInfoShowcase />,
}

export const PickupInfoCasesDarkMode: Story = {
  decorators: [withQueryClient, darkModeDecorator],
  args: { reservation: baseReservation },
  render: () => <PickupInfoShowcase />,
}
