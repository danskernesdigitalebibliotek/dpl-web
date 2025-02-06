import { Factory } from "fishery"

import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import { audioBookManifestationFactory, eBookManifestationFactory } from "./manifestations"
import { audioBookFactory, eBookFactory } from "./materials"

export type Work = WorkTeaserSearchPageFragment

export const AudioBookFactory = Factory.define<Work>(({ sequence }) => ({
  workId: `work-of:870970-basis:38772805-${sequence}`,
  titles: {
    full: ["Kender du J.K. Rowling? : historien om kvinden, der skabte Harry Potter"],
  },
  creators: [
    {
      display: "Christian Mohr Boisen",
      __typename: "Person",
    },
  ],
  materialTypes: [eBookFactory.build(), audioBookFactory.build()],
  manifestations: {
    all: [eBookManifestationFactory.build(), audioBookManifestationFactory.build()],
    bestRepresentation: audioBookManifestationFactory.build(),
  },
}))
