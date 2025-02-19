"use client"

import React from "react"

import { ParagraphGoMaterialSliderManual } from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

import MaterialSlider, { MaterialSliderSkeleton } from "./MaterialSlider"

type MaterialSliderManual = {
  titleOptional: ParagraphGoMaterialSliderManual["title"]
  materialSliderWorkIds: ParagraphGoMaterialSliderManual["materialSliderWorkIds"]
}

const MaterialSliderManual = ({ titleOptional, materialSliderWorkIds }: MaterialSliderManual) => {
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: materialSliderWorkIds.map(material => `workId=${material.work_id}`).join(" OR "),
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: !!materialSliderWorkIds }
  )
  if (isLoading) return <MaterialSliderSkeleton />

  return <MaterialSlider works={data?.complexSearch.works} title={titleOptional} />
}

export default MaterialSliderManual
