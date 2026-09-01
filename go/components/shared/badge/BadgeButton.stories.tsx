import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"

// The pill-shaped toggle used for search filters and material types.
const meta = {
  title: "components/BadgeButton",
  component: BadgeButton,
  parameters: { layout: "centered" },
  args: {
    children: "e-bøger",
    ariaLabel: "e-bøger",
  },
} satisfies Meta<typeof BadgeButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const AllStates = (args: React.ComponentProps<typeof BadgeButton>) => (
  <div className="flex items-end gap-10 p-10">
    <ShowcaseItem title="default">
      <BadgeButton {...args} />
    </ShowcaseItem>
    <ShowcaseItem title="active" description="Selected filter, inverted colors">
      <BadgeButton {...args} isActive />
    </ShowcaseItem>
    <ShowcaseItem title="active with icon" description="Removable filter as on mobile search">
      <BadgeButton {...args} isActive classNames="flex flex-row items-center pr-1">
        {args.children}
        <Icon name="close" className="w-[25px]" />
      </BadgeButton>
    </ShowcaseItem>
    <ShowcaseItem title="transparent" description="No background until active">
      <BadgeButton {...args} variant="transparent" />
    </ShowcaseItem>
    <ShowcaseItem title="with animation" description="Wiggles on hover">
      <BadgeButton {...args} withAnimation />
    </ShowcaseItem>
  </div>
)

export const States: Story = {
  render: args => <AllStates {...args} />,
}

export const StatesDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <AllStates {...args} />,
}
