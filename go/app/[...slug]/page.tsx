import { notFound } from "next/navigation"
import React from "react"

import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import {
  GetPageByPathDocument,
  GetPageByPathQuery,
  NodeGoPage,
} from "@/lib/graphql/generated/dpl-cms/graphql"

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params

  const { slug } = params

  const data = await fetcher<GetPageByPathQuery, { path: string }>(GetPageByPathDocument, {
    path: slug.join("/"),
  })()

  const routeType = data.route?.__typename

  if (routeType === "RouteRedirect") {
    // TODO: implement redirect
    return
  }

  if (routeType === "RouteExternal") {
    // TODO: implement external route redirect
    return
  }

  if (!routeType || !data?.route?.entity) {
    return notFound()
  }

  const pageData = data.route.entity

  return <BasicPageLayout pageData={pageData as NodeGoPage} />
}

export default page
