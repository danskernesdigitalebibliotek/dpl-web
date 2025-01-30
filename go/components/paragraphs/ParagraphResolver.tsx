import React from "react"

import { ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

import ParagraphGoLinkbox from "./ParagraphGoLinkbox/ParagraphGoLinkbox"
import ParagraphGoVideo from "./ParagraphGoVideo/ParagraphGoVideo"
import { ParagraphErrorBoundary } from "./paragraphErrorBoundary/paragraphErrorBoundary"

function ParagraphResolver({ paragraphs }: { paragraphs: ParagraphUnion[] }) {
  const components = {
    ParagraphGoVideo,
    ParagraphGoLinkbox,
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
