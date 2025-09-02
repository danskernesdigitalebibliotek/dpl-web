import React from "react"

import { ParagraphUnion } from "@/lib/graphql/generated/dpl-cms/graphql"

import ParagraphGoImages from "./Images/Images"
import ParagraphGoMaterialSliderAutomatic from "./MaterialSlider/MaterialSliderAutomatic"
import ParagraphGoMaterialSliderManual from "./MaterialSlider/MaterialSliderManual"
import { ParagraphErrorBoundary } from "./ParagraphErrorBoundary/ParagraphErrorBoundary"
import ParagraphGoLinkbox from "./ParagraphGoLinkbox/ParagraphGoLinkbox"
import ParagraphGoTextBody from "./TextBody/TextBody"
import ParagraphGoVideo from "./Video/Video"
import ParagraphGoVideoBundleAutomatic from "./VideoBundle/VideoBundleAutomatic"
import ParagraphGoVideoBundleManual from "./VideoBundle/VideoBundleManual"

function ParagraphResolver({ paragraphs }: { paragraphs: ParagraphUnion[] }) {
  const components = {
    ParagraphGoVideo,
    ParagraphGoLinkbox,
    ParagraphGoMaterialSliderAutomatic,
    ParagraphGoMaterialSliderManual,
    ParagraphGoVideoBundleAutomatic,
    ParagraphGoVideoBundleManual,
    ParagraphGoTextBody,
    ParagraphGoImages,
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
        <DynamicComponentType {...paragraph} />
      </ParagraphErrorBoundary>
    )
  })
}

export default ParagraphResolver
