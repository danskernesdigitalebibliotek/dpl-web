import { describe, expect, it } from "vitest"

import { parseAndMapAvailability } from "./availability.mapper"

// FBS reports a copy as on-shelf (`available: true`) or lent out.
const onShelf = { available: true }
const lentOut = { available: false }

describe("parseAndMapAvailability", () => {
  it("returns zeros for an empty response array", () => {
    expect(parseAndMapAvailability([])).toEqual({
      totalCopies: 0,
      reservationCount: 0,
      records: {},
    })
  })

  it("counts materials across one record and one placement", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 2,
        reservable: true,
        holdings: [{ materials: [onShelf, onShelf, lentOut] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 3,
      reservationCount: 2,
      records: {
        "12345678": {
          recordId: "12345678",
          totalCopies: 3,
          availableCopies: 2,
          reservationCount: 2,
          reservable: true,
        },
      },
    })
  })

  it("sums materials across multiple placements within one record", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 1,
        reservable: true,
        holdings: [{ materials: [onShelf, lentOut] }, { materials: [onShelf] }, { materials: [] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 3,
      reservationCount: 1,
      records: {
        "12345678": {
          recordId: "12345678",
          totalCopies: 3,
          availableCopies: 2,
          reservationCount: 1,
          reservable: true,
        },
      },
    })
  })

  it("aggregates copies and reservations across multiple records", () => {
    const raw = [
      {
        recordId: "11111111",
        reservations: 4,
        reservable: true,
        holdings: [{ materials: [onShelf, lentOut] }, { materials: [lentOut] }],
      },
      {
        recordId: "22222222",
        reservations: 1,
        reservable: false,
        holdings: [{ materials: [onShelf] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 4,
      reservationCount: 5,
      records: {
        "11111111": {
          recordId: "11111111",
          totalCopies: 3,
          availableCopies: 1,
          reservationCount: 4,
          reservable: true,
        },
        "22222222": {
          recordId: "22222222",
          totalCopies: 1,
          availableCopies: 1,
          reservationCount: 1,
          reservable: false,
        },
      },
    })
  })

  // Every copy lent out is the ordinary "udlant" state: the agency owns the
  // edition, and it normally stays reservable so the patron joins the queue.
  it("reports zero available copies when every copy is lent out", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 3,
        reservable: true,
        holdings: [{ materials: [lentOut, lentOut] }],
      },
    ]

    expect(parseAndMapAvailability(raw).records["12345678"]).toEqual({
      recordId: "12345678",
      totalCopies: 2,
      availableCopies: 0,
      reservationCount: 3,
      reservable: true,
    })
  })

  // Reservability is FBS's own answer, not something derived from the counts:
  // a record the agency holds no copies of can still be reservable when it is
  // obtainable from another library.
  it("keeps reservable independent of the copy counts", () => {
    const raw = [{ recordId: "12345678", reservations: 0, reservable: true, holdings: [] }]

    expect(parseAndMapAvailability(raw).records["12345678"]).toEqual({
      recordId: "12345678",
      totalCopies: 0,
      availableCopies: 0,
      reservationCount: 0,
      reservable: true,
    })
  })

  it("ignores additional fields on the response", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 0,
        reservable: true,
        holdings: [{ materials: [{ available: true, id: 1 }], branch: { branchId: "DK-761500" } }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 1,
      reservationCount: 0,
      records: {
        "12345678": {
          recordId: "12345678",
          totalCopies: 1,
          availableCopies: 1,
          reservationCount: 0,
          reservable: true,
        },
      },
    })
  })

  it("throws when the response is not an array", () => {
    expect(() => parseAndMapAvailability({})).toThrow()
    expect(() => parseAndMapAvailability(null)).toThrow()
    expect(() => parseAndMapAvailability("nope")).toThrow()
  })

  it("throws when reservations is missing or the wrong type", () => {
    expect(() =>
      parseAndMapAvailability([{ recordId: "12345678", reservable: true, holdings: [] }])
    ).toThrow()
    expect(() =>
      parseAndMapAvailability([
        { recordId: "12345678", reservations: "1", reservable: true, holdings: [] },
      ])
    ).toThrow()
  })

  // A library on an older FBS adapter might not send these. Losing one field
  // must not cost the whole response, so they fall back to the permissive
  // answer: the edition stays visible rather than being hidden.
  it("defaults reservable to true when missing or the wrong type", () => {
    expect(
      parseAndMapAvailability([{ recordId: "12345678", reservations: 0, holdings: [] }]).records[
        "12345678"
      ].reservable
    ).toBe(true)
    expect(
      parseAndMapAvailability([
        { recordId: "12345678", reservations: 0, reservable: "yes", holdings: [] },
      ]).records["12345678"].reservable
    ).toBe(true)
  })

  it("throws when holdings is missing or the wrong shape", () => {
    expect(() =>
      parseAndMapAvailability([{ recordId: "12345678", reservations: 0, reservable: true }])
    ).toThrow()
    expect(() =>
      parseAndMapAvailability([
        { recordId: "12345678", reservations: 0, reservable: true, holdings: [{ materials: "x" }] },
      ])
    ).toThrow()
  })

  it("counts a material missing available as on the shelf", () => {
    const result = parseAndMapAvailability([
      {
        recordId: "12345678",
        reservations: 0,
        reservable: true,
        holdings: [{ materials: [{}] }],
      },
    ])

    expect(result.records["12345678"].totalCopies).toBe(1)
    expect(result.records["12345678"].availableCopies).toBe(1)
  })

  it("keeps a record the agency does not own, with zero copies", () => {
    const raw = [
      { recordId: "11111111", reservations: 0, reservable: false, holdings: [] },
      {
        recordId: "22222222",
        reservations: 0,
        reservable: true,
        holdings: [{ materials: [onShelf] }],
      },
    ]

    const result = parseAndMapAvailability(raw)

    expect(result.records["11111111"].totalCopies).toBe(0)
    expect(result.records["22222222"].totalCopies).toBe(1)
  })

  // FBS answers once per record. Should that ever change, the last entry
  // wins in `records` while the totals still sum every entry - pinned here so
  // the divergence shows up as a failing test rather than in the ui.
  it("keeps the last entry for a repeated recordId", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 1,
        reservable: true,
        holdings: [{ materials: [onShelf] }],
      },
      {
        recordId: "12345678",
        reservations: 2,
        reservable: true,
        holdings: [{ materials: [onShelf, lentOut] }],
      },
    ]

    const result = parseAndMapAvailability(raw)

    expect(result.records["12345678"]).toEqual({
      recordId: "12345678",
      totalCopies: 2,
      availableCopies: 1,
      reservationCount: 2,
      reservable: true,
    })
    expect(result.totalCopies).toBe(3)
  })
})
