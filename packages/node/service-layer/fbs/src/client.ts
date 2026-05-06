import type { AuthenticatedPatronV8 } from "./generated/model/authenticatedPatronV8"
import type { AuthenticatedPatronV10 } from "./generated/model/authenticatedPatronV10"
import type { AvailabilityV3 } from "./generated/model/availabilityV3"
import type { AgencyBranch } from "./generated/model/agencyBranch"
import type { FeeV2 } from "./generated/model/feeV2"
import type { HoldingsForBibliographicalRecordLogisticsV1 } from "./generated/model/holdingsForBibliographicalRecordLogisticsV1"
import type { LoanV2 } from "./generated/model/loanV2"
import type { RenewedLoanV2 } from "./generated/model/renewedLoanV2"
import type { ReservationDetailsV2 } from "./generated/model/reservationDetailsV2"
import type { ReservationResponseV2 } from "./generated/model/reservationResponseV2"
import { mapAvailability } from "./mappers/availability.mapper"
import { mapBranch } from "./mappers/branch.mapper"
import { mapFee } from "./mappers/fee.mapper"
import { mapHoldingsForBibliographicalRecord } from "./mappers/holdings.mapper"
import { mapLoan, mapRenewedLoan } from "./mappers/loan.mapper"
import { mapAuthenticatedPatron } from "./mappers/patron.mapper"
import { mapReservationDetails, mapReservationResponse } from "./mappers/reservation.mapper"
import type {
  AuthenticatedPatronInfo,
  Availability,
  Branch,
  CreatePatronRequest,
  CreateReservationBatch,
  DeleteReservationsParams,
  FbsFetcherConfig,
  Fee,
  GetAvailabilityParams,
  GetBranchesParams,
  GetFeesParams,
  GetHoldingsParams,
  HoldingsForBibliographicalRecord,
  Loan,
  RenewedLoan,
  ReservationDetails,
  ReservationResponse,
  UpdatePatronRequest,
  UpdateReservationBatch,
} from "./types"

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
    } else {
      searchParams.append(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export function createFbsClient(config: FbsFetcherConfig) {
  async function request<T>(
    url: string,
    options: {
      method: "GET" | "POST" | "PUT" | "DELETE"
      body?: unknown
      params?: Record<string, unknown>
    }
  ): Promise<T | null> {
    const authHeader = await config.getAuthHeader()
    const queryString = options.params ? buildQueryString(options.params) : ""
    const response = await fetch(`${config.baseUrl}${url}${queryString}`, {
      method: options.method,
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      console.error(response.status, response.statusText, url)
    }

    try {
      return (await response.json()) as T
    } catch {
      return null
    }
  }

  return {
    // -- Patron --

    getPatronInfo: async (): Promise<AuthenticatedPatronInfo> => {
      const raw = await request<AuthenticatedPatronV8>(
        "/external/agencyid/patrons/patronid/v4",
        { method: "GET" }
      )
      return mapAuthenticatedPatron(raw!)
    },

    updatePatron: async (data: UpdatePatronRequest): Promise<void> => {
      await request("/external/agencyid/patrons/patronid/v8", {
        method: "PUT",
        body: data,
      })
    },

    createPatron: async (data: CreatePatronRequest): Promise<AuthenticatedPatronInfo> => {
      const raw = await request<AuthenticatedPatronV10>(
        "/external/agencyid/patrons/v9",
        { method: "POST", body: data }
      )
      // AuthenticatedPatronV10 has the same shape as AuthenticatedPatronV8 for our purposes
      return mapAuthenticatedPatron(raw as unknown as AuthenticatedPatronV8)
    },

    // -- Fees --

    getFees: async (params: GetFeesParams): Promise<Fee[]> => {
      const raw = await request<FeeV2[]>(
        "/external/agencyid/patron/patronid/fees/v2",
        { method: "GET", params: params as unknown as Record<string, unknown> }
      )
      return (raw ?? []).map(mapFee)
    },

    // -- Loans --

    getLoans: async (): Promise<Loan[]> => {
      const raw = await request<LoanV2[]>(
        "/external/agencyid/patrons/patronid/loans/v2",
        { method: "GET" }
      )
      return (raw ?? []).map(mapLoan)
    },

    renewLoans: async (loanIds: number[]): Promise<RenewedLoan[]> => {
      const raw = await request<RenewedLoanV2[]>(
        "/external/agencyid/patrons/patronid/loans/renew/v2",
        { method: "POST", body: loanIds }
      )
      return (raw ?? []).map(mapRenewedLoan)
    },

    // -- Reservations --

    getReservations: async (): Promise<ReservationDetails[]> => {
      const raw = await request<ReservationDetailsV2[]>(
        "/external/v1/agencyid/patrons/patronid/reservations/v2",
        { method: "GET" }
      )
      return (raw ?? []).map(mapReservationDetails)
    },

    addReservations: async (data: CreateReservationBatch): Promise<ReservationResponse> => {
      const raw = await request<ReservationResponseV2>(
        "/external/v1/agencyid/patrons/patronid/reservations/v2",
        { method: "POST", body: data }
      )
      return mapReservationResponse(raw!)
    },

    updateReservations: async (data: UpdateReservationBatch): Promise<ReservationDetails[]> => {
      const raw = await request<ReservationDetailsV2[]>(
        "/external/v1/agencyid/patrons/patronid/reservations",
        { method: "PUT", body: data }
      )
      return (raw ?? []).map(mapReservationDetails)
    },

    deleteReservations: async (params: DeleteReservationsParams): Promise<void> => {
      await request("/external/v1/agencyid/patrons/patronid/reservations", {
        method: "DELETE",
        params: params as unknown as Record<string, unknown>,
      })
    },

    // -- Branches --

    getBranches: async (params?: GetBranchesParams): Promise<Branch[]> => {
      const raw = await request<AgencyBranch[]>(
        "/external/v1/agencyid/branches",
        { method: "GET", params: params as unknown as Record<string, unknown> }
      )
      return (raw ?? []).map(mapBranch)
    },

    // -- Availability --

    getAvailability: async (params: GetAvailabilityParams): Promise<Availability[]> => {
      const raw = await request<AvailabilityV3[]>(
        "/external/agencyid/catalog/availability/v3",
        { method: "GET", params: params as unknown as Record<string, unknown> }
      )
      return (raw ?? []).map(mapAvailability)
    },

    // -- Holdings --

    getHoldings: async (params: GetHoldingsParams): Promise<HoldingsForBibliographicalRecord[]> => {
      const raw = await request<HoldingsForBibliographicalRecordLogisticsV1[]>(
        "/external/agencyid/catalog/holdingsLogistics/v1",
        { method: "GET", params: params as unknown as Record<string, unknown> }
      )
      return (raw ?? []).map(mapHoldingsForBibliographicalRecord)
    },
  }
}
