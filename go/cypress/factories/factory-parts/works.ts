import { Factory } from "fishery"

import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import { audioBookManifestationFactory, eBookManifestationFactory } from "./manifestations"
import { materialTypeAudioBookFactory, materialTypeEbookFactory } from "./materials"

export type Work = WorkTeaserSearchPageFragment

export const AudioBookFactory = Factory.define<Work>(({ sequence }) => ({
  workId: sequence.toString(),
  titles: {
    full: ["Dette er titlen på en lydbog"],
  },
  creators: [
    {
      display: "Forfatternavn 1",
      __typename: "Person",
    },
  ],
  materialTypes: [materialTypeEbookFactory.build(), materialTypeAudioBookFactory.build()],
  manifestations: {
    all: [eBookManifestationFactory.build(), audioBookManifestationFactory.build()],
    bestRepresentation: audioBookManifestationFactory.build(),
  },
}))

export const EBookFactory = Factory.define<Work>(({ sequence }) => ({
  workId: sequence.toString(),
  titles: {
    full: ["Dette er titlen på en e-bog"],
  },
  creators: [
    {
      display: "Forfatternavn 2",
      __typename: "Person",
    },
    {
      display: "Forfatternavn 3",
      __typename: "Person",
    },
  ],
  materialTypes: [materialTypeEbookFactory.build(), materialTypeAudioBookFactory.build()],
  manifestations: {
    all: [eBookManifestationFactory.build()],
    bestRepresentation: eBookManifestationFactory.build(),
  },
}))

export const CombinedWorkFactory = Factory.define<Work>(({ sequence }) => {
  const isAudioBook = sequence % 2 === 0
  return isAudioBook
    ? AudioBookFactory.build({ workId: sequence.toString() })
    : EBookFactory.build({ workId: sequence.toString() })
})
