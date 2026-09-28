"use client"

import { useMaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { isPhysicalMaterialType } from "@/components/pages/workPageLayout/helper"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { isEditionObtainable, isEditionOnLoan } from "@/lib/helpers/helper.availability"
import { getFaustIdsFromManifestations, pidToFaust } from "@/lib/helpers/ids"

import { useBlacklistedAvailabilityBranches } from "./useBlacklistedAvailabilityBranches"

// Every physical record of a work. recordIds are part of the react-query
// key, so all callers must ask about the same set to share one request.
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

  // Null for anything the availability data cannot speak for: digital
  // editions, and anything asked before the answer is in. Both questions
  // below then answer "no", which keeps the edition visible and selectable.
  const getRecord = (manifestation: ManifestationWorkPageFragment): string | null => {
    if (!isResolved) return null
    if (!isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return null
    }

    return pidToFaust(manifestation.pid)
  }

  // Nothing to borrow and nothing to reserve.
  const isEditionHidden = (manifestation: ManifestationWorkPageFragment): boolean => {
    const faust = getRecord(manifestation)
    if (!faust) return false

    return !isEditionObtainable(availability, faust)
  }

  // Held but every copy is out. Still reservable.
  const isEditionLentOut = (manifestation: ManifestationWorkPageFragment): boolean => {
    const faust = getRecord(manifestation)
    if (!faust) return false

    return isEditionOnLoan(availability, faust)
  }

  return {
    isLoadingAvailability,
    isAvailabilityUnknown: isError,
    isEditionHidden,
    isEditionLentOut,
  }
}
