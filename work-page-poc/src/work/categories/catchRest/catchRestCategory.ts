import type { ManifestationCategory } from "../types"
import { CatchRestPage } from "./CatchRestPage"

const catchRestRules = {
  everything: "Alt, som ingen anden kategori matcher",
  bestRepresentation: "Standard er FBI's bedste repræsentation",
  rawData: "Siden viser rå FBI-data og tilgængelighed og har ingen knapper",
}

/** Everything no other category claims, shown as raw data. */
export const catchRestCategory: ManifestationCategory = {
  id: "catch-rest",
  name: "Catch-rest",
  matchRule: catchRestRules.everything,
  match: () => ({ isMatch: true, input: "–" }),
  pickDefault: (categoryManifestations, work) => {
    const bestPid = work.manifestations.bestRepresentation.pid
    const manifestation =
      categoryManifestations.find((candidate) => candidate.pid === bestPid) ?? categoryManifestations[0]
    return {
      manifestation,
      rows: [
        {
          rule: catchRestRules.bestRepresentation,
          input: `manifestations.bestRepresentation.pid = ${bestPid}`,
          outcome: `${manifestation.pid} vælges`,
        },
      ],
    }
  },
  rules: [{ title: "Catch-rest", rules: Object.values(catchRestRules) }],
  usePageTrace: () => [{ title: "Knapper", intro: catchRestRules.rawData, rows: [] }],
  Page: CatchRestPage,
}
