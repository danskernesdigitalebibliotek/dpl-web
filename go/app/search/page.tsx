import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import SearchPageLayout from '@/components/pages/searchPageLayout/SearchPageLayout'

import {
  prefetchSearchFacets,
  prefetchSearchResult
} from './fetchSearchResult.server'
import { Suspense } from 'react'
import getQueryClient from '@/lib/getQueryClient'

const Page = async ({
  searchParams: { q }
}: {
  searchParams: { q: string }
}) => {
  const queryClient = getQueryClient()
  await prefetchSearchResult(q, queryClient)
  await prefetchSearchFacets(q, queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPageLayout searchQuery={q} />
    </HydrationBoundary>
  )
}

export default Page
