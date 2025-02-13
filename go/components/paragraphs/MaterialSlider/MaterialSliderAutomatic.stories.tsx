import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import MaterialSliderAutomatic from "@/components/paragraphs/MaterialSlider/MaterialSliderAutomatic"

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
  component: MaterialSliderAutomatic,
  parameters: { layout: "centered" },
  args: {
    titleOptional: "Material Slider - Automatic",
    cqlSearch: {
      __typename: "CQLSearch",
      value:
        "(term.title='adams' AND term.title= 'bold') OR (term.title= 'adams' AND term.title= 'ballon') OR (term.title= 'adams' AND term.title= 'pony') OR (term.title= 'adams' AND term.title= 'cykel') OR (term.title= 'adams' AND term.title= 'fugl') OR (term.title= 'møgmis')",
    },
    sliderAmountOfMaterials: 10,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof MaterialSliderAutomatic>

export default meta
type Story = StoryObj<typeof meta>

export const Automatic: Story = {
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSliderAutomatic {...args} />
    </div>
  ),
}

export const AutomaticDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSliderAutomatic {...args} />
    </div>
  ),
}
