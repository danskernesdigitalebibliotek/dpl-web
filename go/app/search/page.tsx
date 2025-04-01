import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { headers } from "next/headers"

import SearchPageLayout from "@/components/pages/searchPageLayout/SearchPageLayout"
import getQueryClient from "@/lib/getQueryClient"

import { prefetchSearchFacets, prefetchSearchResult } from "./fetchSearchResult.server"

const Page = async (props: { searchParams: Promise<{ q: string }> }) => {
  const searchParams = await props.searchParams
  const headersList = await headers()
  const { q } = searchParams

  const queryClient = getQueryClient()
  prefetchSearchResult(q, queryClient, headersList)
  prefetchSearchFacets(q, queryClient, headersList)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPageLayout />
    </HydrationBoundary>
  )
}

export default Page
