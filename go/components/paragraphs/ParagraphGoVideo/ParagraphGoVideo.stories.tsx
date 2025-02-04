import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ParagraphGoVideo from "@/components/paragraphs/ParagraphGoVideo/ParagraphGoVideo"

const meta = {
  title: "components/ParagraphGoVideo",
  component: ParagraphGoVideo,
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
} satisfies Meta<typeof ParagraphGoVideo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <ParagraphGoVideo {...args}>ParagraphGoVideo</ParagraphGoVideo>,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <ParagraphGoVideo {...args}>ParagraphGoVideo</ParagraphGoVideo>,
}
