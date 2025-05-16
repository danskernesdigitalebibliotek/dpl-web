import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Metadata } from "next"
import { headers } from "next/headers"

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

  const queryClient = getQueryClient()
  prefetchSearchResult(q, queryClient, headersList)
  prefetchSearchFacets(q, queryClient, headersList)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPageLayout />
    </HydrationBoundary>
  )
}

async function Page(props: TSearchPageProps) {
  return <SearchPage {...props} />
}

export default Page
