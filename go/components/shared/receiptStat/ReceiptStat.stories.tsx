import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ReceiptStat from "@/components/shared/receiptStat/ReceiptStat"

// A single term/value stat shown on receipt views (loan renewal,
// reservation). Rendered inside a <dl> at the call sites.
const meta = {
  title: "components/ReceiptStat",
  component: ReceiptStat,
  parameters: { layout: "centered" },
  args: {
    term: "Skal afleveres",
    value: "24. juli 2026",
  },
} satisfies Meta<typeof ReceiptStat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <dl className="w-96">
      <ReceiptStat {...args} />
    </dl>
  ),
}

// Side by side as on the reservation receipt.
export const TwoColumns: Story = {
  render: args => (
    <dl className="grid w-96 grid-cols-2 gap-4">
      <ReceiptStat {...args} term="Afhentes senest" value="30. juli 2026" />
      <ReceiptStat {...args} term="Nummer i køen" value="3" />
    </dl>
  ),
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <dl className="w-96">
      <ReceiptStat {...args} />
    </dl>
  ),
}
