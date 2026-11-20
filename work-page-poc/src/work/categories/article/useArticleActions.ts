import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { Manifestation } from "../../../fbi/types"
import { pickFastestAccess } from "./accessWays"
import { resolveArticleActions } from "./resolveArticleActions"

/** Feeds resolveArticleActions from the connection settings and the patron. */
export const useArticleActions = (
  manifestation: Manifestation,
  categoryManifestations: Manifestation[],
  hasClickedWithoutLogin = false
) => {
  const { settings } = useConnectionSettings()
  const { data: patron } = usePatron()
  return resolveArticleActions({
    manifestation,
    hasUserToken: Boolean(settings.userToken),
    isBlocked: Boolean(patron?.isLocked),
    hasOtherEditions: categoryManifestations.length > 1,
    isRecommended: pickFastestAccess(categoryManifestations).pid === manifestation.pid,
    hasClickedWithoutLogin,
  })
}
