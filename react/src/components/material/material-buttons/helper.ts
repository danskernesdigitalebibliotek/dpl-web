import { Manifestation } from "../../../core/utils/types/entities";
import articleTypes from "../../../core/utils/types/article-types";
import { AccessTypeCodeEnum } from "../../../core/dbc-gateway/generated/graphql";

export const hasCorrectAccess = (
  // TODO: This should be an enum or something more precise.
  desiredAccess: string,
  manifestations: Manifestation[]
) => {
  return manifestations.some((manifestation) => {
    return manifestation.access.some(
      ({ __typename }) =>
        __typename.toLowerCase() === desiredAccess.toLowerCase()
    );
  });
};

export const hasCorrectAccessType = (
  desiredAccessType: AccessTypeCodeEnum,
  manifestations: Manifestation[]
) => {
  return manifestations.some((manifestation) => {
    return manifestation.accessTypes.some(
      (type) => type.code === desiredAccessType
    );
  });
};

export const hasCorrectMaterialType = (
  desiredMaterialType: string,
  manifestations: Manifestation[]
) => {
  return manifestations.some((manifestation) => {
    return manifestation.materialTypes.some(
      (type) =>
        type.materialTypeSpecific.display.toLowerCase() ===
        desiredMaterialType.toLowerCase()
    );
  });
};

export const isArticle = (manifestations: Manifestation[]) => {
  return articleTypes.some((type) =>
    hasCorrectMaterialType(type, manifestations)
  );
};
