import { flatten } from "lodash"

import {
  IdentifierType,
  ManifestationIdentifiersFragment,
  WorkTeaserFragment,
} from "../graphql/generated/fbi/graphql"
import { filterFalsyValuesFromArray } from "./arrays"

export const getIsbnsFromManifestation = (manifestation: ManifestationIdentifiersFragment) => {
  return manifestation.identifiers.map(identifier => {
    if (identifier.type === IdentifierType.Isbn) {
      return identifier.value
    }
  })
}

export const getIsbnsFromWork = (work: WorkTeaserFragment) => {
  const isbnsnested = work.manifestations.all.map(manifestation =>
    getIsbnsFromManifestation(manifestation)
  )
  return filterFalsyValuesFromArray(flatten(isbnsnested))
}
