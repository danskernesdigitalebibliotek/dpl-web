import { type Loan, ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import LoanDetailsModal from "@/components/shared/loanDetailsModal/LoanDetailsModal"
import { Toaster } from "@/components/shared/toaster/Toaster"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"

// Dates are computed relative to "now" so the rendered values stay stable
// over time (e.g. in Chromatic snapshots).
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const fixtureCover = coverFactory.build({
  thumbnail: "https://placehold.co/120x173/5b4a8a/ffffff.jpg?text=Sj%C3%A6lerytterne",
  xSmall: {
    url: "https://placehold.co/120x173/5b4a8a/ffffff.jpg?text=Sj%C3%A6lerytterne",
    width: 120,
    height: 173,
  },
  small: {
    url: "https://placehold.co/240x346/5b4a8a/ffffff.jpg?text=Sj%C3%A6lerytterne",
    width: 240,
    height: 346,
  },
  medium: {
    url: "https://placehold.co/480x691/5b4a8a/ffffff.jpg?text=Sj%C3%A6lerytterne",
    width: 480,
    height: 691,
  },
  large: {
    url: "https://placehold.co/500x720/5b4a8a/ffffff.jpg?text=Sj%C3%A6lerytterne",
    width: 500,
    height: 720,
  },
})

const fixtureManifestation = eBookManifestationFactory.build({
  pid: "870970-basis:12345671",
  cover: fixtureCover,
  materialTypes: [
    {
      materialTypeGeneral: { display: "bøger", code: "BOOKS" },
      materialTypeSpecific: { code: "BOOK", display: "bog" },
    },
  ],
})

const fixtureLoan: Loan = {
  loanId: 12345671,
  recordId: "12345671",
  dueDate: daysFromNow(8),
  loanDate: daysFromNow(-22),
  materialItemNumber: "87454647634",
  isRenewable: true,
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
        {/* Non-dismissing so error toasts stay visible for review/snapshots. */}
        <Toaster duration={Infinity} />
      </ServiceLayerProvider>
    </QueryClientProvider>
  )

const meta = {
  title: "components/LoanDetailsModal",
  component: LoanDetailsModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoanDetailsModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  loan: fixtureLoan,
  manifestation: fixtureManifestation,
  title: "Sjælerytterne",
  creators: "Helena Dahlgren",
}

export const Default: Story = {
  decorators: [withServiceLayer()],
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
  args: defaultArgs,
}

// The renew option is decided by FBS (isRenewable); without it the modal is
// informational only.
export const NotRenewable: Story = {
  decorators: [withServiceLayer()],
  args: {
    ...defaultArgs,
    loan: { ...fixtureLoan, isRenewable: false },
  },
}

// Stub the FBS renew endpoint and auto-click "Forny lån" so the story renders
// the requested renewal outcome on load.
const renewalStory = (renewalStatus: string[]): Story => ({
  decorators: [withServiceLayer()],
  beforeEach: () => {
    const original = window.fetch
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString()
      if (url.includes("/loans/renew/v2") && init?.method === "POST") {
        const loanIds = JSON.parse(String(init.body)) as number[]
        const body = loanIds.map(loanId => ({
          renewalStatus,
          loanDetails: {
            loanId,
            recordId: String(loanId),
            dueDate: daysFromNow(30),
            loanDate: daysFromNow(0),
            loanType: "loan",
            materialItemNumber: "87454647634",
          },
        }))
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      return original(input, init)
    }) as typeof fetch
    return () => {
      // Restore original fetch when story unmounts so other stories aren't affected.
      window.fetch = original
    }
  },
  play: async () => {
    // The modal renders to a portal, so query against document.body via
    // screen instead of canvasElement.
    const { screen, userEvent } = await import("@storybook/test")
    const button = await screen.findByRole("button", { name: /forny lån/i })
    await userEvent.click(button)
  },
  args: defaultArgs,
})

export const RenewalSucceeds = renewalStory(["renewed"])
export const RenewalDenied = renewalStory(["deniedReserved"])
