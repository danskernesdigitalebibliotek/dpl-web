import { createBiblioClient } from "../biblio/src"
import { isCostFreeLoan } from "./digital-loans"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type {
  LoanDecision,
  LoanDecisionResult,
  LoanDecisionStatus,
  ServiceLayerConfig,
} from "./types"

export const cannotBeBorrowed: LoanDecisionResult = {
  type: "failure",
  error: "cannot-be-borrowed",
}

// Whether the user can borrow a material right now. The answer covers both the
// material (is it available?) and the user (quota, lending blocks), so callers
// must pick the part they care about - see isMaterialAvailable. A material
// the adapter does not know cannot be borrowed through Biblio at all.
export async function getDigitalLoanDecision(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanDecisionResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const loanDecision = await biblio.getLoanDecision(materialId)
  return loanDecision ? { type: "success", loanDecision } : cannotBeBorrowed
}

// The predicates below take the result as useDigitalLoanDecision hands it out.
// An unanswered or failed one never promises anything.
const decisionOf = (result: LoanDecisionResult | undefined): LoanDecision | undefined =>
  result?.type === "success" ? result.loanDecision : undefined

/**
 * Whether the MATERIAL itself can be borrowed right now.
 *
 * Statuses that describe the user rather than the material - an exhausted
 * quota, blocked lending, missing credentials - leave the material itself
 * available. This mirrors Publizon, where status 0 ("not loanable, max loans
 * reached") is also counted as available.
 */
export const isMaterialAvailable = (result: LoanDecisionResult | undefined): boolean => {
  switch (decisionOf(result)?.status) {
    case "loanable":
    case "monthly_limit_exceeded":
    case "concurrent_limit_exceeded":
    case "no_valid_credentials":
    case "lending_blocked":
      return true
    // "reservable" is equivalent to Publizon's status 5 (reservation queue).
    // A status this package does not know is not promised as available.
    default:
      return false
  }
}

/**
 * Whether the user can borrow the material right now - the loan button's
 * answer, so a spent quota counts as "no", as with Publizon's status 0.
 */
export const isMaterialLoanable = (result: LoanDecisionResult | undefined): boolean =>
  decisionOf(result)?.status === "loanable"

/**
 * Whether the user can join the queue for the material.
 *
 * A wishable material is deliberately excluded: wishing is not reserving, and
 * there is no Publizon equivalent to render it with.
 */
export const isMaterialReservable = (result: LoanDecisionResult | undefined): boolean =>
  decisionOf(result)?.status === "reservable"

/**
 * Whether a loan of the material costs the user nothing, judged by the licence
 * the adapter picked - see isCostFreeLoan.
 */
export const isMaterialCostFree = (result: LoanDecisionResult | undefined): boolean =>
  isCostFreeLoan(decisionOf(result)?.loanProvider)

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
