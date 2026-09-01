import type { RenewalFailureReason } from "@danskernesdigitalebibliotek/dpl-service-layer"

const GENERIC_MESSAGE = "Lånet kunne ikke forlænges. Kontakt dit bibliotek eller prøv igen senere."

// Single source of truth for FBS renewal-denial → Danish copy. Codes the user
// can't act on collapse to the generic message, mirroring the reservation flow.
const REASON_COPY: Record<RenewalFailureReason, string> = {
  deniedReserved: "Bogen er reserveret af en anden låner, lånet kan ikke forlænges",
  deniedMaxRenewalsReached: "Lånet kan ikke forlænges flere gange",
  deniedLoanerIsBlocked: "Din konto er spærret. Kontakt biblioteket",
  deniedMaterialIsNotLoanable: "Bogen kan ikke forlænges lige nu",
  deniedMaterialIsNotFound: "Bogen er ikke længere tilgængelig",
  deniedLoanerNotFound: "Vi kunne ikke finde din konto",
  deniedLoaningProfileNotFound: GENERIC_MESSAGE,
  deniedOtherReason: GENERIC_MESSAGE,
}

export const getRenewalFailureMessage = (reason: RenewalFailureReason): string =>
  REASON_COPY[reason] ?? GENERIC_MESSAGE

// True when the reason has copy that actually explains the denial. FBS also
// sends the generic code for loans merely outside the renewal window.
export const hasSpecificRenewalFailureMessage = (reason: RenewalFailureReason): boolean =>
  REASON_COPY[reason] !== undefined && REASON_COPY[reason] !== GENERIC_MESSAGE
