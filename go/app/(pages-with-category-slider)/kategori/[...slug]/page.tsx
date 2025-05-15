import React from "react"

import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import { NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getEntityFromPageData } from "@/lib/helpers/dpl-cms-content"
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
  const entity = getEntityFromPageData(data)

  return (
    <RedirectNotFoundOrRenderPage data={data} pageType="NodeGoCategory">
      <CategoryPageLayout pageData={entity as NodeGoCategory} />
    </RedirectNotFoundOrRenderPage>
  )
}

export default page
