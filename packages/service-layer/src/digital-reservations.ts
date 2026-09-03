import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalReservation, LoanRequestResult, ServiceLayerConfig } from "./types"

// The endpoint returns active reservations only.
export async function getDigitalReservations(
  config: ServiceLayerConfig
): Promise<{ reservations: DigitalReservation[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getReservations()
}

// Reserve a material. Answers with the same envelope as a loan request: a
// decision status, and a loan when the material turned out to be available.
export async function createDigitalReservation(
  config: ServiceLayerConfig,
  materialId: string
): Promise<LoanRequestResult> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createReservation(materialId)
}

// Accept a reservation offer as a loan - the Biblio equivalent of redeeming a
// Publizon reservation. Publizon has no explicit redeem step, so a material
// the user holds an offer for must be accepted here rather than borrowed.
export async function acceptDigitalOffer(
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
export async function deleteDigitalReservation(
  config: ServiceLayerConfig,
  reservationId: string
): Promise<void> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  const success = await biblio.deleteReservation(reservationId)
  if (!success) {
    throw new Error(`Biblio declined to cancel reservation ${reservationId}`)
  }
}
