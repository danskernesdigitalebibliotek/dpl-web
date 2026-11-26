import type { LoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { usePreferredManifestation } from "@/hooks/usePreferredManifestation"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

const loanDecisions = vi.hoisted(() => ({
  current: { decisions: {} as Record<string, LoanDecision>, isLoading: false },
  askedFor: [] as string[],
}))
const sessionResolved = vi.hoisted(() => ({ current: true }))
const borrowingSession = vi.hoisted(() => ({ current: true }))

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", async importOriginal => ({
  ...(await importOriginal<object>()),
  useDigitalLoanDecisions: (materialIds: string[]) => {
    loanDecisions.askedFor = materialIds
    return { ...loanDecisions.current, isError: false }
  },
  useCanUseDigitalLoans: () => borrowingSession.current,
}))

vi.mock("@/lib/providers/ServiceLayerProvider", () => ({
  useIsServiceLayerSessionResolved: () => sessionResolved.current,
}))

const manifestation = (pid: string, code: string, isbn: string) =>
  ({
    pid,
    materialTypes: [{ materialTypeSpecific: { code } }],
    identifiers: [{ type: "ISBN", value: isbn }],
  }) as unknown as ManifestationSearchPageTeaserFragment

const newest = manifestation("newest", "EBOOK", "1")
const olderBlue = manifestation("older", "EBOOK", "2")
const audiobook = manifestation("audio", "AUDIO_BOOK_ONLINE", "3")
const book = manifestation("book", "BOOK", "4")
const blue: LoanDecision = { status: "loanable", loanProvider: "selection" }

type Props = { isEnabled?: boolean; key?: string | null }

const setup = (
  manifestations = [newest, olderBlue],
  initialProps: Props = { isEnabled: true, key: "EBOOK" }
) =>
  renderHook(
    ({ isEnabled, key }: Props) =>
      usePreferredManifestation(manifestations, { isEnabled, key, alsoAskAbout: [audiobook] }),
    { initialProps }
  )

describe("usePreferredManifestation", () => {
  beforeEach(() => {
    loanDecisions.current = { decisions: {}, isLoading: false }
    loanDecisions.askedFor = []
    sessionResolved.current = true
    borrowingSession.current = true
  })

  it("asks about the further manifestations in the same lookup", () => {
    setup()
    expect(loanDecisions.askedFor).toEqual(["1", "2", "3"])
  })

  it("waits until enabled", () => {
    const { result, rerender } = setup(undefined, { isEnabled: false, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(true)
    expect(loanDecisions.askedFor).toEqual([])

    rerender({ isEnabled: true, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(false)
  })

  it("waits until the session is known", () => {
    sessionResolved.current = false
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(true)

    sessionResolved.current = true
    rerender({ isEnabled: true, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(false)
  })

  it("waits for the decisions, then picks the newest BLÅ manifestation", () => {
    loanDecisions.current = { decisions: {}, isLoading: true }
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(true)

    loanDecisions.current = { decisions: { "2": blue }, isLoading: false }
    rerender({ isEnabled: true, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("older")
  })

  it("picks the newest once the decisions say nothing is BLÅ", () => {
    const { result } = setup()
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("newest")
  })

  it("does not wait for being enabled without a borrowing session", () => {
    borrowingSession.current = false
    const { result } = setup(undefined, { isEnabled: false, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("newest")
  })

  it("has nothing to wait for when no manifestation is digital", () => {
    loanDecisions.current = { decisions: {}, isLoading: true }
    const { result } = renderHook(() => usePreferredManifestation([book]))
    expect(result.current.isWaiting).toBe(false)
  })

  it("does not wait for the session when no manifestation is digital", () => {
    sessionResolved.current = false
    const { result } = renderHook(() => usePreferredManifestation([book]))
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("book")
  })

  it("does not wait again for the same key, but does for a new one", () => {
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(false)

    loanDecisions.current = { decisions: {}, isLoading: true }
    rerender({ isEnabled: true, key: "EBOOK" })
    expect(result.current.isWaiting).toBe(false)

    rerender({ isEnabled: true, key: "AUDIO_BOOK_ONLINE" })
    expect(result.current.isWaiting).toBe(true)
  })
})
