import { describe, expect, it } from "vitest"

import { isDigitalEditionUnavailable, mapDigitalAvailability } from "./helper.digitalAvailability"

const availability = mapDigitalAvailability([
  // Not loanable, the patron's own quota is spent.
  { identifier: "quotaSpent", loanStatus: 0 },
  // Already loaned out.
  { identifier: "loaned", loanStatus: 1 },
  // Reserved, not redeemable yet.
  { identifier: "reserved", loanStatus: 2 },
  // Reserved and now redeemable.
  { identifier: "redeemable", loanStatus: 3 },
  // Loanable.
  { identifier: "loanable", loanStatus: 4 },
  // A reservation queue on the material. GO cannot reserve digital material,
  // so this is a dead end here.
  { identifier: "queued", loanStatus: 5 },
])

describe("mapDigitalAvailability", () => {
  it("keys items by identifier", () => {
    expect(availability["queued"]?.loanStatus).toBe(5)
  })

  it("skips items without an identifier", () => {
    expect(Object.keys(mapDigitalAvailability([{ loanStatus: 5 }]))).toHaveLength(0)
  })

  it("handles a missing item list", () => {
    expect(mapDigitalAvailability(undefined)).toEqual({})
    expect(mapDigitalAvailability(null)).toEqual({})
  })
})

describe("isDigitalEditionUnavailable", () => {
  it("is false for the two loanable statuses", () => {
    expect(isDigitalEditionUnavailable(availability, "redeemable")).toBe(false)
    expect(isDigitalEditionUnavailable(availability, "loanable")).toBe(false)
  })

  it("is true for every other status", () => {
    expect(isDigitalEditionUnavailable(availability, "quotaSpent")).toBe(true)
    expect(isDigitalEditionUnavailable(availability, "loaned")).toBe(true)
    expect(isDigitalEditionUnavailable(availability, "reserved")).toBe(true)
    expect(isDigitalEditionUnavailable(availability, "queued")).toBe(true)
  })

  // Silence is not an answer: an identifier nobody spoke for stays borrowable
  // rather than being marked on a guess.
  it("is false for an identifier missing from the response", () => {
    expect(isDigitalEditionUnavailable(availability, "unknown")).toBe(false)
  })

  it("is false for an item answered without a status", () => {
    const noStatus = mapDigitalAvailability([{ identifier: "silent" }])
    expect(isDigitalEditionUnavailable(noStatus, "silent")).toBe(false)
  })

  it("is false without an identifier", () => {
    expect(isDigitalEditionUnavailable(availability, undefined)).toBe(false)
  })

  it("is false when availability has not loaded", () => {
    expect(isDigitalEditionUnavailable(undefined, "queued")).toBe(false)
  })
})
