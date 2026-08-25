import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type {
  BiblioCanLoan,
  BiblioCanLoanStatus,
  BiblioLoan,
  BiblioLoanQuota,
  BiblioLoanResult,
  BiblioMaterial,
  BiblioReservation,
  ServiceLayerConfig,
} from "./types"

// The endpoint returns active loans only. The cursor is carried through
// untouched: nothing pages through loans yet, but the shape is the adapter's.
export async function getBiblioLoans(
  config: ServiceLayerConfig
): Promise<{ loans: BiblioLoan[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoans()
}

// Catalogue fields for a material by its ISBN-13. Returns null when the
// material is unknown to Biblio - null rather than undefined, because
// TanStack Query rejects undefined as query data, which would turn "not
// found" into a failed query.
export async function getBiblioMaterial(
  config: ServiceLayerConfig,
  isbn: string
): Promise<BiblioMaterial | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return (await biblio.getMetadata(isbn)) ?? null
}

// Whether the user can borrow a material right now. The answer covers both the
// material (is it available?) and the user (quota, lending blocks), so callers
// must pick the part they care about - see isBiblioMaterialAvailable.
export async function getBiblioCanLoan(
  config: ServiceLayerConfig,
  materialId: string
): Promise<BiblioCanLoan> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.canLoan(materialId)
}

/**
 * Whether the MATERIAL itself can be borrowed right now.
 *
 * Statuses that describe the user rather than the material - an exhausted
 * quota, blocked lending, missing credentials - leave the material itself
 * available. This mirrors Publizon, where status 0 ("not loanable, max loans
 * reached") is also counted as available.
 */
export const isBiblioMaterialAvailable = (status: BiblioCanLoanStatus): boolean => {
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

// The endpoint returns active reservations only.
export async function getBiblioReservations(
  config: ServiceLayerConfig
): Promise<{ reservations: BiblioReservation[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getReservations()
}

// One quota per organization. A patron belongs to a single library in
// practice - see getBiblioLoanQuota for how a format's numbers are read out.
export async function getBiblioLoanQuotas(config: ServiceLayerConfig): Promise<BiblioLoanQuota[]> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoanQuotas()
}

// The id a patron gives the library when asking for help with a digital loan.
export async function getBiblioSupportId(config: ServiceLayerConfig): Promise<string> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getSupportId()
}

// Create a digital loan. The adapter can accept the request without creating a
// loan - an exceeded quota, say - so the result only carries a loan when the
// operation actually succeeded, and callers must check `loan`.
export async function createBiblioLoan(
  config: ServiceLayerConfig,
  materialId: string
): Promise<BiblioLoanResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createLoan(materialId)
}

// Reserve a material. Answers with the same envelope as a loan request: a
// decision status, and a loan when the material turned out to be available.
export async function createBiblioReservation(
  config: ServiceLayerConfig,
  materialId: string
): Promise<BiblioLoanResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createReservation(materialId)
}

// Accept a reservation offer as a loan - the Biblio equivalent of redeeming a
// Publizon reservation. Publizon has no explicit redeem step, so a material
// the user holds an offer for must be accepted here rather than borrowed.
export async function acceptBiblioReservationOffer(
  config: ServiceLayerConfig,
  offerId: string
): Promise<{ success: boolean; loanId?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.acceptReservationOffer(offerId)
}

/**
 * Cancel a reservation, by its own id - Publizon cancels by material
 * identifier, Biblio by the reservation.
 *
 * The adapter answers 200 with `{ success: false }` when it accepted the
 * request but removed nothing: an already consumed or expired reservation.
 * That is a failed cancellation to the user, so it is turned into a rejection
 * here - callers report their outcome from the promise, and a resolved one
 * would read as "reservation deleted" while it is still in the list.
 */
export async function deleteBiblioReservation(
  config: ServiceLayerConfig,
  reservationId: string
): Promise<boolean> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const success = await biblio.deleteReservation(reservationId)
  if (!success) {
    throw new Error(`Biblio declined to cancel reservation ${reservationId}`)
  }
  return success
}

/**
 * Whether the user can borrow the material right now.
 *
 * Unlike `isBiblioMaterialAvailable`, which asks about the material alone,
 * this is the answer the loan button needs - so a status describing the user
 * counts as "no". A spent quota therefore leaves neither this nor
 * `isBiblioMaterialReservable` true, which matches Publizon's status 0 ("not
 * loanable, max loans reached"): inherited behaviour, not a Biblio decision.
 */
export const isBiblioMaterialLoanable = (status: BiblioCanLoanStatus): boolean =>
  status === "loanable"

/**
 * Whether the user can join the queue for the material.
 *
 * A wishable material is deliberately excluded: wishing is not reserving, and
 * there is no Publizon equivalent to render it with.
 */
export const isBiblioMaterialReservable = (status: BiblioCanLoanStatus): boolean =>
  status === "reservable"

/**
 * Whether the adapter acted on a loan or reservation request.
 *
 * `POST /v1/loans` and `POST /v1/reservations` answer 200/201 with a decision
 * rather than an HTTP error when they refuse, so the status is the only thing
 * separating "you are queued" from "your quota is spent". Only the two
 * statuses that mean the request could be fulfilled count as granted.
 */
export const isBiblioRequestGranted = (status: BiblioCanLoanStatus): boolean =>
  status === "loanable" || status === "reservable"

export type BiblioQuota = {
  current: number
  limit: number | undefined
}

/**
 * The user's loan quota for a format.
 *
 * Biblio counts loans two ways and the consumers need different ones: the
 * availability texts talk about loans "this month", while the profile page
 * shows how many loans the user holds right now. Organizations either count
 * e-books and audiobooks together or split them per format.
 *
 * The adapter returns one quota per organization. A patron belongs to a
 * single library in practice, so the first one is used - if a patron can ever
 * belong to several, this needs a rule from DBC.
 *
 * Cost-free ("blue") loans draw on no quota, and the adapter's counters
 * already exclude them at the source - verified against the real adapter by
 * borrowing a blue (selection-licence) title and watching the counters stand
 * still, then a click-licence title and watching them move. So unlike the
 * Publizon path, which subtracts its subscription loans itself, the numbers
 * are used as they arrive.
 */
export const getBiblioLoanQuota = ({
  quotas,
  format,
  period = "monthly",
}: {
  quotas: BiblioLoanQuota[] | undefined
  format: "ebook" | "audiobook"
  period?: "monthly" | "concurrent"
}): BiblioQuota => {
  const quota = quotas?.[0]

  if (!quota) {
    return { current: 0, limit: undefined }
  }

  if (quota.splitOnFormat) {
    return period === "concurrent"
      ? {
          current: quota.currentConcurrentLoans[format],
          limit: quota.maxConcurrentLoans[format],
        }
      : {
          current: quota.currentMonthlyLoans[format],
          limit: quota.maxLoans[format],
        }
  }

  return period === "concurrent"
    ? {
        current: quota.currentConcurrentLoans,
        limit: quota.maxConcurrentLoans,
      }
    : {
        current: quota.currentMonthlyLoans,
        limit: quota.maxLoans,
      }
}
