import { describe, expect, it } from "vitest"

import { type DueThresholds, dueStatus } from "@/lib/helpers/helper.due-status"

// Half-day offsets so differenceInDays lands on whole days at any time of day.
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const thresholds: DueThresholds = { warning: 7, danger: 0, renewalWindow: 7 }

describe("dueStatus", () => {
  it("grades a loan past its due date as overdue", () => {
    const status = dueStatus(daysFromNow(-1.5), thresholds)
    expect(status.state).toBe("overdue")
    expect(status.daysUntil).toBe(-1)
  })

  it("grades a loan due later today as due-today, not overdue", () => {
    expect(dueStatus(daysFromNow(0.5), thresholds).state).toBe("due-today")
  })

  it("grades a loan inside the warning threshold as due-soon", () => {
    expect(dueStatus(daysFromNow(1.5), thresholds).state).toBe("due-soon")
    // The threshold itself is inclusive.
    expect(dueStatus(daysFromNow(7.5), thresholds).state).toBe("due-soon")
  })

  it("grades a loan beyond the warning threshold as neutral", () => {
    expect(dueStatus(daysFromNow(8.5), thresholds).state).toBe("neutral")
  })

  it("reports days until the renewal window opens", () => {
    // Due in 9 days, window is 7 → renewable in 2 days.
    expect(dueStatus(daysFromNow(9.5), thresholds).daysUntilRenewable).toBe(2)
    // At the window edge renewal is allowed now.
    expect(dueStatus(daysFromNow(7.5), thresholds).daysUntilRenewable).toBe(0)
    // Overdue loans are well inside the window.
    expect(dueStatus(daysFromNow(-1.5), thresholds).daysUntilRenewable).toBeLessThan(0)
  })

  it("respects a configured danger threshold", () => {
    // With danger at 2, a loan due tomorrow already counts as overdue.
    expect(dueStatus(daysFromNow(1.5), { ...thresholds, danger: 2 }).state).toBe("overdue")
  })

  it("degrades an unparseable due date to neutral", () => {
    expect(dueStatus("", thresholds).state).toBe("neutral")
    expect(dueStatus("not-a-date", thresholds).state).toBe("neutral")
  })
})
