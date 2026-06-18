import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import LoanMaterialModal from "@/components/shared/loanMaterialModal/LoanMaterialModal"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import manifestationMock from "@/lib/mocks/manifestation/infoBox.mock"
import workMock from "@/lib/mocks/work/infoBox.mock"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"

const EBOOK_IDENTIFIER = "9788762722880"

const ebookManifestation = {
  ...manifestationMock,
  pid: "870970-basis:12345678",
  identifiers: [
    { type: "PUBLIZON", value: EBOOK_IDENTIFIER },
    { type: "ISBN", value: EBOOK_IDENTIFIER },
  ],
  materialTypes: [
    {
      materialTypeGeneral: { display: "e-bøger", code: "EBOOKS" },
      materialTypeSpecific: { code: "EBOOK", display: "e-bog" },
    },
  ],
  titles: { full: ["Emilie & Esther"], original: [] },
}

const ebookWork = {
  ...workMock,
  workId: "work-of:870970-basis:12345678",
  manifestations: {
    ...workMock.manifestations,
    all: [ebookManifestation],
    bestRepresentation: ebookManifestation,
    latest: ebookManifestation,
  },
}

const wid = ebookWork.workId
const pid = ebookManifestation.pid

const seedClient = ({ alreadyLoaned = false } = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(useGetMaterialQuery.getKey({ wid }), { work: ebookWork })
  client.setQueryData(getGetV1UserLoansAdapterQueryKey(), {
    loans: alreadyLoaned
      ? [{ libraryBook: { identifier: EBOOK_IDENTIFIER }, orderId: "x", orderDateUtc: "" }]
      : [],
  })
  return client
}

const withQueryClient =
  (client: QueryClient) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  )

const meta = {
  title: "components/LoanMaterialModal",
  component: LoanMaterialModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoanMaterialModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = { open: true, onClose: () => {}, wid, pid }

export const Default: Story = {
  decorators: [withQueryClient(seedClient())],
  args: baseArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [withQueryClient(seedClient()), darkModeDecorator],
  args: baseArgs,
}

export const AlreadyLoaned: Story = {
  decorators: [withQueryClient(seedClient({ alreadyLoaned: true }))],
  args: baseArgs,
}

// Error stories: stub the publizon POST to throw a code-bearing Error so the
// modal's onError handler populates publizonError, which swaps to LoanErrorContent.
// The mutation's fetcher throws `new Error(JSON.stringify({ code, message }))`.
const errorStory = (code: number): Story => ({
  decorators: [withQueryClient(seedClient())],
  beforeEach: () => {
    const original = window.fetch
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString()
      if (url.includes(`/v1/user/loans/${EBOOK_IDENTIFIER}`) && init?.method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify({ code, message: `Error ${code}` }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      return original(input, init)
    }) as typeof fetch
    return () => {
      window.fetch = original
    }
  },
  play: async () => {
    const { screen, userEvent } = await import("@storybook/test")
    const button = await screen.findByRole("button", { name: /^ja$/i })
    await userEvent.click(button)
  },
  args: baseArgs,
})

export const ErrorMaterialUnavailable = errorStory(105)
export const ErrorTooManyConcurrentLoans = errorStory(120)
export const ErrorMonthlyLimit = errorStory(125)
export const ErrorMaterialNotLoanable = errorStory(128)
export const ErrorBookAlreadyReserved = errorStory(140)
export const ErrorUnexpected = errorStory(148)
