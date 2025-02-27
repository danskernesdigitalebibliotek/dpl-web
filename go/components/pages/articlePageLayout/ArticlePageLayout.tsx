import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoArticle } from "@/lib/graphql/generated/dpl-cms/graphql"

function ArticlePageLayout({ pageData }: { pageData: NodeGoArticle }) {
  const { paragraphs } = pageData

  if (!paragraphs) {
    return null
  }

  return (
    <div className="">
      <h1 className="text-4xl font-bold">{pageData.title}</h1>a
      <p className="text-lg">{pageData.subtitle}</p>
      <div className="gap-y-paragraph-spacing flex w-full flex-col">
        <ParagraphResolver paragraphs={paragraphs} />
      </div>
    </div>
  )
}

export default ArticlePageLayout
