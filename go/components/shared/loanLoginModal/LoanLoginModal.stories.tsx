import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import LoanLoginModal from "@/components/shared/loanLoginModal/LoanLoginModal"
import type { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/configSchemas"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import manifestationMock from "@/lib/mocks/manifestation/infoBox.mock"
import workMock from "@/lib/mocks/work/infoBox.mock"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const ebookManifestation = {
  ...manifestationMock,
  pid: "870970-basis:12345678",
  titles: { full: ["Emilie & Esther"], original: [] },
  materialTypes: [
    {
      materialTypeGeneral: { display: "e-bøger", code: "EBOOKS" },
      materialTypeSpecific: { code: "EBOOK", display: "e-bog" },
    },
  ],
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

const stubConfig: TDplCmsPublicConfig = {
  loginUrls: { adgangsplatformen: "https://example.test/login/adgangsplatformen" },
  logoutUrls: { adgangsplatformen: null },
  libraryInfo: { name: "Storybook Bibliotek", baseURL: "https://example.test" },
  mapp: null,
  unilogin: { municipalityId: null },
}

const seedClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(useGetMaterialQuery.getKey({ wid }), { work: ebookWork })
  return client
}

const withProviders =
  (client: QueryClient, config: TDplCmsPublicConfig | null = stubConfig) =>
  (Story: React.ComponentType): React.ReactElement => (
    <QueryClientProvider client={client}>
      <DplCmsConfigContext.Provider value={config}>
        <Story />
      </DplCmsConfigContext.Provider>
    </QueryClientProvider>
  )

const meta = {
  title: "components/LoanLoginModal",
  component: LoanLoginModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoanLoginModal>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = { open: true, onClose: () => {}, wid, pid }

export const Default: Story = {
  decorators: [withProviders(seedClient())],
  args: baseArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [withProviders(seedClient()), darkModeDecorator],
  args: baseArgs,
}

// Adgangsplatformen login URL missing -> the second LoginPanel disables its button.
export const AdgangsplatformenUnavailable: Story = {
  decorators: [
    withProviders(seedClient(), {
      ...stubConfig,
      loginUrls: { adgangsplatformen: null },
    }),
  ],
  args: baseArgs,
}
