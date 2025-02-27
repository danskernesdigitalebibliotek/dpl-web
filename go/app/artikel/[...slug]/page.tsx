import { notFound } from "next/navigation"
import React, { Suspense } from "react"

import loadArticle from "@/app/artikel/[...slug]/loadArticle"
import ArticlePageLayout from "@/components/pages/articlePageLayout/ArticlePageLayout"
import { GetArticleByPathQuery, NodeGoArticle } from "@/lib/graphql/generated/dpl-cms/graphql"

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const { slug } = params

  const slugString = slug.join("/")

  const data: GetArticleByPathQuery = await loadArticle(slugString)

  const routeType = data.route?.__typename

  console.log({ data, routeType })

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

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ArticlePageLayout pageData={pageData as NodeGoArticle} />
    </Suspense>
  )
}

export default page
