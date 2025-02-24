import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import MaterialSlider from "@/components/paragraphs/MaterialSlider/MaterialSlider"

import { worksMock } from "./MaterialSlider.mockData"

const queryClient = new QueryClient()

// TODO: fix this typing of StoryComponent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withQueryClient = (StoryComponent: any) => (
  <QueryClientProvider client={queryClient}>
    <StoryComponent />
  </QueryClientProvider>
)

const meta = {
  title: "components/MaterialSlider",
  component: MaterialSlider,
  parameters: { layout: "centered" },
  args: {
    title: "Material Slider",
    works: worksMock,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof MaterialSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSlider {...args} />
    </div>
  ),
}

export const MaterialSliderDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSlider {...args} />
    </div>
  ),
}
