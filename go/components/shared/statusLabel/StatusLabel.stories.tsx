import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem, ShowcaseTitle } from "@/.storybook/showcase"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"

const meta = {
  title: "components/StatusLabel",
  component: StatusLabel,
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "select", options: ["error", "warning", "success", "neutral"] },
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

// Plain text without a pill background.
export const Neutral: Story = {
  args: { variant: "neutral", children: "Skal afleveres om 8 dage" },
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

// All status labels per modal context, mirroring the design reference:
// compact labels on the "Min side" carousels, expanded labels (bold absolute
// subline) in list and material views.
const ContextColumn = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <ShowcaseItem title={title}>{children}</ShowcaseItem>
)

const ContextSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <ShowcaseTitle>{title}</ShowcaseTitle>
    <div className="grid gap-10 md:grid-cols-2">{children}</div>
  </section>
)

const ModalContextsShowcase = () => (
  <div className="space-y-14 p-10">
    <ContextSection title="Digitale lån">
      <ContextColumn title="Min side karrusel">
        <StatusLabel variant="neutral">Udløber om 8 dage</StatusLabel>
        <StatusLabel variant="warning">Udløber om 7 dage</StatusLabel>
      </ContextColumn>
      <ContextColumn title="Liste- og materialevisningen">
        <StatusLabel variant="neutral">Udløber om 8 dage</StatusLabel>
        <StatusLabel variant="warning" subline="Udløber 22. juli 2026">
          Udløber om 7 dage
        </StatusLabel>
      </ContextColumn>
    </ContextSection>

    <ContextSection title="Fysiske lån">
      <ContextColumn title="Min side karrusel">
        <StatusLabel variant="neutral">Skal afleveres om 8 dage</StatusLabel>
        <StatusLabel variant="warning">Skal afleveres om 7 dage</StatusLabel>
        <StatusLabel variant="warning">Skal afleveres i dag</StatusLabel>
        <StatusLabel variant="error">Afleveringsfrist overskredet</StatusLabel>
      </ContextColumn>
      <ContextColumn title="Liste- og materialevisningen">
        <StatusLabel variant="neutral" className="px-0 py-0" subline="Aflevér senest 28. juli 2026">
          Skal afleveres om 8 dage
        </StatusLabel>
        <StatusLabel variant="warning" subline="Aflevér senest 22. juli 2026">
          Skal afleveres om 7 dage
        </StatusLabel>
        <StatusLabel variant="warning" subline="Aflevér senest 20. jul. 2026">
          Afleveres i dag
        </StatusLabel>
        <StatusLabel variant="error" subline="Skulle afleveres 18. jul. 2026">
          Afleveringsfristen er overskredet med 2 dage
        </StatusLabel>
      </ContextColumn>
    </ContextSection>

    <ContextSection title="Reserveringer">
      <ContextColumn title="Min side karrusel">
        <StatusLabel variant="neutral">Der er 8 foran dig i køen</StatusLabel>
        <StatusLabel variant="success">Klar til afhentning</StatusLabel>
        <StatusLabel variant="neutral" className="bg-background-overlay px-4 py-1">
          Afhentningsfristen er overskredet
        </StatusLabel>
      </ContextColumn>
      <ContextColumn title="Liste- og materialevisningen">
        <StatusLabel variant="neutral" className="px-0 py-0" subline="Der er 8 foran dig i køen">
          Biblioteket har 128 eksemplarer
        </StatusLabel>
        <StatusLabel variant="success" subline="Afhent senest 22. juli 2026">
          <span>Nørrebro Bibliotek</span>
          <span>Afhentningsinfo: Reol 101</span>
        </StatusLabel>
        <StatusLabel
          variant="neutral"
          className="bg-background-overlay"
          subline="Afhentningsfristen er overskredet">
          Reserver igen for at låne materialet
        </StatusLabel>
      </ContextColumn>
    </ContextSection>
  </div>
)

export const ModalContexts: Story = {
  parameters: { layout: "fullscreen" },
  args: { children: "" },
  render: () => <ModalContextsShowcase />,
}

export const ModalContextsDarkMode: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [darkModeDecorator],
  args: { children: "" },
  render: () => <ModalContextsShowcase />,
}
