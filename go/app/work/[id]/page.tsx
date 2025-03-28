import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getBearerTokenServerSide } from "@/lib/helpers/tokens"
import { getSession } from "@/lib/session/session"

const createServerQueryFn = async <TQuery, TVariables>(
  fetcher: (variables: TVariables, options?: RequestInit["headers"]) => () => Promise<TQuery>,
  variables: TVariables,
  options?: RequestInit["headers"]
) => {
  const session = await getSession()
  const bearerToken = await getBearerTokenServerSide("fbi", session)

  return fetcher(variables, { ...options, Authorization: `Bearer ${bearerToken}` })
}

async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params

  const queryClient = getQueryClient()
  const decodedWid = decodeURIComponent(id)

  await queryClient.prefetchQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: decodedWid }),
    queryFn: await createServerQueryFn(useGetMaterialQuery.fetcher, {
      wid: decodedWid,
    }),
  })

  // Dehydrate the query data after ensuring it is fetched
  const dehydratedState = dehydrate(queryClient)
  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkPageLayout workId={decodedWid} />
    </HydrationBoundary>
  )
}

export const dynamic = "force-dynamic"

export default Page
