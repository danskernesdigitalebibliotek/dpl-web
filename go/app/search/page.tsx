import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Suspense } from "react"

import SearchPageLayout from "@/components/pages/searchPageLayout/SearchPageLayout"
import getQueryClient from "@/lib/getQueryClient"

import { prefetchSearchFacets, prefetchSearchResult } from "./fetchSearchResult.server"

const Page = async ({ searchParams: { q } }: { searchParams: { q: string } }) => {
  const queryClient = getQueryClient()
  await prefetchSearchResult(q, queryClient)
  await prefetchSearchFacets(q, queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <SearchPageLayout />
      </Suspense>
    </HydrationBoundary>
  )
}

export default Page
