import { flatten } from "lodash"

import { filterFalsyValuesFromArray } from "@/lib/helpers/helper.arrays"

import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "../graphql/generated/fbi/graphql"

export const getIsbnsFromManifestation = (manifestation: ManifestationWorkPageFragment) => {
  if (!manifestation) return []

  return manifestation.identifiers.reduce((acc, identifier) => {
    if (identifier.type === "ISBN") {
      acc.push(identifier.value)
    }
    return acc
  }, [] as string[])
}

// Identifier sent to Publizon when loaning/reserving a digital material. The
// loanable edition is keyed by its PUBLIZON identifier; a work can also expose
// a deselected ("fravalgt") PDF edition that only has an ISBN and is not on the
// agreement. Prefer the PUBLIZON identifier, fall back to the ISBN.
export const getPublizonIdentifierFromManifestation = (
  manifestation: ManifestationWorkPageFragment | undefined
) => {
  if (!manifestation) return undefined

  const publizonIdentifier = manifestation.identifiers.find(
    identifier => identifier.type === "PUBLIZON"
  )
  const isbnIdentifier = manifestation.identifiers.find(identifier => identifier.type === "ISBN")

  return publizonIdentifier?.value ?? isbnIdentifier?.value
}

export const getIsbnsFromWork = (work: WorkFullWorkPageFragment) => {
  const isbnsNested = work.manifestations.all.map(manifestation =>
    getIsbnsFromManifestation(manifestation)
  )
  return filterFalsyValuesFromArray(flatten(isbnsNested))
}
