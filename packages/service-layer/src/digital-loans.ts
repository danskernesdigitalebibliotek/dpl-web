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
 * Whether a loan under this licence costs the patron nothing - what lets the
 * UI promise the material is included. Only "selection" qualifies; "free" is
 * deliberately left out until the first title shows up on it - see
 * LoanProvider for what each licence means. Cost-free is not unlimited: a
 * separate concurrent cap still answers "concurrent_limit_exceeded".
 */
export const isCostFreeLoan = (loanProvider: LoanProvider | undefined): boolean =>
  loanProvider === "selection"
