import { IdentifierTypeEnum } from "../../dbc-gateway/generated/graphql";
import { Manifestation } from "../types/entities";
import { PublizonIdentifier } from "../types/ids";
import { ManifestationMaterialType } from "../types/material-type";
import { getMaterialTypes, orderManifestationsByYear } from "./general";

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

export type LendableEdition = {
  manifestation: Manifestation;
  identifier: PublizonIdentifier;
};

// The edition a provider is asked about and lends, or null when none of them
// carries a PUBLIZON identifier. Several editions of one material type can,
// and the reader expects the newest. orderManifestationsByYear sorts in
// place, which only touches the filtered copy, not the caller's list.
export const getLendableEdition = (
  manifestations: Manifestation[]
): LendableEdition | null => {
  const [manifestation] = orderManifestationsByYear(
    manifestations.filter(
      (candidate) => getPublizonIdentifier(candidate) !== null
    )
  );
  const identifier = manifestation
    ? getPublizonIdentifier(manifestation)
    : null;
  return manifestation && identifier ? { manifestation, identifier } : null;
};

const readerTypes = [
  ManifestationMaterialType.ebook,
  ManifestationMaterialType.pictureBookOnline,
  ManifestationMaterialType.animatedSeriesOnline,
  ManifestationMaterialType.yearBookOnline
];

const playerTypes = [
  ManifestationMaterialType.audioBook,
  ManifestationMaterialType.podcast,
  ManifestationMaterialType.musicOnline,
  ManifestationMaterialType.audioBookTape
];

const opensIn = (manifestation: Manifestation): "reader" | "player" | null => {
  const materialTypes = getMaterialTypes([manifestation]);

  if (readerTypes.some((type) => materialTypes.includes(type))) return "reader";
  if (playerTypes.some((type) => materialTypes.includes(type))) return "player";

  return null;
};

export type DigitalLoanEdition = LendableEdition & {
  opensIn: "reader" | "player";
};

/**
 * The edition of a material type that is lent out, the id it is lent by and
 * where it opens - or null when we cannot lend it. The one way to pick the
 * lent edition: the header, the loan modal and the edition switch all go
 * through here, so whatever they resolve it from, they agree.
 */
export const getDigitalLoanEdition = (
  manifestations: Manifestation[]
): DigitalLoanEdition | null => {
  const lendable = getLendableEdition(manifestations);
  if (!lendable) return null;

  const type = opensIn(lendable.manifestation);
  return type ? { ...lendable, opensIn: type } : null;
};
