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
    <Link href={`/work/${work.workId}`}>
      <div key={work.workId} className="rounded-sm bg-background-overlay p-2 md:p-4">
        <div
          className="px-auto relative mx-auto flex aspect-[166/228] w-full items-center rounded-sm shadow-coverPicture
            md:mb-6 md:mt-9">
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
      <p className="mt-1 text-typo-subtitle-sm md:mt-5">{work.titles.full[0]}</p>
      <p className="mt-1 text-typo-caption opacity-50 md:mt-2">
        {displayCreators(work.creators, 2)}
      </p>
    </Link>
  )
}

export default WorkCard
