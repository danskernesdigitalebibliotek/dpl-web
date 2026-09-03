import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalLoan, LoanProvider, LoanRequestResult, ServiceLayerConfig } from "./types"

// The endpoint returns active loans only. The cursor is carried through
// untouched: nothing pages through loans yet, but the shape is the adapter's.
export async function getDigitalLoans(
  config: ServiceLayerConfig
): Promise<{ loans: DigitalLoan[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoans()
}

// Create a digital loan. The adapter can accept the request without creating a
// loan - an exceeded quota, say - so the result only carries a loan when the
// operation actually succeeded, and callers must check `loan`.
export async function createDigitalLoan(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanRequestResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createLoan(materialId)
}

/**
 * Whether a loan under this licence costs the patron nothing - which is what
 * lets the UI promise that the material is included.
 *
 * Only "selection", the licence Danish blue titles answer with: WeDoBooks
 * states those are bought out AND exempt from the quotas.
 *
 * "free" is deliberately not included. It is not in use yet, and what
 * WeDoBooks has confirmed about it is only that titles arriving on it will be
 * exempt from every quota - drawing on no quota is not the same as being free
 * to the patron, and only the latter is worth promising. Revisit when the
 * first title shows up on it.
 *
 * The field is optional by contract: absent means no provider could be picked
 * at all, which promises the patron nothing.
 *
 * Note that cost-free is not the same as unlimited. There is a separate cap
 * on how many cost-free loans a patron may hold at once, and reaching it
 * answers "concurrent_limit_exceeded" like any other ceiling.
 */
export const isCostFreeLoan = (loanProvider: LoanProvider | undefined): boolean =>
  loanProvider === "selection"
