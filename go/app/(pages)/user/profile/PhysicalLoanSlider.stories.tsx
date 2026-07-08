import { type Loan, ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import PhysicalLoanSlider, { PhysicalLoanItem } from "@/app/(pages)/user/profile/PhysicalLoanSlider"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { EBookFactory } from "@/cypress/factories/fbi/factory-parts/works"

// Due dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const buildCover = (color: string, text: string) => {
  const url = (w: number, h: number) =>
    `https://placehold.co/${w}x${h}/${color}/ffffff.jpg?text=${encodeURIComponent(text)}`
  return coverFactory.build({
    thumbnail: url(120, 173),
    xSmall: { url: url(120, 173), width: 120, height: 173 },
    small: { url: url(240, 346), width: 240, height: 346 },
    medium: { url: url(480, 691), width: 480, height: 691 },
    large: { url: url(500, 720), width: 500, height: 720 },
  })
}

const buildItem = ({
  faust,
  title,
  dueInDays,
  isRenewable,
  coverColor,
}: {
  faust: string
  title: string
  dueInDays: number
  isRenewable: boolean
  coverColor: string
}): PhysicalLoanItem => {
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${faust}`,
    cover: buildCover(coverColor, title),
    materialTypes: [
      {
        materialTypeGeneral: { display: "bøger", code: "BOOKS" },
        materialTypeSpecific: { code: "BOOK", display: "bog" },
      },
    ],
  })
  const work = EBookFactory.build({
    workId: `work-of:870970-basis:${faust}`,
    titles: { full: [title] },
    manifestations: { all: [manifestation], bestRepresentation: manifestation },
  })
  const loan: Loan = {
    loanId: Number(faust),
    recordId: faust,
    dueDate: daysFromNow(dueInDays),
    loanDate: daysFromNow(dueInDays - 30),
    materialItemNumber: `50${faust}`,
    isRenewable,
  }
  return { loan, work, manifestation }
}

const fixtureItems: PhysicalLoanItem[] = [
  buildItem({
    faust: "12345671",
    title: "Sjælerytterne",
    dueInDays: 0,
    isRenewable: false,
    coverColor: "5b4a8a",
  }),
  buildItem({
    faust: "12345672",
    title: "Den sultne larve Aldrigmæt",
    dueInDays: 8,
    isRenewable: true,
    coverColor: "3a7d44",
  }),
  buildItem({
    faust: "12345673",
    title: "Vi snakker ikke om Jonathan",
    // 1.5 days so differenceInDays yields a full day and the card shows the
    // singular "om 1 dag" state instead of rounding down to "nu".
    dueInDays: 1.5,
    isRenewable: true,
    coverColor: "d95d39",
  }),
  buildItem({
    faust: "12345674",
    title: "Den meget sultne larve",
    dueInDays: 24,
    isRenewable: false,
    coverColor: "2b6777",
  }),
]

const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
}

const withServiceLayer =
  () =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ServiceLayerProvider config={storyServiceLayerConfig}>
        <Story />
      </ServiceLayerProvider>
    </QueryClientProvider>
  )

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
  },
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: {
    items: fixtureItems,
  },
}

export const OneLoan: Story = {
  decorators: [withServiceLayer()],
  args: {
    items: fixtureItems.slice(1, 2),
  },
}

export const Empty: Story = {
  decorators: [withServiceLayer()],
  args: {
    items: [],
  },
}

// Clicking "Forny lån" on a card opens the loan details modal.
export const OpensLoanDetails: Story = {
  decorators: [withServiceLayer()],
  play: async () => {
    // The modal renders to a portal, so query against document.body via
    // screen instead of canvasElement.
    const { screen, userEvent } = await import("@storybook/test")
    const cardButtons = await screen.findAllByRole("button", { name: /forny lån/i })
    await userEvent.click(cardButtons[0])
    await screen.findByRole("dialog")
  },
  args: {
    items: fixtureItems,
  },
}
