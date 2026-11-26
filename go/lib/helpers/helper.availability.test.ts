import { MaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { describe, expect, it } from "vitest"

import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import {
  getManifestationQueueText,
  getShownManifestations,
  isEditionObtainable,
  isEditionOnLoan,
  isManifestationLentOut,
  isManifestationUnobtainable,
} from "./helper.availability"

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

// The pid's faust must match a record id in the fixture above.
const manifestation = (faust: string, code = "BOOK") =>
  ({
    pid: `870970-basis:${faust}`,
    materialTypes: [{ materialTypeSpecific: { code, display: code } }],
  }) as unknown as ManifestationWorkPageFragment

describe("isManifestationUnobtainable", () => {
  it("is true for a record the kommune cannot supply", () => {
    expect(isManifestationUnobtainable(manifestation("notOwned"), availability, true)).toBe(true)
  })

  it("is false for one it can", () => {
    expect(isManifestationUnobtainable(manifestation("onShelf"), availability, true)).toBe(false)
  })

  it("is false for a lent-out one, which is still reservable", () => {
    expect(isManifestationUnobtainable(manifestation("onLoan"), availability, true)).toBe(false)
  })

  it("is false for a digital edition, which has no record", () => {
    expect(
      isManifestationUnobtainable(manifestation("notOwned", "EBOOK"), availability, true)
    ).toBe(false)
  })

  it("is false before the availability has resolved", () => {
    expect(isManifestationUnobtainable(manifestation("notOwned"), availability, false)).toBe(false)
  })
})

describe("getShownManifestations", () => {
  it("leaves out what the kommune cannot supply and keeps the order", () => {
    const manifestations = [
      manifestation("onShelf"),
      manifestation("notOwned"),
      manifestation("onLoan"),
    ]

    expect(getShownManifestations(manifestations, availability, true).map(m => m.pid)).toEqual([
      "870970-basis:onShelf",
      "870970-basis:onLoan",
    ])
  })

  it("shows every manifestation before the availability has resolved", () => {
    const manifestations = [manifestation("onShelf"), manifestation("notOwned")]

    expect(getShownManifestations(manifestations, availability, false)).toHaveLength(2)
  })
})

describe("isManifestationLentOut", () => {
  it("is true when the kommune holds it but no copy is on the shelf", () => {
    expect(isManifestationLentOut(manifestation("onLoan"), availability, true)).toBe(true)
  })

  it("is false when a copy is on the shelf", () => {
    expect(isManifestationLentOut(manifestation("onShelf"), availability, true)).toBe(false)
  })

  it("is false for a digital edition, which has no record", () => {
    expect(isManifestationLentOut(manifestation("onLoan", "EBOOK"), availability, true)).toBe(false)
  })

  it("is false before the availability has resolved", () => {
    expect(isManifestationLentOut(manifestation("onLoan"), availability, false)).toBe(false)
  })
})

describe("getManifestationQueueText", () => {
  it("names the queue for a lent-out edition", () => {
    expect(getManifestationQueueText(manifestation("onLoan"), availability, true)).toBe(
      "Der er 3 lånere i kø."
    )
  })

  it("is undefined for a digital edition, which has no record", () => {
    expect(
      getManifestationQueueText(manifestation("onLoan", "EBOOK"), availability, true)
    ).toBeUndefined()
  })

  it("is undefined before the availability has resolved", () => {
    expect(getManifestationQueueText(manifestation("onLoan"), availability, false)).toBeUndefined()
  })
})
