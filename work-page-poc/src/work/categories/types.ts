import type { ComponentType } from "react"

import type { Manifestation, Work } from "../../fbi/types"
import type { RuleGroup, TraceRow, TraceSection } from "../trace"

export type CategoryPageProps = {
  work: Work
  /** The manifestation the page is about: the one in `?manifestationId=`. */
  manifestation: Manifestation
  /** Every manifestation of the work in the same category, the shown one included. */
  categoryManifestations: Manifestation[]
}

/**
 * A kind of material with its own work page: which manifestations it covers,
 * which of them is shown when the URL names none, how the page looks, and
 * why. The explaining parts are required, so the debug panel covers every
 * category.
 */
export type ManifestationCategory = {
  id: string
  /** The category's name in the debug panel, in Danish. */
  name: string
  /** What `match` checks, in words. */
  matchRule: string
  /** Whether the manifestation belongs here, and the FBI input that decided it. */
  match: (manifestation: Manifestation) => { isMatch: boolean; input: string }
  pickDefault: (categoryManifestations: Manifestation[], work: Work) => { manifestation: Manifestation; rows: TraceRow[] }
  /** The general rules, built from the same constants the category's code uses. */
  rules: RuleGroup[]
  /** Why the page shows what it shows, from the same resolvers the page renders from. */
  usePageTrace: (props: CategoryPageProps) => TraceSection[]
  Page: ComponentType<CategoryPageProps>
}
