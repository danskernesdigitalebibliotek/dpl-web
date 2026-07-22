import { describe, expect, it } from "vitest"

import { RESERVATION_FAILURE_REASONS } from "../../../src/types"
import { parseAndMapReservation } from "./reservation.mapper"

const successBody = {
  success: true,
  reservationResults: [
    {
      recordId: "12345678",
      result: "reserved",
      reservationDetails: {
        recordId: "12345678",
        reservationId: 987654,
        pickupBranch: "DK-761500",
        numberInQueue: 3,
        dateOfReservation: "2026-06-10",
        expiryDate: "2026-12-10",
        reservationType: "normal",
        state: "reserved",
        transactionId: "tx-1",
      },
    },
  ],
}

describe("parseAndMapReservation", () => {
  it("maps a successful reservation to status=success with queue position and pickup branch", () => {
    expect(parseAndMapReservation(successBody)).toEqual({
      status: "success",
      recordId: "12345678",
      reservationId: 987654,
      pickupBranchId: "DK-761500",
      numberInQueue: 3,
    })
  })

  it("leaves numberInQueue undefined when the response omits it", () => {
    const body = {
      ...successBody,
      reservationResults: [
        {
          ...successBody.reservationResults[0],
          reservationDetails: {
            ...successBody.reservationResults[0].reservationDetails,
            numberInQueue: undefined,
          },
        },
      ],
    }

    expect(parseAndMapReservation(body)).toMatchObject({
      status: "success",
      numberInQueue: undefined,
    })
  })

  it("returns status=failed when success is false", () => {
    expect(
      parseAndMapReservation({
        success: false,
        reservationResults: [{ recordId: "12345678", result: "patron_is_blocked" }],
      })
    ).toEqual({
      status: "failed",
      recordId: "12345678",
      reason: "patron_is_blocked",
    })
  })

  it.each(RESERVATION_FAILURE_REASONS.filter(r => r !== "unknown"))(
    "maps documented failure code %s to itself",
    code => {
      expect(
        parseAndMapReservation({
          success: false,
          reservationResults: [{ recordId: "12345678", result: code }],
        })
      ).toEqual({ status: "failed", recordId: "12345678", reason: code })
    }
  )

  it("normalises mixed-case codes from FBS to the canonical lowercase form", () => {
    // The spec lists "material_Discarded" with capital D — guard against it.
    expect(
      parseAndMapReservation({
        success: false,
        reservationResults: [{ recordId: "12345678", result: "material_Discarded" }],
      })
    ).toEqual({ status: "failed", recordId: "12345678", reason: "material_discarded" })
  })

  it("coerces undocumented failure codes to reason=unknown", () => {
    expect(
      parseAndMapReservation({
        success: false,
        reservationResults: [{ recordId: "12345678", result: "some_new_code_added_later" }],
      })
    ).toEqual({ status: "failed", recordId: "12345678", reason: "unknown" })
  })

  it("handles a real FBS failure body where reservationDetails is null", () => {
    expect(
      parseAndMapReservation({
        success: false,
        reservationResults: [
          {
            periodical: null,
            recordId: "61636935",
            reservationDetails: null,
            result: "already_reserved",
          },
        ],
      })
    ).toEqual({
      status: "failed",
      recordId: "61636935",
      reason: "already_reserved",
    })
  })

  it("returns status=failed when success is true but reservationDetails is missing", () => {
    expect(
      parseAndMapReservation({
        success: true,
        reservationResults: [{ recordId: "12345678", result: "already_reserved" }],
      })
    ).toEqual({
      status: "failed",
      recordId: "12345678",
      reason: "already_reserved",
    })
  })

  it("coerces unparsable garbage reason via the unknown bucket", () => {
    expect(
      parseAndMapReservation({
        success: true,
        reservationResults: [{ recordId: "12345678", result: "" }],
      })
    ).toEqual({ status: "failed", recordId: "12345678", reason: "unknown" })
  })

  it("throws when reservationResults is empty", () => {
    expect(() => parseAndMapReservation({ success: true, reservationResults: [] })).toThrow()
  })

  it("throws when the response shape fails validation", () => {
    expect(() => parseAndMapReservation({})).toThrow()
    expect(() => parseAndMapReservation(null)).toThrow()
    expect(() => parseAndMapReservation({ success: "yes", reservationResults: [] })).toThrow()
  })

  it("ignores additional fields on the reservation details", () => {
    const body = {
      success: true,
      reservationResults: [
        {
          recordId: "12345678",
          result: "reserved",
          extraField: "ignored",
          reservationDetails: {
            reservationId: 1,
            pickupBranch: "DK-761500",
            numberInQueue: 0,
            pickupDeadline: "2026-06-20",
            pickupNumber: "42",
            state: "readyForPickup",
            transactionId: "tx-2",
          },
        },
      ],
    }

    expect(parseAndMapReservation(body)).toMatchObject({
      status: "success",
      reservationId: 1,
      pickupBranchId: "DK-761500",
      numberInQueue: 0,
    })
  })
})
