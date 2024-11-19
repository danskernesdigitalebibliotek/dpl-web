import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

function Page({ params: { id } }: { params: { id: string } }) {
  const queryClient = getQueryClient()

  const decodedWid = decodeURIComponent(id)

  queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: decodedWid }),
    queryFn: useGetMaterialQuery.fetcher({ wid: decodedWid }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <WorkPageLayout wid={decodedWid} />
        <pre>{JSON.stringify(id, null, 2)}</pre>
        Page
      </div>
    </HydrationBoundary>
  )
}

export default Page
