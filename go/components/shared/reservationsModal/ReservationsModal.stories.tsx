import {
  type Patron,
  type Reservation,
  patronQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import type { QueryClient } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import {
  fixtureItems,
  withServiceLayer,
} from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"
import ReservationsModal from "@/components/shared/reservationsModal/ReservationsModal"
import { branchTitleQueryKey } from "@/hooks/useBranchTitle.keys"
import { ReservationItem } from "@/lib/helpers/helper.patron"

const fixtureBranch = { isilId: "DK-761500", title: "Hovedbiblioteket" }

const fixturePatron: Patron = {
  name: "Test Bruger",
  isLocked: false,
  pickupBranchId: fixtureBranch.isilId,
  emailAddress: "test@example.com",
  phoneNumber: "+4512345678",
}

// Branch titles and patron data come from server actions the Storybook
// build can't run, so both are seeded — the "Afhentningssted" / sms /
// e-mail cards in "Din reservering" depend on them.
const seedDetails = (client: QueryClient) => {
  client.setQueryData(branchTitleQueryKey(fixtureBranch.isilId), fixtureBranch.title)
  client.setQueryData(patronQueryKey(), fixturePatron)
}

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const buildReservation = (index: number, overrides: Partial<Reservation> = {}): ReservationItem => {
  const { work, manifestation } = fixtureItems[index]
  return {
    reservation: {
      reservationId: index,
      recordId: fixtureItems[index].loan.recordId,
      pickupBranchId: "DK-761500",
      numberInQueue: 3,
      state: "reserved",
      pickupDeadline: undefined,
      pickupNumber: undefined,
      ...overrides,
    },
    work,
    manifestation,
  }
}

// All status states a reservation can be in: ready for pickup, pickup
// deadline exceeded, first in queue, and further back in the queue.
const reservationItems = [
  buildReservation(0, {
    state: "readyForPickup",
    numberInQueue: undefined,
    pickupDeadline: daysFromNow(6),
    pickupNumber: "Reol 13",
  }),
  buildReservation(1, {
    state: "readyForPickup",
    numberInQueue: undefined,
    pickupDeadline: daysFromNow(-2),
  }),
  buildReservation(2, { numberInQueue: 1 }),
  buildReservation(3, { numberInQueue: 4 }),
]

// One dialog with internal views: the reservations list (split into "Klar
// til afhentning" and "I kø"), the "Din reservering" details, the deletion
// confirm step, and the deletion receipt — modals are never stacked.
const meta = {
  title: "modals/ReservationsModal",
  component: ReservationsModal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ReservationsModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  open: true,
  onClose: () => {},
  items: reservationItems,
}

// The list view: ready-for-pickup rows show the green pickup box, queued
// rows their queue position, expired rows the re-reserve notice.
export const List: Story = {
  decorators: [withServiceLayer()],
  args: baseArgs,
}

export const ListDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: baseArgs,
}

// Clicking a row slides forward to "Din reservering" with pickup and
// notification details, and the delete action in the footer.
export const ReservationDetails: Story = {
  decorators: [withServiceLayer(seedDetails)],
  args: baseArgs,
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const [firstRow] = await screen.findAllByRole("button", {
      name: /se detaljer om din reservering/i,
    })
    await userEvent.click(firstRow)
    await screen.findByRole("heading", { name: "Din reservering" })
  },
}
