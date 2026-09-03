import { describe, expect, it } from "vitest"

import { parseAndMapCanLoan, parseAndMapLoanResult } from "./can-loan.mapper"

describe("parseAndMapCanLoan", () => {
  it("maps the can-loan answer", () => {
    expect(parseAndMapCanLoan({ status: "loanable" })).toEqual({
      status: "loanable",
      unavailableReason: undefined,
      lendingBlockReason: undefined,
    })
  })

  it("surfaces the adapter's own message when a 2xx body is its error envelope", () => {
    expect(() => parseAndMapCanLoan({ message: "Rate limit exceeded" })).toThrow(
      "Biblio adapter error: Rate limit exceeded"
    )
  })

  it("throws the validation error when the body is neither answer nor error envelope", () => {
    expect(() => parseAndMapCanLoan({ status: "not-a-status" })).toThrow(/status/)
  })
})

describe("parseAndMapLoanResult", () => {
  it("surfaces the adapter's own message when a 2xx body is its error envelope", () => {
    expect(() => parseAndMapLoanResult({ message: "Loan failed" })).toThrow(
      "Biblio adapter error: Loan failed"
    )
  })
})
