import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundle, { VideoBundleMaterial } from "@/components/paragraphs/VideoBundle/VideoBundle"

const queryClient = new QueryClient()

// TODO: fix this typing of StoryComponent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withQueryClient = (StoryComponent: any) => (
  <QueryClientProvider client={queryClient}>
    <StoryComponent />
  </QueryClientProvider>
)

const manualBundleArgs = {
  title: "Video Bundle - Manual",
  url: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
  materials: [
    { materialType: "bog", workId: "work-of:870970-basis:52516749" },
    { materialType: "e-bog", workId: "work-of:870970-basis:53559700" },
    { materialType: "artikel", workId: "work-of:870971-tsart:82862382" },
    { materialType: "artikel (online)", workId: "work-of:870971-avis:36769580" },
  ] as VideoBundleMaterial[],
}

const meta = {
  title: "components/VideoBundle",
  component: VideoBundle,
  parameters: { layout: "centered" },
  args: {
    title: "Video Bundle - Automatic",
    url: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
    cqlSearchString:
      "(term.title='adams' AND term.title= 'bold') OR (term.title= 'adams' AND term.title= 'ballon') OR (term.title= 'adams' AND term.title= 'pony') OR (term.title= 'adams' AND term.title= 'cykel') OR (term.title= 'adams' AND term.title= 'fugl')",
    amountOfMaterials: 5,
  },
  decorators: [withQueryClient],
} satisfies Meta<typeof VideoBundle>

export default meta
type Story = StoryObj<typeof meta>

export const Automatic: Story = {
  render: args => (
    <div className="my-grid-gap-2 h-full w-[100vw] space-y-grid-gap-2">
      <VideoBundle {...args} />
    </div>
  ),
}

export const AutomaticDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2">
      <VideoBundle {...args} />
    </div>
  ),
}

export const Manual: Story = {
  args: { ...manualBundleArgs },
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2">
      <VideoBundle {...args} />
    </div>
  ),
}

export const ManualDarkMode: Story = {
  args: { ...manualBundleArgs },
  decorators: [darkModeDecorator],
  render: args => (
    <div className="my-grid-gap-2 space-y-grid-gap-2">
      <VideoBundle {...args} />
    </div>
  ),
}
