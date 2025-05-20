import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import React, { Suspense } from "react"

import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import ArticlePageLayout, {
  TArticlePageLayoutProps,
} from "@/components/pages/articlePageLayout/ArticlePageLayout"
import { getEntityFromPageData, loadPageData } from "@/lib/helpers/dpl-cms-content"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

async function getPage(slug: string[]) {
  "use cache"
  const {
    go: { cacheTags },
    ...data
  } = await loadPageData({
    contentPath: slug.join("/"),
    type: "article",
  })

  if (cacheTags) {
    // eslint-disable-next-line no-console
    console.log("------- Storing [article] cacheTags -----", cacheTags)
    cacheTag(...cacheTags)
  }

  return { go: { cacheTags }, ...data }
}

type TArticlePageProps = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: TArticlePageProps) {
  const data = await getPage((await params).slug)

  if (data.route?.__typename === "RouteInternal") {
    const { title } = data.route.entity as TArticlePageLayoutProps

    return setPageMetadata(title)
  }
}

async function ArticlePage({ params }: TArticlePageProps) {
  const data = await getPage((await params).slug)
  const entity = getEntityFromPageData(data)

  return (
    <RedirectNotFoundOrRenderPage data={data} pageType="NodeGoArticle">
      <ArticlePageLayout pageData={entity as TArticlePageLayoutProps} />
    </RedirectNotFoundOrRenderPage>
  )
}

async function Page({ params }: TArticlePageProps) {
  return (
    <Suspense>
      <ArticlePage params={params} />
    </Suspense>
  )
}

export default Page
