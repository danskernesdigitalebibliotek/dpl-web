import { Manifestation } from "./types/entities";
import { getManifestationDigitalIdentifier } from "../../apps/material/helper";
import { getReaderPlayerType } from "../../components/reader-player/helper";
import useServiceLayerLending from "./useServiceLayerLending";
import { DigitalProvider } from "./types/digital-provider";
import useDigitalReaderPlayerState from "./useDigitalReaderPlayerState";
import usePublizonReaderPlayerState from "./usePublizonReaderPlayerState";

/**
 * Everything the material page needs to offer one digital material: whether
 * the user already has it, whether they can get it, and the key that opens it.
 *
 * The hook derives what belongs to the material - its type and its identifier -
 * and asks the providers for the rest. Two different questions are asked, and
 * they do NOT have the same answer during the transition:
 *
 * - **Acquiring** a material follows the library's choice of provider. With the
 *   adapter enabled it is the only one asked, and there is no falling back: a
 *   material it cannot lend simply is not offered. Quietly borrowing it from
 *   Publizon instead would keep pulling new loans into the service we are
 *   migrating away from, which is worse than the loan not happening.
 * - **Reading** a material the user already holds follows whoever holds it. A
 *   loan made under Publizon before the switch keeps its old reader and player,
 *   because that is where the loan lives.
 *
 * ## When Publizon goes away
 *
 * Delete `usePublizonReaderPlayerState` and return the service layer state
 * directly.
 * No component changes, because they all consume `ReaderPlayerState` and never
 * learn which provider produced it.
 */
const useReaderPlayer = (manifestation: Manifestation | null) => {
  const viaServiceLayer = useServiceLayerLending();

  const type = getReaderPlayerType(manifestation);
  const identifier = manifestation
    ? getManifestationDigitalIdentifier(manifestation)
    : null;

  const serviceLayer = useDigitalReaderPlayerState({
    identifier,
    enabled: viaServiceLayer
  });

  const publizon = usePublizonReaderPlayerState({
    identifier,
    // Publizon is always asked what the user already holds, but it may only
    // decide on a new loan while it is still the lending provider.
    canAcquire: !viaServiceLayer
  });

  const acquisition = viaServiceLayer ? serviceLayer : publizon;

  // A material is held by one provider or the other, never both: whoever has
  // the loan or the reservation answers for it.
  const heldByServiceLayer =
    serviceLayer.isAlreadyLoaned || serviceLayer.isAlreadyReserved;
  const heldByPublizon = publizon.isAlreadyLoaned || publizon.isAlreadyReserved;
  const holding = heldByServiceLayer ? serviceLayer : publizon;
  // Which reader or player opens what the user holds - the same fact a loan
  // carries as LoanType.digitalProvider. Called "holding" here because this
  // hook also answers who may LEND the material, and on a switched library
  // those are different providers.
  //
  // Derived here rather than reported by each provider: it is a fact about the
  // composition, and asking both to state their own identity duplicated the
  // predicate above.
  const holdingProvider: DigitalProvider | null = heldByServiceLayer
    ? "serviceLayer"
    : heldByPublizon
      ? "publizon"
      : null;

  return {
    type,
    identifier,
    canBeLoaned: acquisition.canBeLoaned,
    canBeReserved: acquisition.canBeReserved,
    // The offer belongs with acquiring: claiming it is how the user gets the
    // material, and only the lending provider hands one out.
    offerId: acquisition.offerId,
    isAlreadyLoaned: holding.isAlreadyLoaned,
    isAlreadyReserved: holding.isAlreadyReserved,
    orderId: holding.orderId,
    holdingProvider,
    reservation: holding.reservation
  };
};

export default useReaderPlayer;
