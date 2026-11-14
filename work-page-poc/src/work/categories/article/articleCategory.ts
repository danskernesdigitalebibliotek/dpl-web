import type { ManifestationCategory } from "../types"
import { accessRules, rankEditions } from "./accessWays"
import { ArticlePage } from "./ArticlePage"
import { actionRules } from "./resolveArticleActions"
import { useArticleActions } from "./useArticleActions"

/** Articles and reviews, printed and online: FBI files them all under ARTICLES. */
export const articleCategory: ManifestationCategory = {
  id: "article",
  name: "Artikel",
  matchRule: "materialTypeGeneral.code = ARTICLES (artikler og anmeldelser, trykte og online)",
  match: (manifestation) => {
    const codes = manifestation.materialTypes.map((materialType) => materialType.materialTypeGeneral.code)
    return {
      isMatch: codes.includes("ARTICLES"),
      input: `materialTypes[].materialTypeGeneral.code = ${codes.join(", ")}`,
    }
  },
  pickDefault: (categoryManifestations) => {
    const { ranked, rows } = rankEditions(categoryManifestations)
    return { manifestation: ranked[0], rows }
  },
  rules: [
    { title: "Adgangsveje", rules: Object.values(accessRules) },
    { title: "Knapper og statuslinjer", rules: Object.values(actionRules) },
  ],
  usePageTrace: ({ manifestation, categoryManifestations }) => {
    const { accessRows, buttonRows, statusRows } = useArticleActions(manifestation, categoryManifestations)
    return [
      { title: "Adgangsveje", intro: "Hver indgang i manifestationens access, og hvad den blev til.", rows: accessRows },
      { title: "Knapper", rows: buttonRows },
      {
        title: "Statuslinjer",
        intro: "Login-beskeden vises først, når man klikker uden brugertoken.",
        rows: statusRows,
      },
    ]
  },
  Page: ArticlePage,
}
