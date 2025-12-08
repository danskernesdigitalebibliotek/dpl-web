import type { Meta, StoryObj } from "@storybook/nextjs"

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
        url: "",
        alt: "Placeholder",
        height: 0,
        size: 0,
        width: 0,
      },
    },
    goLinkParagraph: {
      link: {
        title: "Læs mere",
        url: "/",
        internal: false,
      },
      ariaLabel: "Adrians bogklub 2.0",
      targetBlank: false,
    },
  },
} satisfies Meta<typeof ParagraphGoLinkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <ParagraphGoLinkbox {...args} />,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <ParagraphGoLinkbox {...args} />,
}
