import { describe, expect, it } from "vitest"

import { cannotBeBorrowed, isMaterialAvailable } from "./digital-loan-decision"
import type { LoanDecisionStatus } from "./types"

const answered = (status: LoanDecisionStatus) =>
  ({ type: "success", loanDecision: { status } }) as const

describe("isMaterialAvailable", () => {
  it("Treats a loanable material as available", () => {
    expect(isMaterialAvailable(answered("loanable"))).toBe(true)
  })

  it.each(["reservable", "wishable", "unavailable"] as const)(
    "Treats a material that can only be %s as unavailable",
    status => {
      expect(isMaterialAvailable(answered(status))).toBe(false)
    }
  )

  it.each([
    "monthly_limit_exceeded",
    "concurrent_limit_exceeded",
    "no_valid_credentials",
    "lending_blocked",
  ] as const)(
    "Keeps the material available when %s describes the user, not the material",
    status => {
      expect(isMaterialAvailable(answered(status))).toBe(true)
    }
  )

  it("Does not promise a material available on a status it does not know", () => {
    expect(isMaterialAvailable(answered("brand-new-status"))).toBe(false)
  })

  it("Treats a material that cannot be borrowed as unavailable", () => {
    expect(isMaterialAvailable(cannotBeBorrowed)).toBe(false)
  })

  it("Treats an unanswered decision as unavailable", () => {
    expect(isMaterialAvailable(undefined)).toBe(false)
  })
})
