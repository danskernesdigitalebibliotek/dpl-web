import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import { daysFromNow } from "@/components/shared/digitalLoansModal/digitalLoansStoryFixtures"
import LoanDetailsModal from "@/components/shared/loanDetailsModal/LoanDetailsModal"
import {
  buildItem,
  withServiceLayer,
} from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"

// The renewable "Sjælerytterne" fixture from the shared physical loan set —
// plain placeholder covers, dates relative to "now". 7 days lands inside
// the renewal window (7) but outside the warning threshold (6): neutral
// status with an active "Forny lån" button.
const fixtureItem = buildItem({
  faust: "12345671",
  title: "Sjælerytterne",
  dueInDays: 7,
  isRenewable: true,
})
const fixtureLoan = fixtureItem.loan
const fixtureManifestation = fixtureItem.manifestation

const meta = {
  title: "modals/LoanDetailsModal",
  component: LoanDetailsModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoanDetailsModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  loan: fixtureLoan,
  manifestation: fixtureManifestation,
  title: "Sjælerytterne",
  creators: "Helena Dahlgren",
}

export const Default: Story = {
  decorators: [withServiceLayer()],
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: defaultArgs,
}

// Whether renewal is possible is FBS' per-loan call; when blocked the button
// is disabled with the denial reason above it.
export const NotRenewableReserved: Story = {
  decorators: [withServiceLayer()],
  args: {
    ...defaultArgs,
    loan: { ...fixtureLoan, isRenewable: false, nonRenewableReason: "deniedReserved" as const },
  },
}

// Blocked without a documented reason: the generic fallback copy.
export const NotRenewableUnknownReason: Story = {
  decorators: [withServiceLayer()],
  args: {
    ...defaultArgs,
    loan: { ...fixtureLoan, isRenewable: false, nonRenewableReason: undefined },
  },
}

// More than `renewalWindow` days to the due date: Cicero doesn't allow
// renewal yet, so the button is disabled with a countdown to the renew date.
export const RenewalWindowNotOpen: Story = {
  decorators: [withServiceLayer()],
  args: {
    ...defaultArgs,
    loan: { ...fixtureLoan, dueDate: daysFromNow(14) },
  },
}

// Stub the FBS renew endpoint and auto-click "Forny lån" so the story renders
// the requested renewal outcome on load.
const renewalStory = (renewalStatus: string[]): Story => ({
  decorators: [withServiceLayer()],
  beforeEach: () => {
    const original = window.fetch
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString()
      if (url.includes("/loans/renew/v2") && init?.method === "POST") {
        const loanIds = JSON.parse(String(init.body)) as number[]
        const body = loanIds.map(loanId => ({
          renewalStatus,
          loanDetails: {
            loanId,
            recordId: String(loanId),
            dueDate: daysFromNow(30),
            loanDate: daysFromNow(0),
            loanType: "loan",
            materialItemNumber: "87454647634",
          },
        }))
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      return original(input, init)
    }) as typeof fetch
    return () => {
      // Restore original fetch when story unmounts so other stories aren't affected.
      window.fetch = original
    }
  },
  play: async () => {
    // The modal renders to a portal, so query against document.body via
    // screen instead of canvasElement.
    const { screen, userEvent } = await import("@storybook/test")
    const button = await screen.findByRole("button", { name: /forny lån/i })
    await userEvent.click(button)
  },
  args: defaultArgs,
})

export const RenewalSucceeds = renewalStory(["renewed"])
// Denial stories exercise the reason-specific toast copy buckets
// (incl. the deniedOtherReason fallback for undocumented codes).
export const RenewalDeniedReserved = renewalStory(["deniedReserved"])
export const RenewalDeniedMaxRenewals = renewalStory(["deniedMaxRenewalsReached"])
export const RenewalDeniedBlocked = renewalStory(["deniedLoanerIsBlocked"])
export const RenewalDeniedUnknownReason = renewalStory(["someUndocumentedCode"])
