"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading, {
  WorkPageHeaderSkeleton,
} from "@/components/pages/workPageLayout/WorkPageLoading"
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

  // The edition the url pins, if it names one this material type has. Shared
  // by the effect below, which picks it over any default, and by the header's
  // loading gate, which has nothing to wait for once it exists.
  const pinnedManifestation = useMemo(
    () =>
      getPinnedEditionManifestation(
        (allManifestations ?? []) as ManifestationWorkPageFragment[],
        searchParamsMaterialType ?? "",
        parseEditionChoice(searchParams.get("edition"))?.pid ?? null
      ),
    [allManifestations, searchParamsMaterialType, searchParams]
  )

  // The page waits for this before showing anything edition-dependent: the
  // reader should never see the newest edition and then have it swapped for
  // the newest blue one underneath them — the first thing shown must already
  // be the right default.
  const { defaultManifestation: defaultObtainableEdition, isLoading: isLoadingDefaultEdition } =
    useDefaultObtainableEdition(obtainableEditions)

  // A pinned edition is the answer already, so the lookups behind the default
  // pick have nothing left to decide and the header need not wait for them.
  const isWaitingForDefaultEdition = isLoadingDefaultEdition && !pinnedManifestation

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
    // isEditionHidden is rebuilt every render, so the flags behind it stand
    // in for it. Both settle once, so a background refetch does not swap the
    // edition under the reader; isAvailabilityUnknown catches an error that
    // later succeeds, which is the first real answer. isLoadingDefaultEdition
    // is the same kind of settle-once signal for the Publizon lookups behind
    // defaultObtainableEdition.
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
          {/* The header waits for the default-edition pick, reserving its space
              with the header skeleton meanwhile: it never shows the newest
              edition only to swap it for the newest blue one underneath the
              reader. A url-pinned edition skips that wait — it is already the
              answer. The skeleton is the containerless variant, since this div
              is already the content-container. The description comes from the
              work and does not depend on the pick, so it renders regardless;
              the fields that do depend on it fall back to "-" until it
              settles. */}
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
