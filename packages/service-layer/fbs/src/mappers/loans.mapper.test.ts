import { describe, expect, it } from "vitest"

import { parseAndMapLoans } from "./loans.mapper"

describe("parseAndMapLoans", () => {
  it("maps an empty list", () => {
    expect(parseAndMapLoans([])).toEqual([])
  })

  it("maps loan details to the domain shape", () => {
    const raw = [
      {
        isRenewable: true,
        isLongtermLoan: false,
        renewalStatusList: [],
        loanDetails: {
          loanId: 42,
          recordId: "12345678",
          dueDate: "2026-07-16",
          loanDate: "2026-06-16",
          loanType: "loan",
          materialItemNumber: "5001234567",
          materialGroup: { name: "standard", description: "Standard" },
        },
      },
    ]

    expect(parseAndMapLoans(raw)).toEqual([
      {
        loanId: 42,
        recordId: "12345678",
        dueDate: "2026-07-16",
        loanDate: "2026-06-16",
        materialItemNumber: "5001234567",
        isRenewable: true,
      },
    ])
  })

  it("keeps isRenewable false when the loan cannot be renewed", () => {
    const raw = [
      {
        isRenewable: false,
        loanDetails: {
          loanId: 1,
          recordId: "1",
          dueDate: "2026-07-01",
          loanDate: "2026-06-01",
          materialItemNumber: "5001234567",
        },
      },
    ]
    expect(parseAndMapLoans(raw)).toEqual([
      {
        loanId: 1,
        recordId: "1",
        dueDate: "2026-07-01",
        loanDate: "2026-06-01",
        materialItemNumber: "5001234567",
        isRenewable: false,
      },
    ])
  })

  it("throws on non-array input", () => {
    expect(() => parseAndMapLoans({})).toThrow()
    expect(() => parseAndMapLoans(null)).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseAndMapLoans([{ isRenewable: true, loanDetails: { loanId: 1 } }])).toThrow()
  })
})
