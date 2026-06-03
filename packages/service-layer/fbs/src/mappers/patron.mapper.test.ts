import { describe, expect, it } from "vitest"

import { parseAndMapPatron } from "./patron.mapper"

const fullPatronBody = {
  authenticateStatus: "VALID" as const,
  patron: {
    name: "Test User",
    preferredPickupBranch: "DK-761500",
    emailAddress: "user@example.com",
    phoneNumber: "+4512345678",
  },
}

describe("parseAndMapPatron", () => {
  it("maps a VALID patron to a Patron with isLocked=false and all contact fields", () => {
    expect(parseAndMapPatron(fullPatronBody)).toEqual({
      name: "Test User",
      isLocked: false,
      preferredPickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
    })
  })

  it("maps a LOANER_LOCKED_OUT patron to a Patron with isLocked=true", () => {
    expect(
      parseAndMapPatron({
        ...fullPatronBody,
        authenticateStatus: "LOANER_LOCKED_OUT",
      })
    ).toEqual({
      name: "Test User",
      isLocked: true,
      preferredPickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
    })
  })

  it("returns undefined when authenticateStatus is INVALID (no patron object)", () => {
    expect(parseAndMapPatron({ authenticateStatus: "INVALID" })).toBeUndefined()
  })

  it("returns undefined when the patron object is missing on any status", () => {
    expect(parseAndMapPatron({ authenticateStatus: "VALID" })).toBeUndefined()
    expect(parseAndMapPatron({ authenticateStatus: "LOANER_LOCKED_OUT" })).toBeUndefined()
  })

  it("maps a patron with optional fields missing (name, email, phone are all optional)", () => {
    expect(
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: { preferredPickupBranch: "DK-761500" },
      })
    ).toEqual({
      name: undefined,
      isLocked: false,
      preferredPickupBranchId: "DK-761500",
      emailAddress: undefined,
      phoneNumber: undefined,
    })
  })

  it("ignores additional fields on the upstream patron object", () => {
    expect(
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: {
          ...fullPatronBody.patron,
          patronId: 123,
          receiveSms: true,
          defaultInterestPeriod: 180,
        },
      })
    ).toEqual({
      name: "Test User",
      isLocked: false,
      preferredPickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
    })
  })

  it("throws on an unknown authenticateStatus", () => {
    expect(() =>
      parseAndMapPatron({ ...fullPatronBody, authenticateStatus: "SUSPENDED" })
    ).toThrow()
  })

  it("throws on a missing authenticateStatus", () => {
    expect(() => parseAndMapPatron({})).toThrow()
  })

  it("throws when preferredPickupBranch is missing from the patron object", () => {
    expect(() =>
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: { name: "Test User" },
      })
    ).toThrow()
  })

  it("throws on a non-object response", () => {
    expect(() => parseAndMapPatron(null)).toThrow()
    expect(() => parseAndMapPatron("VALID")).toThrow()
    expect(() => parseAndMapPatron(42)).toThrow()
  })

  it("throws when patron.name is the wrong type", () => {
    expect(() =>
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: { ...fullPatronBody.patron, name: 42 },
      })
    ).toThrow()
  })
})
