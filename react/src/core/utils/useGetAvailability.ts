import { useAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer";
import { branchesFromConfig } from "../../apps/material/helper";
import { UseConfigFunction } from "./config";
import { FaustId } from "./types/ids";

// Thin wrapper around the service-layer's useAvailability so existing /react
// callers keep their { faustIds, config, options } shape. The returned data
// is the service-layer Availability[] domain DTO (faustId / isAvailable /
// isReservable / reservationCount) rather than the raw AvailabilityV3 shape.
const useGetAvailability = ({
  faustIds,
  config,
  options
}: {
  faustIds: FaustId[];
  config: UseConfigFunction;
  options?: {
    query?: { enabled?: boolean };
  };
}) => {
  const excludeBranches = branchesFromConfig("availability", config);
  return useAvailability(
    { faustIds, excludeBranches },
    { enabled: options?.query?.enabled }
  );
};

export default useGetAvailability;
