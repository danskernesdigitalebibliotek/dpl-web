import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundleManual from "@/components/paragraphs/VideoBundle/VideoBundleManual"
import { ParagraphGoVideoBundleManual } from "@/lib/graphql/generated/dpl-cms/graphql"

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
  component: VideoBundleManual,
  parameters: { layout: "centered" },
  args: {
    goVideoTitle: "Video Bundle - Manual",
    embedVideo: {
      mediaVideotool: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
      name: "Video Title",
    },
    videoBundleWorkIds: [
      "work-of:870970-basis:52516749",
      "work-of:870970-basis:53559700",
      "work-of:870971-tsart:82862382",
      "work-of:870971-avis:36769580",
    ] as ParagraphGoVideoBundleManual["videoBundleWorkIds"],
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof VideoBundleManual>

export default meta
type Story = StoryObj<typeof meta>

export const Manual: Story = {
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2 h-full w-[100vw]">
      <VideoBundleManual {...args} />
    </div>
  ),
}

export const ManualDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2 h-full w-[100vw]">
      <VideoBundleManual {...args} />
    </div>
  ),
}
