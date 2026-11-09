import type { ManifestationCategory } from "../types"
import { CatchRestPage } from "./CatchRestPage"

/** Everything no other category claims, shown as raw data. */
export const catchRestCategory: ManifestationCategory = {
  id: "catch-rest",
  matches: () => true,
  pickDefault: (categoryManifestations, work) =>
    categoryManifestations.find(
      (manifestation) => manifestation.pid === work.manifestations.bestRepresentation.pid
    ) ?? categoryManifestations[0],
  Page: CatchRestPage,
}
