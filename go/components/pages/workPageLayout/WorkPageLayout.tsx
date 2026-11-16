"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading, {
  WorkPageHeaderSkeleton,
} from "@/components/pages/workPageLayout/WorkPageLoading"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
import { useDefaultObtainableEdition } from "@/hooks/useDefaultObtainableEdition"
import { useEditionAvailability } from "@/hooks/useEditionAvailability"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  getEditionsForMaterialType,
  getPinnedEditionManifestation,
} from "./helper"

const subscribeNoop = () => () => {}

function WorkPageLayout({ workId, hasServerData }: { workId: string; hasServerData: boolean }) {
  const router = useRouter()
  const { data, isLoading } = useGetMaterialQuery({
    wid: workId,
  })
  const [selectedManifestation, setSelectedManifestation] =
    useState<ManifestationWorkPageFragment>()
  const searchParams = useSearchParams()
  const { isEditionHidden, isLoadingAvailability, isAvailabilityUnknown } =
    useEditionAvailability(workId)
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
  // Without server data the server rendered the loading state, but a modal
  // opened from the URL can fetch the work before this hydrates. Keep the
  // loading state until hydration so the markup matches the server.
  const isAwaitingHydration = !hasServerData && !isHydrated

  if (!isAwaitingHydration && !isLoading && (!data || !data.work)) {
    notFound()
  }

  const work = data?.work
  const bestRepresentation = work?.manifestations?.bestRepresentation
  const allManifestations = work?.manifestations?.all

  const manifestations = useMemo(() => {
    if (!allManifestations) return []

    return filterManifestationsByEdition(
      filterManifestationsByMaterialType(filterMaterialTypes(allManifestations))
    )
  }, [allManifestations]) as ManifestationWorkPageFragment[]

  const searchParamsMaterialType = searchParams.get("type")

  // Newest first, minus the ones the kommune cannot supply.
  const obtainableEditions = useMemo(
    () =>
      getEditionsForMaterialType(
        (allManifestations ?? []) as ManifestationWorkPageFragment[],
        searchParamsMaterialType ?? ""
      ).filter(manifestation => !isEditionHidden(manifestation)),
    // isEditionHidden is rebuilt every render, so the flags behind it stand
    // in for it — see the effect below for the same reasoning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allManifestations, searchParamsMaterialType, isLoadingAvailability, isAvailabilityUnknown]
  )

  // The `edition` param holds a pid. Absent, the page picks a default itself
  // and never writes it back to the url.
  const pinnedManifestation = useMemo(
    () =>
      getPinnedEditionManifestation(
        (allManifestations ?? []) as ManifestationWorkPageFragment[],
        searchParamsMaterialType ?? "",
        searchParams.get("edition")
      ),
    [allManifestations, searchParamsMaterialType, searchParams]
  )

  const { defaultManifestation: defaultObtainableEdition, isLoading: isLoadingDefaultEdition } =
    useDefaultObtainableEdition(obtainableEditions)

  // Remembers the material type whose pick is done. Its lookups share query
  // keys with every other request for the same ISBN, so one started elsewhere
  // must not read as this pick still being decided.
  const [settledMaterialType, setSettledMaterialType] = useState<string | null>(null)
  useEffect(() => {
    if (!isLoadingDefaultEdition) setSettledMaterialType(searchParamsMaterialType)
  }, [isLoadingDefaultEdition, searchParamsMaterialType])
  const isPickIdle = !isLoadingDefaultEdition
  const isPickAlreadyMade = settledMaterialType === searchParamsMaterialType
  const hasSettled = isPickIdle || isPickAlreadyMade

  // A pinned edition is the answer, so there is nothing left to wait for.
  const isWaitingForDefaultEdition = !hasSettled && !pinnedManifestation

  useEffect(() => {
    if (!searchParamsMaterialType && bestRepresentation) {
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
    // isEditionHidden is rebuilt every render, so the settle-once flags behind
    // it stand in for it and a background refetch leaves the edition alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    manifestations,
    allManifestations,
    pinnedManifestation,
    isLoadingAvailability,
    isAvailabilityUnknown,
    isLoadingDefaultEdition,
  ])

  if ((isLoading && !data) || isAwaitingHydration) {
    return <WorkPageLoading />
  }

  if (!isLoading && !work) {
    return notFound()
  }

  return (
    <div
      className="content-container mb-grid-gap-2 lg:mb-grid-gap-half flex flex-col flex-row
        flex-wrap gap-y-10">
      {work && (
        <>
          {/* The skeleton holds the header's place until the edition is
              decided, so the reader never sees one edition swapped for
              another. The info boxes stay, their edition fields showing "-"
              meanwhile. */}
          {isWaitingForDefaultEdition || !selectedManifestation ? (
            <WorkPageHeaderSkeleton />
          ) : (
            <WorkPageHeader
              manifestations={manifestations}
              work={work}
              selectedManifestation={selectedManifestation}
            />
          )}
          <InfoBox
            work={work}
            selectedManifestation={isWaitingForDefaultEdition ? undefined : selectedManifestation}
          />
          <InfoBoxDetails
            selectedManifestation={isWaitingForDefaultEdition ? undefined : selectedManifestation}
          />
        </>
      )}
    </div>
  )
}

export default WorkPageLayout
