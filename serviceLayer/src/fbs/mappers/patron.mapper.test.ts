import { describe, expect, it } from "vitest"

import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import { mapAuthenticatedPatron } from "./patron.mapper"

describe("mapAuthenticatedPatron", () => {
  it("maps a valid patron with all fields", () => {
    const raw: AuthenticatedPatronV8 = {
      authenticateStatus: "VALID",
      patron: {
        patronId: 123,
        name: "Test User",
        defaultInterestPeriod: 30,
        guardianVisibility: false,
        preferredPickupBranch: "DK-123456",
        receiveEmail: true,
        receivePostalMail: false,
        receiveSms: false,
        resident: true,
      },
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result).toEqual({
      status: "VALID",
      patron: {
        name: "Test User",
        patronId: 123,
      },
    })
  })

  it("maps a response with undefined patron", () => {
    const raw: AuthenticatedPatronV8 = {
      authenticateStatus: "INVALID",
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result).toEqual({
      status: "INVALID",
      patron: undefined,
    })
  })

  it("maps LOANER_LOCKED_OUT status", () => {
    const raw: AuthenticatedPatronV8 = {
      authenticateStatus: "LOANER_LOCKED_OUT",
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result.status).toBe("LOANER_LOCKED_OUT")
    expect(result.patron).toBeUndefined()
  })

  it("maps a patron with undefined name", () => {
    const raw: AuthenticatedPatronV8 = {
      authenticateStatus: "VALID",
      patron: {
        patronId: 456,
        defaultInterestPeriod: 30,
        guardianVisibility: false,
        preferredPickupBranch: "DK-654321",
        receiveEmail: false,
        receivePostalMail: false,
        receiveSms: false,
        resident: false,
      },
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result.patron).toEqual({
      name: undefined,
      patronId: 456,
    })
  })
})
