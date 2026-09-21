import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import {
  fixtureItems,
  withServiceLayer,
} from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"
import PhysicalLoansModal from "@/components/shared/physicalLoansModal/PhysicalLoansModal"

const meta = {
  title: "modals/PhysicalLoansModal",
  component: PhysicalLoansModal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PhysicalLoansModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  open: true,
  onClose: () => {},
  // Reversed so the stories show the modal's own sorting: the list must
  // render soonest-due first regardless of the order it receives.
  items: [...fixtureItems].reverse(),
}

// The list view: one row per physical loan with cover, title and due status,
// sorted soonest-due first.
export const List: Story = {
  decorators: [withServiceLayer()],
  args: baseArgs,
}

export const ListDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: baseArgs,
}

// Clicking a row slides forward to the "Dit lån" details with the renew
// action in the footer.
export const LoanDetails: Story = {
  decorators: [withServiceLayer()],
  args: baseArgs,
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const [firstRow] = await screen.findAllByRole("button", { name: /vis detaljer/i })
    await userEvent.click(firstRow)
    await screen.findByRole("heading", { name: "Dit lån" })
  },
}
