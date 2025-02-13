"use client"

import Link from "next/link"
import React from "react"

import { WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => {
        const bestRepresentation = work.manifestations.bestRepresentation
        return (
          <div key={work.workId} className="col-span-3 lg:col-span-4">
            <Link
              href={resolveUrl({
                routeParams: { work: "work", wid: work.workId },
                queryParams: { type: bestRepresentation.materialTypes[0].materialTypeGeneral.code },
              })}>
              <WorkCardWithCaption work={work} isWithTilt />
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export const SearchResultsSkeleton = () => {
  const skeletonItems = Array.from({ length: 6 })

  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {skeletonItems.map((_, index) => (
        <div className="col-span-3 lg:col-span-4" key={index}>
          <WorkCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export default SearchResults
