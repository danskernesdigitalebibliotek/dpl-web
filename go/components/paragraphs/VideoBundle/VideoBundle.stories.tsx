import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundle from "@/components/paragraphs/VideoBundle/VideoBundle"

import { worksMock } from "./VideoBundle.mockData"

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
)

const meta = {
  title: "paragraphs/VideoBundle",
  component: VideoBundle,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Video Bundle",
    videoUrl: "https://media.videotool.dk/?vn=557_2025010614502071929993093451",
    works: worksMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof VideoBundle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
