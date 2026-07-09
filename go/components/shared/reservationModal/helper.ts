import type { FailureReason } from "@danskernesdigitalebibliotek/dpl-service-layer"

const GENERIC_MESSAGE = "Reservationen kunne ikke gennemføres. Prøv igen senere."

// Single source of truth for failure-code → Danish copy. Several FBS codes
// collapse to the same user-facing message because the user can't act on the
// distinction (e.g. material_lost vs material_discarded).
const REASON_COPY: Record<FailureReason, string> = {
  already_reserved: "Du har allerede reserveret denne bog.",
  patron_is_blocked: "Din konto er spærret. Kontakt biblioteket.",
  patron_not_found: "Vi kunne ikke finde din konto.",
  material_not_reservable: "Bogen kan ikke reserveres lige nu.",
  not_reservable: "Bogen kan ikke reserveres lige nu.",
  interlibrary_material_not_reservable: "Bogen kan ikke reserveres lige nu.",
  material_not_loanable: "Bogen kan ikke reserveres lige nu.",
  no_reservable_materials: "Bogen kan ikke reserveres lige nu.",
  already_loaned: "Du har allerede lånt denne bog.",
  previously_loaned_by_homebound_patron: "Du har allerede lånt denne bog.",
  material_lost: "Bogen er ikke længere tilgængelig.",
  material_discarded: "Bogen er ikke længere tilgængelig.",
  material_not_found: "Bogen er ikke længere tilgængelig.",
  exceeds_max_reservations: "Du har nået det maksimale antal reservationer.",
  loaning_profile_not_found: GENERIC_MESSAGE,
  material_part_of_collection: GENERIC_MESSAGE,
  unknown: GENERIC_MESSAGE,
}

export const getReservationFailureMessage = (reason: FailureReason): string =>
  REASON_COPY[reason] ?? GENERIC_MESSAGE
