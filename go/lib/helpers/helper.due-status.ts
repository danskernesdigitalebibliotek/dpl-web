import { differenceInDays } from "date-fns"

import goConfig from "@/lib/config/goConfig"

// How urgent a loan is, derived from its due date. The single home for the
// day-math and threshold rules; components only map `state` to presentation.
export type DueState = "overdue" | "due-today" | "due-soon" | "neutral"

export type DueThresholds = {
  // Days before due date where the loan warns.
  warning: number
  // Days before due date where the loan is due now / overdue.
  danger: number
  // Days before due date from which Cicero allows renewal.
  renewalWindow: number
}

export type DueStatus = {
  state: DueState
  // Whole calendar days until due; negative once overdue, 0 = due today.
  daysUntil: number
  // Days until the renewal window opens; 0 or less means renewable now.
  daysUntilRenewable: number
}

// Mirrors dpl-react's thresholds so status styling matches across platforms.
// Reads the sync resolver values; if a resolver ever goes async, this is the
// one place the compiler flags.
export const getLoanThresholds = (): DueThresholds => ({
  warning: goConfig("loans.threshold.warning"),
  danger: goConfig("loans.threshold.danger"),
  renewalWindow: goConfig("loans.renewal-window"),
})

// Unparseable due dates yield NaN day counts and degrade to "neutral".
export const dueStatus = (
  dueDate: string,
  thresholds: DueThresholds = getLoanThresholds()
): DueStatus => {
  const daysUntil = differenceInDays(new Date(dueDate), new Date())
  const state: DueState =
    daysUntil < thresholds.danger
      ? "overdue"
      : daysUntil === 0
        ? "due-today"
        : daysUntil <= thresholds.warning
          ? "due-soon"
          : "neutral"
  return { state, daysUntil, daysUntilRenewable: daysUntil - thresholds.renewalWindow }
}
