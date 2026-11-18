import { cleanup, render } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { DigitalLoan } from "@danskernesdigitalebibliotek/dpl-service-layer"

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

const renderCard = (biblioLoans?: DigitalLoan[]) => {
  const groups = {
    setAudioLoans: vi.fn(),
    setEbookLoans: vi.fn(),
    setBlueLoans: vi.fn(),
  }
  render(
    <LoanCard
      manifestation={manifestation}
      title="Vildheks"
      biblioLoans={biblioLoans}
      {...groups}
    />
  )
  return groups
}

const settledDecision = {
  data: { status: "loanable" },
  isPending: false,
  fetchStatus: "idle",
}

const biblioLoan = (materialId: string, endDate: string) =>
  [{ materialId, endDate }] as unknown as DigitalLoan[]

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

    const { setEbookLoans, setBlueLoans, setAudioLoans } = renderCard()
    expect(setEbookLoans).toHaveBeenCalled()
    expect(setBlueLoans).not.toHaveBeenCalled()
    expect(setAudioLoans).not.toHaveBeenCalled()
  })

  it("reports a cost-free e-book as blue, and only as blue", () => {
    decisionResult.mockReturnValue({
      data: { status: "loanable", loanProvider: "selection" },
      isPending: false,
      fetchStatus: "idle",
    })

    const { setBlueLoans, setEbookLoans } = renderCard()
    expect(setBlueLoans).toHaveBeenCalled()
    expect(setEbookLoans).not.toHaveBeenCalled()
  })

  it("reports an e-book when the decision is disabled and will never arrive", () => {
    // What a signed-out session looks like: pending forever, nothing in
    // flight.
    decisionResult.mockReturnValue({
      data: undefined,
      isPending: true,
      fetchStatus: "idle",
    })

    const { setEbookLoans, setBlueLoans } = renderCard()
    expect(setEbookLoans).toHaveBeenCalled()
    expect(setBlueLoans).not.toHaveBeenCalled()
  })

  it("waits while the decision is actually in flight", () => {
    decisionResult.mockReturnValue({
      data: undefined,
      isPending: true,
      fetchStatus: "fetching",
    })

    const { setEbookLoans, setBlueLoans, setAudioLoans } = renderCard()
    expect(setEbookLoans).not.toHaveBeenCalled()
    expect(setBlueLoans).not.toHaveBeenCalled()
    expect(setAudioLoans).not.toHaveBeenCalled()
  })
})

/**
 * The card shows whichever provider holds the loan. A Biblio loan runs to the
 * end of a day, so its end timestamp is counted as the plain UTC date — the
 * raw instant lands a day later in CET and would disagree with the loan modal.
 */
describe("LoanCard shows a Biblio loan's due date", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 23:30 CET: the hour where the raw timestamp and the date differ.
    vi.setSystemTime(new Date("2026-11-18T22:30:00Z"))
    decisionResult.mockReturnValue(settledDecision)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("counts the days to the end of the loan's last day", () => {
    const { container } = render(
      <LoanCard
        manifestation={manifestation}
        title="Vildheks"
        biblioLoans={biblioLoan(EBOOK_ISBN, "2026-11-20T23:59:59Z")}
        setAudioLoans={vi.fn()}
        setEbookLoans={vi.fn()}
        setBlueLoans={vi.fn()}
      />
    )

    expect(container.textContent).toContain("Udløber om 2 dage")
  })

  it("matches a loan made on an identifier the catalogue does not type as ISBN", () => {
    const publizonId = "9788711402757"
    const withPublizonIdentifier = {
      ...manifestation,
      identifiers: [
        { type: "PUBLIZON", value: publizonId },
        { type: "ISBN", value: EBOOK_ISBN },
      ],
    } as unknown as ManifestationSearchPageTeaserFragment

    const { container } = render(
      <LoanCard
        manifestation={withPublizonIdentifier}
        title="Vildheks"
        biblioLoans={biblioLoan(EBOOK_ISBN, "2026-11-20T23:59:59Z")}
        setAudioLoans={vi.fn()}
        setEbookLoans={vi.fn()}
        setBlueLoans={vi.fn()}
      />
    )

    expect(container.textContent).toContain("Udløber om 2 dage")
  })
})
