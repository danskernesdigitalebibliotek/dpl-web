import { UseQueryOptions } from "react-query";
import { useGetAvailability as useGetAvailabilityHook } from "../fbs/hooks";
import { Availability } from "@dpl/fbs";
import { UseConfigFunction } from "./config";
import { FaustId } from "./types/ids";
import { getBlacklistedQueryArgs } from "../../apps/material/helper";

const useGetAvailability = ({
  faustIds,
  config,
  options
}: {
  faustIds: FaustId[];
  config: UseConfigFunction;
  options?: {
    query?: UseQueryOptions<Availability[]>;
  };
}) => {
  const response = useGetAvailabilityHook(
    getBlacklistedQueryArgs(faustIds, config, "availability"),
    options
  );
  return response;
};

export default useGetAvailability;
