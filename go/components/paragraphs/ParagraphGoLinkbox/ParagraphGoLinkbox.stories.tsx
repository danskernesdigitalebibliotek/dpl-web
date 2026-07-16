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
        url: "https://placehold.co/800x600.jpg",
        alt: "Placeholder",
        height: 600,
        size: 0,
        width: 800,
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

// Without a background color from the CMS the box renders plain.
export const WithoutBackground: Story = {
  args: { goColor: undefined },
  render: args => <ParagraphGoLinkbox {...args} />,
}

// Every background color the CMS can pick.
export const AllBackgrounds: Story = {
  parameters: { layout: "fullscreen" },
  render: args => (
    <div className="flex flex-col gap-10 p-10">
      {(["content_color_1", "content_color_2", "content_color_3", "content_color_4"] as const).map(
        color => (
          <ParagraphGoLinkbox key={color} {...args} goColor={color} />
        )
      )}
    </div>
  ),
}

export const AllBackgroundsDarkMode: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [darkModeDecorator],
  render: args => (
    <div className="flex flex-col gap-10 p-10">
      {(["content_color_1", "content_color_2", "content_color_3", "content_color_4"] as const).map(
        color => (
          <ParagraphGoLinkbox key={color} {...args} goColor={color} />
        )
      )}
    </div>
  ),
}

export const WithoutBackgroundDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: { goColor: undefined },
  render: args => <ParagraphGoLinkbox {...args} />,
}
