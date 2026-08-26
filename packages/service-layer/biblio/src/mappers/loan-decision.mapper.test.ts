import { describe, expect, it } from "vitest"

import { parseAndMapLoanDecision, parseAndMapLoanRequestResult } from "./loan-decision.mapper"

describe("parseAndMapLoanDecision", () => {
  it("maps the can-loan answer", () => {
    expect(parseAndMapLoanDecision({ status: "loanable" })).toEqual({
      status: "loanable",
      unavailableReason: undefined,
      lendingBlockReason: undefined,
    })
  })

  it("surfaces the adapter's own message when a 2xx body is its error envelope", () => {
    expect(() => parseAndMapLoanDecision({ message: "Rate limit exceeded" })).toThrow(
      "Biblio adapter error: Rate limit exceeded"
    )
  })

  it("throws the validation error when the body is neither answer nor error envelope", () => {
    expect(() => parseAndMapLoanDecision({ status: "not-a-status" })).toThrow(/status/)
  })
})

describe("parseAndMapLoanRequestResult", () => {
  it("surfaces the adapter's own message when a 2xx body is its error envelope", () => {
    expect(() => parseAndMapLoanRequestResult({ message: "Loan failed" })).toThrow(
      "Biblio adapter error: Loan failed"
    )
  })
})
