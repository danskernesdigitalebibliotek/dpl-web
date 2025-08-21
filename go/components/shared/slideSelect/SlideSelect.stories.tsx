import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import { darkModeDecorator } from "@/.storybook/decorators"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"

const defaultArgs = {
  options: [
    { code: "BOOKS", display: "Book" },
    { code: "EBOOKS", display: "E-book" },
    { code: "AUDIO_BOOKS", display: "Audiobook" },
  ] as SlideSelectOption[],
  selected: "BOOKS" as GeneralMaterialTypeCodeEnum,
  onOptionSelect: fn(),
}

const meta = {
  title: "components/SlideSelect",
  component: SlideSelect,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    options: {
      control: { type: "object" },
    },
    onOptionSelect: { control: { type: "text", disable: true } },
  },
} satisfies Meta<typeof SlideSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: defaultArgs,
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center p-1">
      <SlideSelect {...args} />
    </div>
  ),
}

export const DarkMode: Story = {
  args: defaultArgs,
  decorators: [darkModeDecorator],
  render: args => (
    <div className="flex w-full max-w-[90vw] justify-center p-1">
      <SlideSelect {...args} />
    </div>
  ),
}
