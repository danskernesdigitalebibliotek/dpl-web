import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import { daysFromNow } from "@/components/shared/digitalLoansModal/digitalLoansStoryFixtures"
import PhysicalDueStatusLabel from "@/components/shared/loanDetailsModal/PhysicalDueStatusLabel"

// The expanded due status used in the loan modals' list and material views.
// Due dates are relative to "now" (with a half-day offset so
// differenceInDays lands on whole days) to keep the rendered counts stable.
const meta = {
  title: "components/PhysicalDueStatusLabel",
  component: PhysicalDueStatusLabel,
  parameters: { layout: "centered" },
} satisfies Meta<typeof PhysicalDueStatusLabel>

export default meta
type Story = StoryObj<typeof meta>

// Plain text with the deadline subline; no pill background.
export const Neutral: Story = {
  args: { dueDate: daysFromNow(8.5) },
}

// Inside the warning threshold: soft orange pill.
export const DueSoon: Story = {
  args: { dueDate: daysFromNow(5.5) },
}

// "Afleveres i dag" with the abbreviated absolute deadline.
export const DueToday: Story = {
  args: { dueDate: daysFromNow(0.5) },
}

// "Afleveringsfristen er overskredet med X dage" / "Skulle afleveres …".
export const Overdue: Story = {
  args: { dueDate: daysFromNow(-2.5) },
}

export const OverdueDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: { dueDate: daysFromNow(-2.5) },
}
