"use client"

import React from "react"

import WorkCard, { WorkCardGhost } from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => (
        <div key={work.workId} className="col-span-3 lg:col-span-4">
          <WorkCard work={work} />
        </div>
      ))}
    </div>
  )
}

export const SearchResultsGhost = () => {
  const ghostItems = Array.from({ length: 6 })

  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {ghostItems.map((_, index) => (
        <div className="col-span-3 lg:col-span-4" key={index}>
          <WorkCardGhost />
        </div>
      ))}
    </div>
  )
}

export default SearchResults
