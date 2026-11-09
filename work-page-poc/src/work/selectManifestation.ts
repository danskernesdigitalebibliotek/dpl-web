import type { Manifestation, Work } from "../fbi/types"
import { getCategory } from "./categories/registry"

/**
 * The manifestation the page shows: the one the URL names, or else the default
 * of the category in charge, which is the category of FBI's best
 * representation, as on the react/ work page.
 */
export const selectManifestation = (work: Work, manifestationId: string | null): Manifestation | undefined => {
  const { all, bestRepresentation } = work.manifestations
  const named = all.find((manifestation) => manifestation.pid === manifestationId)
  if (named) return named

  const representative = all.find((manifestation) => manifestation.pid === bestRepresentation.pid) ?? all[0]
  if (!representative) return undefined

  const category = getCategory(representative)
  return category.pickDefault(all.filter(category.matches), work)
}
