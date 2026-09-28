"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading from "@/components/pages/workPageLayout/WorkPageLoading"
import { parseEditionChoice } from "@/components/shared/editionsSelectModal/editionChoice"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
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

function WorkPageLayout({ workId }: { workId: string }) {
  const router = useRouter()
  const { data, isLoading } = useGetMaterialQuery({
    wid: workId,
  })
  const [selectedManifestation, setSelectedManifestation] =
    useState<ManifestationWorkPageFragment>()
  const searchParams = useSearchParams()
  const { isEditionHidden, isLoadingAvailability, isAvailabilityUnknown } =
    useEditionAvailability(workId)

  if (!isLoading && (!data || !data.work)) {
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

  useEffect(() => {
    // Get the material type from the search params
    const searchParamsMaterialType = searchParams.get("type")

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
      typeof editionChoice === "object" ? editionChoice.pid : null
    )

    // "Nyeste" has to mean the newest edition the kommune can actually supply,
    // or the page would show an edition the picker leaves out of its grid and
    // does not describe. Editions come back newest first, so the first one
    // that is not hidden is the pick. Falls back to the default when
    // availability says nothing yet, which is also what it says while loading.
    const newestObtainable = getEditionsForMaterialType(
      (allManifestations ?? []) as ManifestationWorkPageFragment[],
      searchParamsMaterialType ?? ""
    ).find(manifestation => !isEditionHidden(manifestation))

    // `manifestations.find` is cast to a non-nullable type above, so it can
    // hand back undefined for a material type that has no manifestation. Keep
    // the last good pick rather than clearing the page in that case.
    const nextManifestation = pinnedManifestation ?? newestObtainable ?? defaultManifestation
    if (nextManifestation) {
      setSelectedManifestation(nextManifestation)
    }
    // isEditionHidden is rebuilt every render, so the effect depends on the
    // flags behind it instead. Both are one-shots rather than per-refetch
    // signals: the pick is made once and not revised if holdings change later
    // in the session, since re-running on every background refetch would swap
    // the displayed edition under the reader. isAvailabilityUnknown covers the
    // one case the loading flag cannot - a request that failed and then
    // succeeded on retry. There the first pick was made knowing nothing, so
    // the retry is the first real answer and has to be acted on, or the page
    // can sit on an edition the picker leaves out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    manifestations,
    allManifestations,
    isLoadingAvailability,
    isAvailabilityUnknown,
  ])

  if (isLoading && !data) {
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
