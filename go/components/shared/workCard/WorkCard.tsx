"use client"

import { useQueries } from "@tanstack/react-query"
import React from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { getAllWorkPids } from "@/components/shared/workCard/helper"
import goConfig from "@/lib/config/goConfig"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import {
  getGetV1ProductsIdentifierQueryKey,
  getV1ProductsIdentifier,
} from "@/lib/rest/publizon-api/generated/publizon"

export type WorkCardProps = {
  work: WorkTeaserSearchPageFragment
  className?: string
  isWithTilt?: boolean
}

const WorkCard = ({ work, className, isWithTilt = false }: WorkCardProps) => {
  const manifestations = work.manifestations.all
  const bestRepresentation = work.manifestations.bestRepresentation
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [bestRepresentation.pid],
    sizes: [
      "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })

  // for each manifestation, get publizon data and add to array
  // TODO: in storybook, request don't work, so we need make a mock request using fishery
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

  return (
    <div
      key={work.workId}
      className={cn(
        `rounded-base bg-background-overlay relative mb-6 flex aspect-5/7 w-full flex-col overflow-hidden
        px-[15%] pt-[15%]`,
        className
      )}>
      {isSomeManifestationTypeCostFree || isSomeMaterialTypePodcast ? (
        <Badge variant={"blue-title"} className="absolute top-4 left-4 md:top-4 md:left-4">
          BLÅ
        </Badge>
      ) : null}
      <div className="relative mx-auto flex aspect-5/7 h-full w-full">
        <div className="h-full w-full">
          {!isLoadingCovers && (
            <CoverPicture
              lowResSrc={lowResCover || ""}
              src={coverSrc?.[0] || ""}
              alt={`${work.titles.full[0]} cover billede`}
              withTilt={isWithTilt}
              className="select-none"
            />
          )}
        </div>
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
  )
}

export const WorkCardSkeleton = () => {
  return (
    <div className="h-full w-full space-y-3 lg:space-y-5">
      <div className="rounded-base bg-background-skeleton w-full animate-pulse">
        <div className="aspect-5/7 px-[15%] pt-[15%]"></div>
      </div>
      <div className="space-y-2">
        <div className="rounded-base bg-background-skeleton h-5 animate-pulse lg:h-7"></div>
        <div className="rounded-base bg-background-skeleton h-3 animate-pulse lg:h-4"></div>
      </div>
    </div>
  )
}

export const WorkCardEmpty = () => {
  return (
    <div className="h-full w-full space-y-3 lg:space-y-5">
      <div className="rounded-base bg-background-skeleton w-full">
        <div className="flex aspect-4/5 w-full flex-col items-center justify-center">
          <Icon
            name="question-mark"
            className="text-foreground opacity-20"
            aria-label="Spørgsmålstegn ikon"
          />
          <p className="text-typo-caption text-center">Kunne ikke vises</p>
        </div>
        <div className="py-3 md:py-4">
          <div className="h-6 md:h-10"></div>
        </div>
      </div>
    </div>
  )
}

export default WorkCard
