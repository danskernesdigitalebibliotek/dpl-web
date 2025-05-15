import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import React from "react"
import { not } from "xstate"

import WorkPageLayout from "@/components/pages/workPageLayout/WorkPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import { useGetPreviewPageByIddQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { createServerQueryFn } from "@/lib/helpers/bearer-token"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Preview")

async function Page(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { token } = searchParams as { token: string | undefined }
  const { slug } = params

  console.log("searchParams")

  console.log("params", params)
  console.log("slug", slug)

  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery({
    queryKey: useGetPreviewPageByIddQuery.getKey({ id: slug, token: token || "" }),
    queryFn: useGetPreviewPageByIddQuery.fetcher({ id: slug, token: token || "" }),
  })

  console.log("data", data)

  if (!data) {
    return notFound()
  }

  const pageType = data?.__typename

  // Dehydrate the query data after ensuring it is fetched
  // const dehydratedState = dehydrate(queryClient)
  // return (
  //   <HydrationBoundary state={dehydratedState}>
  //     <WorkPageLayout workId={workId} />
  //   </HydrationBoundary>
  // )
}

export const dynamic = "force-dynamic"

export default Page
