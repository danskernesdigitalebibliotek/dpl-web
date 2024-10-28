import Image from "next/image"
import Link from "next/link"
import React from "react"

import { useGetCoverCollection } from "@/lib/cover-service-api/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/cover-service-api/model"
import { WorkTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getRandomContentColorClass } from "@/lib/helper"
import { cn } from "@/lib/utils"

import Icon from "../icon/Icon"
import WorkCardAvailabilityRow from "./WorkCardAvailabilityRow"
import { displayCreators, getAllWorkPids, getCoverUrls } from "./helper"

type WorkCardProps = {
  work: WorkTeaserFragment
}

const WorkCard = ({ work }: WorkCardProps) => {
  const { data } = useGetCoverCollection({
    type: "pid",
    identifiers: getAllWorkPids(work),
    sizes: [
      "small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })
  const bestRepresentation = work.manifestations.bestRepresentation
  const allPids = [bestRepresentation.pid, ...getAllWorkPids(work)]
  const coverSrc = getCoverUrls(data, allPids || [], [
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
        <div key={work.workId} className="rounded-sm bg-background-overlay p-2 md:p-4">
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
