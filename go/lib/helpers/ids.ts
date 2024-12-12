import { flatten } from "lodash"

import {
  IdentifierTypeEnum,
  ManifestationIdentifiersFragment,
  ManifestationWorkPageFragment,
  WorkTeaserSearchPageFragment,
} from "../graphql/generated/fbi/graphql"
import { filterFalsyValuesFromArray } from "./arrays"

export const getIsbnsFromManifestation = (
  manifestation: ManifestationIdentifiersFragment | ManifestationWorkPageFragment | null
) => {
  if (!manifestation) return []

  return manifestation.identifiers.reduce((acc, identifier) => {
    if (identifier.type === IdentifierTypeEnum.Isbn) {
      acc.push(identifier.value)
    }
    return acc
  }, [] as string[])
}

export const getIsbnsFromWork = (work: WorkTeaserSearchPageFragment) => {
  const isbnsnested = work.manifestations.all.map(manifestation =>
    getIsbnsFromManifestation(manifestation)
  )
  return filterFalsyValuesFromArray(flatten(isbnsnested))
}
