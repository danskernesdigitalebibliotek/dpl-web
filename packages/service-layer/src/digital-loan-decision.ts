import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { LoanDecision, LoanDecisionStatus, ServiceLayerConfig } from "./types"

// TEMPORARY, with the toleration setting it serves. The adapter answers 404
// for a material it does not know; with the setting on that becomes this
// decision instead, so callers see an ordinary unavailable material and
// nothing downstream has to know about the 404. Without the setting the 404
// stays an error - asking about an unknown material is normally a routing
// mistake worth hearing about.
const UNKNOWN_MATERIAL_REASON = "unknown_material"

const unknownMaterialDecision: LoanDecision = {
  status: "unavailable",
  unavailableReason: UNKNOWN_MATERIAL_REASON,
}

// Whether the user can borrow a material right now. The answer covers both the
// material (is it available?) and the user (quota, lending blocks), so callers
// must pick the part they care about - see isMaterialAvailable.
export async function getDigitalLoanDecision(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanDecision> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const decision = await biblio.getLoanDecision(materialId, {
    allowNotFound: config.tolerateUnknownMaterials?.() ?? false,
  })
  return decision ?? unknownMaterialDecision
}

/**
 * Whether the decision stands in for a material the adapter does not know.
 *
 * Such a material is unavailable like any other, but it also has no sample:
 * offering one would open an empty reader or player. TEMPORARY with the
 * toleration setting - once every catalogue material exists in the adapter,
 * this is always false.
 */
export const isUnknownMaterial = (decision: LoanDecision | undefined): boolean =>
  decision?.unavailableReason === UNKNOWN_MATERIAL_REASON

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
    // Equivalent to Publizon's status 5 (reservation queue).
    case "reservable":
    case "wishable":
    case "unavailable":
      return false
    default:
      return true
  }
}

/**
 * Whether the user can borrow the material right now - the loan button's
 * answer, so a spent quota counts as "no", as with Publizon's status 0.
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
