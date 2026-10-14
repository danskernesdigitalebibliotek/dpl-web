import { MaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { describe, expect, it } from "vitest"

import { isEditionObtainable, isEditionOnLoan } from "./helper.availability"

const availability: MaterialAvailability = {
  totalCopies: 4,
  reservationCount: 0,
  records: {
    // Owned, a copy on the shelf.
    onShelf: {
      recordId: "onShelf",
      totalCopies: 2,
      availableCopies: 1,
      reservationCount: 0,
      reservable: true,
    },
    // Owned, every copy lent out.
    onLoan: {
      recordId: "onLoan",
      totalCopies: 2,
      availableCopies: 0,
      reservationCount: 3,
      reservable: true,
    },
    // Not owned, and nothing to reserve.
    notOwned: {
      recordId: "notOwned",
      totalCopies: 0,
      availableCopies: 0,
      reservationCount: 0,
      reservable: false,
    },
    // Not owned, but obtainable from another library.
    fromOtherLibrary: {
      recordId: "fromOtherLibrary",
      totalCopies: 0,
      availableCopies: 0,
      reservationCount: 0,
      reservable: true,
    },
  },
}

describe("isEditionObtainable", () => {
  it("is true for an edition with copies on the shelf", () => {
    expect(isEditionObtainable(availability, "onShelf")).toBe(true)
  })

  it("is true for an owned edition that is lent out", () => {
    expect(isEditionObtainable(availability, "onLoan")).toBe(true)
  })

  it("is true for an edition reservable without the agency owning it", () => {
    expect(isEditionObtainable(availability, "fromOtherLibrary")).toBe(true)
  })

  it("is false for an edition that is neither owned nor reservable", () => {
    expect(isEditionObtainable(availability, "notOwned")).toBe(false)
  })

  // Silence is not a yes: an edition we cannot vouch for is left out rather
  // than offered and then failing at reservation time.
  it("is false for a record missing from the response", () => {
    expect(isEditionObtainable(availability, "99999999")).toBe(false)
  })

  it("is false when availability has not loaded", () => {
    expect(isEditionObtainable(undefined, "onShelf")).toBe(false)
  })
})

describe("isEditionOnLoan", () => {
  it("is true when the agency owns copies and none is available", () => {
    expect(isEditionOnLoan(availability, "onLoan")).toBe(true)
  })

  it("is false while a copy is still on the shelf", () => {
    expect(isEditionOnLoan(availability, "onShelf")).toBe(false)
  })

  // Not owned is a different state from lent out, and is filtered rather than
  // greyed out, so it must not be reported as on loan.
  it("is false for an edition the agency does not own", () => {
    expect(isEditionOnLoan(availability, "notOwned")).toBe(false)
    expect(isEditionOnLoan(availability, "fromOtherLibrary")).toBe(false)
  })

  it("is false when availability has not loaded", () => {
    expect(isEditionOnLoan(undefined, "onLoan")).toBe(false)
  })
})
