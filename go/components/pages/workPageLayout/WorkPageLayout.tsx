"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import {
  getBestRepresentation,
  getManifestationByMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { ButtonSkeleton } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import { SlideSelectSkeleton } from "@/components/shared/slideSelect/SlideSelect"
import { GetMaterialQuery, useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

type WorkPageLayoutProps = {
  workId: string
  dehydratedQueryData: GetMaterialQuery | undefined
}

function WorkPageLayout({ workId, dehydratedQueryData }: WorkPageLayoutProps) {
  const searchParams = useSearchParams()
  const { data, isLoading } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: useGetMaterialQuery.fetcher({ wid: workId }),
    initialData: dehydratedQueryData,
  })
  const { selectedManifestation, setSelectedManifestation } = useSelectedManifestationStore()

  // Cleanup at unmount
  useEffect(() => {
    return () => {
      setSelectedManifestation(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!data || !data.work) return
    if (selectedManifestation) return

    // Select work manifestation on the initial load - 1. by URL params, 2. by best representation
    if (!!searchParams.get("type")) {
      setSelectedManifestation(
        getManifestationByMaterialType(data.work, searchParams.get("type") as string) ||
          getBestRepresentation(data.work)
      )
    } else {
      setSelectedManifestation(getBestRepresentation(data.work))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifestation])

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
      <WorkPageHeader work={data.work} />
      <InfoBox work={data.work} />
      {/* <WorkPageDetails /> */}
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
