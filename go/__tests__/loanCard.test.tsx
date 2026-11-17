import { cleanup, render } from "@testing-library/react"
import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import LoanCard from "@/components/shared/loanCard/LoanCard"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

/**
 * The card reports every loan it renders back to the profile page, which
 * groups them into audiobooks, e-books and blue titles. A loan decision that
 * never arrives — no patron session, or a material Biblio has no id for —
 * must not keep a loan out of those groups.
 */

const decisionResult = vi.fn()

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", () => ({
  useDigitalLoanDecision: () => decisionResult(),
  isCostFreeLoan: (loanProvider?: string) => loanProvider === "selection",
}))

vi.mock("@/lib/rest/publizon/useGetV1UserLoans", () => ({
  default: () => ({ data: undefined, isLoading: false }),
}))

const EBOOK_ISBN = "9788711402740"

const manifestation = {
  identifiers: [{ type: "ISBN", value: EBOOK_ISBN }],
  materialTypes: [{ materialTypeSpecific: { code: "EBOOK", display: "e-bog" } }],
  cover: {},
} as unknown as ManifestationSearchPageTeaserFragment

const renderCard = () => {
  const setEbookLoans = vi.fn()
  render(
    <LoanCard
      manifestation={manifestation}
      title="Vildheks"
      setAudioLoans={vi.fn()}
      setEbookLoans={setEbookLoans}
      setBlueLoans={vi.fn()}
    />
  )
  return setEbookLoans
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("LoanCard reports its loan", () => {
  it("reports an e-book once the decision has settled", () => {
    decisionResult.mockReturnValue({
      data: { status: "loanable" },
      isPending: false,
      fetchStatus: "idle",
    })

    expect(renderCard()).toHaveBeenCalled()
  })

  it("reports an e-book when the decision is disabled and will never arrive", () => {
    // What a signed-out session looks like: pending forever, nothing in
    // flight.
    decisionResult.mockReturnValue({
      data: undefined,
      isPending: true,
      fetchStatus: "idle",
    })

    expect(renderCard()).toHaveBeenCalled()
  })

  it("waits while the decision is actually in flight", () => {
    decisionResult.mockReturnValue({
      data: undefined,
      isPending: true,
      fetchStatus: "fetching",
    })

    expect(renderCard()).not.toHaveBeenCalled()
  })
})
