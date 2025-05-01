import { notFound } from "next/navigation"
import React from "react"

import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import { NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"

import loadCategoryPage from "./loadCategoryPage"

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const { slug } = params
  const slugString = slug.join("/")
  const data = await loadCategoryPage(slugString)
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
  if (data.route?.entity?.__typename !== "NodeGoCategory") {
    return notFound()
  }

  const pageData = data.route.entity
  return <CategoryPageLayout pageData={pageData as NodeGoCategory} />
}

export default page
