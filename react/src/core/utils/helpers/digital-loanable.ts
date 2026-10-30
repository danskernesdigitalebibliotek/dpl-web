import { IdentifierTypeEnum } from "../../dbc-gateway/generated/graphql";
import { Manifestation } from "../types/entities";
import { PublizonIdentifier } from "../types/ids";

// No ISBN stands in when the PUBLIZON identifier is missing: a manifestation
// can carry several ISBNs, and the leading one is not always the edition a
// provider lends - a deselected PDF, say.
export const getPublizonIdentifier = (
  manifestation: Manifestation
): PublizonIdentifier | null => {
  const value = manifestation.identifiers?.find(
    (identifier) => identifier.type === IdentifierTypeEnum.Publizon
  )?.value;
  return value ? { type: IdentifierTypeEnum.Publizon, value } : null;
};
