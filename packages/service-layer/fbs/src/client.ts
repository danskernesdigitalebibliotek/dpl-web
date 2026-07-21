import type {
  CreateReservationInput,
  CreateReservationResult,
  Fee,
  Loan,
  MaterialAvailability,
  Patron,
  RenewedLoan,
  Reservation,
} from "../../src/types"
import {
  getAddReservationsV2Url,
  getDeleteReservationsUrl,
  getGetFeesV2Url,
  getGetHoldingsLogisticsV1Url,
  getGetLoansV2Url,
  getGetPatronInformationByPatronIdV4Url,
  getGetReservationsV2Url,
  getRenewLoansV2Url,
} from "./generated/fbs"
import type { CreateReservationBatchV2 } from "./generated/model/createReservationBatchV2"
import { parseAndMapAvailability } from "./mappers/availability.mapper"
import { parseAndMapFees } from "./mappers/fees.mapper"
import { parseAndMapLoans } from "./mappers/loans.mapper"
import { parseAndMapPatron } from "./mappers/patron.mapper"
import { parseAndMapRenewedLoans } from "./mappers/renewedLoans.mapper"
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
          throw new Error(
            `FBS createReservation failed: ${response.status} ${response.statusText}`,
            { cause: parseError }
          )
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

    getFees: async (): Promise<Fee[]> => {
      const authHeader = await config.getAuthHeader()
      // Unpaid fees only; nonpayable ones are included because they are
      // displayed, not paid, through the client systems.
      const url = `${config.baseUrl}${getGetFeesV2Url({
        includepaid: false,
        includenonpayable: true,
      })}`
      const response = await fetch(url, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getFees failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapFees(raw)
    },

    getLoans: async (): Promise<Loan[]> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}${getGetLoansV2Url()}`, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getLoans failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapLoans(raw)
    },

    renewLoans: async (loanIds: number[]): Promise<RenewedLoan[]> => {
      if (loanIds.length === 0) {
        return []
      }
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}${getRenewLoansV2Url()}`, {
        method: "POST",
        headers: {
          authorization: authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify(loanIds),
      })
      if (!response.ok) {
        throw new Error(`FBS renewLoans failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapRenewedLoans(raw)
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
