import { describe, expect, it } from "vitest"

import { parseAndMapRenewedLoans } from "./renewedLoans.mapper"

describe("parseAndMapRenewedLoans", () => {
  it("maps an empty list", () => {
    expect(parseAndMapRenewedLoans([])).toEqual([])
  })

  it("marks a loan renewed when the status list contains renewed", () => {
    const raw = [
      {
        renewalStatus: ["renewed"],
        loanDetails: {
          loanId: 42,
          recordId: "12345678",
          dueDate: "2026-08-16",
          loanDate: "2026-07-16",
          loanType: "loan",
        },
      },
    ]

    expect(parseAndMapRenewedLoans(raw)).toEqual([
      {
        loanId: 42,
        recordId: "12345678",
        dueDate: "2026-08-16",
        renewed: true,
      },
    ])
  })

  it("matches renewed case-insensitively", () => {
    const raw = [
      {
        renewalStatus: ["Renewed"],
        loanDetails: { loanId: 1, recordId: "1", dueDate: "2026-08-01" },
      },
    ]
    expect(parseAndMapRenewedLoans(raw)[0].renewed).toBe(true)
  })

  it("marks a loan not renewed when only denial reasons are present", () => {
    const raw = [
      {
        renewalStatus: ["deniedReserved"],
        loanDetails: { loanId: 1, recordId: "1", dueDate: "2026-07-01" },
      },
    ]
    expect(parseAndMapRenewedLoans(raw)).toEqual([
      { loanId: 1, recordId: "1", dueDate: "2026-07-01", renewed: false },
    ])
  })

  it("throws on non-array input", () => {
    expect(() => parseAndMapRenewedLoans({})).toThrow()
    expect(() => parseAndMapRenewedLoans(null)).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseAndMapRenewedLoans([{ renewalStatus: ["renewed"] }])).toThrow()
  })
})
