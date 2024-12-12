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
import InfoBox from "@/components/shared/infoBox/InfoBox"
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
        Loading...
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

export default WorkPageLayout
