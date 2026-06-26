import type {
  CreateReservationInput,
  CreateReservationResult,
  MaterialAvailability,
  Patron,
  Reservation,
} from "../../src/types"
import {
  getAddReservationsV2Url,
  getDeleteReservationsUrl,
  getGetHoldingsLogisticsV1Url,
  getGetPatronInformationByPatronIdV4Url,
  getGetReservationsV2Url,
} from "./generated/fbs"
import type { CreateReservationBatchV2 } from "./generated/model/createReservationBatchV2"
import { parseAndMapAvailability } from "./mappers/availability.mapper"
import { parseAndMapPatron } from "./mappers/patron.mapper"
import { parseAndMapReservation } from "./mappers/reservation.mapper"
import { parseAndMapReservations } from "./mappers/reservations.mapper"
import type { FbsConfig } from "./types"

export function createFbsClient(config: FbsConfig) {
  return {
    getPatron: async (): Promise<Patron | undefined> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}${getGetPatronInformationByPatronIdV4Url()}`, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getPatron failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapPatron(raw)
    },

    getMaterialAvailability: async (recordIds: string[]): Promise<MaterialAvailability> => {
      if (recordIds.length === 0) {
        return { totalCopies: 0, reservationCount: 0 }
      }
      const authHeader = await config.getAuthHeader()
      const url = `${config.baseUrl}${getGetHoldingsLogisticsV1Url({ recordid: recordIds })}`
      const response = await fetch(url, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(
          `FBS getMaterialAvailability failed: ${response.status} ${response.statusText}`
        )
      }
      const raw: unknown = await response.json()
      return parseAndMapAvailability(raw)
    },

    createReservation: async (input: CreateReservationInput): Promise<CreateReservationResult> => {
      const authHeader = await config.getAuthHeader()
      const body: CreateReservationBatchV2 = {
        reservations: [
          {
            recordId: input.recordId,
            ...(input.pickupBranchId ? { pickupBranch: input.pickupBranchId } : {}),
            ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
          },
        ],
      }
      const response = await fetch(`${config.baseUrl}${getAddReservationsV2Url()}`, {
        method: "POST",
        headers: {
          authorization: authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
      const raw: unknown = await response.json().catch(() => undefined)

      // FBS may report failures (e.g. already_reserved) with a non-2xx status
      // but a structured body. Map the body first; only throw if it isn't one.
      try {
        return parseAndMapReservation(raw)
      } catch (parseError) {
        if (!response.ok) {
          throw new Error(`FBS createReservation failed: ${response.status} ${response.statusText}`)
        }
        throw parseError
      }
    },

    getReservations: async (): Promise<Reservation[]> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}${getGetReservationsV2Url()}`, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getReservations failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapReservations(raw)
    },

    deleteReservation: async (reservationId: number): Promise<void> => {
      const authHeader = await config.getAuthHeader()
      const url = `${config.baseUrl}${getDeleteReservationsUrl({
        reservationid: [reservationId],
      })}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS deleteReservation failed: ${response.status} ${response.statusText}`)
      }
    },
  }
}
