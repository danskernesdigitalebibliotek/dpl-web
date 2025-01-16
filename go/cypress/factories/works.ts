import { Factory } from "fishery"

import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

import { audioBookManifistationFactory, eBookManifistationFactory } from "./manifistations"
import { audioBookFactory, eBookFactory } from "./materials"

export type Work = SearchWithPaginationQuery["search"]["works"][0]

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
    all: [eBookManifistationFactory.build(), audioBookManifistationFactory.build()],
    bestRepresentation: audioBookManifistationFactory.build(),
  },
}))
