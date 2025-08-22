import { Factory } from "fishery"

import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import {
  audioBookManifestationIdentifierFactory,
  eBookManifestationIdentifierFactory,
} from "./identifier"
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
    all: [eBookManifestationFactory.build(), audioBookManifestationFactory.build()],
    bestRepresentation: eBookManifestationFactory.build(),
  },
}))

export const worksWithIdentifiersFactory = Factory.define<Work[], { identifiers: string[] }>(
  ({ transientParams }) => {
    const { identifiers = [] } = transientParams

    return identifiers.map((identifier, index) => {
      if (index % 2 === 0) {
        return EBookFactory.build({
          manifestations: {
            all: [
              eBookManifestationFactory.build({
                identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
              }),
            ],
            bestRepresentation: eBookManifestationFactory.build({
              identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          },
        })
      }

      return AudioBookFactory.build({
        manifestations: {
          all: [
            audioBookManifestationFactory.build({
              identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          ],
          bestRepresentation: audioBookManifestationFactory.build({
            identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
          }),
        },
      })
    })
  }
)

export const CombinedWorkFactory = Factory.define<Work>(({ sequence }) => {
  const isAudioBook = sequence % 2 === 0
  return isAudioBook
    ? AudioBookFactory.build({ workId: sequence.toString() })
    : EBookFactory.build({ workId: sequence.toString() })
})
