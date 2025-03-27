"use client"

import { useQuery } from "@tanstack/react-query"
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

function WorkPageLayout({ workId }: { workId: string }) {
  const [selectedManifestation, setSelectedManifestation] =
    useState<ManifestationWorkPageFragment>()
  const searchParams = useSearchParams()

  const { data, isLoading } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: useGetMaterialQuery.fetcher({ wid: workId }),
  })

  if (!data || !data.work) {
    notFound()
  }

  const work = data.work as WorkFullWorkPageFragment
  const manifestations = work.manifestations.all

  // filter out manifestations that not digital except physical books
  const filteredManifestationsByAccessType = manifestations.filter(manifestation => {
    if (manifestation.materialTypes[0].materialTypeGeneral.code === "BOOKS") {
      return true
    }

    return manifestation.accessTypes[0].code !== "PHYSICAL"
  })

  useEffect(() => {
    const searchParamsMaterialType = searchParams.get("type")

    // filter out manifestations that don't match the search params material type
    const filteredManifestations = filteredManifestationsByAccessType.filter(manifestation => {
      return manifestation.materialTypes[0].materialTypeGeneral.code === searchParamsMaterialType
    })

    if (!filteredManifestations.length) return notFound()

    // get the manifestation that has the newest edition
    const latestManifestationEdition = filteredManifestationsByAccessType.reduce(
      (latest, current) => {
        const latestEdition = latest.edition?.publicationYear?.year || 0
        const currentEdition = current.edition?.publicationYear?.year || 0

        return latestEdition > currentEdition ? latest : current
      },
      filteredManifestations[0]
    )

    // set the selected manifestation in the state
    setSelectedManifestation(latestManifestationEdition)
  }, [filteredManifestationsByAccessType, searchParams])

  if (isLoading && !data) {
    return (
      <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
        <WorkPageSkeleton />
      </div>
    )
  }

  if (!data || !data.work) {
    notFound()
  }

  return (
    <div className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap">
      {selectedManifestation && (
        <>
          <WorkPageHeader
            manifestations={filteredManifestationsByAccessType}
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
