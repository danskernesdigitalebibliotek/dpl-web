"use client"

import { notFound, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

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

import { filterManifestationsByEdition, filterManifestationsByMaterialType } from "./helper"

function WorkPageLayout({ workId }: { workId: string }) {
  const { data, isLoading } = useGetMaterialQuery({
    wid: workId,
  })

  const [selectedManifestation, setSelectedManifestation] =
    useState<ManifestationWorkPageFragment>()
  const searchParams = useSearchParams()

  if (!data || !data.work) {
    notFound()
  }

  const work = data?.work as WorkFullWorkPageFragment
  const manifestations = work?.manifestations.all as ManifestationWorkPageFragment[]

  // Filter out manifestations that not digital except physical books
  const filteredManifestationsByMaterialType = filterManifestationsByMaterialType(manifestations)
  // If multiple manifestations has the same type find the latest edition
  const filteredManifestationsByEdition = filterManifestationsByEdition(
    filteredManifestationsByMaterialType
  )

  useEffect(() => {
    // Get the material type from the search params
    const searchParamsMaterialType = searchParams.get("type")
    // Filter out manifestations that don't match the search params material type
    const selectedManifestation = filteredManifestationsByEdition.find(manifestation => {
      return manifestation.materialTypes[0].materialTypeGeneral.code === searchParamsMaterialType
    })

    // Set the selected manifestation in the state
    setSelectedManifestation(selectedManifestation)
  }, [filteredManifestationsByEdition, searchParams])

  if (isLoading && !data) {
    return (
      <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
        <WorkPageSkeleton />
      </div>
    )
  }

  if (!work) {
    return notFound()
  }

  return (
    <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
      {work && selectedManifestation && (
        <>
          <WorkPageHeader
            manifestations={filteredManifestationsByEdition}
            work={work}
            selectedManifestation={selectedManifestation}
          />
          <InfoBox work={data.work} selectedManifestation={selectedManifestation} />
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
