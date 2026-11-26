import React from "react"

import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import WorkTeaser from "./WorkTeaser"
import { getWorkTeaserProps } from "./helper"

// A work teaser with two tilted cards behind it.
const WorkTeaserStacked = ({ work }: { work: WorkTeaserSearchPageFragment }) => {
  const { workTitle, creators, url, manifestations, linkedManifestations } =
    getWorkTeaserProps(work)

  return (
    <div className="relative">
      <div
        className="rounded-base dark:bg-background-overlay-solid shadow-stacked-card absolute top-0
          right-0 left-0 aspect-5/7 w-full rotate-3"
      />
      <div
        className="rounded-base dark:bg-background-overlay-solid shadow-stacked-card absolute top-0
          right-0 left-0 aspect-5/7 w-full -rotate-3"
      />
      <WorkTeaser
        key={work.workId}
        workTitle={workTitle}
        creators={creators}
        url={url}
        manifestations={manifestations}
        linkedManifestations={linkedManifestations}
        className="block h-full w-full"
        captionClassName="pointer-events-auto relative h-auto overflow-visible text-center
          opacity-100 lg:text-left"
        cardClassName="bg-background dark:bg-background-overlay-solid shadow-stacked-card"
        isWithTilt={false}
      />
    </div>
  )
}

export default WorkTeaserStacked
