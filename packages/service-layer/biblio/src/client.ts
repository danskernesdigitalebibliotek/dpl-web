import type {
  DigitalLoan,
  DigitalLoanQuota,
  DigitalMaterial,
  DigitalReservation,
  LoanDecision,
  LoanRequestResult,
  ReaderSignInToken,
} from "../../src/types"
import {
  getAcceptReservationOfferForAuthenticatedUserUrl,
  getCanLoanForAuthenticatedUserUrl,
  getCreateReservationForAuthenticatedUserUrl,
  getCreateSignInTokenForAuthenticatedUserUrl,
  getDeleteReservationForAuthenticatedUserUrl,
  getGetLoanQuotasForAuthenticatedUserUrl,
  getGetLoansForAuthenticatedUserUrl,
  getGetMetadataByMaterialIdUrl,
  getGetReservationsForAuthenticatedUserUrl,
  getGetSupportIdForAuthenticatedUserUrl,
  getRequestLoanForAuthenticatedUserUrl,
} from "./generated/biblio"
import {
  parseAndMapLoanDecision,
  parseAndMapLoanRequestResult,
} from "./mappers/loan-decision.mapper"
import { parseAndMapLoans } from "./mappers/loan.mapper"
import { parseAndMapMetadata } from "./mappers/metadata.mapper"
import { parseAndMapLoanQuotas } from "./mappers/quotas.mapper"
import {
  parseAndMapAcceptReservationOffer,
  parseAndMapReservations,
  parseDeleteReservation,
} from "./mappers/reservation.mapper"
import { parseAndMapSignInToken, parseAndMapSupportId } from "./mappers/user.mapper"
import type { BiblioConfig } from "./types"

type PageParams = {
  limit?: number
  cursor?: string
}

type RequestOptions = {
  method: "GET" | "POST" | "DELETE"
  path: string
  body?: unknown
  // Return undefined instead of throwing on a 404 response.
  allowNotFound?: boolean
}

// Mirrors the Publizon calls the frontends make so they can switch provider
// behind the feature flag. Not covered because the adapter has no
// equivalent: the Publizon checklist (favorites) and batch loan status.
export function createBiblioClient(config: BiblioConfig) {
  const request = async (options: RequestOptions): Promise<unknown> => {
    const { method, path, body, allowNotFound } = options

    const url = `${config.baseUrl}${path}`

    const authHeader = await config.getAuthHeader()
    const response = await fetch(url, {
      method,
      headers: {
        authorization: authHeader,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

    if (allowNotFound && response.status === 404) {
      return undefined
    }
    if (!response.ok) {
      throw new Error(`Biblio ${method} ${path} failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as unknown
  }

  return {
    // The only adapter call that works with a client_credentials token alone.
    // A 404 means Biblio does not know the ISBN; returned as `undefined` so
    // callers can use it as a provider probe.
    getMetadata: async (isbn: string): Promise<DigitalMaterial | undefined> => {
      const raw = await request({
        method: "GET",
        // The generated helpers do not encode path parameters.
        path: getGetMetadataByMaterialIdUrl(encodeURIComponent(isbn)),
        allowNotFound: true,
      })
      if (raw === undefined) {
        return undefined
      }
      return parseAndMapMetadata(raw)
    },

    getLoans: async (
      params?: PageParams & { active?: boolean }
    ): Promise<{ loans: DigitalLoan[]; nextCursor?: string }> => {
      const raw = await request({
        method: "GET",
        path: getGetLoansForAuthenticatedUserUrl({
          active: params?.active,
          limit: params?.limit,
          cursor: params?.cursor,
        }),
      })
      return parseAndMapLoans(raw)
    },

    // Whether the user can loan the material right now - the equivalent of
    // Publizon's loan status for an identifier.
    //
    // TEMPORARY, with the toleration flag it serves: the adapter answers 404
    // for a material it does not know, and with allowNotFound that becomes
    // undefined - "Biblio has no answer" - for callers that want to render
    // the material as unavailable rather than fail on it.
    getLoanDecision: async (
      materialId: string,
      options?: { allowNotFound?: boolean }
    ): Promise<LoanDecision | undefined> => {
      const raw = await request({
        method: "GET",
        path: getCanLoanForAuthenticatedUserUrl({ material_id: materialId }),
        allowNotFound: options?.allowNotFound,
      })
      if (raw === undefined) {
        return undefined
      }
      return parseAndMapLoanDecision(raw)
    },

    createLoan: async (materialId: string): Promise<LoanRequestResult> => {
      const raw = await request({
        method: "POST",
        path: getRequestLoanForAuthenticatedUserUrl(),
        body: { material_id: materialId },
      })
      return parseAndMapLoanRequestResult(raw)
    },

    getReservations: async (
      params?: PageParams
    ): Promise<{ reservations: DigitalReservation[]; nextCursor?: string }> => {
      const raw = await request({
        method: "GET",
        path: getGetReservationsForAuthenticatedUserUrl({
          limit: params?.limit,
          cursor: params?.cursor,
        }),
      })
      return parseAndMapReservations(raw)
    },

    createReservation: async (materialId: string): Promise<LoanRequestResult> => {
      const raw = await request({
        method: "POST",
        path: getCreateReservationForAuthenticatedUserUrl(),
        body: { material_id: materialId },
      })
      return parseAndMapLoanRequestResult(raw)
    },

    deleteReservation: async (reservationId: string): Promise<boolean> => {
      const raw = await request({
        method: "DELETE",
        path: getDeleteReservationForAuthenticatedUserUrl(encodeURIComponent(reservationId)),
      })
      return parseDeleteReservation(raw)
    },

    // Accept (redeem) a reservation offer as a loan.
    acceptReservationOffer: async (
      offerId: string
    ): Promise<{ success: boolean; loanId?: string }> => {
      const raw = await request({
        method: "POST",
        path: getAcceptReservationOfferForAuthenticatedUserUrl(),
        body: { offer_id: offerId },
      })
      return parseAndMapAcceptReservationOffer(raw)
    },

    // Loan quotas per organization - the equivalent of the quota part of
    // Publizon's library profile.
    getLoanQuotas: async (): Promise<DigitalLoanQuota[]> => {
      const raw = await request({ method: "GET", path: getGetLoanQuotasForAuthenticatedUserUrl() })
      return parseAndMapLoanQuotas(raw)
    },

    // Stable identifier the user can hand to support - the equivalent of
    // Publizon's friendly card number.
    getSupportId: async (): Promise<string> => {
      const raw = await request({ method: "GET", path: getGetSupportIdForAuthenticatedUserUrl() })
      return parseAndMapSupportId(raw)
    },

    // Custom token for the WeDoBooks SDK's users.signIn() used by the
    // reader/player.
    createSignInToken: async (): Promise<ReaderSignInToken> => {
      const raw = await request({
        method: "POST",
        path: getCreateSignInTokenForAuthenticatedUserUrl(),
      })
      return parseAndMapSignInToken(raw)
    },
  }
}
