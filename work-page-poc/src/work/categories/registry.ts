import type { Manifestation } from "../../fbi/types"
import type { TraceSection } from "../trace"
import { articleCategory } from "./article/articleCategory"
import { catchRestCategory } from "./catchRest/catchRestCategory"
import type { ManifestationCategory } from "./types"

// Checked in order; the catch-rest category matches everything and stays last.
const categories: ManifestationCategory[] = [articleCategory, catchRestCategory]

export const belongsTo = (category: ManifestationCategory, manifestation: Manifestation) =>
  category.match(manifestation).isMatch

/** The category a manifestation belongs to. */
export const getCategory = (manifestation: Manifestation) =>
  categories.find((category) => belongsTo(category, manifestation)) ?? catchRestCategory

/** How each category, in order, judged the manifestation. */
export const explainCategory = (manifestation: Manifestation): TraceSection => {
  const chosen = getCategory(manifestation)
  return {
    title: "Kategori",
    intro: "Kategorierne prøves i rækkefølge på den viste manifestation; den første, der matcher, tegner siden.",
    rows: categories.map((category) => {
      const { isMatch, input } = category.match(manifestation)
      return {
        rule: `${category.name}: ${category.matchRule}`,
        input,
        outcome: category === chosen ? "Matcher → tegner siden" : isMatch ? "Matcher, men kommer senere" : "Matcher ikke",
      }
    }),
  }
}
