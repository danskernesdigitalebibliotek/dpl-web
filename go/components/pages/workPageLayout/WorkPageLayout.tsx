"use client"

import { useQuery } from "@tanstack/react-query"
import React, { useEffect } from "react"

import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import WorkPageHeader from "./WorkPageHeader"
import { getBestRepresentation } from "./helper"

type WorkPageLayoutProps = {
  workId: string
}

function WorkPageLayout({ workId }: WorkPageLayoutProps) {
  const { data, isLoading } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: useGetMaterialQuery.fetcher({ wid: workId }),
  })
  const pageContainerClasses =
    "content-container my-grid-gap-2 flex-row flex-wrap space-y-grid-gap-2"
  const { selectedManifestation, setSelectedManifestation } = useSelectedManifestationStore()

  useEffect(() => {
    if (!data || !data.work) return
    if (!selectedManifestation) {
      setSelectedManifestation(getBestRepresentation(data.work))
    }
    // We only want to check whether selectedManifestation is empty whenever the value changes + on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifestation])

  if (isLoading && !data) {
    return <div className={pageContainerClasses}>Loading...</div>
  }

  if (!data || !data.work) {
    return <div className={pageContainerClasses}>So sorry page</div>
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
