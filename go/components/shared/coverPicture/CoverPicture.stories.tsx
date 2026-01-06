import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"

const defaultArgs = {
  covers: coverFactory.build(),
  alt: "Cover picture alt text",
}

const meta = {
  title: "components/CoverPicture",
  component: CoverPicture,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    covers: {
      control: { type: "object" },
    },
    alt: {
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof CoverPicture>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: defaultArgs,
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const DarkMode: Story = {
  args: defaultArgs,
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTilt: Story = {
  args: { ...defaultArgs, withTilt: true },
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTiltDarkMode: Story = {
  args: { ...defaultArgs, withTilt: true },
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCover: Story = {
  args: { ...defaultArgs, covers: {} },
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCoverDarkMode: Story = {
  args: { ...defaultArgs, covers: {} },
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="rounded-base flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center
        lg:aspect-4/5 lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}
