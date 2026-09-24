import { describe, expect, it } from "vitest"

import { parseAndMapPatron } from "./patron.mapper"

const fullPatronBody = {
  authenticateStatus: "VALID" as const,
  patron: {
    name: "Test User",
    preferredPickupBranch: "DK-761500",
    emailAddress: "user@example.com",
    phoneNumber: "+4512345678",
    receiveSms: true,
  },
}

describe("parseAndMapPatron", () => {
  it("maps a VALID patron to a Patron with isLocked=false and all contact fields", () => {
    expect(parseAndMapPatron(fullPatronBody)).toEqual({
      name: "Test User",
      isLocked: false,
      pickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
      receiveSms: true,
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
      pickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
      receiveSms: true,
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
      pickupBranchId: "DK-761500",
      emailAddress: undefined,
      phoneNumber: undefined,
      receiveSms: undefined,
    })
  })

  it("maps receiveSms=false through rather than coercing it to undefined", () => {
    expect(
      parseAndMapPatron({
        ...fullPatronBody,
        patron: { ...fullPatronBody.patron, receiveSms: false },
      })
    ).toEqual({
      name: "Test User",
      isLocked: false,
      pickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
      receiveSms: false,
    })
  })

  it("ignores additional fields on the upstream patron object", () => {
    expect(
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: {
          ...fullPatronBody.patron,
          patronId: 123,
          defaultInterestPeriod: 180,
        },
      })
    ).toEqual({
      name: "Test User",
      isLocked: false,
      pickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
      receiveSms: true,
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

  it("coerces null email/phone/receiveSms to undefined (FBS sends null for missing)", () => {
    expect(
      parseAndMapPatron({
        authenticateStatus: "VALID",
        patron: {
          name: "Test User",
          preferredPickupBranch: "DK-710117",
          emailAddress: null,
          phoneNumber: null,
          receiveSms: null,
        },
      })
    ).toEqual({
      name: "Test User",
      isLocked: false,
      pickupBranchId: "DK-710117",
      emailAddress: undefined,
      phoneNumber: undefined,
      receiveSms: undefined,
    })
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
