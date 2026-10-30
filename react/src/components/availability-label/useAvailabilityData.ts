import { AccessTypeCodeEnum } from "../../core/dbc-gateway/generated/graphql";
import { AccessTypes } from "../../core/utils/types/entities";
import { FaustId, PublizonIdentifier } from "../../core/utils/types/ids";
import { isOnline } from "./helper";
import useOnlineAvailabilityData from "./useOnlineAvailabilityData";
import usePhysicalAvailabilityData from "./usePhysicalAvailabilityData";

const useAvailabilityData = ({
  accessTypes,
  access,
  faustIds,
  manifestText,
  identifier,
  enabled = true
}: {
  accessTypes: AccessTypeCodeEnum[];
  access: AccessTypes[];
  faustIds: FaustId[];
  manifestText: string;
  identifier: PublizonIdentifier | null;
  enabled?: boolean;
}) => {
  const availabilityOnline = useOnlineAvailabilityData({
    enabled: isOnline(accessTypes) && enabled,
    access,
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
