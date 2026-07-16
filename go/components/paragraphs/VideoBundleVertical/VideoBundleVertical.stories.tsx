import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundleVertical from "@/components/paragraphs/VideoBundleVertical/VideoBundleVertical"

import { worksMock } from "../VideoBundle/VideoBundle.mockData"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
)

// The portrait (9:16) variant of the video bundle: video on the left, the
// stacked work carousel on the right.
const meta = {
  title: "components/VideoBundleVertical",
  component: VideoBundleVertical,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Video Bundle Vertical",
    videoUrl: "https://media.videotool.dk/?vn=557_2025010614502071929993093451",
    works: worksMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof VideoBundleVertical>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
