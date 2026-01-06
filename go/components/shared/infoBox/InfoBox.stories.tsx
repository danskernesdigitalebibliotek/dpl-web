import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import manifestationMock from "@/lib/mocks/manifestation/infoBox.mock"
import workMock from "@/lib/mocks/work/infoBox.mock"

const meta = {
  title: "components/InfoBox",
  component: InfoBox,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    work: {
      control: { type: "object" },
    },
  },
  args: {
    work: workMock,
    selectedManifestation: manifestationMock,
  },
} satisfies Meta<typeof InfoBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <InfoBox {...args} />,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <InfoBox {...args} />,
}
