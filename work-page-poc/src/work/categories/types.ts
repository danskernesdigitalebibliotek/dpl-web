import type { ComponentType } from "react"

import type { Manifestation, Work } from "../../fbi/types"

export type CategoryPageProps = {
  work: Work
  /** The manifestation the page is about: the one in `?manifestationId=`. */
  manifestation: Manifestation
  /** Every manifestation of the work in the same category, the shown one included. */
  categoryManifestations: Manifestation[]
}

/**
 * A kind of material with its own work page: which manifestations it covers,
 * which of them is shown when the URL names none, and how the page looks.
 */
export type ManifestationCategory = {
  id: string
  matches: (manifestation: Manifestation) => boolean
  pickDefault: (categoryManifestations: Manifestation[], work: Work) => Manifestation
  Page: ComponentType<CategoryPageProps>
}
