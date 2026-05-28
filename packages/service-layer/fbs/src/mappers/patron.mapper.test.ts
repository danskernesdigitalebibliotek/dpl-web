import { describe, expect, it } from "vitest"

import { parseAndMapPatron } from "./patron.mapper"

describe("parseAndMapPatron", () => {
  it("maps a VALID patron with a name to a Patron with isLocked=false", () => {
    const raw = {
      authenticateStatus: "VALID",
      patron: { name: "Test User" },
    }

    expect(parseAndMapPatron(raw)).toEqual({
      name: "Test User",
      isLocked: false,
    })
  })

  it("maps a LOANER_LOCKED_OUT patron to a Patron with isLocked=true", () => {
    const raw = {
      authenticateStatus: "LOANER_LOCKED_OUT",
      patron: { name: "Test User" },
    }

    expect(parseAndMapPatron(raw)).toEqual({
      name: "Test User",
      isLocked: true,
    })
  })

  it("returns undefined when authenticateStatus is INVALID (no patron object)", () => {
    expect(parseAndMapPatron({ authenticateStatus: "INVALID" })).toBeUndefined()
  })

  it("returns undefined when the patron object is missing on any status", () => {
    expect(parseAndMapPatron({ authenticateStatus: "VALID" })).toBeUndefined()
    expect(parseAndMapPatron({ authenticateStatus: "LOANER_LOCKED_OUT" })).toBeUndefined()
  })

  it("maps a patron with no name", () => {
    const raw = {
      authenticateStatus: "VALID",
      patron: {},
    }

    expect(parseAndMapPatron(raw)).toEqual({
      name: undefined,
      isLocked: false,
    })
  })

  it("ignores additional fields on the upstream patron object", () => {
    const raw = {
      authenticateStatus: "VALID",
      patron: {
        name: "Test User",
        patronId: 123,
        emailAddress: "user@example.com",
      },
    }

    expect(parseAndMapPatron(raw)).toEqual({
      name: "Test User",
      isLocked: false,
    })
  })

  it("throws on an unknown authenticateStatus", () => {
    expect(() => parseAndMapPatron({ authenticateStatus: "SUSPENDED" })).toThrow()
  })

  it("throws on a missing authenticateStatus", () => {
    expect(() => parseAndMapPatron({})).toThrow()
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
        patron: { name: 42 },
      })
    ).toThrow()
  })
})
