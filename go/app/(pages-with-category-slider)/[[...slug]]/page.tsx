import { isEmpty } from "lodash"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import React, { Suspense } from "react"

import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import PageLoading from "@/components/shared/pageLoading/PageLoading"
import { DPL_CMS_CONTENT_CACHE_TAG } from "@/lib/config/dpl-cms/cacheTags"
import goConfig from "@/lib/config/goConfig"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getEntityFromPageData, loadPageData } from "@/lib/helpers/dpl-cms-content"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

async function getPage(slug: string[]) {
  "use cache"
  // Umbrella tag so a single revalidation can drop every cached page. The
  // per-node tags below stay for targeted, per-content invalidation.
  cacheTag(DPL_CMS_CONTENT_CACHE_TAG)

  const {
    go: { cacheTags },
    ...data
  } = await loadPageData({
    contentPath: slug ? slug.join("/") : goConfig("routes.frontpage"),
    type: "page",
  })

  if (isEmpty(data)) {
    notFound()
  }

  if (cacheTags) {
    // eslint-disable-next-line no-console
    console.log("------- Storing [page] cacheTags -----", cacheTags)
    cacheTag(...cacheTags)
  }

  return { go: { cacheTags }, ...data }
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

  if (data.route?.__typename === "RouteInternal") {
    const { title } = data.route.entity as NodeGoPage

    return setPageMetadata(title)
  }

  return null
}

async function BasicPage(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)
  const entity = getEntityFromPageData(data)

  return (
    <RedirectNotFoundOrRenderPage data={data} pageType="NodeGoPage">
      <BasicPageLayout pageData={entity as NodeGoPage} />
    </RedirectNotFoundOrRenderPage>
  )
}

async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <BasicPage params={params} />
    </Suspense>
  )
}

export default Page
