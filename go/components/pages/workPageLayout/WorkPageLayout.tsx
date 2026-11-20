"use client"

import { notFound } from "next/navigation"
import React, { useMemo, useSyncExternalStore } from "react"

import WorkPageHeader from "@/components/pages/workPageLayout/WorkPageHeader"
import WorkPageLoading, {
  WorkPageHeaderSkeleton,
} from "@/components/pages/workPageLayout/WorkPageLoading"
import InfoBox from "@/components/shared/infoBox/InfoBox"
import InfoBoxDetails from "@/components/shared/infoBox/InfoBoxDetails"
import { useSelectedEdition } from "@/hooks/useSelectedEdition"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
} from "./helper"

const subscribeNoop = () => () => {}

function WorkPageLayout({ workId, hasServerData }: { workId: string; hasServerData: boolean }) {
  const { data, isLoading } = useGetMaterialQuery({
    wid: workId,
  })
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
  // Without server data the server rendered the loading state, but a modal
  // opened from the URL can fetch the work before this hydrates. Keep the
  // loading state until hydration so the markup matches the server.
  const isAwaitingHydration = !hasServerData && !isHydrated

  if (!isAwaitingHydration && !isLoading && (!data || !data.work)) {
    notFound()
  }

  const work = data?.work
  const allManifestations = work?.manifestations?.all as ManifestationWorkPageFragment[] | undefined

  const manifestations = useMemo(() => {
    if (!allManifestations) return []

    return filterManifestationsByEdition(
      filterManifestationsByMaterialType(filterMaterialTypes(allManifestations))
    )
  }, [allManifestations]) as ManifestationWorkPageFragment[]

  const { selectedManifestation, isWaitingForDefaultEdition } = useSelectedEdition({
    workId,
    work,
    manifestations,
    allManifestations,
  })

  if ((isLoading && !data) || isAwaitingHydration) {
    return <WorkPageLoading />
  }

  if (!isLoading && !work) {
    return notFound()
  }

  return (
    <div
      className="content-container mb-grid-gap-2 lg:mb-grid-gap-half flex flex-col flex-row
        flex-wrap gap-y-10">
      {work && (
        <>
          {/* The skeleton holds the header's place until the edition is
              decided, so the reader never sees one edition swapped for
              another. The info boxes stay, their edition fields showing "-"
              meanwhile. */}
          {isWaitingForDefaultEdition || !selectedManifestation ? (
            <WorkPageHeaderSkeleton />
          ) : (
            <WorkPageHeader
              manifestations={manifestations}
              work={work}
              selectedManifestation={selectedManifestation}
            />
          )}
          <InfoBox
            work={work}
            selectedManifestation={isWaitingForDefaultEdition ? undefined : selectedManifestation}
          />
          <InfoBoxDetails
            selectedManifestation={isWaitingForDefaultEdition ? undefined : selectedManifestation}
          />
        </>
      )}
    </div>
  )
}

export default WorkPageLayout
