import { notFound } from "next/navigation"
import React from "react"

import loadPage from "@/app/[[...slug]]/loadPage"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import goConfig from "@/lib/config/goConfig"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

async function getPage(slug: string[]) {
  if (!slug) {
    return await loadPage(goConfig("routes.frontpage"))
  }
  const slugString = slug.join("/")
  return await loadPage(slugString)
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

  if (data.route?.__typename === "RouteInternal") {
    const { title } = data.route.entity as NodeGoPage

    return setPageMetadata(title)
  }
}

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

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

  return <BasicPageLayout pageData={pageData as NodeGoPage} />
}

export default page
