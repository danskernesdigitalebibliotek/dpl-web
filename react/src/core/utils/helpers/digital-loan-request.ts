import {
  DigitalLoan,
  LoanRequestResult
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { ReservationInput } from "../../publizon/model";
import { Patron } from "../types/entities";
import { ReaderPlayerState } from "../types/reader-player-state";
import { formatDanishPhoneNumber } from "./general";

/**
 * What the lending provider said about this material. A named subset of what
 * useReaderPlayer answers, so the two cannot drift apart.
 */
export type LoanableMaterial = Pick<
  ReaderPlayerState,
  "canBeLoaned" | "canBeReserved" | "offerId"
> & { identifier: string | null };

/**
 * What pressing the loan or reserve button should do. `open-modal` is the
 * button that only opens the confirmation modal rather than acting - the
 * material page's button, as opposed to the one inside the modal.
 */
export type LoanReservationRequest =
  | { kind: "open-modal" }
  | { kind: "accept-offer"; offerId: string }
  | { kind: "loan"; materialId: string }
  | { kind: "reserve"; materialId: string };

/**
 * The whole decision of what a press means, in one place and without touching
 * anything.
 */
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
  if (!identifier) return null;

  if (canBeLoaned) {
    // An offer is the adapter's alone - Publizon always reports null - and it
    // has to be claimed rather than the material borrowed anew.
    if (offerId) return { kind: "accept-offer", offerId };
    return { kind: "loan", materialId: identifier };
  }

  if (canBeReserved) return { kind: "reserve", materialId: identifier };

  return null;
};

/**
 * The adapter answers 200 whether or not it acted - a spent quota, say - so
 * what came back decides, not the status code.
 */
export const loanWasCreated = (
  result: LoanRequestResult
): result is LoanRequestResult & { loan: DigitalLoan } => Boolean(result.loan);

/**
 * Who Publizon should notify about the reservation. The adapter needs none of
 * this - it derives the user from the token.
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
