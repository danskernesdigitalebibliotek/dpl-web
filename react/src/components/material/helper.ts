import { getLoanableManifestation } from "../../apps/material/helper";
import { AccessTypeCodeEnum } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { getReaderPlayerType } from "../reader-player/helper";
import { hasCorrectMaterialType, isArticle } from "./material-buttons/helper";

export const isPhysical = (manifestations: Manifestation[]) => {
  return manifestations.some((manifestation) => {
    return manifestation.accessTypes.some((acc) => {
      return acc.code === AccessTypeCodeEnum.Physical;
    });
  });
};

export const isPeriodical = (manifestations: Manifestation[]) => {
  return (
    hasCorrectMaterialType(
      ManifestationMaterialType.magazine,
      manifestations
    ) ||
    hasCorrectMaterialType(
      ManifestationMaterialType.yearBook,
      manifestations
    ) ||
    hasCorrectMaterialType(
      ManifestationMaterialType.yearBookOnline,
      manifestations
    ) ||
    hasCorrectMaterialType(ManifestationMaterialType.newspaper, manifestations)
  );
};

export const isMaterialButtonsOnlineInternal = (
  manifestation: Manifestation
) => {
  return Boolean(getReaderPlayerType(manifestation));
};

export const shouldShowMaterialAvailabilityText = (
  manifestations: Manifestation[]
) => {
  // The same edition the buttons and the text itself act on - the first one
  // listed may be an edition no provider lends.
  const loanableManifestation = getLoanableManifestation(manifestations);
  const shouldShowOnlineAvailability =
    loanableManifestation &&
    isMaterialButtonsOnlineInternal(loanableManifestation);

  const shouldShowPhysicalAvailability =
    isPhysical(manifestations) &&
    !isPeriodical(manifestations) &&
    !isArticle(manifestations);

  return shouldShowOnlineAvailability || shouldShowPhysicalAvailability;
};
