import type { Meta, StoryObj } from "@storybook/nextjs"

import VideoBundle from "@/components/paragraphs/VideoBundle/VideoBundle"

import { worksMock } from "./VideoBundle.mockData"

const meta = {
  title: "components/VideoBundle",
  component: VideoBundle,
  parameters: { layout: "centered" },
  args: {
    title: "Video Bundle",
    videoUrl: "https://media.videotool.dk/?vn=557_2025010614502071929993093451",
    works: worksMock,
  },
} satisfies Meta<typeof VideoBundle>

export default meta
type Story = StoryObj<typeof meta>

// TODO: add VideoBundle to the story when request mocking through fishery is implemented
export const Default: Story = {
  render: () => <div>{/* <VideoBundle {...args} /> */}</div>,
}

// TODO: add VideoBundle to the story when request mocking through fishery is implemented
// export const AutomaticDarkMode: Story = {
//   decorators: [darkModeDecorator],
//   render: args => <VideoBundle {...args} />,
// }
