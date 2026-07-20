import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import CompensationModal from "@/components/shared/compensationModal/CompensationModal"

const meta = {
  title: "modals/CompensationModal",
  component: CompensationModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof CompensationModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  compensationMaterialCount: 2,
  compensationTotal: 250,
}

export const Default: Story = {
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: defaultArgs,
}

export const SingleBook: Story = {
  args: { ...defaultArgs, compensationMaterialCount: 1, compensationTotal: 125 },
}
