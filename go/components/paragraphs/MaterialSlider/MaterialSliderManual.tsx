"use client"

import React from "react"

import { ParagraphGoMaterialSliderManual } from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

import MaterialSlider, { MaterialSliderSkeleton } from "./MaterialSlider"

type MaterialSliderManual = {
  titleOptional: ParagraphGoMaterialSliderManual["title"]
  materialSliderWorkIds: ParagraphGoMaterialSliderManual["materialSliderWorkIds"]
}

const MaterialSliderManual = ({ titleOptional, materialSliderWorkIds }: MaterialSliderManual) => {
  const { paragraphRef, paragraphIsInView } = useParagraphDataLazyLoading()
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: materialSliderWorkIds.map(material => `workId=${material.work_id}`).join(" OR "),
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: paragraphIsInView && !!materialSliderWorkIds }
  )
  const showSkeleton = isLoading || !paragraphIsInView

  return (
    <div ref={paragraphRef}>
      {showSkeleton && <MaterialSliderSkeleton />}
      {!showSkeleton && <MaterialSlider works={data?.complexSearch.works} title={titleOptional} />}
    </div>
  )
}

export default MaterialSliderManual
