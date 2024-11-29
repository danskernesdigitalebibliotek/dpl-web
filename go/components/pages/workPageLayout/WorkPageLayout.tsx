"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import React, { useEffect } from "react"

import { GetMaterialQuery, useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import WorkPageHeader from "./WorkPageHeader"
import { getBestRepresentation } from "./helper"

type WorkPageLayoutProps = {
  workId: string
  dehydratedQueryData: GetMaterialQuery | undefined
}

function WorkPageLayout({ workId, dehydratedQueryData }: WorkPageLayoutProps) {
  const { data, isLoading } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: useGetMaterialQuery.fetcher({ wid: workId }),
    initialData: dehydratedQueryData,
  })
  const pageContainerClasses =
    "content-container my-grid-gap-2 flex-row flex-wrap space-y-grid-gap-2 lg:space-y-grid-gap-1 lg:my-grid-gap-half"
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
    // Select on the initial load
    if (!selectedManifestation) {
      setSelectedManifestation(getBestRepresentation(data.work))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifestation])

  if (isLoading && !data) {
    return <div className={pageContainerClasses}>Loading...</div>
  }

  if (!data || !data.work) {
    notFound()
  }

  return (
    <div className={pageContainerClasses}>
      <WorkPageHeader work={data.work} />
      {/* <WorkPageDescription /> */}
      {/* <WorkPageDetails /> */}
    </div>
  )
}

export default WorkPageLayout
