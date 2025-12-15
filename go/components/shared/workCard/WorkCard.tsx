"use client"

import { useQueries } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import React, { useRef } from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import {
  getGetV1ProductsIdentifierAdapterQueryKey,
  getV1ProductsIdentifierAdapter,
} from "@/lib/rest/publizon/adapter/generated/publizon"

import Icon from "../icon/Icon"

export type TWorkCardProps = {
  workId: string
  title: string
  manifestations: ManifestationSearchPageTeaserFragment[]
  bestRepresentation: ManifestationSearchPageTeaserFragment
  className?: string
  isWithTilt?: boolean
}

const WorkCard = ({
  workId,
  title,
  manifestations,
  bestRepresentation,
  className,
  isWithTilt = false,
}: TWorkCardProps) => {
  const workCardRef = useRef(null)
  const workCardIsInView = useInView(workCardRef, {
    once: true,
  })

  // TODO: in storybook, request don't work, so we need make a mock request using fishery
  // For each manifestation, get publizon data and add to array
  const manifestationsWithPublizonData = useQueries({
    queries: manifestations.map(manifestation => {
      const isbn =
        manifestation.identifiers.find(identifier => identifier.type === "ISBN")?.value || ""

      return {
        queryKey: getGetV1ProductsIdentifierAdapterQueryKey(isbn),
        queryFn: () => getV1ProductsIdentifierAdapter(isbn),
        // If the manifestation is not online, skip the request
        enabled: workCardIsInView && manifestation.accessTypes[0].code === "ONLINE",
      }
    }),
    combine: results => {
      // combine manifestation data with publizon data
      return manifestations.map((manifestation, index) => {
        // if manifestation is not online, it doesn't have publizon data and falls back to null
        return {
          ...manifestation,
          publizonData: results[index].data?.product ?? null,
        }
      })
    },
  })

  const covers = bestRepresentation.cover

  const isSomeMaterialTypePodcast = manifestationsWithPublizonData.some(
    manifestation => manifestation.materialTypes[0].materialTypeGeneral.code === "PODCASTS"
  )

  const isSomeManifestationTypeCostFree = manifestationsWithPublizonData.some(
    manifestation => manifestation.publizonData?.costFree
  )

  return (
    <div
      ref={workCardRef}
      key={workId}
      data-cy={cyKeys["work-card"]}
      className={cn(
        `rounded-base bg-background-overlay relative mb-6 flex aspect-5/7 w-full flex-col
        overflow-hidden px-[15%] pt-[15%]`,
        className
      )}>
      {isSomeManifestationTypeCostFree || isSomeMaterialTypePodcast ? (
        <Badge variant={"blue-title"} className="absolute top-4 left-4 md:top-4 md:left-4">
          BLÅ
        </Badge>
      ) : null}
      <div className="relative mx-auto flex aspect-5/7 h-full w-full">
        <div className="h-full w-full">
          {covers && (
            <CoverPicture
              covers={covers}
              alt={`${title} cover billede`}
              withTilt={isWithTilt}
              className="select-none"
            />
          )}
        </div>
      </div>
      <div className="my-auto flex min-h-[15%] items-center py-3 md:py-4">
        <div className="flex w-full flex-row justify-center gap-2">
          {/* Loop through all manifestation types */}
          {manifestationsWithPublizonData.map(manifestation => {
            // find material type general material type
            const materialType = manifestation.materialTypes[0].materialTypeGeneral.code
            const materialTypeIcon = getIconNameFromMaterialType(materialType) || "book"
            const isCostFree = manifestation.publizonData?.costFree
            const isPodcast = materialType === "PODCASTS"

            return (
              <MaterialTypeIconWrapper
                key={manifestation.pid}
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

export const WorkCardEmpty = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        `rounded-base bg-background-overlay flex aspect-5/7 h-full w-full flex-col space-y-3
        lg:space-y-5`,
        className
      )}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-y-4">
        <Icon
          name="alert"
          className="text-foreground h-[50px] opacity-20 lg:h-[80px]"
          aria-label="Advarsel ikon"
        />
        <p className="text-typo-caption text-center opacity-55">Materialet kunne ikke vises</p>
      </div>
    </div>
  )
}

export default WorkCard
