import { describe, expect, it } from "vitest"

import { parseAndMapReservations } from "./reservations.mapper"

describe("parseAndMapReservations", () => {
  it("maps an empty list", () => {
    expect(parseAndMapReservations([])).toEqual([])
  })

  it("maps reservation details to the domain shape", () => {
    const raw = [
      {
        recordId: "12345678",
        reservationId: 42,
        pickupBranch: "DK-761500",
        numberInQueue: 3,
        state: "reserved",
        dateOfReservation: "2026-06-10",
        expiryDate: "2026-12-10",
        reservationType: "normal",
        transactionId: "tx-1",
      },
    ]

    expect(parseAndMapReservations(raw)).toEqual([
      {
        reservationId: 42,
        recordId: "12345678",
        pickupBranchId: "DK-761500",
        numberInQueue: 3,
        state: "reserved",
        pickupDeadline: undefined,
        pickupNumber: undefined,
      },
    ])
  })

  it("maps pickup details on ready reservations", () => {
    const raw = [
      {
        recordId: "12345678",
        reservationId: 43,
        pickupBranch: "DK-761500",
        numberInQueue: null,
        state: "readyForPickup",
        pickupDeadline: "2026-07-22",
        pickupNumber: "Reol 101",
      },
    ]

    expect(parseAndMapReservations(raw)).toEqual([
      {
        reservationId: 43,
        recordId: "12345678",
        pickupBranchId: "DK-761500",
        numberInQueue: undefined,
        state: "readyForPickup",
        pickupDeadline: "2026-07-22",
        pickupNumber: "Reol 101",
      },
    ])
  })

  it("leaves numberInQueue undefined when omitted", () => {
    const raw = [
      {
        recordId: "1",
        reservationId: 1,
        pickupBranch: "DK-761500",
        state: "readyForPickup",
      },
    ]
    expect(parseAndMapReservations(raw)).toEqual([
      {
        reservationId: 1,
        recordId: "1",
        pickupBranchId: "DK-761500",
        numberInQueue: undefined,
        state: "readyForPickup",
        pickupDeadline: undefined,
        pickupNumber: undefined,
      },
    ])
  })

  it("throws on non-array input", () => {
    expect(() => parseAndMapReservations({})).toThrow()
    expect(() => parseAndMapReservations(null)).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseAndMapReservations([{ reservationId: 1 }])).toThrow()
  })
})
