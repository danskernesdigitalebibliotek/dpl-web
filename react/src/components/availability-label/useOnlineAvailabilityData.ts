import {
  isMaterialAvailable,
  useDigitalLoanDecision
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  useGetV1LoanstatusIdentifier,
  useGetV1ProductsIdentifier
} from "../../core/publizon/publizon";
import { publizonProductStatuses } from "./types";
import { DigitalMaterialId } from "../../core/utils/types/ids";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

/**
 * Availability of an online material: the service layer answers when the
 * library has switched, Publizon when it has not - never both. Falling back
 * to Publizon would offer a loan the library has decided not to make.
 */
const useOnlineAvailabilityData = ({
  enabled,
  identifier
}: {
  enabled: boolean;
  identifier: DigitalMaterialId | null;
}) => {
  const viaBiblioAdapter = useBiblioAdapter();

  // Having the identifier is what makes a provider answerable: an online
  // material outside the e-book service - a PressReader newspaper, whose only
  // identifier is a URI - has none, and asking about it with some other
  // string can only produce a 404 or an answer about the wrong material.
  //
  // can-loan is patron-scoped, so with the flag on and no patron nobody is
  // asked and the default applies.
  const askServiceLayer =
    viaBiblioAdapter && enabled && !!identifier && !isAnonymous();
  const askPublizon = !viaBiblioAdapter && enabled && !!identifier;

  const { data: loanDecision, isLoading: isLoadingServiceLayer } =
    useDigitalLoanDecision(identifier, { enabled: askServiceLayer });

  // Find out if the material is cost free.
  const { isLoading: isLoadingIdentifier, data: dataIdentifier } =
    useGetV1ProductsIdentifier(identifier ?? "", {
      query: { enabled: askPublizon }
    });

  // Publizon / useGetV1LoanstatusIdentifier shows loan status per material.
  // This status is only available for products found on Publizon. Other online
  // materials are always supposed to be shown as "available".
  const { isLoading: isLoadingPublizonData, data: dataPublizon } =
    useGetV1LoanstatusIdentifier(identifier ?? "", {
      query: {
        enabled:
          askPublizon &&
          // A cost-free material - "blue" material - is always available, so
          // its loan status answers a question nobody asked.
          dataIdentifier?.product?.costFree === false
      }
    });

  // If hook is not enabled make it clear that the loading and availability status is unknown.
  if (!enabled) {
    return {
      isLoading: null,
      isAvailable: null
    };
  }

  // Both derivations are gated on who was asked, not just on the query: an
  // answer sitting in the cache from a provider that may no longer answer
  // must be ignored. Within a gate, null means "not answered yet".
  const isAvailableViaServiceLayer =
    askServiceLayer && loanDecision
      ? isMaterialAvailable(loanDecision.status)
      : null;

  const isAvailableViaPublizon =
    askPublizon && dataPublizon?.loanStatus
      ? publizonProductStatuses[dataPublizon.loanStatus].isAvailable
      : null;

  const isAvailable = isAvailableViaServiceLayer ?? isAvailableViaPublizon;

  return {
    // Disabled queries never report loading, so this only counts the
    // questions actually asked.
    isLoading:
      isLoadingServiceLayer || isLoadingIdentifier || isLoadingPublizonData,
    // An online material neither service answers for is always available -
    // cost-free Publizon materials and other online materials alike.
    isAvailable: isAvailable ?? true
  };
};

export default useOnlineAvailabilityData;
