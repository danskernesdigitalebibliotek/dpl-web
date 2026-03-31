"use client"

import React from "react"

import VideoBundleVertical, {
  VideoBundleVerticalSkeleton,
} from "@/components/paragraphs/VideoBundleVertical/VideoBundleVertical"
import {
  MediaVideotoolVertical,
  ParagraphGoVideoBundleVerticalManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

export type VideoBundleVerticalManualProps = {
  goVideoTitle: ParagraphGoVideoBundleVerticalManual["goVideoTitle"]
  embedVideo: {
    mediaVideotool1: MediaVideotoolVertical["mediaVideotool1"]
    name: MediaVideotoolVertical["name"]
  }
  videoBundleWorkIds: ParagraphGoVideoBundleVerticalManual["videoBundleWorkIds"]
}

const VideoBundleVerticalManual = ({
  goVideoTitle,
  embedVideo,
  videoBundleWorkIds,
}: VideoBundleVerticalManualProps) => {
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
      {showSkeleton && <VideoBundleVerticalSkeleton />}
      {!showSkeleton && (
        <VideoBundleVertical
          works={data?.complexSearch.works}
          title={goVideoTitle}
          videoUrl={embedVideo.mediaVideotool1}
        />
      )}
    </div>
  )
}

export default VideoBundleVerticalManual
