// Shared fixtures for physical loan stories: loans in every status
// state, paired with works/manifestations, plus the service-layer decorator.
import { type Loan, ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { StoreModal } from "@/components/shared/dynamicModal/DynamicModal"
import { PhysicalLoanItem } from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import { Toaster } from "@/components/shared/toaster/Toaster"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { EBookFactory } from "@/cypress/factories/fbi/factory-parts/works"

// Due dates are computed relative to "now" so the rendered day counts stay
// stable over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

// Real covers come in varying proportions; the fixtures rotate through a
// tall, a standard and a near-square ratio so cover-edge-anchored details
// (material type icon) are exercised against all of them.
type CoverRatio = "tall" | "standard" | "square"

const coverSizes: Record<CoverRatio, { width: number; height: number }> = {
  tall: { width: 420, height: 720 },
  standard: { width: 500, height: 720 },
  square: { width: 660, height: 720 },
}

const buildCover = (ratio: CoverRatio) => {
  const { width, height } = coverSizes[ratio]
  const url = (scale: number) => `https://placehold.co/${width * scale}x${height * scale}.jpg`
  return coverFactory.build({
    thumbnail: url(1),
    xSmall: { url: url(1), width, height },
    small: { url: url(1), width, height },
    medium: { url: url(1), width, height },
    large: { url: url(1), width, height },
  })
}

export const buildItem = ({
  faust,
  title,
  dueInDays,
  isRenewable,
  coverRatio = "standard",
}: {
  faust: string
  title: string
  dueInDays: number
  isRenewable: boolean
  coverRatio?: CoverRatio
}): PhysicalLoanItem => {
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${faust}`,
    cover: buildCover(coverRatio),
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

// All possible status states a physical loan can be in: overdue (an exceeded
// loan can no longer be renewed by FBS), due today / due soon (with and
// without renewal), and neutral (with and without renewal).
export const fixtureItems: PhysicalLoanItem[] = [
  buildItem({
    faust: "12345670",
    title: "Vildheks",
    // Overdue: red "Afleveringsfrist overskredet" — never renewable.
    dueInDays: -3,
    isRenewable: false,
    coverRatio: "tall",
  }),
  buildItem({
    faust: "12345671",
    title: "Sjælerytterne",
    // Due today, renewable.
    dueInDays: 0,
    isRenewable: true,
    coverRatio: "square",
  }),
  buildItem({
    faust: "12345672",
    title: "Vi snakker ikke om Jonathan",
    // 1.5 days so differenceInDays yields a full day and the card shows the
    // singular "om 1 dag" state instead of rounding down to "i dag".
    dueInDays: 1.5,
    isRenewable: true,
  }),
  buildItem({
    faust: "12345673",
    title: "Den sultne larve Aldrigmæt",
    // Due soon but not renewable (e.g. reserved by another patron).
    dueInDays: 5.5,
    isRenewable: false,
    coverRatio: "tall",
  }),
  buildItem({
    faust: "12345674",
    title: "Den meget sultne larve",
    // Neutral, renewable.
    dueInDays: 14,
    isRenewable: true,
    coverRatio: "square",
  }),
  buildItem({
    faust: "12345675",
    title: "Halfdans ABC",
    // Neutral, not renewable.
    dueInDays: 24,
    isRenewable: false,
  }),
]

const storyServiceLayerConfig = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer story-token",
}

export const withServiceLayer =
  () =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ServiceLayerProvider config={storyServiceLayerConfig}>
        <Story />
        {/* Modals open through the global store, rendered by this host. */}
        <StoreModal />
        {/* Non-dismissing so error toasts stay visible for review/snapshots. */}
        <Toaster duration={Infinity} />
      </ServiceLayerProvider>
    </QueryClientProvider>
  )
