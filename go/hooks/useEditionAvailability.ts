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

// Every physical record of a work, which is what FBS must be asked about —
// not the subset a given caller cares about. recordIds are part of the
// react-query key, so asking about a subset opens a second cache entry and a
// second request for the same answer. Reads the work from the same cached
// query the page already made.
export const useWorkRecordIds = (wid: string) => {
  const { data, isLoading } = useGetMaterialQuery({ wid }, { enabled: !!wid })

  const physicalManifestations = (
    (data?.work?.manifestations?.all ?? []) as ManifestationWorkPageFragment[]
  ).filter(manifestation =>
    isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )

  return { recordIds: getFaustIdsFromManifestations(physicalManifestations), isLoading }
}

// Whether the visited kommune has copies of a given edition.
//
// The answer is agency-scoped, not patron-scoped: whether the kommune owns a
// record is the same fact for every visitor. Per the platform's token rule a
// service needing no user context is called with the library token, which
// every session carries — anonymous ones included — so this is fetched for
// everyone, and a logged-out visitor sees the same editions marked as a
// logged-in one. Only the reserve and loan actions depend on the session.
//
// Only physical editions have an FBS record at all — digital ones are served
// by Publizon and must never be reported as out of stock here.
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

  // The record ids come from the work query, so it has to land before the
  // availability query can even start. Until both are in, the answer is not
  // known: reporting "settled" here would render the grid live and then flip
  // items to disabled under the cursor, which is what the skeleton prevents.
  const isLoadingAvailability = isLoadingWork || (recordIds.length > 0 && isLoading)

  // A failed query knows nothing about any record, which is different from a
  // successful answer that left one out. Without this the two are
  // indistinguishable — isLoading goes false either way — and a single failed
  // request would hide every edition and dead-end every reserve button at
  // once. Treating the failure as "unknown" keeps the page usable: FBS is the
  // authority at reservation time and rejects what it cannot supply.
  const isResolved = !isLoadingAvailability && !isError && recordIds.length > 0

  // Both questions are asked per edition, and both answer "no" for anything
  // the availability data cannot speak for: digital editions (served by
  // Publizon, with no FBS record), and anything asked before the answer is in.
  // Saying no there keeps every edition visible and selectable, which is the
  // state to fall back to when we do not know.
  const getRecord = (manifestation: ManifestationWorkPageFragment): string | null => {
    if (!isResolved) return null
    if (!isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return null
    }

    return pidToFaust(manifestation.pid)
  }

  // Nothing here to borrow and nothing to reserve — the edition is hidden
  // rather than shown as a dead end.
  const isEditionHidden = (manifestation: ManifestationWorkPageFragment): boolean => {
    const faust = getRecord(manifestation)
    if (!faust) return false

    return !isEditionObtainable(availability, faust)
  }

  // Owned but every copy is out. Shown, marked, and still reservable.
  const isEditionLentOut = (manifestation: ManifestationWorkPageFragment): boolean => {
    const faust = getRecord(manifestation)
    if (!faust) return false

    return isEditionOnLoan(availability, faust)
  }

  return {
    isLoadingAvailability,
    // The picker says so rather than silently showing an unmarked grid.
    isAvailabilityUnknown: isError,
    isEditionHidden,
    isEditionLentOut,
  }
}
