import type { ManifestationCategory } from "../types"
import { accessRules, rankEditions } from "./accessWays"
import { optionRules } from "./articleOptions"
import { ArticlePage } from "./ArticlePage"
import { actionRules } from "./resolveArticleAction"
import { useArticlePage } from "./useArticlePage"

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
    { title: "Typer, udgaver og bestillingsmuligheder", rules: Object.values(optionRules) },
    { title: "Knap og tekster", rules: Object.values(actionRules) },
  ],
  usePageTrace: ({ manifestation, categoryManifestations }) => {
    const { options, action } = useArticlePage(manifestation, categoryManifestations)
    return [
      { title: "Materialetyper", rows: options.typeRows },
      { title: "Adgangsveje", intro: "Hver indgang i manifestationens access, og hvad den blev til.", rows: options.accessRows },
      { title: "Valgt adgangsvej og Skift", rows: options.choiceRows },
      { title: "Knap", rows: action.actionRows },
      {
        title: "Tekster under knappen",
        intro: "Login-beskeden vises først, når man klikker uden brugertoken.",
        rows: action.textRows,
      },
    ]
  },
  Page: ArticlePage,
}
