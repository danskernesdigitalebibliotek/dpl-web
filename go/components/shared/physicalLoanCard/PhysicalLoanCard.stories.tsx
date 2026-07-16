import { type Loan, ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import PhysicalLoanCard from "@/components/shared/physicalLoanCard/PhysicalLoanCard"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"

// Due dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

let faustCounter = 22345670

const buildProps = ({
  title,
  materialType,
  dueInDays,
  isRenewable = false,
}: {
  title: string
  materialType: { code: string; display: string; general: GeneralMaterialTypeCodeEnum }
  dueInDays: number
  isRenewable?: boolean
}) => {
  const faust = String(faustCounter++)
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${faust}`,
    materialTypes: [
      {
        materialTypeGeneral: { display: materialType.display, code: materialType.general },
        materialTypeSpecific: materialType,
      },
    ],
  })
  const loan: Loan = {
    loanId: Number(faust),
    recordId: faust,
    dueDate: daysFromNow(dueInDays),
    loanDate: daysFromNow(dueInDays - 30),
    materialItemNumber: `50${faust}`,
    isRenewable,
  }
  return { loan, manifestation, title, workId: `work-of:870970-basis:${faust}` }
}

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

const CardGrid = ({ items }: { items: React.ComponentProps<typeof PhysicalLoanCard>[] }) => (
  <div className="flex flex-wrap gap-8 p-10">
    {items.map(item => (
      <div key={item.loan.loanId} className="w-72">
        <ShowcaseItem title={item.title} boxClassName="items-stretch">
          <PhysicalLoanCard {...item} />
        </ShowcaseItem>
      </div>
    ))}
  </div>
)

const meta = {
  title: "profile/PhysicalLoanCard",
  component: PhysicalLoanCard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PhysicalLoanCard>

export default meta
type Story = StoryObj<typeof meta>

// One card per physical material type, showing each material icon.
const materialTypeItems = [
  buildProps({
    title: "Bog",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: 14,
  }),
  buildProps({
    title: "Tegneserie",
    materialType: { code: "COMIC", display: "tegneserie", general: "COMICS" },
    dueInDays: 14,
  }),
  buildProps({
    title: "Graphic novel",
    materialType: { code: "GRAPHIC_NOVEL", display: "graphic novel", general: "COMICS" },
    dueInDays: 14,
  }),
  buildProps({
    title: "Billedbog",
    materialType: { code: "PICTURE_BOOK", display: "billedbog", general: "BOOKS" },
    dueInDays: 14,
  }),
]

export const MaterialTypes: Story = {
  decorators: [withServiceLayer()],
  args: materialTypeItems[0],
  render: () => <CardGrid items={materialTypeItems} />,
}

// Every due-status presentation: overdue (red, expanded), due today /
// due soon (orange, expanded), and neutral (plain text) — with and without
// the renew button.
const stateItems = [
  buildProps({
    title: "Afleveringsfrist overskredet",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: -3,
    isRenewable: true,
  }),
  buildProps({
    title: "Skal afleveres i dag",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: 0,
    isRenewable: true,
  }),
  buildProps({
    title: "Skal afleveres om 1 dag",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    // 1.5 days so differenceInDays yields a full day and the card shows the
    // singular "om 1 dag" state instead of rounding down to "i dag".
    dueInDays: 1.5,
    isRenewable: true,
  }),
  buildProps({
    title: "Skal afleveres om 5 dage",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: 5.5,
  }),
  buildProps({
    title: "Neutral med fornyelse",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: 24,
    isRenewable: true,
  }),
  buildProps({
    title: "Neutral uden fornyelse",
    materialType: { code: "BOOK", display: "bog", general: "BOOKS" },
    dueInDays: 24,
  }),
]

export const States: Story = {
  decorators: [withServiceLayer()],
  args: stateItems[0],
  render: () => <CardGrid items={stateItems} />,
}

export const StatesDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: stateItems[0],
  render: () => <CardGrid items={stateItems} />,
}
