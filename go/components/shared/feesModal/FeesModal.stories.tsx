import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import FeesModal from "@/components/shared/feesModal/FeesModal"
import DplCmsConfigContextProvider from "@/lib/providers/DplCmsConfigContextProvider"

// The payment link resolves the library site's base URL from the CMS config
// context; provide a fixture so the link renders in stories.
const withCmsConfig = (Story: React.ComponentType): React.ReactElement => (
  <DplCmsConfigContextProvider
    dplCmsConfig={
      {
        libraryInfo: { name: "Storybook Bibliotek", baseURL: "https://bibliotek.example" },
      } as React.ComponentProps<typeof DplCmsConfigContextProvider>["dplCmsConfig"]
    }>
    <Story />
  </DplCmsConfigContextProvider>
)

const meta = {
  title: "modals/FeesModal",
  component: FeesModal,
  parameters: { layout: "centered" },
  decorators: [withCmsConfig],
} satisfies Meta<typeof FeesModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  lateMaterialCount: 3,
  lateFeeTotal: 58,
}

export const Default: Story = {
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: defaultArgs,
}

export const SingleBook: Story = {
  args: { ...defaultArgs, lateMaterialCount: 1, lateFeeTotal: 20 },
}
