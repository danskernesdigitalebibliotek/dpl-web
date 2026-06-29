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

export const getIsbnsFromWork = (work: WorkFullWorkPageFragment) => {
  const isbnsNested = work.manifestations.all.map(manifestation =>
    getIsbnsFromManifestation(manifestation)
  )
  return filterFalsyValuesFromArray(flatten(isbnsNested))
}

const FAUST_FROM_PID_REGEX = /^[0-9]+-[a-z]+:([a-zA-Z0-9-_.]+)$/

export const pidToFaust = (pid: string): string | null => {
  const match = pid.match(FAUST_FROM_PID_REGEX)
  return match?.[1] ?? null
}

export const getFaustIdsFromManifestations = (manifestations: { pid: string }[]): string[] =>
  filterFalsyValuesFromArray(manifestations.map(m => pidToFaust(m.pid)))
