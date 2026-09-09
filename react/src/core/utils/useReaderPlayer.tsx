import { Manifestation } from "./types/entities";
import { getManifestationDigitalIdentifier } from "../../apps/material/helper";
import { getReaderPlayerType } from "../../components/reader-player/helper";
import useBiblioAdapter from "./useBiblioAdapter";
import { DigitalProvider } from "./types/digital-provider";
import useDigitalReaderPlayerState from "./useDigitalReaderPlayerState";
import usePublizonReaderPlayerState from "./usePublizonReaderPlayerState";

/**
 * Everything the material page needs to offer one digital material. Two
 * questions with different answers during the transition:
 *
 * - **Acquiring** follows the library's chosen provider, with no falling back:
 *   a material the adapter cannot lend is not offered, because borrowing it
 *   from Publizon would keep pulling new loans into the service being left.
 * - **Holding** follows whoever holds it: a Publizon loan from before the
 *   switch keeps its old reader and player.
 *
 * When Publizon goes away, delete `usePublizonReaderPlayerState` and return
 * the service layer state directly.
 */
const useReaderPlayer = (manifestation: Manifestation | null) => {
  const viaBiblioAdapter = useBiblioAdapter();

  const type = getReaderPlayerType(manifestation);
  const identifier = manifestation
    ? getManifestationDigitalIdentifier(manifestation)
    : null;

  const serviceLayer = useDigitalReaderPlayerState({
    identifier,
    enabled: viaBiblioAdapter
  });

  const publizon = usePublizonReaderPlayerState({
    identifier,
    // Publizon is always asked what the user already holds, but it may only
    // decide on a new loan while it is still the lending provider.
    canAcquire: !viaBiblioAdapter
  });

  const acquisition = viaBiblioAdapter ? serviceLayer : publizon;

  // A material is held by one provider or the other, never both: whoever has
  // the loan or the reservation answers for it.
  const heldByServiceLayer =
    serviceLayer.isAlreadyLoaned || serviceLayer.isAlreadyReserved;
  const heldByPublizon = publizon.isAlreadyLoaned || publizon.isAlreadyReserved;
  const holding = heldByServiceLayer ? serviceLayer : publizon;
  // Which reader or player opens what the user holds - the same fact a loan
  // carries as LoanType.digitalProvider. "Holding" because this hook also
  // answers who may LEND, and on a switched library those differ.
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
    // Samples follow the lending provider too: they play through its reader
    // and player, so only its own answer can promise one.
    canBeSampled: acquisition.canBeSampled,
    isAlreadyLoaned: holding.isAlreadyLoaned,
    isAlreadyReserved: holding.isAlreadyReserved,
    orderId: holding.orderId,
    holdingProvider,
    reservation: holding.reservation,
    // Loading while any provider that was actually asked has not answered -
    // a disabled provider reports false, so this settles as soon as the
    // relevant answers are in.
    isLoading: serviceLayer.isLoading || publizon.isLoading
  };
};

export default useReaderPlayer;
