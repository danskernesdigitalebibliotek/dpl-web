import Image from "next/image"
import Link from "next/link"
import React from "react"

import { useGetCoverCollection } from "@/lib/cover-service-api/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/cover-service-api/model"
import { WorkTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getRandomContentColorClass } from "@/lib/helpers/colors"
import { cn } from "@/lib/helpers/helper.cn"
import { getIsbnsFromWork } from "@/lib/helpers/ids"
import { useGetV1ProductsIdentifier } from "@/lib/publizon-api/publizon"

import Icon from "../icon/Icon"
import WorkCardAvailabilityRow from "./WorkCardAvailabilityRow"
import { displayCreators, getAllWorkPids, getCoverUrls } from "./helper"

type WorkCardProps = {
  work: WorkTeaserFragment
}

const WorkCard = ({ work }: WorkCardProps) => {
  const { data: dataCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [getAllWorkPids(work).join(", ")],
    sizes: [
      // TODO: These sizes should be defined in a general global config.
      "small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })
  const isbns = getIsbnsFromWork(work)

  const { data: dataPublizon } = useGetV1ProductsIdentifier(isbns[0] ?? "", {
    query: {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      enabled: isbns[0] !== null && isbns[0] !== undefined,
    },
  })

  const bestRepresentation = work.manifestations.bestRepresentation
  const allPids = [bestRepresentation.pid, ...getAllWorkPids(work)]
  const coverSrc = getCoverUrls(dataCovers, allPids || [], [
    // TODO: These sizes should be defined in a general global config.
    "default",
    "original",
    "large",
    "medium-large",
    "medium",
    "small-medium",
    "small",
  ])

  return (
    <div className="mb-4">
      <Link href={`/work/${work.workId}`}>
        <div key={work.workId} className="relative rounded-sm bg-background-overlay p-2 md:p-4">
          {!!dataPublizon?.product?.costFree && (
            <div
              className="bg-content-blue absolute left-2 top-2 rounded-full px-2 py-1 text-typo-tag-sm text-white md:left-4
                md:top-4">
              BLÅ
            </div>
          )}
          <div
            className="px-auto relative mx-auto mb-3 mt-6 flex aspect-[166/228] w-[calc(100%-76px-4px)] items-center
              rounded-sm md:mb-6 md:mt-9 md:w-[calc(100%-106px)]">
            {!!coverSrc?.length && coverSrc.length > 0 && (
              <Image
                src={coverSrc[0]}
                alt="work image"
                layout="responsive"
                width={166}
                height={228}
                className="overflow-hidden rounded-sm shadow-coverPicture"
              />
            )}
            {(!coverSrc?.length || coverSrc.length === 0) && (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-sm",
                  getRandomContentColorClass()
                )}>
                <Icon name="question-mark" className="h-[100px] text-background opacity-50" />
              </div>
            )}
          </div>
          <WorkCardAvailabilityRow materialTypes={work.materialTypes} />
        </div>
      </Link>
      <p className="mt-1 text-typo-subtitle-sm md:mt-5">{work.titles.full[0]}</p>
      <p className="mt-1 text-typo-caption opacity-50 md:mt-2">
        {displayCreators(work.creators, 2)}
      </p>
    </div>
  )
}

export default WorkCard
