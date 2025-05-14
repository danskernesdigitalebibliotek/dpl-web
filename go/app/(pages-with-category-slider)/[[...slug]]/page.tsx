import React from "react"

import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import goConfig from "@/lib/config/goConfig"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getEntityFromPageData } from "@/lib/helpers/dpl-cms-content"
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
  const entity = getEntityFromPageData(data)

  return (
    <RedirectNotFoundOrRenderPage data={data} pageType="NodeGoPage">
      <BasicPageLayout pageData={entity as NodeGoPage} />
    </RedirectNotFoundOrRenderPage>
  )
}

export default page
