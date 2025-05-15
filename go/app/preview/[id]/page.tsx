import { Metadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

import CategorySliderLayout from "@/app/(pages-with-category-slider)/layout"
import ArticlePageLayout, {
  TArticlePageLayoutProps,
} from "@/components/pages/articlePageLayout/ArticlePageLayout"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import getQueryClient from "@/lib/getQueryClient"
import {
  NodeGoCategory,
  NodeGoPage,
  useGetPreviewPageByIddQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Preview")

async function Page(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { token } = searchParams as { token: string | undefined }
  const { id } = params

  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery({
    queryKey: useGetPreviewPageByIddQuery.getKey({ id: id, token: token || "" }),
    queryFn: useGetPreviewPageByIddQuery.fetcher({ id: id, token: token || "" }),
  })

  if (!data) {
    return notFound()
  }

  const pageType = data?.preview?.__typename

  if (pageType === "NodeGoPage") {
    return (
      <CategorySliderLayout>
        <BasicPageLayout pageData={data.preview as NodeGoPage} />
      </CategorySliderLayout>
    )
  }

  if (pageType === "NodeGoArticle") {
    return <ArticlePageLayout pageData={data.preview as TArticlePageLayoutProps} />
  }

  if (pageType === "NodeGoCategory") {
    return (
      <CategorySliderLayout>
        <CategoryPageLayout pageData={data.preview as NodeGoCategory} />
      </CategorySliderLayout>
    )
  }

  return notFound()
}

export default Page
