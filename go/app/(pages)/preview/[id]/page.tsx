import { Metadata } from "next"
import { notFound } from "next/navigation"
import React, { Suspense } from "react"

import CategorySliderLayout from "@/app/(pages-with-category-slider)/layout"
import ArticlePageLayout, {
  TArticlePageLayoutProps,
} from "@/components/pages/articlePageLayout/ArticlePageLayout"
import BasicPageLayout from "@/components/pages/basicPageLayout/BasicPageLayout"
import CategoryPageLayout from "@/components/pages/categoryPageLayout/CategoryPageLayout"
import { NodeGoCategory, NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import loadPreviewPage from "./loadPreviewPage"

export const metadata: Metadata = setPageMetadata("Preview")

async function PreviewPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { token } = searchParams as { token: string | undefined }
  const { id } = params

  if (!id || !token) {
    return notFound()
  }

  const data = await loadPreviewPage({
    id: id,
    token: token,
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

async function Page(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <Suspense>
      <PreviewPage {...props} />
    </Suspense>
  )
}

export default Page
