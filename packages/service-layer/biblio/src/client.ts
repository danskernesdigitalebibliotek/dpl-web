import type {
  BiblioCanLoan,
  BiblioLoan,
  BiblioLoanQuota,
  BiblioLoanResult,
  BiblioMaterial,
  BiblioReservation,
  BiblioSignInToken,
} from "../../src/types"
import { parseAndMapCanLoan, parseAndMapLoanResult } from "./mappers/can-loan.mapper"
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
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  // Return undefined instead of throwing on a 404 response.
  allowNotFound?: boolean
}

// The client surface mirrors the Publizon calls the frontends make today so
// they can switch provider behind the feature flag: loans, loan status,
// reservations (incl. the offer flow which replaces Publizon's redeem
// concept), loan quotas (Publizon library profile), support id (Publizon
// friendly card number) and the sign-in token for the reader/player SDK.
//
// Not covered because the adapter has no equivalent endpoints: the Publizon
// checklist (favorites) and batch loan status.
export function createBiblioClient(config: BiblioConfig) {
  const request = async (options: RequestOptions): Promise<unknown> => {
    const { method, path, query, body, allowNotFound } = options

    const queryEntries = Object.entries(query ?? {}).filter(
      (entry): entry is [string, string | number | boolean] => entry[1] !== undefined
    )
    const queryString = queryEntries.length
      ? `?${queryEntries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")}`
      : ""
    const url = `${config.baseUrl}${path}${queryString}`

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
    // Resolves a single material by its ISBN-13 via the Biblio adapter's
    // metadata endpoint. This is the only adapter surface callable without an
    // end-user token (a client_credentials bearer token is enough). A 404
    // means the material is unknown to Biblio, which we surface as
    // `undefined` rather than an error so callers can use it as a provider
    // probe.
    getMetadata: async (isbn: string): Promise<BiblioMaterial | undefined> => {
      const raw = await request({
        method: "GET",
        path: `/v1/metadata/${encodeURIComponent(isbn)}`,
        allowNotFound: true,
      })
      if (raw === undefined) {
        return undefined
      }
      return parseAndMapMetadata(raw)
    },

    getLoans: async (
      params?: PageParams & { active?: boolean }
    ): Promise<{ loans: BiblioLoan[]; nextCursor?: string }> => {
      const raw = await request({
        method: "GET",
        path: "/v1/loans",
        query: { active: params?.active, limit: params?.limit, cursor: params?.cursor },
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
    canLoan: async (
      materialId: string,
      options?: { allowNotFound?: boolean }
    ): Promise<BiblioCanLoan | undefined> => {
      const raw = await request({
        method: "GET",
        path: "/v1/loans/can-loan",
        query: { material_id: materialId },
        allowNotFound: options?.allowNotFound,
      })
      if (raw === undefined) {
        return undefined
      }
      return parseAndMapCanLoan(raw)
    },

    createLoan: async (materialId: string): Promise<BiblioLoanResult> => {
      const raw = await request({
        method: "POST",
        path: "/v1/loans",
        body: { material_id: materialId },
      })
      return parseAndMapLoanResult(raw)
    },

    getReservations: async (
      params?: PageParams
    ): Promise<{ reservations: BiblioReservation[]; nextCursor?: string }> => {
      const raw = await request({
        method: "GET",
        path: "/v1/reservations",
        query: { limit: params?.limit, cursor: params?.cursor },
      })
      return parseAndMapReservations(raw)
    },

    createReservation: async (materialId: string): Promise<BiblioLoanResult> => {
      const raw = await request({
        method: "POST",
        path: "/v1/reservations",
        body: { material_id: materialId },
      })
      return parseAndMapLoanResult(raw)
    },

    deleteReservation: async (reservationId: string): Promise<boolean> => {
      const raw = await request({
        method: "DELETE",
        path: `/v1/reservations/${encodeURIComponent(reservationId)}`,
      })
      return parseDeleteReservation(raw)
    },

    // Accept (redeem) a reservation offer as a loan.
    acceptReservationOffer: async (
      offerId: string
    ): Promise<{ success: boolean; loanId?: string }> => {
      const raw = await request({
        method: "POST",
        path: "/v1/reservations/accept-offer",
        body: { offer_id: offerId },
      })
      return parseAndMapAcceptReservationOffer(raw)
    },

    // Loan quotas per organization - the equivalent of the quota part of
    // Publizon's library profile.
    getLoanQuotas: async (): Promise<BiblioLoanQuota[]> => {
      const raw = await request({ method: "GET", path: "/v1/users/get_loan_quotas" })
      return parseAndMapLoanQuotas(raw)
    },

    // Stable identifier the user can hand to support - the equivalent of
    // Publizon's friendly card number.
    getSupportId: async (): Promise<string> => {
      const raw = await request({ method: "GET", path: "/v1/users/get_support_id" })
      return parseAndMapSupportId(raw)
    },

    // Custom token for the WeDoBooks SDK's users.signIn() used by the
    // reader/player.
    createSignInToken: async (): Promise<BiblioSignInToken> => {
      const raw = await request({ method: "POST", path: "/v1/auth/create-sign-in-token" })
      return parseAndMapSignInToken(raw)
    },
  }
}
