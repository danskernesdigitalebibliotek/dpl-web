import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import StatusLabel from "@/components/shared/statusLabel/StatusLabel"

const meta = {
  title: "components/StatusLabel",
  component: StatusLabel,
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "select", options: ["error", "warning", "success"] },
    inverted: { control: "boolean" },
  },
} satisfies Meta<typeof StatusLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {
  args: { variant: "error", children: "Mangler betaling" },
}

export const Warning: Story = {
  args: { variant: "warning", children: "Lån udløber" },
}

export const Success: Story = {
  args: { variant: "success", children: "Klar til dig" },
}

export const ErrorInverted: Story = {
  args: { variant: "error", inverted: true, children: "Frist overskredet" },
}

export const WarningInverted: Story = {
  args: { variant: "warning", inverted: true, children: "Lån udløber" },
}

export const SuccessInverted: Story = {
  args: { variant: "success", inverted: true, children: "Bogen er reserveret til dig" },
}

// Side-by-side overview of all variants.
export const Showcase: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <StatusLabel variant="error">Mangler betaling</StatusLabel>
        <StatusLabel variant="warning">Lån udløber</StatusLabel>
        <StatusLabel variant="success">Klar til dig</StatusLabel>
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusLabel variant="error" inverted>
          Frist overskredet
        </StatusLabel>
        <StatusLabel variant="warning" inverted>
          Lån udløber
        </StatusLabel>
        <StatusLabel variant="success" inverted>
          Bogen er reserveret til dig
        </StatusLabel>
      </div>
    </div>
  ),
}
