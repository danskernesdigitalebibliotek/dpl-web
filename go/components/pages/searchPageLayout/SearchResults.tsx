"use client"

import Link from "next/link"
import React from "react"

import WorkCard, { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import {
  ManifestationWorkPageFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  sortManifestationsBySortPriority,
} from "../workPageLayout/helper"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => {
        const manifestations = work.manifestations.all as ManifestationWorkPageFragment[]
        let bestRepresentation = work.manifestations
          .bestRepresentation as ManifestationWorkPageFragment

        // Filter and manifestations
        const filteredManifestations = filterManifestationsByEdition(
          filterManifestationsByMaterialType(manifestations)
        )
        // Sort manifestations
        const sortedManifestations = sortManifestationsBySortPriority(filteredManifestations)
        // check if bestRepresentation is located in the sortedManifestations
        const isBestRepresentationInSortedManifestations = sortedManifestations.some(
          manifestation => manifestation.pid === bestRepresentation.pid
        )
        // if not, set bestRepresentation to the first manifestation in sortedManifestations
        if (!isBestRepresentationInSortedManifestations) {
          bestRepresentation = sortedManifestations[0]
        }

        const title = work.titles.full[0] || ""
        const url = bestRepresentation
          ? resolveUrl({
              routeParams: { work: "work", wid: work.workId },
              queryParams: {
                type: bestRepresentation.materialTypes[0].materialTypeGeneral.code,
              },
            })
          : ""

        return (
          <div key={work.workId} className="col-span-3 lg:col-span-4">
            <Link
              aria-label={`Tilgå værket ${title} af ${displayCreators(work.creators, 1)}`}
              className="focus-visible"
              href={url}>
              <WorkCardWithCaption title={title} creators={work.creators || []}>
                {bestRepresentation ? (
                  <WorkCard
                    workId={work.workId}
                    title={title}
                    bestRepresentation={bestRepresentation}
                    manifestations={sortedManifestations}
                    isWithTilt
                  />
                ) : (
                  <WorkCardEmpty />
                )}
              </WorkCardWithCaption>
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
