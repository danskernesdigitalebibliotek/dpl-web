import type { Meta, StoryObj } from "@storybook/nextjs"
import { fn } from "@storybook/test"

import { darkModeDecorator } from "@/.storybook/decorators"

import MaterialTypeSelect from "./MaterialTypeSelect"

const meta = {
  title: "components/MaterialTypeSelect",
  component: MaterialTypeSelect,
  parameters: {
    layout: "centered",
  },
  args: {
    options: [
      { code: "EBOOK", display: "E-bog" },
      { code: "AUDIO_BOOK_ONLINE", display: "Lydbog" },
      { code: "BOOK", display: "Bog" },
    ],
    selected: "EBOOK",
    onOptionSelect: fn(),
  },
} satisfies Meta<typeof MaterialTypeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AudioBookSelected: Story = {
  args: {
    selected: "AUDIO_BOOK_ONLINE",
  },
}

export const SingleOption: Story = {
  args: {
    options: [{ code: "EBOOK", display: "E-bog" }],
    selected: "EBOOK",
  },
}

export const ManyOptions: Story = {
  args: {
    options: [
      { code: "EBOOK", display: "E-bog" },
      { code: "AUDIO_BOOK_ONLINE", display: "Lydbog" },
      { code: "BOOK", display: "Bog" },
      { code: "PODCAST", display: "Podcast" },
      { code: "COMIC", display: "Tegneserie" },
      { code: "GRAPHIC_NOVEL", display: "Graphic novel" },
    ],
    selected: "BOOK",
  },
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
}
