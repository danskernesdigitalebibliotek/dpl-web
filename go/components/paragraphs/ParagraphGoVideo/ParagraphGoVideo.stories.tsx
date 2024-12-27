import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ParagraphGoVideo from "@/components/paragraphs/paragraphGoVideo/ParagraphGoVideo"

const meta = {
  title: "components/ParagraphGoVideo",
  component: ParagraphGoVideo,
  parameters: {
    layout: "centered",
  },
  args: {
    goVideoTitle: "Naja Marie Aidt - Oevelser i moerke",
    src: "https://media.videotool.dk/?vn=557_2024111913325696587632242634",
  },
} satisfies Meta<typeof ParagraphGoVideo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    goVideoTitle: "Naja Marie Aidt - Oeveser i moerke",
  },

  render: args => <ParagraphGoVideo {...args}>ParagraphGoVideo</ParagraphGoVideo>,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <ParagraphGoVideo {...args}>ParagraphGoVideo</ParagraphGoVideo>,
}
