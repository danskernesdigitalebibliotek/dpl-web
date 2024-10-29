import Image from "next/image"
import Link from "next/link"
import React from "react"

import { WorkTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

import WorkCardAvailabilityRow from "./WorkCardAvailabilityRow"
import { displayCreators } from "./helper"

type WorkCardProps = {
  work: WorkTeaserFragment
}

const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <div className="mb-4">
      <Link href={`/work/${work.workId}`}>
        <div key={work.workId} className="rounded-sm bg-background-overlay p-2 md:p-4">
          <div
            className="px-auto relative mx-auto mb-3 mt-6 flex aspect-[166/228] w-[calc(100%-76px-4px)] items-center
              rounded-sm shadow-coverPicture md:mb-6 md:mt-9 md:w-[calc(100%-106px)]">
            <Image
              // TODO: dynamic image
              src="https://i.pinimg.com/564x/b0/4a/b2/b04ab2de27591aee4a76015e42e0e282.jpg"
              alt="work image"
              layout="responsive"
              width={166}
              height={228}
              className="overflow-hidden rounded-sm"
            />
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
