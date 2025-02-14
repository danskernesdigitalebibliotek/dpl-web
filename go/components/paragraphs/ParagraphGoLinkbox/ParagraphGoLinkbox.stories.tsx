import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"
import ParagraphGoLinkbox from "@/components/paragraphs/ParagraphGoLinkbox/ParagraphGoLinkbox"

const meta = {
  title: "components/ParagraphGoLinkbox",
  component: ParagraphGoLinkbox,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Adrians bogklub 2.0",
    goDescription: "Adrians bogklub 2.0",
    goColor: "content_color_1",
    goImage: {
      mediaImage: {
        url: "https://via.placeholder.com/800x800",
      },
    },
    goLink: {
      id: "1",
      status: true,
      link: [
        {
          title: "Adrians bogklub 2.0",
          url: "/",
          internal: false,
        },
      ],
    },
  },
} satisfies Meta<typeof ParagraphGoLinkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <ParagraphGoLinkbox {...args}>ParagraphGoLinkbox</ParagraphGoLinkbox>,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <ParagraphGoLinkbox {...args}>ParagraphGoLinkbox</ParagraphGoLinkbox>,
}
