import type { LoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useWorkTeaserManifestation } from "@/hooks/useWorkTeaserManifestation"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

const loanDecisions = vi.hoisted(() => ({
  current: { decisions: {} as Record<string, LoanDecision>, isLoading: false },
}))
const sessionResolved = vi.hoisted(() => ({ current: true }))
const borrowingSession = vi.hoisted(() => ({ current: true as boolean | undefined }))

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", async importOriginal => ({
  ...(await importOriginal<object>()),
  useDigitalLoanDecisions: () => ({ ...loanDecisions.current, isError: false }),
  useServiceLayerConfig: () => ({ canUseDigitalLoans: borrowingSession.current }),
}))

vi.mock("@/lib/providers/ServiceLayerProvider", () => ({
  useIsServiceLayerSessionResolved: () => sessionResolved.current,
}))

const ebook = (pid: string, isbn: string) =>
  ({
    pid,
    materialTypes: [{ materialTypeSpecific: { code: "EBOOK" } }],
    identifiers: [{ type: "ISBN", value: isbn }],
  }) as unknown as ManifestationSearchPageTeaserFragment

const newest = ebook("newest", "1")
const olderBlue = ebook("older", "2")
const blue: LoanDecision = { status: "loanable", loanProvider: "selection" }

const setup = (isEnabled = true) =>
  renderHook(
    ({ isEnabled }) =>
      useWorkTeaserManifestation({
        manifestations: [newest, olderBlue],
        linkedManifestations: [newest, olderBlue],
        isEnabled,
      }),
    { initialProps: { isEnabled } }
  )

describe("useWorkTeaserManifestation", () => {
  beforeEach(() => {
    loanDecisions.current = { decisions: {}, isLoading: false }
    sessionResolved.current = true
    borrowingSession.current = true
  })

  it("waits until the teaser is in view", () => {
    const { result, rerender } = setup(false)
    expect(result.current.isWaiting).toBe(true)

    rerender({ isEnabled: true })
    expect(result.current.isWaiting).toBe(false)
  })

  it("waits until the session is known", () => {
    sessionResolved.current = false
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(true)

    sessionResolved.current = true
    rerender({ isEnabled: true })
    expect(result.current.isWaiting).toBe(false)
  })

  it("waits for the decisions, then picks the newest BLÅ manifestation", () => {
    loanDecisions.current = { decisions: {}, isLoading: true }
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(true)

    loanDecisions.current = { decisions: { "2": blue }, isLoading: false }
    rerender({ isEnabled: true })
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("older")
    expect(result.current.isBlueTitle).toBe(true)
  })

  it("picks the newest once the decisions say nothing is BLÅ", () => {
    const { result } = setup()
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("newest")
    expect(result.current.isBlueTitle).toBe(false)
  })

  it("does not wait for the teaser to be in view without a borrowing session", () => {
    borrowingSession.current = false
    const { result } = setup(false)
    expect(result.current.isWaiting).toBe(false)
    expect(result.current.manifestation?.pid).toBe("newest")
  })

  it("treats a config without the digital flag as a borrowing session", () => {
    borrowingSession.current = undefined
    const { result } = setup(false)
    expect(result.current.isWaiting).toBe(true)
  })

  it("does not wait again once the pick is made", () => {
    loanDecisions.current = { decisions: { "2": blue }, isLoading: false }
    const { result, rerender } = setup()
    expect(result.current.isWaiting).toBe(false)

    loanDecisions.current = { decisions: { "2": blue }, isLoading: true }
    rerender({ isEnabled: true })
    expect(result.current.isWaiting).toBe(false)
  })
})
