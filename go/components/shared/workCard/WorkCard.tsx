import Link from "next/link"
import React from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import {
  GeneralMaterialTypeCodeEnum,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { Product } from "@/lib/rest/publizon-api/generated/model"
import { useGetV1ProductsIdentifier } from "@/lib/rest/publizon-api/generated/publizon"

import { Badge } from "../badge/Badge"
import { CoverPicture } from "../coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "./MaterialTypeIconWrapper"
import { getAllWorkPids } from "./helper"

type WorkCardProps = {
  work: WorkTeaserSearchPageFragment
}

type TManifestationsWithPublizonData = Array<{
  isbn: string
  data?: Product
}>

const WorkCard = ({ work }: WorkCardProps) => {
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [getAllWorkPids(work).join(", ")],
    sizes: [
      "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })

  const manifestations = work.manifestations.all

  // for each manifestation, get publizon data and add to array
  const manifestationsWithPublizonData = manifestations.map(manifestation => {
    // Get ISBN from manifestation
    const isbn =
      manifestation.identifiers.find(identifier => identifier.type === "ISBN")?.value || ""

    const { data } = useGetV1ProductsIdentifier(isbn, {
      query: {
        // Publizon / useGetV1ProductsIdentifier is responsible for online
        // materials. It requires an ISBN to do lookups.
        enabled: isbn.length > 0,
      },
    })

    const publizonData = data?.product
    return { manifestation, publizonData }
  })

  console.log("manifestationsWithPublizonData", manifestationsWithPublizonData)

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

  const isSomeMaterialTypePodcast = work.materialTypes.some(
    materialType => materialType?.materialTypeGeneral?.code === GeneralMaterialTypeCodeEnum.Podcasts
  )

  const isSomeManifestationTypeCostFree = manifestationsWithPublizonData.some(
    manifestation => manifestation.publizonData?.costFree
  )

  return (
    <Link
      className="block space-y-3 lg:space-y-5"
      href={resolveUrl({ routeParams: { work: "work", wid: work.workId } })}>
      <div>
        <div
          key={work.workId}
          className="relative flex aspect-4/5 h-auto w-full flex-col rounded-base bg-background-overlay px-[15%] pt-[15%]">
          {isSomeManifestationTypeCostFree || isSomeMaterialTypePodcast ? (
            <Badge variant={"blue-title"} className="absolute left-4 top-4 md:left-4 md:top-4">
              BLÅ
            </Badge>
          ) : null}
          <div className="relative mx-auto flex h-full w-full items-center justify-center">
            {!isLoadingCovers && (
              <CoverPicture
                lowResSrc={lowResCover || ""}
                src={coverSrc?.[0] || ""}
                alt={`${work.titles.full[0]} cover billede`}
                withTilt
                className="select-none"
              />
            )}
          </div>
          <div className="my-auto flex min-h-[15%] items-center py-3 md:py-4">
            <div className="flex w-full flex-row justify-center gap-2">
              {/* Loop through all manifestation types */}
              {manifestationsWithPublizonData.map(manifestationWithPublizonData => {
                const isCostFree = manifestationWithPublizonData.publizonData?.costFree
                // find material type general material type
                const materialType =
                  manifestationWithPublizonData.manifestation.materialTypes[0].materialTypeGeneral
                    .code
                const materialTypeIcon = getIconNameFromMaterialType(materialType) || "book"

                return (
                  <MaterialTypeIconWrapper
                    key={manifestationWithPublizonData.manifestation.pid}
                    costFree={isCostFree}
                    iconName={materialTypeIcon}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="mr-grid-column-half break-words text-typo-subtitle-lg">
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
      <div className="w-full animate-pulse rounded-base bg-background-skeleton">
        <div className="aspect-4/5 px-[15%] pt-[15%]"></div>
        <div className="py-3 md:py-4">
          <div className="h-6 md:h-10"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 animate-pulse rounded-base bg-background-skeleton lg:h-7"></div>
        <div className="h-3 animate-pulse rounded-base bg-background-skeleton lg:h-4"></div>
      </div>
    </div>
  )
}

export default WorkCard
