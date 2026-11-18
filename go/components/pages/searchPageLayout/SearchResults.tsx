"use client"

import React from "react"

import { WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkTeaser from "@/components/shared/workTeaser/WorkTeaser"
import { getWorkTeaserProps } from "@/components/shared/workTeaser/helper"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
  // Works per row on large screens.
  columns?: 3 | 4
}

// Literal classes per column count, so Tailwind finds them.
const ITEM_CLASSES = {
  3: "col-span-3 lg:col-span-4",
  4: "col-span-3 lg:col-span-3",
}

const SearchResults = ({ works, columns = 3 }: SearchResultProps) => {
  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => {
        const { title, creators, url, cover, manifestations } = getWorkTeaserProps(work)
        return (
          <div key={work.workId} className={ITEM_CLASSES[columns]}>
            <WorkTeaser
              title={title}
              creators={creators}
              url={url}
              cover={cover}
              manifestations={manifestations}
            />
          </div>
        )
      })}
    </div>
  )
}

export const SearchResultsSkeleton = ({
  count = 6,
  columns = 3,
}: {
  count?: number
  columns?: 3 | 4
}) => {
  const skeletonItems = Array.from({ length: count })

  return (
    <div className="grid-go gap-y-[calc(var(--grid-gap-x)*2)]">
      {skeletonItems.map((_, index) => (
        <div className={ITEM_CLASSES[columns]} key={index}>
          <WorkCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export default SearchResults
