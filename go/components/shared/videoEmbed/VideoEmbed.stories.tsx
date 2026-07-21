import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import VideoEmbed from "@/components/shared/videoEmbed/VideoEmbed"

// The videotool player used by the video paragraphs: an optional thumbnail
// covers the frame until the iframe has loaded.
const meta = {
  title: "components/VideoEmbed",
  component: VideoEmbed,
  parameters: { layout: "centered" },
  args: {
    videoUrl: "https://media.videotool.dk/?vn=557_2025010614502071929993093451",
    title: "Adrians bogklub 2.0",
    aspect: "16/9",
  },
} satisfies Meta<typeof VideoEmbed>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape: Story = {
  render: args => (
    <div className="w-[640px] max-w-full">
      <VideoEmbed {...args} />
    </div>
  ),
}

// The 9:16 variant used by the vertical video bundle.
export const Portrait: Story = {
  args: {
    videoUrl: "https://media.videotool.dk/?vn=557_2025091614030817677597047514",
    aspect: "9/16",
  },
  render: args => (
    <div className="w-72">
      <VideoEmbed {...args} />
    </div>
  ),
}

export const LandscapeDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="w-[640px] max-w-full">
      <VideoEmbed {...args} />
    </div>
  ),
}
