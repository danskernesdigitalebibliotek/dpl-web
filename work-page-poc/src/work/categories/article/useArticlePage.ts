import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useSearchParams } from "react-router"

import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { Manifestation } from "../../../fbi/types"
import { resolveArticleOptions } from "./articleOptions"
import { resolveArticleAction } from "./resolveArticleAction"

/** Feeds the article's resolvers from the URL, the connection settings and the patron. */
export const useArticlePage = (
  manifestation: Manifestation,
  categoryManifestations: Manifestation[],
  hasClickedWithoutLogin = false
) => {
  const [searchParams] = useSearchParams()
  const { settings } = useConnectionSettings()
  const { data: patron } = usePatron()

  const options = resolveArticleOptions({
    manifestation,
    categoryManifestations,
    requestedWay: searchParams.get("accessWay"),
    isResident: patron?.isResident,
  })
  const action = resolveArticleAction({
    manifestation,
    selectedWay: options.selectedWay,
    hasUserToken: Boolean(settings.userToken),
    isBlocked: Boolean(patron?.isLocked),
    hasClickedWithoutLogin,
  })
  return { options, action }
}
