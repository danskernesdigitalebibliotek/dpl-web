import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"

function BasicPageLayout({ pageData }: { pageData: NodeGoPage }) {
  const { paragraphs } = pageData

  if (!paragraphs) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-paragraph-spacing">
      <ParagraphResolver paragraphs={paragraphs} />
    </div>
  )
}

export default BasicPageLayout
