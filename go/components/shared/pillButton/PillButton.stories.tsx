import type { Meta, StoryObj } from "@storybook/nextjs"
import { fn } from "@storybook/test"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import Icon from "@/components/shared/icon/Icon"
import PillButton from "@/components/shared/pillButton/PillButton"

// The pill shape without state or animation. Callers add both.
const meta = {
  title: "components/PillButton",
  component: PillButton,
  parameters: { layout: "centered" },
  args: {
    children: "E-bog",
    onClick: fn(),
  },
} satisfies Meta<typeof PillButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { classNames: "bg-background-overlay text-foreground" },
}

const AllStates = (args: React.ComponentProps<typeof PillButton>) => (
  <div className="flex items-end gap-10 p-10">
    <ShowcaseItem title="default" description="Colours come from the caller">
      <PillButton {...args} classNames="bg-background-overlay text-foreground" />
    </ShowcaseItem>
    <ShowcaseItem title="selected" description="Inverted, as a chosen option">
      <PillButton {...args} classNames="bg-foreground text-background" />
    </ShowcaseItem>
    <ShowcaseItem title="with icon">
      <PillButton {...args} classNames="bg-background-overlay text-foreground">
        <Icon name="ebook" className="h-5 w-5 shrink-0" />
        <span>{args.children}</span>
      </PillButton>
    </ShowcaseItem>
    <ShowcaseItem title="transparent" description="No background until the caller gives one">
      <PillButton {...args} classNames="text-foreground" />
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
