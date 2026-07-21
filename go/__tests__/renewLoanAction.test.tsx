import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import RenewLoanAction from "@/components/shared/loanDetailsModal/RenewLoanAction"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"

// Anchored to local noon so calendar-day counts are stable at any time of day.
const daysFromNow = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const loan = (dueInDays: number, overrides: Record<string, unknown> = {}) => ({
  loanId: 1,
  dueDate: daysFromNow(dueInDays),
  isRenewable: true,
  ...overrides,
})

const renewButton = () => screen.getByRole("button", { name: /forny lån/i }) as HTMLButtonElement

describe("RenewLoanAction", () => {
  it("shows a disabled button with a countdown before the renewal window opens", () => {
    // Due in 14 days, window is 7 → renewable in 7 days.
    render(
      <RenewLoanAction loan={loan(14.5)} title="Vildheks" isRenewing={false} onRenew={() => {}} />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText("Lånet kan først fornys om 7 dage")).toBeTruthy()
  })

  it("uses the singular day form one day before the window opens", () => {
    render(
      <RenewLoanAction loan={loan(8.5)} title="Vildheks" isRenewing={false} onRenew={() => {}} />
    )

    expect(screen.getByText("Lånet kan først fornys om 1 dag")).toBeTruthy()
  })

  it("renews through an active button inside the window", () => {
    const onRenew = vi.fn()
    render(
      <RenewLoanAction loan={loan(5.5)} title="Vildheks" isRenewing={false} onRenew={onRenew} />
    )

    expect(renewButton().disabled).toBe(false)
    fireEvent.click(renewButton())
    expect(onRenew).toHaveBeenCalledTimes(1)
  })

  it("offers renewal for overdue loans when FBS allows it", () => {
    render(
      <RenewLoanAction loan={loan(-2.5)} title="Vildheks" isRenewing={false} onRenew={() => {}} />
    )

    expect(renewButton().disabled).toBe(false)
  })

  it("disables the button and shows the denial reason when FBS blocks renewal", () => {
    render(
      <RenewLoanAction
        loan={loan(5.5, { isRenewable: false, nonRenewableReason: "deniedReserved" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText(getRenewalFailureMessage("deniedReserved"))).toBeTruthy()
  })

  it("shows a terminal denial reason instead of the countdown before the window opens", () => {
    render(
      <RenewLoanAction
        loan={loan(14, { isRenewable: false, nonRenewableReason: "deniedMaxRenewalsReached" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText(getRenewalFailureMessage("deniedMaxRenewalsReached"))).toBeTruthy()
  })

  it("keeps the countdown for situational denials before the window opens", () => {
    // A reservation can be cancelled before the window opens, so the
    // countdown is still the useful message.
    render(
      <RenewLoanAction
        loan={loan(14, { isRenewable: false, nonRenewableReason: "deniedReserved" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(screen.getByText("Lånet kan først fornys om 7 dage")).toBeTruthy()
  })

  it("falls back to the generic denial copy without a documented reason", () => {
    render(
      <RenewLoanAction
        loan={loan(5.5, { isRenewable: false })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(screen.getByText(getRenewalFailureMessage("deniedOtherReason"))).toBeTruthy()
  })
})
