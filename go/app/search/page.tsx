import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import SearchPageLayout from '@/components/pages/searchPageLayout/SearchPageLayout'

import prefetchSearchResult from './fetchSearchResult.server'
import { Suspense } from 'react'

const Page = async ({
  searchParams: { q }
}: {
  searchParams: { q: string }
}) => {
  const queryClient = await prefetchSearchResult(q)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPageLayout searchQuery={q} />
    </HydrationBoundary>
  )
}

export default Page
