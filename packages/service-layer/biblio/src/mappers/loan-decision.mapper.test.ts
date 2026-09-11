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

  // Only "selection" (Danish blue titles) is free and draws on no quota, so
  // this one field decides whether the material page promises "included".
  describe("the licence", () => {
    it("carries the licence a blue title is lent under", () => {
      expect(
        parseAndMapLoanDecision({ status: "loanable", loan_provider: "selection" })
      ).toMatchObject({ loanProvider: "selection" })
    })

    it.each(["free", "k-fond", "click", "package", "premium", "selection"])(
      "carries %s through unchanged",
      loanProvider => {
        expect(
          parseAndMapLoanDecision({ status: "loanable", loan_provider: loanProvider })
        ).toMatchObject({ loanProvider })
      }
    )

    it("leaves the licence out when the adapter picked none", () => {
      // Optional by contract: absent means no provider could be selected,
      // which is not the same as a free one - the material page must then
      // promise nothing rather than call it included.
      expect(parseAndMapLoanDecision({ status: "loanable" }).loanProvider).toBeUndefined()
    })

    it("throws on a licence the contract does not list", () => {
      // A new WeDoBooks licence must fail loudly here: a quiet undefined would
      // read as "not included" and charge the patron's quota for a free title.
      expect(() =>
        parseAndMapLoanDecision({ status: "loanable", loan_provider: "brand-new-licence" })
      ).toThrow(/loan_provider/)
    })
  })

  it("maps every field of the decision, not just the status", () => {
    expect(
      parseAndMapLoanDecision({
        status: "unavailable",
        loan_provider: "premium",
        unavailable_reason: "not_in_catalogue",
        lending_block_reason: "too_many_loans",
      })
    ).toEqual({
      status: "unavailable",
      loanProvider: "premium",
      unavailableReason: "not_in_catalogue",
      lendingBlockReason: "too_many_loans",
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

  it("carries the licence the loan was actually made under", () => {
    // The request answers with the same decision shape as can-loan, so the
    // licence has to survive the extended schema too - this is the answer the
    // confirmation screen is rendered from.
    expect(
      parseAndMapLoanRequestResult({ status: "loanable", loan_provider: "selection" })
    ).toMatchObject({ loanProvider: "selection" })
  })

  it("throws on a licence the contract does not list", () => {
    expect(() =>
      parseAndMapLoanRequestResult({ status: "loanable", loan_provider: "brand-new-licence" })
    ).toThrow(/loan_provider/)
  })
})
