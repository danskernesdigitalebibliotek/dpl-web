import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Metadata } from "next"
import { cookies } from "next/headers"
import React, { Suspense } from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { createServerQueryFn } from "@/lib/helpers/bearer-token"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

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
