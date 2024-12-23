import React from "react"

import ParagraphVideo from "@/components/paragraphs/ParagraphGoVideo/ParagraphVideo"
import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoPage, ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

function BasicPageLayout({ pageData }: { pageData: NodeGoPage }) {
  const { paragraphs } = pageData

  return (
    <div className="gap-y-paragraph-spacing flex flex-col">
      <ParagraphResolver paragraphs={paragraphs ?? []} />
    </div>
  )
}

export default BasicPageLayout
