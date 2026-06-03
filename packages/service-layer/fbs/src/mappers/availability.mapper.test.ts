import { describe, expect, it } from "vitest"

import { parseAndMapAvailability } from "./availability.mapper"

describe("parseAndMapAvailability", () => {
  it("maps a list of FBS availability entries to domain DTOs", () => {
    const raw = [
      { available: true, recordId: "12345678", reservable: true, reservations: 2 },
      { available: false, recordId: "23456789", reservable: false, reservations: 0 },
    ]

    expect(parseAndMapAvailability(raw)).toEqual([
      { faustId: "12345678", isAvailable: true, isReservable: true, reservationCount: 2 },
      { faustId: "23456789", isAvailable: false, isReservable: false, reservationCount: 0 },
    ])
  })

  it("returns an empty array when given an empty array", () => {
    expect(parseAndMapAvailability([])).toEqual([])
  })

  it("ignores additional fields on each upstream entry", () => {
    const raw = [
      {
        available: true,
        recordId: "12345678",
        reservable: true,
        reservations: 1,
        somethingElse: "ignored",
      },
    ]

    expect(parseAndMapAvailability(raw)).toEqual([
      { faustId: "12345678", isAvailable: true, isReservable: true, reservationCount: 1 },
    ])
  })

  it("throws when a required field is missing", () => {
    expect(() =>
      parseAndMapAvailability([{ recordId: "12345678", reservable: true, reservations: 0 }])
    ).toThrow()
  })

  it("throws when a field has the wrong type", () => {
    expect(() =>
      parseAndMapAvailability([
        { available: "yes", recordId: "12345678", reservable: true, reservations: 0 },
      ])
    ).toThrow()
  })

  it("throws when the response is not an array", () => {
    expect(() => parseAndMapAvailability(null)).toThrow()
    expect(() => parseAndMapAvailability({})).toThrow()
    expect(() => parseAndMapAvailability("nope")).toThrow()
  })

  it("throws when reservations is not an integer", () => {
    expect(() =>
      parseAndMapAvailability([
        { available: true, recordId: "12345678", reservable: true, reservations: 1.5 },
      ])
    ).toThrow()
  })
})
