import type { RenewalFailureReason } from "@danskernesdigitalebibliotek/dpl-service-layer"

const GENERIC_MESSAGE = "Lånet kunne ikke fornys. Prøv igen senere."

// Single source of truth for FBS renewal-denial → Danish copy. Codes the user
// can't act on collapse to the generic message, mirroring the reservation flow.
const REASON_COPY: Record<RenewalFailureReason, string> = {
  deniedReserved: "Bogen er reserveret af en anden låner, så lånet kan ikke fornys.",
  deniedMaxRenewalsReached: "Lånet kan ikke fornys flere gange.",
  deniedLoanerIsBlocked: "Din konto er spærret. Kontakt biblioteket.",
  deniedMaterialIsNotLoanable: "Bogen kan ikke fornys lige nu.",
  deniedMaterialIsNotFound: "Bogen er ikke længere tilgængelig.",
  deniedLoanerNotFound: "Vi kunne ikke finde din konto.",
  deniedLoaningProfileNotFound: GENERIC_MESSAGE,
  deniedOtherReason: GENERIC_MESSAGE,
}

export const getRenewalFailureMessage = (reason: RenewalFailureReason): string =>
  REASON_COPY[reason] ?? GENERIC_MESSAGE
