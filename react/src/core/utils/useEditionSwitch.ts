import { useModalButtonHandler } from "./modal";
import { useModalIdsToCloseForReservation } from "./useModalIdsToCloseForReservation";
import { useUrls } from "./url";
import { hasCorrectAccessType } from "../../components/material/material-buttons/helper";
import { AccessTypeCodeEnum } from "../dbc-gateway/generated/graphql";
import {
  reservationModalId,
  onlineInternalModalId
} from "../../apps/material/helper";
import { getAllFaustIds } from "./helpers/general";
import { Manifestation } from "./types/entities";

/**
 * Custom hook that creates a handler for edition switch modal reservation logic.
 * Determines the appropriate reservation modal to open based on the
 * manifestation's access type (physical vs digital).
 */
export const useEditionSwitch = (
  selectedManifestations: Manifestation[] | null
) => {
  const { openGuarded } = useModalButtonHandler();
  const modalsToClose = useModalIdsToCloseForReservation();
  const u = useUrls();
  const authUrl = u("authUrl");

  const handleReserveFirstAvailable = () => {
    if (!selectedManifestations?.length) return;

    const faustIds = getAllFaustIds(selectedManifestations);

    const isPhysical = hasCorrectAccessType(
      AccessTypeCodeEnum.Physical,
      selectedManifestations
    );

    const modalId = isPhysical
      ? reservationModalId(faustIds)
      : onlineInternalModalId(selectedManifestations);

    openGuarded({
      authUrl,
      modalId,
      options: { modalsToClose }
    });
  };

  return { handleReserveFirstAvailable };
};
