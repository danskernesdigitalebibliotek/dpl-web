import { describe, expect, it } from "vitest"

import { parseAndMapAuthenticatedPatron } from "./patron.mapper"

describe("parseAndMapAuthenticatedPatron", () => {
  it("maps a valid patron with a name", () => {
    const raw = {
      authenticateStatus: "VALID",
      patron: {
        name: "Test User",
      },
    }

    expect(parseAndMapAuthenticatedPatron(raw)).toEqual({
      status: "VALID",
      patron: { name: "Test User" },
    })
  })

  it("maps a response with no patron object", () => {
    const raw = { authenticateStatus: "INVALID" }

    expect(parseAndMapAuthenticatedPatron(raw)).toEqual({
      status: "INVALID",
      patron: undefined,
    })
  })

  it("maps LOANER_LOCKED_OUT status to LOCKED_OUT", () => {
    const raw = { authenticateStatus: "LOANER_LOCKED_OUT" }

    expect(parseAndMapAuthenticatedPatron(raw).status).toBe("LOCKED_OUT")
  })

  it("maps a patron with no name", () => {
    const raw = {
      authenticateStatus: "VALID",
      patron: {},
    }

    expect(parseAndMapAuthenticatedPatron(raw)).toEqual({
      status: "VALID",
      patron: { name: undefined },
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

    expect(parseAndMapAuthenticatedPatron(raw)).toEqual({
      status: "VALID",
      patron: { name: "Test User" },
    })
  })

  it("throws on an unknown authenticateStatus", () => {
    expect(() => parseAndMapAuthenticatedPatron({ authenticateStatus: "SUSPENDED" })).toThrow()
  })

  it("throws on a missing authenticateStatus", () => {
    expect(() => parseAndMapAuthenticatedPatron({})).toThrow()
  })

  it("throws on a non-object response", () => {
    expect(() => parseAndMapAuthenticatedPatron(null)).toThrow()
    expect(() => parseAndMapAuthenticatedPatron("VALID")).toThrow()
    expect(() => parseAndMapAuthenticatedPatron(42)).toThrow()
  })

  it("throws when patron.name is the wrong type", () => {
    expect(() =>
      parseAndMapAuthenticatedPatron({
        authenticateStatus: "VALID",
        patron: { name: 42 },
      })
    ).toThrow()
  })
})
