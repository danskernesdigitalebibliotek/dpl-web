"use client"

import Link from "next/link"
import React from "react"

import WorkCard, { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  sortManifestationsBySortPriority,
} from "../workPageLayout/helper"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
}

const SearchResults = ({ works }: SearchResultProps) => {
  return (
    <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
      {works.map(work => {
        const manifestations = sortManifestationsBySortPriority(
          filterManifestationsByEdition(
            filterManifestationsByMaterialType(filterMaterialTypes(work.manifestations.all))
          )
        )
        const manifestation = getEbookManifestationOrFallbackManifestation(
          work.manifestations.bestRepresentation,
          manifestations
        )

        const title = work.titles.full[0]
        const url = manifestation
          ? resolveUrl({
              routeParams: { work: "work", wid: work.workId },
              queryParams: {
                type: manifestation.materialTypes[0].materialTypeGeneral.code,
              },
            })
          : ""

        return (
          <div key={work.workId} className="col-span-3 lg:col-span-4">
            <Link
              prefetch={false}
              aria-label={`Tilgå værket ${title} af ${displayCreators(work.creators, 1)}`}
              className="focus-visible"
              href={url}>
              <WorkCardWithCaption title={title} creators={work.creators || []}>
                {manifestation ? (
                  <WorkCard
                    workId={work.workId}
                    title={title}
                    bestRepresentation={manifestation}
                    manifestations={manifestations}
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
