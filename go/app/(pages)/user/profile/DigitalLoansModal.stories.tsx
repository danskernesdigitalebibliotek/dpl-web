import type { Meta, StoryObj } from "@storybook/nextjs"

import DigitalLoansModal, { buildSelectedLoan } from "@/app/(pages)/user/profile/DigitalLoansModal"
import {
  fixtureWorks,
  loanListResult,
  seedClient,
  withQueryClient,
} from "@/app/(pages)/user/profile/digitalLoansStoryFixtures"

// The digital loans modal is one dialog with internal views: the loan list,
// the "Dit lån" details, and (for audiobooks) the player. Navigation between
// views slides directionally; modals are never stacked.
const meta = {
  title: "profile/DigitalLoansModal",
  component: DigitalLoansModal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DigitalLoansModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  open: true,
  onClose: () => {},
  works: fixtureWorks,
  loanData: loanListResult,
}

// The list view: one row per loan with cover, title, author and expiry
// status. Opened via "Vis alle" in the loans overview.
export const List: Story = {
  decorators: [withQueryClient(seedClient())],
  args: baseArgs,
}

// Clicking a row slides forward to the "Dit lån" details. The header gains a
// back button (returning to the list) and the actions footer slides in with
// the primary action — "Læs e-bog" for this e-book loan.
export const LoanDetails: Story = {
  decorators: [withQueryClient(seedClient())],
  args: baseArgs,
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const [firstRow] = await screen.findAllByText("Dette er titlen på en e-bog")
    await userEvent.click(firstRow)
    await screen.findByRole("heading", { name: "Dit lån" })
  },
}

// Opened directly on a loan (clicking a slider card): the list was never
// shown, so the details view has no back button — closing is the only exit.
export const OpenedFromCard: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    ...baseArgs,
    initialLoan: buildSelectedLoan(fixtureWorks[0], loanListResult),
  },
}

// An audiobook loan carries a "Lyt til lydbog" action instead of the read
// link. Clicking it slides forward to the in-modal player view; the back
// button returns to the details.
export const Player: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    ...baseArgs,
    initialLoan: buildSelectedLoan(fixtureWorks[1], loanListResult),
  },
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const listenButton = await screen.findByRole("button", { name: /lyt til lydbog/i })
    await userEvent.click(listenButton)
    await screen.findByRole("heading", { name: /lyt til lydbog/i })
  },
}

// Full round trip through the flow: list → details → back → list. Ends on
// the list view after exercising both transition directions.
export const BackNavigation: Story = {
  decorators: [withQueryClient(seedClient())],
  args: baseArgs,
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const [firstRow] = await screen.findAllByText("Dette er titlen på en e-bog")
    await userEvent.click(firstRow)
    await screen.findByRole("heading", { name: "Dit lån" })
    const backButton = await screen.findByRole("button", { name: "Tilbage" })
    await userEvent.click(backButton)
    await screen.findByRole("heading", { name: /digitale lån/i })
  },
}
