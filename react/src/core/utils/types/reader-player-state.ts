import { ReservationType } from "./reservation-type";

/**
 * What a provider has to say about one digital material for the material page
 * to offer it - the seam of the Publizon → service layer transition. Produced
 * by `usePublizonReaderPlayerState` and `useDigitalReaderPlayerState`, composed
 * by `useReaderPlayer`, which answers *acquiring* from the library's provider
 * and *holding* from whoever holds the item. Provider-neutral so the Publizon
 * producer can be deleted without touching a component; anything
 * provider-specific belongs behind this type, not in it.
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
   * TEMPORARY, acquiring: the provider would have taken a reservation for
   * this material, but reservations are closed right now. `canBeReserved` is
   * false whenever this is true - the two together are what lets the page say
   * why it refuses rather than looking broken.
   *
   * Only Publizon reports it, and only while its queue is frozen for
   * migration. Delete this field once the freeze is lifted - see
   * `usePublizonReservationsClosed`.
   */
  reservationsClosed: boolean;
  /**
   * Holding: the key that opens the loan in the reader/player. Publizon calls
   * it an order id, the service layer a loan id; both serve the same purpose.
   */
  orderId: string | null;
  /** Holding: the reservation the user can cancel, when there is one. */
  reservation: ReservationType | null;
  /**
   * Acquiring: the id of a pending grant the user has to claim before the
   * material becomes a loan. Publizon has no such step and always reports null.
   */
  offerId: string | null;
  /**
   * Acquiring: whether the provider can offer a sample of the material at
   * all. Not an availability question - a reserved-out material still has its
   * sample - but a material the lending provider does not know has no sample
   * to play, and offering one would open an empty reader or player.
   */
  canBeSampled: boolean;
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
  reservationsClosed: false,
  orderId: null,
  reservation: null,
  offerId: null,
  canBeSampled: false,
  isLoading: false
};

export default {};
