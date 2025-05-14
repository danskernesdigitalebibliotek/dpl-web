import { notFound, redirect } from "next/navigation"
import React from "react"

import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import goConfig from "@/lib/config/goConfig"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import loadPage from "./loadPage"

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

  return null
}

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)
  const routeType = data.route?.__typename

  if (routeType === "RouteRedirect") {
    if (data.route?.url) {
      return redirect(data.route.url)
    }
  }
  if (routeType === "RouteExternal") {
    // TODO: implement external route redirect
    return null
  }
  if (routeType === "RouteInternal") {
    const { entity } = data.route ?? {}
    if (entity?.__typename === "NodeGoPage") {
      return <BasicPageLayout pageData={entity as NodeGoPage} />
    }
  }

  return notFound()
}

export default page
