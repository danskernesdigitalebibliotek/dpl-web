"use client"

import React from "react"

import VideoBundle, { VideoBundleSkeleton } from "@/components/paragraphs/VideoBundle/VideoBundle"
import {
  MediaVideotool,
  ParagraphGoVideoBundleManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export type VideoBundleManualProps = {
  goVideoTitle: ParagraphGoVideoBundleManual["goVideoTitle"]
  embedVideo: {
    mediaVideotool: MediaVideotool["mediaVideotool"]
    name: MediaVideotool["name"]
  }
  videoBundleWorkIds: ParagraphGoVideoBundleManual["videoBundleWorkIds"]
}

const VideoBundleManual = ({
  goVideoTitle,
  embedVideo,
  videoBundleWorkIds,
}: VideoBundleManualProps) => {
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: videoBundleWorkIds?.map(id => `workId=${id}`).join(" OR ") || "",
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: !!videoBundleWorkIds }
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

export default VideoBundleManual
