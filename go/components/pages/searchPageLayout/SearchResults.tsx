"use client"

import React from "react"

import WorkCard from "@/components/shared/workCard/WorkCard"
import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: SearchWithPaginationQuery["search"]["works"]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)] md:grid-cols-3">
      {works.map(work => (
        <WorkCard key={work.workId} work={work} />
      ))}
    </div>
  )
}

export default SearchResults
