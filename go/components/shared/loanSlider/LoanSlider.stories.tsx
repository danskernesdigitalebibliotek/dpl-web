import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import {
  fixtureBiblioLoans,
  fixtureMergedWorks,
  fixtureWorks,
  loanListResult,
  seedClient,
  withQueryClient,
} from "@/components/shared/digitalLoansModal/digitalLoansStoryFixtures"
import LoanSlider from "@/components/shared/loanSlider/LoanSlider"

const meta = {
  title: "profile/LoanSlider",
  component: LoanSlider,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoanSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks,
    loanData: loanListResult,
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withQueryClient(seedClient()), darkModeDecorator],
  args: {
    works: fixtureWorks,
    loanData: loanListResult,
  },
}

export const OneLoan: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks.slice(0, 1),
    loanData: { loans: loanListResult.loans.slice(0, 1) },
  },
}

// A cost-free ("BLÅ") title whose loan is running out: the orange warning
// label and the BLÅ badge render together on the same card.
export const ExpiringBlueTitle: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureWorks.slice(4, 5),
    loanData: { loans: loanListResult.loans.slice(4, 5) },
  },
}

// With the Biblio adapter switched on, the slider shows both providers'
// loans side by side — Publizon loans keep their cards until they expire.
// TODO(publizon-sunset): remove when the Publizon API is phased out — see
// the matching story in DigitalLoansModal.stories.tsx.
export const MergedWithBiblioLoans: Story = {
  decorators: [withQueryClient(seedClient())],
  args: {
    works: fixtureMergedWorks,
    loanData: loanListResult,
    biblioLoans: fixtureBiblioLoans,
  },
}

// "Vis alle" in the overview opens the digital loans modal with one row per
// loan: cover, title, author and expiry status.
export const ViewAllModal: Story = {
  decorators: [withQueryClient(seedClient())],
  play: async () => {
    // The modal renders to a portal, so query document.body via screen.
    const { screen, userEvent } = await import("@storybook/test")
    const button = await screen.findByRole("button", { name: /vis alle/i })
    await userEvent.click(button)
    await screen.findByRole("dialog")
  },
  args: {
    works: fixtureWorks,
    loanData: loanListResult,
  },
}

export const Empty: Story = {
  decorators: [withQueryClient(seedClient({ loans: [] }))],
  args: {
    works: [],
    loanData: { loans: [] },
  },
}
