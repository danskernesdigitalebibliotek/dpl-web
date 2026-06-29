import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ReservationLoginModal from "@/components/shared/reservationModal/ReservationLoginModal"
import { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/configSchemas"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const dplCmsConfig: TDplCmsPublicConfig = {
  loginUrls: { adgangsplatformen: "https://login.example/adgangsplatformen" },
  logoutUrls: { adgangsplatformen: "https://login.example/logout" },
  libraryInfo: { name: "Story Bibliotek", baseURL: "https://library.example" },
  mapp: null,
  unilogin: { municipalityId: "0000" },
}

const withDplCmsConfig =
  (config: TDplCmsPublicConfig) =>
  (Story: React.ComponentType): React.ReactElement => (
    <DplCmsConfigContext.Provider value={config}>
      <Story />
    </DplCmsConfigContext.Provider>
  )

const meta = {
  title: "components/ReservationLoginModal",
  component: ReservationLoginModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ReservationLoginModal>

export default meta
type Story = StoryObj<typeof meta>

const args = {
  open: true,
  onClose: () => {},
  wid: "work-of:870970-basis:12345678",
  pid: "870970-basis:12345678",
}

export const Default: Story = {
  decorators: [withDplCmsConfig(dplCmsConfig)],
  args,
}

export const DefaultDarkMode: Story = {
  decorators: [withDplCmsConfig(dplCmsConfig), darkModeDecorator],
  args,
}
