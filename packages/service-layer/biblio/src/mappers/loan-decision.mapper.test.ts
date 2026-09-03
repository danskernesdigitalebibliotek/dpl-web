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

  /**
   * The licence the loan would be made under.
   *
   * Only "selection" - what Danish blue titles answer with - is free to the
   * patron and draws on no quota, so this one field decides whether the
   * material page promises "included" or counts the loan against the monthly
   * quota. It travels from here through useDigitalLoanDecision to
   * MaterialAvailabilityTextOnline, and nothing between them re-derives it.
   */
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
      // A licence type WeDoBooks adds later must fail loudly here rather than
      // arrive as a quiet undefined, which would read as "not included" and
      // silently charge the patron's quota for a material they may hold for
      // free. The availability label dies with it - that is the intended
      // trade: a visible failure over a wrong promise.
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
