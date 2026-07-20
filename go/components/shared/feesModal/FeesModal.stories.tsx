import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import FeesModal from "@/components/shared/feesModal/FeesModal"

const meta = {
  title: "modals/FeesModal",
  component: FeesModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FeesModal>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  open: true,
  onClose: () => {},
  lateMaterialCount: 3,
  lateFeeTotal: 58,
}

export const Default: Story = {
  args: defaultArgs,
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: defaultArgs,
}

export const SingleBook: Story = {
  args: { ...defaultArgs, lateMaterialCount: 1, lateFeeTotal: 20 },
}
