import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import Authors from "@/components/shared/authors/Authors"

// The "Af ..." line under material titles; each creator links to a search
// for their name.
const meta = {
  title: "components/Authors",
  component: Authors,
  parameters: { layout: "centered" },
  args: {
    creators: [
      { __typename: "Person", display: "Lene Kaaberbøl" },
      { __typename: "Person", display: "Agnete Friis" },
    ],
  },
} satisfies Meta<typeof Authors>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleAuthor: Story = {
  args: {
    creators: [{ __typename: "Person", display: "Ole Lund Kirkegaard" }],
  },
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
}
