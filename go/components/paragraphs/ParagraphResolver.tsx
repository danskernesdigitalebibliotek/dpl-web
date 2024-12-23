import React from "react"

import { ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

import ParagraphGoVideo from "./ParagraphGoVideo/ParagraphGoVideo"
import { ParagraphErrorBoundary } from "./paragraphErrorBoundary/paragraphErrorBoundary"

function ParagraphResolver({ paragraphs }: { paragraphs: ParagraphUnion[] }) {
  const components = {
    ParagraphGoVideo,
  }

  return paragraphs.map((paragraph, index) => {
    const type = paragraph?.__typename
    if (!type) {
      return null
    }

    const DynamicComponentType = components[type as keyof typeof components] || null

    return (
      <ParagraphErrorBoundary key={index}>
        {DynamicComponentType ? <DynamicComponentType key={index} {...paragraph} /> : null}
      </ParagraphErrorBoundary>
    )
  })
}

export default ParagraphResolver
