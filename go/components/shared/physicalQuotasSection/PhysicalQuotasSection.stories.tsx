import { type Reservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import {
  fixtureItems,
  withServiceLayer,
} from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"
import PhysicalQuotasSection from "@/components/shared/physicalQuotasSection/PhysicalQuotasSection"
import { ReservationItem } from "@/lib/helpers/helper.patron"

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

// One ready for pickup, two queued.
const reservationItems = [
  buildReservation(0, {
    state: "readyForPickup",
    numberInQueue: undefined,
    pickupDeadline: daysFromNow(6),
    pickupNumber: "Reol 13",
  }),
  buildReservation(1, { numberInQueue: 1 }),
  buildReservation(2, { numberInQueue: 4 }),
]

const meta = {
  title: "profile/PhysicalQuotasSection",
  component: PhysicalQuotasSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PhysicalQuotasSection>

export default meta
type Story = StoryObj<typeof meta>

// Loan and reservation counts; "Vis alle" opens the matching modal through
// the modal store (hosted by the decorator).
export const Default: Story = {
  decorators: [withServiceLayer()],
  args: {
    loanItems: fixtureItems,
    reservationItems,
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: {
    loanItems: fixtureItems,
    reservationItems,
  },
}

export const Empty: Story = {
  decorators: [withServiceLayer()],
  args: {
    loanItems: [],
    reservationItems: [],
  },
}
