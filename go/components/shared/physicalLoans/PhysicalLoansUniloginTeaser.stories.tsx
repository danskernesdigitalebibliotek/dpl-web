import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { withServiceLayer } from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"
import DplCmsConfigContextProvider from "@/lib/providers/DplCmsConfigContextProvider"

import PhysicalLoansUniloginTeaser from "./PhysicalLoansUniloginTeaser"

const withCmsConfig = (Story: React.ComponentType): React.ReactElement => (
  <DplCmsConfigContextProvider
    dplCmsConfig={
      { loginUrls: { adgangsplatformen: "#" } } as React.ComponentProps<
        typeof DplCmsConfigContextProvider
      >["dplCmsConfig"]
    }>
    <Story />
  </DplCmsConfigContextProvider>
)

// Shown instead of the physical loans slider for Unilogin sessions: the
// empty slider grayed out behind a library-login teaser.
const meta = {
  title: "profile/PhysicalLoansUniloginTeaser",
  component: PhysicalLoansUniloginTeaser,
  parameters: { layout: "fullscreen" },
  decorators: [withCmsConfig],
} satisfies Meta<typeof PhysicalLoansUniloginTeaser>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withServiceLayer()],
}

export const DefaultDarkMode: Story = {
  decorators: [withServiceLayer(), darkModeDecorator],
}
