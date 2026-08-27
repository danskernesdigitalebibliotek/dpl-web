import {
  useGetV1LoanstatusIdentifier,
  useGetV1ProductsIdentifier
} from "../../core/publizon/publizon";
import { publizonProductStatuses } from "./types";
import { AccessTypes } from "../../core/utils/types/entities";
import useDigitalAvailability from "../../core/digital/useDigitalAvailability";

const useOnlineAvailabilityData = ({
  enabled,
  access,
  isbn
}: {
  enabled: boolean;
  access: AccessTypes[];
  isbn: string | null;
}) => {
  // An online material outside the e-book service - a PressReader newspaper,
  // whose only identifier is a URI - is in neither Publizon nor the service
  // layer, so asking about it can only produce a 404.
  const isEreolMaterial = access.some((acc) => acc === "Ereol");

  // Gates on the feature flag itself, so no check is needed here.
  const {
    isAnswering: isServiceLayerAnswering,
    isAvailable: isAvailableViaServiceLayer,
    isLoading: isLoadingServiceLayer
  } = useDigitalAvailability({
    enabled: enabled && isEreolMaterial,
    isbn
  });

  // Publizon answers for everything the service layer does not - and must not
  // answer at all while the service layer is the provider. It requires an
  // ISBN to do lookups.
  const askPublizon =
    enabled && isEreolMaterial && !!isbn && !isServiceLayerAnswering;

  // Find out if the material is cost free.
  const { isLoading: isLoadingIdentifier, data: dataIdentifier } =
    // We never want to pass an empty string to the API
    // So we only enable the query if we have an isbn
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

  // The service layer answers for the materials it provides; Publizon for the
  // rest. Null when neither has answered - because the queries are still
  // loading, or because neither service knows the material.
  // Gated on askPublizon and not just on the query: while the service layer
  // is the provider, a Publizon answer must be ignored even if one is already
  // sitting in the cache.
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
