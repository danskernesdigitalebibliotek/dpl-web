import { describe, expect, it } from "vitest"

import { parseAndMapAvailability } from "./availability.mapper"

describe("parseAndMapAvailability", () => {
  it("returns zeros for an empty response array", () => {
    expect(parseAndMapAvailability([])).toEqual({
      totalCopies: 0,
      reservationCount: 0,
    })
  })

  it("counts materials across one record and one placement", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 2,
        holdings: [{ materials: [{}, {}, {}] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 3,
      reservationCount: 2,
    })
  })

  it("sums materials across multiple placements within one record", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 1,
        holdings: [{ materials: [{}, {}] }, { materials: [{}] }, { materials: [] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 3,
      reservationCount: 1,
    })
  })

  it("aggregates copies and reservations across multiple records", () => {
    const raw = [
      {
        recordId: "11111111",
        reservations: 4,
        holdings: [{ materials: [{}, {}] }, { materials: [{}] }],
      },
      {
        recordId: "22222222",
        reservations: 1,
        holdings: [{ materials: [{}] }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 4,
      reservationCount: 5,
    })
  })

  it("ignores additional fields on the response", () => {
    const raw = [
      {
        recordId: "12345678",
        reservations: 0,
        reservable: true,
        holdings: [{ materials: [{ id: 1 }], branch: { branchId: "DK-761500" } }],
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual({
      totalCopies: 1,
      reservationCount: 0,
    })
  })

  it("throws when the response is not an array", () => {
    expect(() => parseAndMapAvailability({})).toThrow()
    expect(() => parseAndMapAvailability(null)).toThrow()
    expect(() => parseAndMapAvailability("nope")).toThrow()
  })

  it("throws when reservations is missing or the wrong type", () => {
    expect(() => parseAndMapAvailability([{ recordId: "12345678", holdings: [] }])).toThrow()
    expect(() =>
      parseAndMapAvailability([{ recordId: "12345678", reservations: "1", holdings: [] }])
    ).toThrow()
  })

  it("throws when holdings is missing or the wrong shape", () => {
    expect(() => parseAndMapAvailability([{ recordId: "12345678", reservations: 0 }])).toThrow()
    expect(() =>
      parseAndMapAvailability([
        { recordId: "12345678", reservations: 0, holdings: [{ materials: "x" }] },
      ])
    ).toThrow()
  })
})
