import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundleAutomatic from "@/components/paragraphs/VideoBundle/VideoBundleAutomatic"

const queryClient = new QueryClient()

// TODO: fix this typing of StoryComponent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withQueryClient = (StoryComponent: any) => (
  <QueryClientProvider client={queryClient}>
    <StoryComponent />
  </QueryClientProvider>
)

const meta = {
  title: "components/VideoBundle",
  component: VideoBundleAutomatic,
  parameters: { layout: "centered" },
  args: {
    goVideoTitle: "Video Bundle - Automatic",
    embedVideo: {
      mediaVideotool: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
      name: "Video Title",
    },
    cqlSearch: {
      __typename: "CQLSearch",
      value:
        "(term.title='adams' AND term.title= 'bold') OR (term.title= 'adams' AND term.title= 'ballon') OR (term.title= 'adams' AND term.title= 'pony') OR (term.title= 'adams' AND term.title= 'cykel') OR (term.title= 'adams' AND term.title= 'fugl')",
    },
    videoAmountOfMaterials: 5,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof VideoBundleAutomatic>

export default meta
type Story = StoryObj<typeof meta>

export const Automatic: Story = {
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2 h-full w-[100vw]">
      <VideoBundleAutomatic {...args} />
    </div>
  ),
}

export const AutomaticDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2 h-full w-[100vw]">
      <VideoBundleAutomatic {...args} />
    </div>
  ),
}
