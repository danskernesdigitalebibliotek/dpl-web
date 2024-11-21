import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type PageProps = {
  params: {
    id: string
  }
}

function Page({ params: { id } }: PageProps) {
  const queryClient = getQueryClient()

  const decodedWid = decodeURIComponent(id)

  queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: decodedWid }),
    queryFn: useGetMaterialQuery.fetcher({ wid: decodedWid }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkPageLayout workId={decodedWid} />
    </HydrationBoundary>
  )
}

export default Page
