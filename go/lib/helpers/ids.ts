import { flatten } from "lodash"

import { filterFalsyValuesFromArray } from "@/lib/helpers/helper.arrays"

import { IdentifierTypeEnum, Manifestation, Work } from "../graphql/generated/fbi/graphql"

export const getIsbnsFromManifestation = (manifestation: Manifestation) => {
  if (!manifestation) return []

  return manifestation.identifiers.reduce((acc, identifier) => {
    if (identifier.type === IdentifierTypeEnum.Isbn) {
      acc.push(identifier.value)
    }
    return acc
  }, [] as string[])
}

export const getIsbnsFromWork = (work: Work) => {
  const isbnsnested = work.manifestations.all.map(manifestation =>
    getIsbnsFromManifestation(manifestation)
  )
  return filterFalsyValuesFromArray(flatten(isbnsnested))
}
