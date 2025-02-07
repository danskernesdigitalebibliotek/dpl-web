"use client"

import { useQueries } from "@tanstack/react-query"
import Link from "next/link"
import React from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import goConfig from "@/lib/config/goConfig"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import {
  getGetV1ProductsIdentifierQueryKey,
  getV1ProductsIdentifier,
} from "@/lib/rest/publizon-api/generated/publizon"

import { Badge } from "../badge/Badge"
import { CoverPicture } from "../coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "./MaterialTypeIconWrapper"
import { getAllWorkPids } from "./helper"

export type WorkCardProps = {
  work: WorkTeaserSearchPageFragment
  classNameWrapper?: string
  className?: string
  isHidden?: boolean
  zIndex?: number
  stackPosition?: number
}

const WorkCard = ({
  work,
  classNameWrapper,
  className,
  isHidden,
  zIndex,
  stackPosition,
}: WorkCardProps) => {
  const manifestations = work.manifestations.all
  const bestRepresentationManifestation = work.manifestations.bestRepresentation
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [bestRepresentationManifestation.pid],
    sizes: [
      "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })

  // for each manifestation, get publizon data and add to array
  const manifestationsWithPublizonData = useQueries({
    queries: manifestations.map(manifestation => {
      const isbn =
        manifestation.identifiers.find(identifier => identifier.type === "ISBN")?.value || ""

      return {
        queryKey: getGetV1ProductsIdentifierQueryKey(isbn),
        queryFn: () => getV1ProductsIdentifier(isbn),
      }
    }),
    combine: results => {
      // combine manifestation data with publizon data
      return manifestations.map((manifestation, index) => ({
        manifestation,
        publizonData: results[index].data?.product,
      }))
    },
  })

  // if any of the manifestations are the same material type filter out based on newest edition
  // TODO: isolate this logic to a helper function and test it
  const filteredManifestations = manifestationsWithPublizonData.reduce(
    (acc, current) => {
      const existing = acc.find(
        item =>
          item.manifestation.materialTypes[0].materialTypeGeneral.code ===
          current.manifestation.materialTypes[0].materialTypeGeneral.code
      )
      if (!existing) {
        acc.push(current)
      } else {
        const existingEdition = existing.manifestation.edition?.publicationYear?.year || 0
        const currentEdition = current.manifestation.edition?.publicationYear?.year || 0
        if (currentEdition > existingEdition) {
          acc = acc.filter(
            item =>
              item.manifestation.materialTypes[0].materialTypeGeneral.code !==
              current.manifestation.materialTypes[0].materialTypeGeneral.code
          )
          acc.push(current)
        }
      }
      return acc
    },
    [] as typeof manifestationsWithPublizonData
  )

  const bestRepresentation = work.manifestations.bestRepresentation
  const allPids = [bestRepresentation.pid, ...getAllWorkPids(work)]
  const coverSrc = getCoverUrls(dataCovers, allPids || [], [
    "default",
    "original",
    "large",
    "medium-large",
    "medium",
    "small-medium",
    "small",
    "xx-small",
  ])

  const lowResCover = getLowResCoverUrl(dataCovers)

  const isSomeMaterialTypePodcast = work.materialTypes.some(materialType => {
    return materialType?.materialTypeGeneral?.code === "PODCASTS"
  })

  const isSomeManifestationTypeCostFree = filteredManifestations.some(
    manifestation => manifestation.publizonData?.costFree
  )

  // sort manifestations by materialTypeSortPriority
  const sortedManifestations = filteredManifestations.sort((a, b) => {
    return (
      goConfig("materialtypes.sortpriority").indexOf(
        a.manifestation.materialTypes[0].materialTypeGeneral.code
      ) -
      goConfig("materialtypes.sortpriority").indexOf(
        b.manifestation.materialTypes[0].materialTypeGeneral.code
      )
    )
  })

  // Get the best representation manifestation material type code for link url
  const bestRepresentationManifestationMaterialTypeCode =
    bestRepresentationManifestation.materialTypes[0].materialTypeGeneral.code

  return (
    <Link
      className={cn("block space-y-3 lg:space-y-5", classNameWrapper)}
      href={resolveUrl({
        routeParams: { work: "work", wid: work.workId },
        queryParams: { type: bestRepresentationManifestationMaterialTypeCode },
      })}
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
      style={{ zIndex }}>
      <div className={cn({ "relative mb-6": !!stackPosition })}>
        <div
          key={work.workId}
          className={cn(
            "rounded-base bg-background-overlay relative flex aspect-4/5 h-auto w-full flex-col px-[15%] pt-[15%]",
            className
          )}>
          {isSomeManifestationTypeCostFree || isSomeMaterialTypePodcast ? (
            <Badge variant={"blue-title"} className="absolute top-4 left-4 md:top-4 md:left-4">
              BLÅ
            </Badge>
          ) : null}
          <div className="relative mx-auto flex h-full w-full items-center justify-center">
            {!isLoadingCovers && (
              <CoverPicture
                lowResSrc={lowResCover || ""}
                src={coverSrc?.[0] || ""}
                alt={`${work.titles.full[0]} cover billede`}
                withTilt={!stackPosition}
                className="select-none"
              />
            )}
          </div>
          <div className="my-auto flex min-h-[15%] items-center py-3 md:py-4">
            <div className="flex w-full flex-row justify-center gap-2">
              {/* Loop through all manifestation types */}
              {sortedManifestations.map(manifestation => {
                // find material type general material type
                const materialType =
                  manifestation.manifestation.materialTypes[0].materialTypeGeneral.code
                const materialTypeIcon = getIconNameFromMaterialType(materialType) || "book"

                const isCostFree = manifestation.publizonData?.costFree
                const isPodcast = materialType === "PODCASTS"

                return (
                  <MaterialTypeIconWrapper
                    key={manifestation.manifestation.pid}
                    costFree={isCostFree || isPodcast}
                    iconName={materialTypeIcon}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("space-y-2", { hidden: stackPosition !== 0 })}>
        <p
          className={cn("mr-grid-column-half text-typo-subtitle-lg break-words", {
            "overflow-scroll lg:max-h-[72px]": !!stackPosition,
          })}>
          {work.titles.full[0]}
        </p>
        <p className="text-typo-caption opacity-60">{displayCreators(work.creators, 2)}</p>
      </div>
    </Link>
  )
}

export const WorkCardSkeleton = () => {
  return (
    <div className="space-y-3 lg:space-y-5">
      <div className="rounded-base bg-background-skeleton w-full animate-pulse">
        <div className="aspect-4/5 px-[15%] pt-[15%]"></div>
        <div className="py-3 md:py-4">
          <div className="h-6 md:h-10"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-base bg-background-skeleton h-5 animate-pulse lg:h-7"></div>
        <div className="rounded-base bg-background-skeleton h-3 animate-pulse lg:h-4"></div>
      </div>
    </div>
  )
}

export default WorkCard
