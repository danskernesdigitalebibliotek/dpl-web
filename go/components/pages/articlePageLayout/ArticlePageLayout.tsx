import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import ImageBaseWithPlaceholder from "@/components/shared/image/ImageBaseWithPlaceholder"
import { Maybe, MediaImage, NodeGoArticle } from "@/lib/graphql/generated/dpl-cms/graphql"

export type TArticlePageLayoutProps = {
  goArticleImage?: Maybe<MediaImage>
} & NodeGoArticle

function ArticlePageLayout({ pageData }: { pageData: TArticlePageLayoutProps }) {
  const { paragraphs } = pageData
  const { goArticleImage } = pageData

  if (!paragraphs) {
    return null
  }

  const mediaImage = goArticleImage?.mediaImage

  const localeDateString = new Date(
    pageData.publicationDate.timestamp as string
  ).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="gap-y-paragraph-spacing flex flex-col">
      <div className="content-container gap-y-paragraph-spacing grid-go">
        <h1 className="text-typo-huge px-grid-column-half col-span-full text-center">
          {pageData.title}
        </h1>
        <div className="col-span-full">
          <div className="rounded-base relative aspect-16/9 overflow-hidden">
            <ImageBaseWithPlaceholder
              className="rounded-base"
              sizes="100vw"
              imageSizing="fillParent"
              src={mediaImage?.url || ""}
              width={mediaImage?.width || 0}
              height={mediaImage?.height || 0}
              alt={mediaImage?.alt || ""}
            />
          </div>
          <p className="text-typo-caption text-foreground/80 mt-1">{goArticleImage?.byline}</p>
        </div>

        <p className="text-typo-subtitle-lg max-w-article-max-width col-span-full mx-auto">
          {pageData.subtitle}
        </p>
        <div className="col-span-full space-y-4">
          <hr className="max-w-article-max-width mx-auto w-full" />
          <div className="max-w-article-max-width text-typo-caption mx-auto">
            {localeDateString}
          </div>
        </div>
      </div>
      <div className="gap-y-paragraph-spacing flex w-full flex-col">
        <ParagraphResolver paragraphs={paragraphs} />
      </div>
    </div>
  )
}

export default ArticlePageLayout
