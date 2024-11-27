import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { GetMaterialQuery, useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type PageProps = {
  params: {
    id: string
  }
}

async function Page({ params: { id } }: PageProps) {
  const queryClient = getQueryClient()
  const decodedWid = decodeURIComponent(id)

  // Wait for the query to finish fetching before dehydrating
  await queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: decodedWid }),
    queryFn: useGetMaterialQuery.fetcher({ wid: decodedWid }),
  })

  // Dehydrate the query data after ensuring it is fetched
  const dehydratedState = dehydrate(queryClient)

  // Get the preloaded data from the query client
  const dehydratedQueryData: GetMaterialQuery | undefined = queryClient.getQueryData(
    useGetMaterialQuery.getKey({ wid: decodedWid })
  )

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkPageLayout
        key={decodedWid}
        workId={decodedWid}
        dehydratedQueryData={dehydratedQueryData}
      />
    </HydrationBoundary>
  )
}

export default Page
