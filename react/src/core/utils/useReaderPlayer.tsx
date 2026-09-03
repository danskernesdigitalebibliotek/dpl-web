import { Manifestation } from "./types/entities";
import { getManifestationDigitalIdentifier } from "../../apps/material/helper";
import { getReaderPlayerType } from "../../components/reader-player/helper";
import useBiblioAdapter from "./useBiblioAdapter";
import useBiblioReaderPlayerState from "./useBiblioReaderPlayerState";
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
 * Delete `usePublizonReaderPlayerState` and return the Biblio state directly.
 * No component changes, because they all consume `ReaderPlayerState` and never
 * learn which provider produced it.
 */
const useReaderPlayer = (manifestation: Manifestation | null) => {
  const useBiblio = useBiblioAdapter();

  const type = getReaderPlayerType(manifestation);
  const identifier = manifestation
    ? getManifestationDigitalIdentifier(manifestation)
    : null;

  const biblio = useBiblioReaderPlayerState({
    identifier,
    enabled: useBiblio
  });

  const publizon = usePublizonReaderPlayerState({
    identifier,
    // Publizon is always asked what the user already holds, but it may only
    // decide on a new loan while it is still the lending provider.
    canAcquire: !useBiblio
  });

  const acquisition = useBiblio ? biblio : publizon;

  // A material is held by one provider or the other, never both: whoever has
  // the loan or the reservation answers for it.
  const holding =
    biblio.isAlreadyLoaned || biblio.isAlreadyReserved ? biblio : publizon;

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
    reservation: holding.reservation
  };
};

export default useReaderPlayer;
