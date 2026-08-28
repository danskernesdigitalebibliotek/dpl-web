import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { LoanDecision, LoanDecisionStatus, ServiceLayerConfig } from "./types"

// Whether the user can borrow a material right now. The answer covers both the
// material (is it available?) and the user (quota, lending blocks), so callers
// must pick the part they care about - see isMaterialAvailable.
//
// TEMPORARY, with the toleration setting it serves: when the config tolerates
// unknown materials, one the adapter does not know resolves to null - null
// rather than undefined, because TanStack Query rejects undefined as query
// data. Otherwise the 404 stays an error, which is the honest default:
// asking about an unknown material is normally a routing mistake.
export async function getDigitalLoanDecision(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanDecision | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const decision = await biblio.getLoanDecision(materialId, {
    allowNotFound: config.tolerateUnknownMaterials?.() ?? false,
  })
  return decision ?? null
}

/**
 * Whether the MATERIAL itself can be borrowed right now.
 *
 * Statuses that describe the user rather than the material - an exhausted
 * quota, blocked lending, missing credentials - leave the material itself
 * available. This mirrors Publizon, where status 0 ("not loanable, max loans
 * reached") is also counted as available.
 */
export const isMaterialAvailable = (status: LoanDecisionStatus): boolean => {
  switch (status) {
    // The material cannot be borrowed now: it can at most be reserved or
    // wished for. Equivalent to Publizon's status 5 (reservation queue).
    case "reservable":
    case "wishable":
    case "unavailable":
      return false
    default:
      return true
  }
}

/**
 * Whether the user can borrow the material right now.
 *
 * Unlike `isMaterialAvailable`, which asks about the material alone,
 * this is the answer the loan button needs - so a status describing the user
 * counts as "no". A spent quota therefore leaves neither this nor
 * `isMaterialReservable` true, which matches Publizon's status 0 ("not
 * loanable, max loans reached"): inherited behaviour, not a Biblio decision.
 */
export const isMaterialLoanable = (status: LoanDecisionStatus): boolean => status === "loanable"

/**
 * Whether the user can join the queue for the material.
 *
 * A wishable material is deliberately excluded: wishing is not reserving, and
 * there is no Publizon equivalent to render it with.
 */
export const isMaterialReservable = (status: LoanDecisionStatus): boolean => status === "reservable"

/**
 * Whether the adapter acted on a loan or reservation request.
 *
 * `POST /v1/loans` and `POST /v1/reservations` answer 200/201 with a decision
 * rather than an HTTP error when they refuse, so the status is the only thing
 * separating "you are queued" from "your quota is spent". Only the two
 * statuses that mean the request could be fulfilled count as granted.
 */
export const isRequestGranted = (status: LoanDecisionStatus): boolean =>
  status === "loanable" || status === "reservable"
