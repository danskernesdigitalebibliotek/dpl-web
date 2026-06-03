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

// FBI pids look like "870970-basis:12345678". FBS keys availability and
// holdings by the FAUST number — the substring after the colon.
export const convertPidToFaustId = (pid: string): string | null => {
  const parts = pid.split(":")
  if (parts.length !== 2) return null
  const faust = parts[1]
  return /^\d+$/.test(faust) ? faust : null
}

export const getFaustIdsFromManifestations = (manifestations: { pid: string }[]): string[] =>
  filterFalsyValuesFromArray(manifestations.map(m => convertPidToFaustId(m.pid)))
