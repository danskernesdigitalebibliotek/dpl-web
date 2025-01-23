"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import { ButtonSkeleton } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
import { SlideSelectSkeleton } from "@/components/shared/slideSelect/SlideSelect"
import {
  Manifestation,
  Work,
  WorkFullWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

function WorkPageLayout({ workId }: { workId: string }) {
  const [selectedManifestation, setSelectedManifestation] = useState<Manifestation>()
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

  useEffect(() => {
    const searchParamsMaterialType = searchParams.get("type")

    // filter out manifestations that don't match the search params material type
    const filteredManifestations = manifestations.filter(manifestation => {
      return manifestation.materialTypes[0].materialTypeGeneral.code === searchParamsMaterialType
    })

    if (!filteredManifestations.length) return notFound()

    // get the manifestation that has the newest edition
    const latestManifestationEdition = filteredManifestations.reduce((latest, current) => {
      const latestEdition = latest.edition?.publicationYear?.year || 0
      const currentEdition = current.edition?.publicationYear?.year || 0

      return latestEdition > currentEdition ? latest : current
    }, filteredManifestations[0]) as Manifestation

    // set the selected manifestation in the state
    setSelectedManifestation(latestManifestationEdition)
  }, [manifestations, searchParams])

  if (isLoading && !data) {
    return (
      <div className="content-container my-grid-gap-2 flex-row flex-wrap lg:my-grid-gap-half">
        <WorkPageSkeleton />
      </div>
    )
  }

  if (!data || !data.work) {
    notFound()
  }

  return (
    <div className="content-container my-grid-gap-2 flex-row flex-wrap lg:my-grid-gap-half">
      {selectedManifestation && (
        <>
          <WorkPageHeader work={work} selectedManifestation={selectedManifestation} />
          <InfoBox work={data.work} selectedManifestation={selectedManifestation} />
          <InfoBoxDetails work={data.work} selectedManifestation={selectedManifestation} />
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
      <div className="col-span-4 flex flex-col items-start justify-end pt-grid-gap-3 lg:pt-0">
        <div className="h-[46px] w-full animate-pulse rounded-md bg-background-skeleton lg:mt-0" />
        <div className="mt-grid-gap-2 h-[13px] w-[50%] animate-pulse rounded-md bg-background-skeleton lg:mt-7" />
      </div>
      <div className="col-span-4 mt-grid-gap-3 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  )
}

export default WorkPageLayout
