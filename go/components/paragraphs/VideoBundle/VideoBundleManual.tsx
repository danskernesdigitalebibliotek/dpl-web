"use client"

import React from "react"

import VideoBundle, { VideoBundleSkeleton } from "@/components/paragraphs/VideoBundle/VideoBundle"
import {
  MediaVideotool,
  ParagraphGoVideoBundleManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

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
  const { paragraphRef, paragraphIsInView } = useParagraphDataLazyLoading()
  const { data, isLoading } = useComplexSearchForWorkTeaserQuery(
    {
      cql: videoBundleWorkIds?.map(id => `workId=${id.work_id}`).join(" OR ") || "",
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: paragraphIsInView && !!videoBundleWorkIds }
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

export default VideoBundleManual
