import React from "react"

import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

import { isOfWorkTypeCategory } from "./helper"
import WorkCardAvailabilityItem from "./WorkCardAvailabilityItem"

type WorkCardAvailabilityRowProps = {
  materialTypes: SearchWithPaginationQuery["search"]["works"][0]["materialTypes"]
}

const WorkCardAvailabilityRow = ({ materialTypes }: WorkCardAvailabilityRowProps) => {
  console.log({ materialTypes })

  return (
    <div className="mb-1 flex w-full flex-row justify-center gap-2">
      {isOfWorkTypeCategory(materialTypes, "reading") && (
        <WorkCardAvailabilityItem iconName="book" />
      )}
      {isOfWorkTypeCategory(materialTypes, "listening") && (
        <WorkCardAvailabilityItem iconName="headphones" />
      )}
      {isOfWorkTypeCategory(materialTypes, "gaming") && (
        <WorkCardAvailabilityItem iconName="controller" />
      )}
      {isOfWorkTypeCategory(materialTypes, "video") && (
        <WorkCardAvailabilityItem iconName="video" />
      )}
    </div>
  )
}

export default WorkCardAvailabilityRow
