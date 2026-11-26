import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useSearchParams } from "react-router"

import { getFbiProfile } from "../../../connection/connectionSettings"
import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { Manifestation } from "../../../fbi/types"
import { usePeriodicalByIssn } from "../../../fbi/usePeriodicalByIssn"
import { resolveArticleOptions } from "./articleOptions"
import { getPeriodicalCql, resolvePeriodicalLink } from "./periodicalLink"
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
  const printedIssue = options.selectedWay?.kind === "printed-issue" ? options.selectedWay : undefined
  const periodicalSearch = usePeriodicalByIssn(printedIssue?.issn && getPeriodicalCql(printedIssue.issn))
  const periodicalLink =
    printedIssue &&
    resolvePeriodicalLink({
      hostTitle: printedIssue.hostTitle,
      issn: printedIssue.issn,
      search: periodicalSearch.data?.complexSearch,
      isSearching: periodicalSearch.isFetching,
      profile: getFbiProfile(settings),
    })

  const action = resolveArticleAction({
    manifestation,
    selectedWay: options.selectedWay,
    hasUserToken: Boolean(settings.userToken),
    isBlocked: Boolean(patron?.isLocked),
    hasClickedWithoutLogin,
    periodicalLink,
  })
  return { options, action }
}
