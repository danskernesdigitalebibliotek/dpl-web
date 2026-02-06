import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"

import SearchPageLayout from "@/components/pages/searchPageLayout/SearchPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import { prefetchSearchFacets, prefetchSearchResult } from "./fetchSearchResult.server"

export const metadata: Metadata = setPageMetadata("Find materialer")

type TSearchPageProps = { searchParams: Promise<{ q: string }> }

const SearchPage = async (props: TSearchPageProps) => {
  const searchParams = await props.searchParams
  const headersList = await headers()
  const { q } = searchParams

  const headersData = Object.fromEntries(headersList.entries())
  const queryClient = getQueryClient()

  prefetchSearchResult(q, queryClient, headersData)
  prefetchSearchFacets(q, queryClient, headersData)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPageLayout />
    </HydrationBoundary>
  )
}

async function Page(props: TSearchPageProps) {
  return (
    <Suspense>
      <SearchPage {...props} />
    </Suspense>
  )
}

export default Page
