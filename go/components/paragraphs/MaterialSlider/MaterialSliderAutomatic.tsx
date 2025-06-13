"use client"

import React from "react"

import { ParagraphGoMaterialSliderAutomatic } from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

import MaterialSlider, { MaterialSliderSkeleton } from "./MaterialSlider"

type MaterialSliderAutomatic = {
  titleOptional: ParagraphGoMaterialSliderAutomatic["title"]
  cqlSearch: ParagraphGoMaterialSliderAutomatic["cqlSearch"]
  sliderAmountOfMaterials: ParagraphGoMaterialSliderAutomatic["sliderAmountOfMaterials"]
}

const MaterialSliderAutomatic = ({
  titleOptional,
  cqlSearch,
  sliderAmountOfMaterials,
}: MaterialSliderAutomatic) => {
  const { paragraphRef, paragraphIsInView } = useParagraphDataLazyLoading()
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: cqlSearch?.value || "",
      offset: 0,
      limit: sliderAmountOfMaterials,
      filters: {},
    },
    { enabled: paragraphIsInView && !!cqlSearch }
  )

  const showSkeleton = isLoading || !paragraphIsInView

  return (
    <div ref={paragraphRef}>
      {showSkeleton && <MaterialSliderSkeleton />}
      {!showSkeleton && <MaterialSlider works={data?.complexSearch.works} title={titleOptional} />}
    </div>
  )
}

export default MaterialSliderAutomatic
