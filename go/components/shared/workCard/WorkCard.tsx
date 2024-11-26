import Link from "next/link"
import React from "react"

import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/covers"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromWork } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifier } from "@/lib/rest/publizon-api/generated/publizon"

import { Badge } from "../badge/Badge"
import { CoverPicture } from "../coverPicture/CoverPicture"
import WorkCardAvailabilityRow from "./WorkCardAvailabilityRow"
import { displayCreators, getAllWorkPids } from "./helper"

type WorkCardProps = {
  work: WorkTeaserSearchPageFragment
}

const WorkCard = ({ work }: WorkCardProps) => {
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [getAllWorkPids(work).join(", ")],
    sizes: [
      "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })
  const isbns = getIsbnsFromWork(work)
  const shouldQueryBeEnabled = () => {
    return isbns && isbns.length > 0
  }
  const { data: dataPublizon } = useGetV1ProductsIdentifier(isbns[0] || "", {
    query: {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      enabled: shouldQueryBeEnabled(),
    },
  })

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

  return (
    <Link
      className="block space-y-3 lg:space-y-5"
      href={resolveUrl({ type: "work", routeParams: { wid: work.workId } })}>
      <div>
        <div
          key={work.workId}
          className="relative flex aspect-4/5 h-auto w-full flex-col rounded-base bg-background-overlay px-[15%] pt-[15%]">
          {!!dataPublizon?.product?.costFree && (
            <Badge variant={"blue-title"} className="absolute left-4 top-4 md:left-4 md:top-4">
              BLÅ
            </Badge>
          )}
          <div className="relative mx-auto flex h-full w-full items-center justify-center">
            {!isLoadingCovers && (
              <CoverPicture
                lowResSrc={lowResCover || ""}
                src={coverSrc?.[0] || ""}
                alt={`${work.titles.full[0]} cover billede`}
                withTilt
              />
            )}
          </div>
          <div className="my-auto flex min-h-[15%] items-center py-3 md:py-4">
            <WorkCardAvailabilityRow materialTypes={work.materialTypes} />
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

export const WorkCardGhost = () => {
  return (
    <div className="space-y-3 lg:space-y-5">
      <div className="w-full animate-pulse rounded-base bg-background-overlay">
        <div className="aspect-4/5 px-[15%] pt-[15%]"></div>
        <div className="py-3 md:py-4">
          <div className="h-6 md:h-10"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 animate-pulse rounded-base bg-background-overlay lg:h-7"></div>
        <div className="h-3 animate-pulse rounded-base bg-background-overlay lg:h-4"></div>
      </div>
    </div>
  )
}

export default WorkCard
