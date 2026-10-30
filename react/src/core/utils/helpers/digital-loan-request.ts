import {
  DigitalLoan,
  LoanRequestResult
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { ReservationInput } from "../../publizon/model";
import { Patron } from "../types/entities";
import { PublizonIdentifier } from "../types/ids";
import { ReaderPlayerState } from "../types/reader-player-state";
import { formatDanishPhoneNumber } from "./general";

/**
 * What the lending provider said about this material. A named subset of what
 * useReaderPlayer answers, so the two cannot drift apart.
 */
export type LoanableMaterial = Pick<
  ReaderPlayerState,
  "canBeLoaned" | "canBeReserved" | "offerId"
> & { identifier: PublizonIdentifier };

/**
 * What pressing the loan or reserve button should do. `open-modal` is the
 * material page's button, which only opens the confirmation modal.
 */
export type LoanReservationRequest =
  | { kind: "open-modal" }
  | { kind: "accept-offer"; offerId: string }
  | { kind: "loan"; identifier: PublizonIdentifier }
  | { kind: "reserve"; identifier: PublizonIdentifier };

/** The whole decision of what a press means, with no side effects. */
export const resolveLoanReservationRequest = ({
  openModal,
  canBeLoaned,
  canBeReserved,
  identifier,
  offerId
}: LoanableMaterial & {
  openModal: boolean;
}): LoanReservationRequest | null => {
  if (openModal) return { kind: "open-modal" };

  if (canBeLoaned) {
    // Only the adapter has offers, and they are claimed rather than borrowed.
    if (offerId) return { kind: "accept-offer", offerId };
    return { kind: "loan", identifier };
  }

  if (canBeReserved) return { kind: "reserve", identifier };

  return null;
};

/** The adapter answers 200 even when it refuses, e.g. on a spent quota. */
export const loanWasCreated = (
  result: LoanRequestResult
): result is LoanRequestResult & { loan: DigitalLoan } => Boolean(result.loan);

/**
 * Who Publizon notifies about the reservation. The adapter needs none of this -
 * it derives the user from the token.
 */
export const publizonReservationContact = (
  patron: Patron
): ReservationInput => {
  const { emailAddress, phoneNumber } = patron;
  return {
    ...(emailAddress && { email: emailAddress }),
    ...(phoneNumber && { phoneNumber: formatDanishPhoneNumber(phoneNumber) })
  };
};
