"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading from "@/components/pages/workPageLayout/WorkPageLoading"
import { parseEditionChoice } from "@/components/shared/editionsSelectModal/editionChoice"
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

  // The candidates the default-edition pick is drawn from: newest first,
  // with the kommune's unobtainable ones left out.
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

  // The newest obtainable edition renders immediately — it needs no network
  // round trip — and is swapped for the newest blue one if the Publizon
  // lookups behind it land one. No loading state: the page never blocks on
  // these, it just quietly upgrades the pick.
  const { defaultManifestation: defaultObtainableEdition } =
    useDefaultObtainableEdition(obtainableEditions)

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

    // The edition choice is serialized in the url query params, so the correct
    // edition is shown for the selected manifestation.
    const editionChoice = parseEditionChoice(searchParams.get("edition"))
    const pinnedManifestation = getPinnedEditionManifestation(
      (allManifestations ?? []) as ManifestationWorkPageFragment[],
      searchParamsMaterialType ?? "",
      editionChoice?.pid ?? null
    )

    // defaultManifestation is cast non-nullable above but can be undefined,
    // so keep the last good pick rather than clearing the page.
    const nextManifestation =
      pinnedManifestation ?? defaultObtainableEdition ?? defaultManifestation
    if (nextManifestation) {
      setSelectedManifestation(nextManifestation)
    }
    // isEditionHidden is rebuilt every render, so the flags behind it stand
    // in for it. Both settle once, so a background refetch does not swap the
    // edition under the reader; isAvailabilityUnknown catches an error that
    // later succeeds, which is the first real answer. defaultObtainableEdition
    // itself re-runs this once its Publizon lookups upgrade the pick to the
    // newest blue edition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    manifestations,
    allManifestations,
    isLoadingAvailability,
    isAvailabilityUnknown,
    defaultObtainableEdition,
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
      {work && selectedManifestation && (
        <>
          <WorkPageHeader
            manifestations={manifestations}
            work={work}
            selectedManifestation={selectedManifestation}
          />
          <InfoBox work={work} selectedManifestation={selectedManifestation} />
          <InfoBoxDetails selectedManifestation={selectedManifestation} />
        </>
      )}
    </div>
  )
}

export default WorkPageLayout
