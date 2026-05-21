import { describe, expect, it } from "vitest"

import { isAuthenticatedPatronV8 } from "./client"

describe("isAuthenticatedPatronV8", () => {
  it("accepts each known FBS status", () => {
    expect(isAuthenticatedPatronV8({ authenticateStatus: "VALID" })).toBe(true)
    expect(isAuthenticatedPatronV8({ authenticateStatus: "INVALID" })).toBe(true)
    expect(
      isAuthenticatedPatronV8({ authenticateStatus: "LOANER_LOCKED_OUT" })
    ).toBe(true)
  })

  it("rejects an unknown status string", () => {
    expect(isAuthenticatedPatronV8({ authenticateStatus: "SUSPENDED" })).toBe(
      false
    )
  })

  it("rejects an object missing authenticateStatus", () => {
    expect(isAuthenticatedPatronV8({})).toBe(false)
  })

  it("rejects null and non-objects", () => {
    expect(isAuthenticatedPatronV8(null)).toBe(false)
    expect(isAuthenticatedPatronV8("VALID")).toBe(false)
    expect(isAuthenticatedPatronV8(42)).toBe(false)
  })
})
