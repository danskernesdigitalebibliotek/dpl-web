import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import {
  type Notification,
  ProfileNotificationsSkeleton,
  ProfileNotificationsView,
} from "@/components/shared/profileNotifications/ProfileNotifications"

const meta = {
  title: "profile/ProfileNotifications",
  component: ProfileNotificationsView,
  parameters: { layout: "fullscreen" },
  // Same page context as ProfilePageLayout, so the section gets the grid
  // column span and max-width it has on the profile page.
  decorators: [
    Story => (
      <div className="content-container grid-go w-full py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileNotificationsView>

export default meta
type Story = StoryObj<typeof meta>

// Every notification the bar can produce, mirroring the copy the data
// wiring builds: unpaid overdue fees, compensation for lost/damaged
// materials, reservations ready for pickup, overdue physical loans and
// loans due soon.
const allNotifications: Notification[] = [
  {
    key: "fees",
    status: "error",
    label: "Mangler betaling",
    title: "Du mangler at betale 58 kr.",
    body: "Tag fat i en voksen for at få hjælp til at betale pengene.",
    action: { label: "Vis gebyrer", onClick: () => {} },
  },
  {
    key: "compensation",
    status: "error",
    label: "Mangler betaling",
    title: "Du mangler at betale 125 kr. i erstatning",
    body: "Tag fat i en voksen for at få hjælp til at betale pengene.",
    action: { label: "Vis erstatning", onClick: () => {} },
  },
  {
    key: "ready",
    status: "success",
    label: "Klar til dig",
    title: "1 bog er klar til afhentning",
    action: { label: "Vis bøger", onClick: () => {} },
  },
  {
    key: "overdue",
    status: "error",
    label: "Frist overskredet",
    title: "1 bog skal afleveres nu",
    action: { label: "Vis bøger", onClick: () => {} },
  },
  {
    key: "due-soon",
    status: "warning",
    label: "Lån udløber",
    title: "2 bøger skal snart afleveres",
    action: { label: "Vis bøger", onClick: () => {} },
  },
]

export const Default: Story = {
  args: { notifications: allNotifications },
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: { notifications: allNotifications },
}

export const SingleNotification: Story = {
  args: { notifications: allNotifications.slice(1, 2) },
}

// No fees, nothing ready, nothing due: the encouraging empty state.
export const Empty: Story = {
  args: { notifications: [] },
}

export const EmptyDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: { notifications: [] },
}

// A failed fetch never claims "all clear" — it says so honestly.
export const Error: Story = {
  args: { notifications: [], hasError: true },
}

export const Skeleton: Story = {
  args: { notifications: [] },
  render: () => <ProfileNotificationsSkeleton />,
}
