import React from "react"

import { ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

import ParagraphGoVideo from "./Video/Video"
import ParagraphGoVideoBundleAutomatic from "./VideoBundle/VideoBundle"
import ParagraphGoVideoBundleManual from "./VideoBundle/VideoBundle"
import { ParagraphErrorBoundary } from "./paragraphErrorBoundary/paragraphErrorBoundary"

function ParagraphResolver({ paragraphs }: { paragraphs: ParagraphUnion[] }) {
  const components = {
    ParagraphGoVideo,
    ParagraphGoVideoBundleAutomatic,
    ParagraphGoVideoBundleManual,
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
