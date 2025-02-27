import { notFound } from "next/navigation"
import React, { Suspense } from "react"

import loadArticle from "@/app/artikel/[...slug]/loadArticle"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const { slug } = params

  const slugString = slug.join("/")

  console.log({ slugString })

  const data = await loadArticle(slugString)

  const routeType = data.route?.__typename

  if (routeType === "RouteRedirect") {
    // TODO: implement redirect
    return null
  }

  if (routeType === "RouteExternal") {
    // TODO: implement external route redirect
    return null
  }

  if (!routeType || !data?.route?.entity) {
    return notFound()
  }

  const pageData = data.route.entity

  console.log("test server")

  console.log({ pageData })

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BasicPageLayout pageData={pageData as NodeGoPage} />
    </Suspense>
  )
}

export default page
