import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import CompensationModal from "@/components/shared/compensationModal/CompensationModal"
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
  title: "modals/CompensationModal",
  component: CompensationModal,
  parameters: { layout: "centered" },
  decorators: [withCmsConfig],
} satisfies Meta<typeof CompensationModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  compensationMaterialCount: 2,
  compensationTotal: 250,
}

export const Default: Story = {
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: defaultArgs,
}

export const SingleBook: Story = {
  args: { ...defaultArgs, compensationMaterialCount: 1, compensationTotal: 125 },
}
