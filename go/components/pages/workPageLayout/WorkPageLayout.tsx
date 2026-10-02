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

    // "Nyeste" means the newest edition the kommune can supply, matching the
    // picker. Editions come back newest first.
    const newestObtainable = getEditionsForMaterialType(
      (allManifestations ?? []) as ManifestationWorkPageFragment[],
      searchParamsMaterialType ?? ""
    ).find(manifestation => !isEditionHidden(manifestation))

    // defaultManifestation is cast non-nullable above but can be undefined,
    // so keep the last good pick rather than clearing the page.
    const nextManifestation = pinnedManifestation ?? newestObtainable ?? defaultManifestation
    if (nextManifestation) {
      setSelectedManifestation(nextManifestation)
    }
    // isEditionHidden is rebuilt every render, so the flags behind it stand
    // in for it. Both settle once, so a background refetch does not swap the
    // edition under the reader; isAvailabilityUnknown catches an error that
    // later succeeds, which is the first real answer.
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
