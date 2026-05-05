import { describe, expect, it } from "vitest"

import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import {
  mapAuthenticatedPatron,
  mapPatronV7,
} from "./patron.mapper"

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
        emailAddress: "test@example.com",
        phoneNumber: "12345678",
        blockStatus: [
          {
            blockedReason: "fee",
            blockedSince: "2024-01-01",
            message: "Unpaid fees",
          },
        ],
        address: {
          city: "Copenhagen",
          coName: "",
          country: "Denmark",
          postalCode: "1000",
          street: "Main St 1",
        },
      },
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result.status).toBe("VALID")
    expect(result.patron).toBeDefined()
    expect(result.patron!.name).toBe("Test User")
    expect(result.patron!.patronId).toBe(123)
    expect(result.patron!.emailAddress).toBe("test@example.com")
    expect(result.patron!.phoneNumber).toBe("12345678")
    expect(result.patron!.preferredPickupBranch).toBe("DK-123456")
    expect(result.patron!.receiveEmail).toBe(true)
    expect(result.patron!.blockStatus).toHaveLength(1)
    expect(result.patron!.guardianVisibility).toBe(false)
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

    expect(result.patron!.name).toBeUndefined()
    expect(result.patron!.patronId).toBe(456)
    expect(result.patron!.preferredPickupBranch).toBe("DK-654321")
  })

  it("maps guardianVisibility from PatronV7", () => {
    const raw: AuthenticatedPatronV8 = {
      authenticateStatus: "VALID",
      patron: {
        patronId: 789,
        defaultInterestPeriod: 14,
        guardianVisibility: true,
        preferredPickupBranch: "DK-111111",
        receiveEmail: true,
        receivePostalMail: false,
        receiveSms: true,
        resident: true,
      },
    }

    const result = mapAuthenticatedPatron(raw)

    expect(result.patron!.guardianVisibility).toBe(true)
  })
})

describe("mapPatronV7", () => {
  it("maps all fields from PatronV7", () => {
    const result = mapPatronV7({
      patronId: 100,
      name: "V7 Patron",
      defaultInterestPeriod: 30,
      guardianVisibility: true,
      preferredPickupBranch: "DK-100000",
      receiveEmail: true,
      receivePostalMail: true,
      receiveSms: false,
      resident: true,
    })

    expect(result.patronId).toBe(100)
    expect(result.name).toBe("V7 Patron")
    expect(result.guardianVisibility).toBe(true)
  })
})
