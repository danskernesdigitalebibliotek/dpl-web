import {
  type Patron,
  materialAvailabilityQuery,
  patronQuery,
  reservationsQuery,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Metadata } from "next"
import { cookies } from "next/headers"
import React, { Suspense } from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import { isPhysicalMaterialType } from "@/components/pages/workPageLayout/helper"
import { branchTitleQueryKey } from "@/hooks/useBranchTitle.keys"
import { getBranchTitle } from "@/lib/actions/getBranchTitle"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { createServerQueryFn, getBearerTokenServerSide } from "@/lib/helpers/bearer-token"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"
import { getFaustIdsFromManifestations } from "@/lib/helpers/ids"
import { getServiceLayerConfig } from "@/lib/helpers/service-layer"
import { getSession } from "@/lib/session/session"

export const metadata: Metadata = setPageMetadata("Materiale")

type TWorkPageProps = { params: Promise<{ id: string }> }

async function WorkPage({ params }: TWorkPageProps) {
  const { id } = await params
  const cookieStore = await cookies()

  const queryClient = getQueryClient()
  const workId = decodeURIComponent(id)

  const queryFn = await createServerQueryFn({
    fetcher: useGetMaterialQuery.fetcher,
    variables: { wid: workId },
    cookieStore,
  })

  await queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn,
  })

  // Prefetch reservation-related data for logged-in patrons so the reservation
  // modal can read from cache when it opens. Failures here are intentionally
  // swallowed: the page must still render even if FBS is unavailable.
  const session = await getSession()
  if (session.isLoggedIn) {
    const work = queryClient.getQueryData<Awaited<ReturnType<typeof queryFn>>>(
      useGetMaterialQuery.getKey({ wid: workId })
    )?.work
    const physicalManifestations =
      work?.manifestations?.all.filter(m =>
        isPhysicalMaterialType(m.materialTypes[0]?.materialTypeSpecific.code)
      ) ?? []
    const recordIds = getFaustIdsFromManifestations(physicalManifestations)
    const accessToken = await getBearerTokenServerSide("fbs", cookieStore)
    if (accessToken) {
      const config = getServiceLayerConfig(accessToken)
      await Promise.allSettled([
        queryClient.prefetchQuery(patronQuery(config)),
        recordIds.length > 0 &&
          queryClient.prefetchQuery(materialAvailabilityQuery(config, workId, recordIds)),
        queryClient.prefetchQuery(reservationsQuery(config)),
      ])

      // Prefetch the patron's pickup branch name (ISIL → title) so the
      // reservation modal renders the friendly name on first paint.
      const patron = queryClient.getQueryData<Patron | undefined>(patronQuery(config).queryKey)
      const isilId = patron?.pickupBranchId
      if (isilId) {
        await queryClient
          .prefetchQuery({
            queryKey: branchTitleQueryKey(isilId),
            queryFn: () => getBranchTitle(isilId),
          })
          .catch(() => {})
      }
    }
  }

  // Dehydrate the query data after ensuring it is fetched
  const dehydratedState = dehydrate(queryClient)
  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkPageLayout workId={workId} />
    </HydrationBoundary>
  )
}

async function Page({ params }: TWorkPageProps) {
  return (
    <Suspense>
      <WorkPage params={params} />
    </Suspense>
  )
}

export default Page
