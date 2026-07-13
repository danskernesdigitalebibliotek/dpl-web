import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import LoanSlider from "@/app/(pages)/user/profile/LoanSlider"
import {
  fixtureWorks,
  loanListResult,
  seedClient,
  withQueryClient,
} from "@/app/(pages)/user/profile/digitalLoansStoryFixtures"

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
