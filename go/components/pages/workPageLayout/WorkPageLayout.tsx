"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import { ButtonSkeleton } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
import { SlideSelectSkeleton } from "@/components/shared/slideSelect/SlideSelect"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getBestRepresentationOrFallbackManifestation,
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

  const work = data?.work as WorkFullWorkPageFragment

  const manifestations = useMemo(() => {
    return filterManifestationsByEdition(
      filterManifestationsByMaterialType(
        filterMaterialTypes(work?.manifestations.all as ManifestationWorkPageFragment[])
      )
    )
  }, [work?.manifestations.all])

  useEffect(() => {
    // Get the material type from the search params
    const searchParamsMaterialType = searchParams.get("type")

    if (!searchParamsMaterialType) {
      // If no material type is specified is url params, redirect the bestRepresentation manifestation if available or a fallback manifestation
      const manifestation = getBestRepresentationOrFallbackManifestation(
        work.manifestations.bestRepresentation,
        manifestations
      )

      if (manifestation) {
        const url = resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: { type: manifestation.materialTypes[0].materialTypeGeneral.code },
        })
        router.replace(url, { scroll: false })
      }
    }

    // Filter out manifestations that don't match the search params material type
    const selectedManifestation = manifestations.find(manifestation => {
      return !!manifestation.materialTypes.find(
        materialType => materialType.materialTypeGeneral.code === searchParamsMaterialType
      )
    })

    setSelectedManifestation(selectedManifestation)
  }, [searchParams, manifestations])

  if (isLoading && !data) {
    return (
      <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
        <WorkPageSkeleton />
      </div>
    )
  }

  if (!isLoading && !work) {
    return notFound()
  }

  return (
    <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
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

export const WorkPageSkeleton = () => {
  return (
    <div className="lg:grid-go mt-5">
      <div className="col-span-4 h-auto lg:order-2">
        <div className="h-auto w-full flex-col items-center justify-center lg:aspect-4/5">
          <CoverPictureSkeleton />
        </div>
        <div className="flex w-full justify-center pt-12">
          <SlideSelectSkeleton />
        </div>
      </div>
      <div className="pt-grid-gap-3 col-span-4 flex flex-col items-start justify-end lg:pt-0">
        <div className="bg-background-skeleton h-[46px] w-full animate-pulse rounded-md lg:mt-0" />
        <div className="mt-grid-gap-2 bg-background-skeleton h-[13px] w-[50%] animate-pulse rounded-md lg:mt-7" />
      </div>
      <div className="mt-grid-gap-3 col-span-4 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  )
}

export default WorkPageLayout
