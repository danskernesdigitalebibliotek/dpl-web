"use client"

import React from "react"

import VideoBundle, { VideoBundleSkeleton } from "@/components/paragraphs/VideoBundle/VideoBundle"
import {
  MediaVideotool,
  ParagraphGoVideoBundleAutomatic,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

type VideoBundleAutomaticProps = {
  goVideoTitle: ParagraphGoVideoBundleAutomatic["goVideoTitle"]
  embedVideo: {
    mediaVideotool: MediaVideotool["mediaVideotool"]
    name: MediaVideotool["name"]
  }
  cqlSearch: ParagraphGoVideoBundleAutomatic["cqlSearch"]
  videoAmountOfMaterials: ParagraphGoVideoBundleAutomatic["videoAmountOfMaterials"]
}

const VideoBundleAutomatic = ({
  goVideoTitle,
  embedVideo,
  cqlSearch,
  videoAmountOfMaterials,
}: VideoBundleAutomaticProps) => {
  const { paragraphRef, paragraphIsInView } = useParagraphDataLazyLoading()
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: cqlSearch?.value || "",
      offset: 0,
      limit: videoAmountOfMaterials,
      filters: {},
    },
    { enabled: !!cqlSearch }
  )

  const showSkeleton = isLoading || !paragraphIsInView

  return (
    <div ref={paragraphRef}>
      {showSkeleton && <VideoBundleSkeleton />}
      {!showSkeleton && (
        <VideoBundle
          works={data?.complexSearch.works}
          title={goVideoTitle}
          videoUrl={embedVideo.mediaVideotool}
        />
      )}
    </div>
  )
}

export default VideoBundleAutomatic
