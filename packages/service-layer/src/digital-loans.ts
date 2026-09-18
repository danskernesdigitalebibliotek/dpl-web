import { createBiblioClient } from "../biblio/src"
import { withCatalogueDetails, withCatalogueDetailsForRequest } from "./catalogue"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalLoan, LoanProvider, LoanRequestResult, ServiceLayerConfig } from "./types"

// The endpoint returns active loans only. The cursor is carried through
// untouched: nothing pages through loans yet, but the shape is the adapter's.
export async function getDigitalLoans(
  config: ServiceLayerConfig
): Promise<{ loans: DigitalLoan[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const { loans, nextCursor } = await biblio.getLoans()

  // A material id is the ISBN-13 the provider lends the material under, the
  // same key its metadata route takes.
  const described = await withCatalogueDetails(config, loans, loan => loan.materialId)

  return { loans: described, nextCursor }
}

/**
 * The loan the patron already holds on this material, if any.
 *
 * Deliberately not `getDigitalLoans().find(...)`: the caller is looking at the
 * material and needs the loan's id and its existence, not its description, so
 * the catalogue is not searched. Correcting a title here would put a second,
 * sequential round trip in front of the borrow button on every material page.
 * See ADR-004.
 *
 * Null rather than undefined for "no such loan": react-query rejects a query
 * that resolves to undefined, and this is a query function.
 */
export async function getDigitalMaterialHolding(
  config: ServiceLayerConfig,
  materialId: string
): Promise<DigitalLoan | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const { loans } = await biblio.getLoans()

  return loans.find(loan => loan.materialId === materialId) ?? null
}

// Create a digital loan. The adapter can accept the request without creating a
// loan - an exceeded quota, say - so the result only carries a loan when the
// operation actually succeeded, and callers must check `loan`.
export async function createDigitalLoan(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanRequestResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return withCatalogueDetailsForRequest(config, biblio.createLoan(materialId), materialId)
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
