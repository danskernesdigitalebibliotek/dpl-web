import type { ReservationDetailsV2 } from "../generated/model/reservationDetailsV2"
import type { ReservationResponseV2 } from "../generated/model/reservationResponseV2"
import type { ReservationResultV2 } from "../generated/model/reservationResultV2"
import type {
  ReservationDetails,
  ReservationResponse,
  ReservationResult,
} from "../types"
import { mapBibliographicRecord } from "./loan.mapper"

export function mapReservationDetails(
  raw: ReservationDetailsV2
): ReservationDetails {
  return {
    dateOfReservation: raw.dateOfReservation,
    expiryDate: raw.expiryDate,
    ilBibliographicRecord: raw.ilBibliographicRecord
      ? mapBibliographicRecord(raw.ilBibliographicRecord)
      : undefined,
    numberInQueue: raw.numberInQueue,
    periodical: raw.periodical,
    pickupBranch: raw.pickupBranch,
    pickupDeadline: raw.pickupDeadline,
    pickupNumber: raw.pickupNumber,
    recordId: raw.recordId,
    reservationId: raw.reservationId,
    reservationType: raw.reservationType,
    state: raw.state,
    transactionId: raw.transactionId,
  }
}

export function mapReservationResult(
  raw: ReservationResultV2
): ReservationResult {
  return {
    periodical: raw.periodical,
    recordId: raw.recordId,
    reservationDetails: raw.reservationDetails
      ? mapReservationDetails(raw.reservationDetails)
      : undefined,
    result: raw.result,
  }
}

export function mapReservationResponse(
  raw: ReservationResponseV2
): ReservationResponse {
  return {
    reservationResults: raw.reservationResults.map(mapReservationResult),
    success: raw.success,
  }
}
