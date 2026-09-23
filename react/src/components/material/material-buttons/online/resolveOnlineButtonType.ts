import { first } from "lodash";
import {
  AccessTypeCodeEnum,
  LinkStatusEnum
} from "../../../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../../../core/utils/types/material-type";
import { getLoanableManifestation } from "../../../../apps/material/helper";
import { getReaderPlayerType } from "../../../reader-player/helper";
import {
  hasCorrectAccess,
  hasCorrectAccessType,
  hasCorrectMaterialType,
  isArticle
} from "../helper";

type ManifestationAccess = Manifestation["access"][number];
type ManifestationAccessUrl = Extract<
  ManifestationAccess,
  { __typename: "AccessUrl" }
>;

/**
 * The online button a set of manifestations resolves to.
 *
 * - `internal`: an e-book or audiobook loaned through eReolen. Opens the
 *   in-app reader or player rather than leaving the site.
 * - `external`: a link out to another service, e.g. Filmstriben or
 *   eReolen Global. Carries the access url to link to.
 * - `digital-article`: an article ordered through the Digital Article
 *   Service and delivered by email.
 * - `retriever-article`: an article read in the Retriever archive.
 */
export type OnlineButtonType =
  | { type: "internal" }
  | { type: "external"; access: ManifestationAccessUrl }
  | { type: "digital-article" }
  | { type: "retriever-article" };

const isActiveAccessUrl = (
  access: ManifestationAccess
): access is ManifestationAccessUrl =>
  access.__typename === "AccessUrl" && access.status === LinkStatusEnum.Ok;

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
 * Online buttons are only considered if the material has an online access type,
 * or it has a DigitalArticleService access and is an article. This way we avoid
 * showing both physical and online action buttons at once.
 */
const hasOnlineAccess = (manifestations: Manifestation[]) =>
  hasCorrectAccessType(AccessTypeCodeEnum.Online, manifestations) ||
  (hasCorrectAccess("DigitalArticleService", manifestations) &&
    isArticle(manifestations));

/**
 * Decides which online button, if any, the given manifestations support.
 *
 * This is the single source of truth shared by MaterialButtons (to know
 * whether to render online buttons or a fallback) and MaterialButtonsOnline
 * (to know which button to render), so the two can never disagree.
 */
export const resolveOnlineButtonType = (
  manifestations: Manifestation[]
): OnlineButtonType | null => {
  if (!hasOnlineAccess(manifestations)) {
    return null;
  }

  const readerPlayerType = getReaderPlayerType(
    getLoanableManifestation(manifestations)
  );

  if (readerPlayerType === "player" || readerPlayerType === "reader") {
    return { type: "internal" };
  }

  // External access, e.g. Filmstriben or eReolen Global.
  if (hasCorrectAccess("AccessUrl", manifestations)) {
    const access = findActiveAccessUrl(manifestations);

    return access ? { type: "external", access } : null;
  }

  if (
    hasCorrectAccess("DigitalArticleService", manifestations) &&
    hasCorrectMaterialType(ManifestationMaterialType.article, manifestations)
  ) {
    return { type: "digital-article" };
  }

  if (hasCorrectAccess("RetrieverService", manifestations)) {
    return { type: "retriever-article" };
  }

  return null;
};
