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

const renewButton = () => screen.getByRole("button", { name: /forlæng lån/i }) as HTMLButtonElement

describe("RenewLoanAction", () => {
  it("renews through an active button before the window opens when FBS allows it", () => {
    // FBS decides; the configured window only estimates the countdown.
    render(
      <RenewLoanAction loan={loan(14.5)} title="Vildheks" isRenewing={false} onRenew={() => {}} />
    )

    expect(renewButton().disabled).toBe(false)
  })

  it("uses the singular day form one day before the window opens", () => {
    render(
      <RenewLoanAction
        loan={loan(8.5, { isRenewable: false, nonRenewableReason: "deniedOtherReason" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(screen.getByText("Lånet kan først forlænges om 1 dag")).toBeTruthy()
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

  it("shows situational denial reasons instead of the countdown before the window opens", () => {
    // Any denial FBS can explain beats the countdown.
    render(
      <RenewLoanAction
        loan={loan(14, { isRenewable: false, nonRenewableReason: "deniedReserved" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText(getRenewalFailureMessage("deniedReserved"))).toBeTruthy()
  })

  it("keeps the countdown for a generic denial before the window opens", () => {
    // FBS sends the generic code for loans merely outside the window.
    render(
      <RenewLoanAction
        loan={loan(14, { isRenewable: false, nonRenewableReason: "deniedOtherReason" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText("Lånet kan først forlænges om 7 dage")).toBeTruthy()
  })

  it("shows the generic denial copy inside the window", () => {
    render(
      <RenewLoanAction
        loan={loan(5.5, { isRenewable: false, nonRenewableReason: "deniedOtherReason" })}
        title="Vildheks"
        isRenewing={false}
        onRenew={() => {}}
      />
    )

    expect(renewButton().disabled).toBe(true)
    expect(screen.getByText(getRenewalFailureMessage("deniedOtherReason"))).toBeTruthy()
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
