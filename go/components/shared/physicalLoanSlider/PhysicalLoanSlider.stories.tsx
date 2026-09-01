import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import PhysicalLoanSlider from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import {
  fixtureItems,
  withServiceLayer,
} from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"

const meta = {
  title: "profile/PhysicalLoanSlider",
  component: PhysicalLoanSlider,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PhysicalLoanSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withServiceLayer()],
  args: {
    items: fixtureItems,
    reservationItems: [],
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: {
    items: fixtureItems,
    reservationItems: [],
  },
}

export const OneLoan: Story = {
  decorators: [withServiceLayer()],
  args: {
    items: fixtureItems.slice(1, 2),
    reservationItems: [],
  },
}

export const Empty: Story = {
  decorators: [withServiceLayer()],
  args: {
    items: [],
    reservationItems: [],
  },
}

// Clicking "Forlæng lån" on a card opens the loan details modal.
export const OpensLoanDetails: Story = {
  decorators: [withServiceLayer()],
  play: async () => {
    // The modal renders to a portal, so query against document.body via
    // screen instead of canvasElement.
    const { screen, userEvent } = await import("@storybook/test")
    const cardButtons = await screen.findAllByRole("button", { name: /forlæng lån/i })
    await userEvent.click(cardButtons[0])
    await screen.findByRole("dialog")
  },
  args: {
    items: fixtureItems,
    reservationItems: [],
  },
}
