import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import React from "react"

import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import { NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getEntityFromPageData, loadPageData } from "@/lib/helpers/dpl-cms-content"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

async function getPage(slug: string[]) {
  "use cache"
  const {
    go: { cacheTags },
    ...data
  } = await loadPageData({
    contentPath: slug.join("/"),
    type: "category",
  })

  if (cacheTags) {
    // eslint-disable-next-line no-console
    console.log("------- Storing [category] cacheTags -----", cacheTags)
    cacheTag(...cacheTags)
  }

  return { go: { cacheTags }, ...data }
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
