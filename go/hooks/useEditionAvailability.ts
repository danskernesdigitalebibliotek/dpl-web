"use client"

import { useMaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { isPhysicalMaterialType } from "@/components/pages/workPageLayout/helper"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import {
  getManifestationQueueText,
  isManifestationLentOut,
  isManifestationUnobtainable,
} from "@/lib/helpers/helper.availability"
import { getFaustIdsFromManifestations } from "@/lib/helpers/ids"

import { useBlacklistedAvailabilityBranches } from "./useBlacklistedAvailabilityBranches"

// Every physical record of a work.
export const useWorkRecordIds = (wid: string) => {
  const { data, isLoading } = useGetMaterialQuery({ wid }, { enabled: !!wid })

  const physicalManifestations = (
    (data?.work?.manifestations?.all ?? []) as ManifestationWorkPageFragment[]
  ).filter(manifestation =>
    isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )

  return { recordIds: getFaustIdsFromManifestations(physicalManifestations), isLoading }
}

// Whether the visited kommune can supply a given edition. Physical editions
// only: digital ones have no FBS record.
// See docs/go/material-availability.md
export const useEditionAvailability = (wid: string) => {
  const { recordIds, isLoading: isLoadingWork } = useWorkRecordIds(wid)

  const blacklistedBranches = useBlacklistedAvailabilityBranches()
  const {
    data: availability,
    isLoading,
    isError,
  } = useMaterialAvailability(wid, recordIds, blacklistedBranches, {
    enabled: recordIds.length > 0,
  })

  // Both queries have to land: the work query supplies the record ids the
  // availability query asks about.
  const isLoadingAvailability = isLoadingWork || (recordIds.length > 0 && isLoading)

  // A failed query is "unknown", not "nothing is obtainable": it knows
  // nothing about any record, where a successful answer merely left one out.
  const isResolved = !isLoadingAvailability && !isError && recordIds.length > 0

  return {
    availability,
    isResolved,
    isLoadingAvailability,
    isAvailabilityUnknown: isError,
    isEditionUnobtainable: (manifestation: ManifestationWorkPageFragment) =>
      isManifestationUnobtainable(manifestation, availability, isResolved),
    isEditionLentOut: (manifestation: ManifestationWorkPageFragment) =>
      isManifestationLentOut(manifestation, availability, isResolved),
    getEditionQueueText: (manifestation: ManifestationWorkPageFragment) =>
      getManifestationQueueText(manifestation, availability, isResolved),
  }
}
