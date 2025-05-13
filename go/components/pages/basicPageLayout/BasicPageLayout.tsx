import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"

function BasicPageLayout({ pageData }: { pageData: NodeGoPage }) {
  const { paragraphs } = pageData

  return (
    <div className="gap-y-paragraph-spacing flex w-full flex-col">
      {paragraphs && <ParagraphResolver paragraphs={paragraphs} />}
    </div>
  )
}

export default BasicPageLayout
