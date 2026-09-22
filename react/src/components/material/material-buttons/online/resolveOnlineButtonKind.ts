import { first } from "lodash";
import { Manifestation } from "../../../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../../../core/utils/types/material-type";
import { getLoanableManifestation } from "../../../../apps/material/helper";
import { getReaderPlayerType } from "../../../reader-player/helper";
import { hasCorrectAccess, hasCorrectMaterialType } from "../helper";

type ManifestationAccess = Manifestation["access"][number];
type ManifestationAccessUrl = Extract<
  ManifestationAccess,
  { __typename: "AccessUrl" }
>;

export type OnlineButtonKind =
  | { kind: "internal" }
  | { kind: "external"; access: ManifestationAccessUrl }
  | { kind: "digital-article" }
  | { kind: "retriever-article" };

const isActiveAccessUrl = (
  access: ManifestationAccess
): access is ManifestationAccessUrl =>
  access.__typename === "AccessUrl" && access.status === "OK";

/**
 * Picks the access url to link to, preferring DBC Webarkiv over other origins.
 */
const findActiveAccessUrl = (manifestations: Manifestation[]) => {
  const access = first(manifestations)?.access ?? [];
  const activeAccessUrls = access.filter(isActiveAccessUrl);

  return (
    activeAccessUrls.find(({ origin }) => origin === "DBC Webarkiv") ??
    first(activeAccessUrls)
  );
};

/**
 * Decides which online button, if any, the given manifestations support.
 *
 * This is the single source of truth shared by MaterialButtons (to know
 * whether to render online buttons or a fallback) and MaterialButtonsOnline
 * (to know which button to render), so the two can never disagree.
 */
export const resolveOnlineButtonKind = (
  manifestations: Manifestation[]
): OnlineButtonKind | null => {
  const readerPlayerType = getReaderPlayerType(
    getLoanableManifestation(manifestations)
  );

  if (readerPlayerType === "player" || readerPlayerType === "reader") {
    return { kind: "internal" };
  }

  // External access, e.g. Filmstriben or eReolen Global.
  if (hasCorrectAccess("AccessUrl", manifestations)) {
    const access = findActiveAccessUrl(manifestations);

    return access ? { kind: "external", access } : null;
  }

  if (
    hasCorrectAccess("DigitalArticleService", manifestations) &&
    hasCorrectMaterialType(ManifestationMaterialType.article, manifestations)
  ) {
    return { kind: "digital-article" };
  }

  if (hasCorrectAccess("RetrieverService", manifestations)) {
    return { kind: "retriever-article" };
  }

  return null;
};
