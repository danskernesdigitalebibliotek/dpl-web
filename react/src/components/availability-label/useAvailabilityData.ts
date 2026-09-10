import { AccessTypeCodeEnum } from "../../core/dbc-gateway/generated/graphql";
import { DigitalMaterialId, FaustId } from "../../core/utils/types/ids";
import { isOnline } from "./helper";
import useOnlineAvailabilityData from "./useOnlineAvailabilityData";
import usePhysicalAvailabilityData from "./usePhysicalAvailabilityData";

const useAvailabilityData = ({
  accessTypes,
  faustIds,
  manifestText,
  identifier,
  enabled = true
}: {
  accessTypes: AccessTypeCodeEnum[];
  faustIds: FaustId[];
  manifestText: string;
  identifier: DigitalMaterialId | null;
  enabled?: boolean;
}) => {
  const availabilityOnline = useOnlineAvailabilityData({
    enabled: isOnline(accessTypes) && enabled,
    identifier
  });

  const availabilityPhysical = usePhysicalAvailabilityData({
    enabled: !isOnline(accessTypes) && enabled,
    faustIds,
    manifestText
  });

  if (isOnline(accessTypes)) {
    return availabilityOnline;
  }

  return availabilityPhysical;
};

export default useAvailabilityData;
