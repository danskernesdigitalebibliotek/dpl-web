import React from "react"

import loadArticle from "@/app/(pages)/artikel/[...slug]/loadArticle"
import RedirectNotFoundOrRenderPage from "@/components/global/dplCmsPage/RedirectNotFoundOrRenderPage"
import ArticlePageLayout, {
  TArticlePageLayoutProps,
} from "@/components/pages/articlePageLayout/ArticlePageLayout"
import { getEntityFromPageData } from "@/lib/helpers/dpl-cms-content"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

async function getPage(slug: string[]) {
  const slugString = slug.join("/")
  return await loadArticle(slugString)
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)

  if (data.route?.__typename === "RouteInternal") {
    const { title } = data.route.entity as TArticlePageLayoutProps

    return setPageMetadata(title)
  }
}

async function page(props: { params: Promise<{ slug: string[] }> }) {
  const data = await getPage((await props.params).slug)
  const entity = getEntityFromPageData(data)

  return (
    <RedirectNotFoundOrRenderPage data={data} pageType="NodeGoArticle">
      <ArticlePageLayout pageData={entity as TArticlePageLayoutProps} />
    </RedirectNotFoundOrRenderPage>
  )
}

export default page
