"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading from "@/components/pages/workPageLayout/WorkPageLoading"
import { parseEditionChoice } from "@/components/shared/editionsSelectModal/EditionsSelectModal"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
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

    setSelectedManifestation(pinnedManifestation ?? defaultManifestation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, manifestations, allManifestations])

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
