import { notFound } from "next/navigation"
import React from "react"

import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import { NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import loadCategoryPage from "./loadCategoryPage"

async function getPage(slug: string[]) {
  const slugString = slug.join("/")
  return await loadCategoryPage(slugString)
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

  if (data.route?.__typename === "RouteInternal") {
    const { title } = data.route.entity as NodeGoCategory

    return setPageMetadata(title)
  }

  return null
}

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

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
