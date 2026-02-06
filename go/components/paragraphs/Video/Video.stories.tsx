import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import Video from "@/components/paragraphs/Video/Video"

const meta = {
  title: "components/Video",
  component: Video,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Adrians bogklub 2.0",
    embedVideo: {
      mediaVideotool: "https://media.videotool.dk/?vn=557_2025010614502071929993093451",
      name: "Sample Video",
    },
  },
} satisfies Meta<typeof Video>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <Video {...args}>Video</Video>,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <Video {...args}>Video</Video>,
}
