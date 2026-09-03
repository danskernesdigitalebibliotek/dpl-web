import {
  isMaterialAvailable,
  useDigitalLoanDecision
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  useGetV1LoanstatusIdentifier,
  useGetV1ProductsIdentifier
} from "../../core/publizon/publizon";
import { publizonProductStatuses } from "./types";
import { AccessTypes } from "../../core/utils/types/entities";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

/**
 * Availability of an online material: the service layer answers for the
 * materials it provides, Publizon for the rest.
 *
 * With the flag on the service layer is THE lending provider: a material it
 * cannot lend is not available, and Publizon must not stand in - not even for
 * a visitor who is not signed in. Falling back would mean offering a loan the
 * library has decided not to make, and the user would end up borrowing from
 * the service we are migrating away from.
 *
 * can-loan is patron-scoped, so nobody answers for a visitor: the label shows
 * the default for online materials - available - until they sign in.
 */
const useOnlineAvailabilityData = ({
  enabled,
  access,
  isbn
}: {
  enabled: boolean;
  access: AccessTypes[];
  isbn: string | null;
}) => {
  const viaBiblioAdapter = useBiblioAdapter();

  // An online material outside the e-book service - a PressReader newspaper,
  // whose only identifier is a URI - is in neither Publizon nor the service
  // layer, so asking about it can only produce a 404.
  const isEreolMaterial = access.some((acc) => acc === "Ereol");

  // Who answers is decided here, once, by the flag alone: the service layer
  // when the library has switched, Publizon when it has not. Both need an
  // ISBN to do lookups. can-loan is patron-scoped, so with the flag on and
  // no patron nobody is asked and the default applies.
  const askServiceLayer =
    viaBiblioAdapter && enabled && isEreolMaterial && !!isbn && !isAnonymous();
  const askPublizon = !viaBiblioAdapter && enabled && isEreolMaterial && !!isbn;

  const { data: loanDecision, isLoading: isLoadingServiceLayer } =
    useDigitalLoanDecision(isbn, { enabled: askServiceLayer });

  // Find out if the material is cost free.
  const { isLoading: isLoadingIdentifier, data: dataIdentifier } =
    useGetV1ProductsIdentifier(isbn ?? "", {
      query: { enabled: askPublizon }
    });

  // Publizon / useGetV1LoanstatusIdentifier shows loan status per material.
  // This status is only available for products found on Publizon. Other online
  // materials are always supposed to be shown as "available".
  const { isLoading: isLoadingPublizonData, data: dataPublizon } =
    useGetV1LoanstatusIdentifier(isbn || "", {
      query: {
        enabled:
          askPublizon &&
          // If the material is free (I think it is called blue material btw.)
          // we should not load the loan status because then we know that it is available.
          // So If the material is not free and we know it is an "Publizon" material we should load the loan status.
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
  const isAvailableViaServiceLayer = askServiceLayer
    ? // null is the tolerated 404: the service layer is THE lending provider,
      // so a material it does not know cannot be lent - unavailable, no
      // fallback. undefined is simply not answered yet.
      loanDecision === null
      ? false
      : ((loanDecision && isMaterialAvailable(loanDecision.status)) ?? null)
    : null;

  const isAvailableViaPublizon =
    askPublizon && dataPublizon?.loanStatus
      ? publizonProductStatuses[dataPublizon.loanStatus].isAvailable
      : null;

  // The first provider that was asked and has answered wins.
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
