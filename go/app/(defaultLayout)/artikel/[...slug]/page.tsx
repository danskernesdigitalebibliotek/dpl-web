import { notFound } from "next/navigation"
import React from "react"

import loadArticle from "@/app/(defaultLayout)/artikel/[...slug]/loadArticle"
import ArticlePageLayout, {
  TArticlePageLayoutProps,
} from "@/components/pages/articlePageLayout/ArticlePageLayout"

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const { slug } = params
  const slugString = slug.join("/")
  const data = await loadArticle(slugString)
  const routeType = data.route?.__typename

  if (routeType === "RouteRedirect") {
    // TODO: implement redirect
    return notFound()
  }
  if (routeType === "RouteExternal") {
    // TODO: implement external route redirect
    return notFound()
  }
  if (!routeType) {
    return notFound()
  }
  if (data.route?.entity?.__typename !== "NodeGoArticle") {
    return notFound()
  }

  const pageData = data.route.entity
  return <ArticlePageLayout pageData={pageData as TArticlePageLayoutProps} />
}

export default page
