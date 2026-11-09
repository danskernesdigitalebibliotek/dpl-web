import type { ManifestationCategory } from "../types"
import { pickFastestAccess } from "./accessWays"
import { ArticlePage } from "./ArticlePage"

/** Articles and reviews, printed and online: FBI files them all under ARTICLES. */
export const articleCategory: ManifestationCategory = {
  id: "article",
  matches: (manifestation) =>
    manifestation.materialTypes.some((materialType) => materialType.materialTypeGeneral.code === "ARTICLES"),
  pickDefault: pickFastestAccess,
  Page: ArticlePage,
}
