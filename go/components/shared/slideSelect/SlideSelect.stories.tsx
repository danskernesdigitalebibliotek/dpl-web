import { INITIAL_VIEWPORTS as viewports } from "@storybook/addon-viewport"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import { darkModeDecorator } from "@/.storybook/decorators"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"

const defaultArgs = {
  options: [
    { value: "BOOK", render: "Book", icon: "book" },
    { value: "EBOOK", render: "E-book", icon: "book" },
    { value: "AUDIOBOOK", render: "Audiobook", icon: "headphones" },
  ],
  initialOption: { value: "BOOK" } as SlideSelectOption,
  onOptionSelect: fn(),
}

const meta = {
  title: "components/SlideSelect",
  component: SlideSelect,
  parameters: {
    layout: "centered",
    viewport: {
      viewports: viewports,
      defaultViewport: "responsive",
    },
  },
  argTypes: {
    options: {
      control: { type: "object" },
    },
    initialOption: { control: { type: "object" } },
    onOptionSelect: { control: { type: "text", disable: true } },
  },
} satisfies Meta<typeof SlideSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: defaultArgs,
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center">
      <SlideSelect {...args} />
    </div>
  ),
}

export const DefaultMobile: Story = {
  args: defaultArgs,
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center">
      <SlideSelect {...args} />
    </div>
  ),
}

export const DarkMode: Story = {
  args: defaultArgs,
  decorators: [darkModeDecorator],
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center">
      <SlideSelect {...args} />
    </div>
  ),
}

export const DarkModeMobile: Story = {
  args: defaultArgs,
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  decorators: [darkModeDecorator],
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center">
      <SlideSelect {...args} />
    </div>
  ),
}
