import React from "react"

import { ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

import { ParagraphErrorBoundary } from "./paragraphErrorBoundary/paragraphErrorBoundary"
import ParagraphGoVideo from "./paragraphGoVideo/ParagraphGoVideo"

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
    if (DynamicComponentType === null) return null

    return (
      <ParagraphErrorBoundary key={index}>
        {/* @ts-ignore TODO: figure out how to type dynamically imported components */}
        <DynamicComponentType key={index} {...paragraph} />
      </ParagraphErrorBoundary>
    )
  })
}

export default ParagraphResolver
