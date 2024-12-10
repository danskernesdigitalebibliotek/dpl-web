import { INITIAL_VIEWPORTS as viewports } from "@storybook/addon-viewport"
import type { Meta, StoryObj } from "@storybook/react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"

const defaultArgs = {
  src: "https://res.cloudinary.com/dandigbib/image/upload/v1544470826/saxo.dk/9788762722880.jpg",
  lowResSrc:
    "https://res.cloudinary.com/dandigbib/image/upload/t_ddb_cover_xxs/v1544470826/saxo.dk/9788762722880.jpg",
  alt: "Cover picture alt text",
}

const meta = {
  title: "components/CoverPicture",
  component: CoverPicture,
  parameters: {
    layout: "centered",
    viewport: {
      viewports: viewports,
      defaultViewport: "responsive",
    },
  },
  argTypes: {
    lowResSrc: {
      control: { type: "text" },
    },
    src: {
      control: { type: "text" },
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
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const DefaultMobile: Story = {
  args: defaultArgs,
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const DarkMode: Story = {
  args: defaultArgs,
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
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
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTilt: Story = {
  args: { ...defaultArgs, withTilt: true },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTiltMobile: Story = {
  args: { ...defaultArgs, withTilt: true },
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTiltDarkMode: Story = {
  args: { ...defaultArgs, withTilt: true },
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithTiltDarkModeMobile: Story = {
  args: { ...defaultArgs, withTilt: true },
  decorators: [darkModeDecorator],
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCover: Story = {
  args: { ...defaultArgs, src: "", lowResSrc: "" },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCoverMobile: Story = {
  args: { ...defaultArgs, src: "", lowResSrc: "" },
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCoverDarkMode: Story = {
  args: { ...defaultArgs, src: "", lowResSrc: "" },
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}

export const WithoutCoverDarkModeMobile: Story = {
  args: { ...defaultArgs, src: "", lowResSrc: "" },
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  decorators: [darkModeDecorator],
  render: args => (
    <div
      className="flex aspect-1/1 h-auto w-[90vw] flex-col items-center justify-center rounded-base lg:aspect-4/5
        lg:w-[33vw]">
      <CoverPicture {...args} />
    </div>
  ),
}
