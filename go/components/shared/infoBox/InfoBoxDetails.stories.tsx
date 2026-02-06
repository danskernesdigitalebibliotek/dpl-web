import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
import manifestationMock from "@/lib/mocks/manifestation/infoBox.mock"

const meta = {
  title: "components/InfoBoxDetails",
  component: InfoBoxDetails,
  parameters: {
    layout: "centered",
  },
  decorators: [
    Story => {
      return (
        <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
          <Story />
        </div>
      )
    },
  ],
  argTypes: {
    selectedManifestation: {
      control: { type: "object" },
    },
  },
  args: {
    selectedManifestation: manifestationMock,
  },
} satisfies Meta<typeof InfoBoxDetails>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <InfoBoxDetails {...args} />,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <InfoBoxDetails {...args} />,
}
