"use client"

import React from "react"

import VideoBundle, { VideoBundleSkeleton } from "@/components/paragraphs/VideoBundle/VideoBundle"
import {
  MediaVideotool,
  ParagraphGoVideoBundleAutomatic,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

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
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: cqlSearch?.value || "",
      offset: 0,
      limit: videoAmountOfMaterials,
      filters: {},
    },
    { enabled: !!cqlSearch }
  )

  if (isLoading) return <VideoBundleSkeleton />

  return (
    <VideoBundle
      works={data?.complexSearch.works}
      title={goVideoTitle}
      videoUrl={embedVideo.mediaVideotool}
    />
  )
}

export default VideoBundleAutomatic
