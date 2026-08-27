import { ReservationType } from "./reservation-type";

/**
 * What a provider has to be able to say about one digital material for the
 * material page to offer it.
 *
 * This is the seam of the Publizon → service layer transition. Two hooks
 * produce it -
 * `usePublizonReaderPlayerState` and `useDigitalReaderPlayerState` - and
 * `useReaderPlayer` composes the result. Keeping the shape provider-neutral is
 * what lets the Publizon side be deleted without touching a single component:
 * when it goes, one producer is removed and the composition collapses into the
 * remaining hook.
 *
 * Note that `useReaderPlayer` does not take one provider's answer wholesale.
 * The fields fall into two groups that get their answer from different places
 * during the transition: what the user can *acquire* comes from the library's
 * chosen provider only, while what the user already *holds* comes from
 * whichever provider holds it. See `useReaderPlayer` for why.
 *
 * Anything provider-specific therefore belongs behind this type, not in it.
 */
export type ReaderPlayerState = {
  /** Holding: the user already has this material as a loan. */
  isAlreadyLoaned: boolean;
  /** Holding: the user is queued for this material and can only cancel. */
  isAlreadyReserved: boolean;
  /**
   * Acquiring: the user can get the material right now. Covers being handed an
   * existing reservation as well as a fresh loan - the provider decides what
   * that takes.
   */
  canBeLoaned: boolean;
  /**
   * Acquiring: the material is not available now but the user can join the
   * queue.
   */
  canBeReserved: boolean;
  /**
   * Holding: the key that opens the loan in the reader/player. Publizon calls
   * it an order id, the service layer a loan id; both serve the same purpose.
   */
  orderId: string | null;
  /** Holding: the reservation the user can cancel, when there is one. */
  reservation: ReservationType | null;
  /**
   * Acquiring: the id of a pending grant the user has to claim before the
   * material becomes a loan, or null when the provider has no such step.
   *
   * Publizon has none - a redeemable reservation simply shows the loan button
   * - so it always reports null. The service layer makes the acceptance
   * explicit, and
   * this is what identifies the offer to accept.
   */
  offerId: string | null;
  /**
   * True while an enabled provider is still fetching the answers above. A
   * provider that is not asked reports false: not knowing is not the same as
   * loading, and a disabled provider will never answer.
   */
  isLoading: boolean;
};

/**
 * The state before any provider has answered.
 *
 * Every flag is false on purpose: guessing would either offer a material the
 * user cannot get or hide one they can. The material page renders its loading
 * button in this state.
 */
export const unknownReaderPlayerState: ReaderPlayerState = {
  isAlreadyLoaned: false,
  isAlreadyReserved: false,
  canBeLoaned: false,
  canBeReserved: false,
  orderId: null,
  reservation: null,
  offerId: null,
  isLoading: false
};

export default {};
