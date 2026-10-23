import { useMemo } from "react";
import { filterManifestationsByType } from "../../apps/material/helper";
import { convertPostIdToFaustId, getAllFaustIds } from "./helpers/general";
import { Manifestation } from "./types/entities";
import { useConfig } from "./config";
import useGetAvailability from "./useGetAvailability";

/**
 * Splits manifestations into those FBS will let the user reserve and those it
 * will not. Both lists are null until availability has loaded.
 */
const UseReservableManifestations = ({
  manifestations,
  type
}: {
  manifestations: Manifestation[];
  type?: string;
}) => {
  const config = useConfig();
  const { data: availability, isLoading } = useGetAvailability({
    faustIds: getAllFaustIds(manifestations),
    config,
    options: { query: { enabled: manifestations.length > 0 } }
  });

  const { reservableManifestations, unReservableManifestations } =
    useMemo(() => {
      if (!availability) {
        return {
          reservableManifestations: null,
          unReservableManifestations: null
        };
      }

      const filterableManifestations = type
        ? filterManifestationsByType(type, manifestations)
        : manifestations;
      const hasAvailability = (
        manifestation: Manifestation,
        reservable: boolean
      ) =>
        availability.some(
          (item) =>
            item.reservable === reservable &&
            item.recordId === convertPostIdToFaustId(manifestation.pid)
        );

      return {
        reservableManifestations: filterableManifestations.filter(
          (manifestation) => hasAvailability(manifestation, true)
        ),
        unReservableManifestations: filterableManifestations.filter(
          (manifestation) => hasAvailability(manifestation, false)
        )
      };
    }, [availability, manifestations, type]);

  return {
    reservableManifestations,
    unReservableManifestations,
    isLoading
  };
};

export default UseReservableManifestations;
