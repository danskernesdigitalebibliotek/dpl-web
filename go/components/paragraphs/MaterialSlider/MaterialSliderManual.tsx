"use client"

import React from "react"

import { ParagraphGoMaterialSliderManual } from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

import MaterialSliderNew, { MaterialSliderSkeleton } from "./MaterialSliderNew"

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

  return <MaterialSliderNew works={data?.complexSearch.works} title={titleOptional} />
}

export default MaterialSliderManual
