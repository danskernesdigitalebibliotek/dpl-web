"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import {
  getEbookManifestationOrFallbackManifestation,
  getEditionsForMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { useEditionAvailability } from "@/hooks/useEditionAvailability"
import { usePreferredManifestation } from "@/hooks/usePreferredManifestation"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Honours the pid only if it belongs to the given material type.
const getPinnedEditionManifestation = (
  manifestations: ManifestationWorkPageFragment[],
  materialTypeCode: string,
  pid: string | null
): ManifestationWorkPageFragment | undefined => {
  if (!pid) return undefined

  return getEditionsForMaterialType(manifestations, materialTypeCode).find(
    manifestation => manifestation.pid === pid
  )
}

type UseSelectedEditionArgs = {
  workId: string
  work: WorkFullWorkPageFragment | null | undefined
  // Filtered down to the types the page renders.
  manifestations: ManifestationWorkPageFragment[]
  allManifestations: ManifestationWorkPageFragment[] | undefined
}

// The edition the work page shows: the one the url pins, else the default
// pick for the material type. Redirects to a material type when the url names
// none.
export const useSelectedEdition = ({
  workId,
  work,
  manifestations,
  allManifestations,
}: UseSelectedEditionArgs) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedManifestation, setSelectedManifestation] =
    useState<ManifestationWorkPageFragment>()
  const { isEditionUnobtainable, isLoadingAvailability, isAvailabilityUnknown } =
    useEditionAvailability(workId)

  const searchParamsMaterialType = searchParams.get("type")
  const bestRepresentation = work?.manifestations?.bestRepresentation

  // Newest first, minus the ones the kommune cannot supply.
  const obtainableEditions = useMemo(
    () =>
      getEditionsForMaterialType(allManifestations ?? [], searchParamsMaterialType ?? "").filter(
        manifestation => !isEditionUnobtainable(manifestation)
      ),
    // isEditionUnobtainable is rebuilt every render, so the flags behind it stand
    // in for it — see the effect below for the same reasoning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allManifestations, searchParamsMaterialType, isLoadingAvailability, isAvailabilityUnknown]
  )

  // The `edition` param holds a pid. Absent, the page picks a default itself
  // and never writes it back to the url.
  const pinnedManifestation = useMemo(
    () =>
      getPinnedEditionManifestation(
        allManifestations ?? [],
        searchParamsMaterialType ?? "",
        searchParams.get("edition")
      ),
    [allManifestations, searchParamsMaterialType, searchParams]
  )

  // Remembers per material type that the pick is made, so a lookup for the
  // same ISBN started elsewhere does not reopen it.
  const { manifestation: defaultObtainableEdition, isWaiting: isWaitingForPick } =
    usePreferredManifestation(obtainableEditions, { key: searchParamsMaterialType })

  // A pinned edition is the answer, so there is nothing left to wait for.
  const isWaitingForDefaultEdition = isWaitingForPick && !pinnedManifestation

  useEffect(() => {
    if (!searchParamsMaterialType && bestRepresentation && work) {
      // If no material type is specified is url params, redirect to the ebook manifestation if available or a fallback manifestation
      const manifestation = getEbookManifestationOrFallbackManifestation(
        bestRepresentation,
        manifestations
      )
      if (manifestation) {
        const url = resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: { type: manifestation.materialTypes[0].materialTypeSpecific.code },
        })
        router.replace(url, { scroll: false })
      }
    }

    // Filter out manifestations that don't match the search params material type
    const defaultManifestation = manifestations.find(manifestation => {
      return !!manifestation?.materialTypes.find(
        materialType => materialType.materialTypeSpecific.code === searchParamsMaterialType
      )
    }) as ManifestationWorkPageFragment

    // defaultManifestation is cast non-nullable above but can be undefined,
    // so keep the last good pick rather than clearing the page.
    const nextManifestation =
      pinnedManifestation ?? defaultObtainableEdition ?? defaultManifestation
    if (nextManifestation) {
      setSelectedManifestation(nextManifestation)
    }
    // isEditionUnobtainable is rebuilt every render, so the settle-once flags behind
    // it stand in for it and a background refetch leaves the edition alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    manifestations,
    allManifestations,
    pinnedManifestation,
    isLoadingAvailability,
    isAvailabilityUnknown,
    isWaitingForPick,
  ])

  return { selectedManifestation, isWaitingForDefaultEdition }
}
