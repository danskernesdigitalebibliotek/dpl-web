import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import InfoCard from "@/components/shared/infoCard/InfoCard"

// Icon + label + value rows used for pickup and notification details in the
// reservation modal.
const meta = {
  title: "components/InfoCard",
  component: InfoCard,
  parameters: { layout: "centered" },
  args: {
    icon: "pin",
    title: "Afhentningssted",
    value: "Hovedbiblioteket",
  },
} satisfies Meta<typeof InfoCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div className="w-96">
      <InfoCard {...args} />
    </div>
  ),
}

// Stacked as in the "Din reservering" view.
export const Stacked: Story = {
  render: args => (
    <div className="w-96 space-y-4">
      <InfoCard {...args} />
      <InfoCard icon="chat" title="Du får en sms når du kan hente bogen" value="12 34 56 78" />
      <InfoCard
        icon="envelope"
        title="Du får en e-mail når du kan hente bogen"
        value="laaner@eksempel.dk"
      />
    </div>
  ),
}

export const StackedDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="w-96 space-y-4">
      <InfoCard {...args} />
      <InfoCard icon="chat" title="Du får en sms når du kan hente bogen" value="12 34 56 78" />
      <InfoCard
        icon="envelope"
        title="Du får en e-mail når du kan hente bogen"
        value="laaner@eksempel.dk"
      />
    </div>
  ),
}
