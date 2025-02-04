import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoBundle, { VideoBundleMaterial } from "@/components/paragraphs/VideoBundle/VideoBundle"

const manualBundleArgs = {
  title: "Video Bundle - Manual",
  url: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
  materials: [
    {
      materialType: "bog",
      workId: "work-of:870970-basis:52516749",
    },
    {
      materialType: "e-bog",
      workId: "work-of:870970-basis:53559700",
    },
    {
      materialType: "artikel",
      workId: "work-of:870971-tsart:82862382",
    },
    {
      materialType: "artikel (online)",
      workId: "work-of:870971-avis:36769580",
    },
  ] as VideoBundleMaterial[],
}

const meta = {
  title: "components/VideoBundle",
  component: VideoBundle,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Video Bundle - Automatic",
    url: "https://media.videotool.dk/?vn=557_2022121911105390173777808898",
    cqlSearchString:
      "(term.title='adams' AND term.title= 'bold') OR (term.title= 'adams' AND term.title= 'ballon') OR (term.title= 'adams' AND term.title= 'pony') OR (term.title= 'adams' AND term.title= 'cykel') OR (term.title= 'adams' AND term.title= 'fugl')",
    amountOfMaterials: 5,
  },
} satisfies Meta<typeof VideoBundle>

export default meta
type Story = StoryObj<typeof meta>

export const Automatic: Story = {
  render: args => <VideoBundle {...args} />,
}

export const AutomaticDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <VideoBundle {...args} />,
}

export const Manual: Story = {
  args: {
    ...manualBundleArgs,
  },
  render: args => <VideoBundle {...args} />,
}

export const ManualDarkMode: Story = {
  args: {
    ...manualBundleArgs,
  },
  decorators: [darkModeDecorator],
  render: args => <VideoBundle {...args} />,
}
