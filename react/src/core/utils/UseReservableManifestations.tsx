import { filterManifestationsByType } from "../../apps/material/helper";
import { convertPostIdToFaustId, getAllFaustIds } from "./helpers/general";
import { Manifestation } from "./types/entities";
import useGetAvailability from "./useGetAvailability";
import { useConfig } from "./config";

const UseReservableManifestations = ({
  manifestations,
  type
}: {
  manifestations: Manifestation[];
  type?: string;
}) => {
  const config = useConfig();
  const faustIds = getAllFaustIds(manifestations);
  const { data } = useGetAvailability({ faustIds, config });

  if (!data) {
    return {
      reservableManifestations: null,
      unReservableManifestations: null
    };
  }

  // If type is set, filter the manifestations by the type.
  // Otherwise leave as is.
  const filterableManifestations = type
    ? filterManifestationsByType(type, manifestations)
    : manifestations;

  const reservableManifestations = filterableManifestations.filter(
    (manifestation) =>
      data.some(
        (item) =>
          item.isReservable &&
          item.faustId === convertPostIdToFaustId(manifestation.pid)
      )
  );

  const unReservableManifestations = filterableManifestations.filter(
    (manifestation) =>
      data.some(
        (item) =>
          !item.isReservable &&
          item.faustId === convertPostIdToFaustId(manifestation.pid)
      )
  );

  return {
    reservableManifestations,
    unReservableManifestations
  };
};

export default UseReservableManifestations;
