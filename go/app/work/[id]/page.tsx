import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { cookies } from "next/headers"
import React from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import CategorySliderTrigger from "@/components/shared/categorySliderTrigger/CategorySliderTrigger"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { createServerQueryFn } from "@/lib/helpers/bearer-token"

async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const cookieStore = await cookies()

  const queryClient = getQueryClient()
  const workId = decodeURIComponent(id)

  await queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: await createServerQueryFn({
      fetcher: useGetMaterialQuery.fetcher,
      variables: { wid: workId },
      cookieStore,
    }),
  })

  // Dehydrate the query data after ensuring it is fetched
  const dehydratedState = dehydrate(queryClient)
  return (
    <HydrationBoundary state={dehydratedState}>
      <CategorySliderTrigger showCategorySlider={false} />
      <WorkPageLayout workId={workId} />
    </HydrationBoundary>
  )
}

export const dynamic = "force-dynamic"

export default Page
