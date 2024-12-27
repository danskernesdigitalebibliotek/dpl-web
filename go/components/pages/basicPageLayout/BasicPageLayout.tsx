import React from "react"

import ParagraphResolver from "@/components/paragraphs/ParagraphResolver"
import { NodeGoPage } from "@/lib/graphql/generated/dpl-cms/graphql"

function BasicPageLayout({ pageData }: { pageData: NodeGoPage }) {
  const { paragraphs } = pageData

  return (
    <div className="flex flex-col gap-y-paragraph-spacing">
      <ParagraphResolver paragraphs={paragraphs ?? []} />
    </div>
  )
}

export default BasicPageLayout
