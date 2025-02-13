import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import MaterialSliderManual from "@/components/paragraphs/MaterialSlider/MaterialSliderManual"
import { ParagraphGoMaterialSliderManual } from "@/lib/graphql/generated/dpl-cms/graphql"

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
  component: MaterialSliderManual,
  parameters: { layout: "centered" },
  args: {
    titleOptional: "Material Slider - Manual",
    materialSliderWorkIds: [
      { material_type: "e-bog", work_id: "work-of:870970-basis:138232743" },
      { material_type: "e-bog", work_id: "work-of:870970-basis:139172957" },
      { material_type: "e-bog", work_id: "work-of:870970-basis:136089471" },
    ] as ParagraphGoMaterialSliderManual["materialSliderWorkIds"],
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof MaterialSliderManual>

export default meta
type Story = StoryObj<typeof meta>

export const Manual: Story = {
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSliderManual {...args} />
    </div>
  ),
}

export const ManualDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="h-full w-[100vw]">
      <MaterialSliderManual {...args} />
    </div>
  ),
}
