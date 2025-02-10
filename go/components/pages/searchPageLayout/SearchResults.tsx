"use client"

import React from "react"

import WorkCard, { WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid-go gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => (
        <div key={work.workId} className="col-span-3 lg:col-span-4">
          <WorkCard work={work} />
        </div>
      ))}
    </div>
  )
}

export const SearchResultsSkeleton = () => {
  const skeletonItems = Array.from({ length: 6 })

  return (
    <div className="grid-go gap-y-[calc(var(--grid-gap-x)*2)]">
      {skeletonItems.map((_, index) => (
        <div className="col-span-3 lg:col-span-4" key={index}>
          <WorkCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export default SearchResults
