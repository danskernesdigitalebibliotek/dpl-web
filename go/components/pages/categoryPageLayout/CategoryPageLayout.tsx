import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"

function CategoryPageLayout({ pageData }: { pageData: NodeGoCategory }) {
  const { paragraphs } = pageData

  return (
    <div className="gap-y-paragraph-spacing flex flex-col">
      <div className="content-container gap-y-paragraph-spacing grid-go">
        <h1
          className="text-typo-heading-1 xs:text-typo-huge md:px-grid-column-half col-span-full
            text-center">
          {pageData.title}
        </h1>
      </div>
      {paragraphs && (
        <div className="gap-y-paragraph-spacing flex w-full flex-col">
          <ParagraphResolver paragraphs={paragraphs} />
        </div>
      )}
    </div>
  )
}

export default CategoryPageLayout
