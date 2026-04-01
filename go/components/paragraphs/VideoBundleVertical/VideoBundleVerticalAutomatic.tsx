"use client"

import React from "react"

import VideoBundleVertical, {
  VideoBundleVerticalSkeleton,
} from "@/components/paragraphs/VideoBundleVertical/VideoBundleVertical"
import {
  MediaVideotoolVertical,
  ParagraphGoVideoBundleVerticalAuto,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { useParagraphDataLazyLoading } from "@/lib/helpers/paragraphs"

type VideoBundleVerticalAutomaticProps = {
  goVideoTitle: ParagraphGoVideoBundleVerticalAuto["goVideoTitle"]
  embedVideo: {
    mediaVideotoolVertical: MediaVideotoolVertical["mediaVideotoolVertical"]
    name: MediaVideotoolVertical["name"]
  }
  cqlSearch: ParagraphGoVideoBundleVerticalAuto["cqlSearch"]
  videoAmountOfMaterials: ParagraphGoVideoBundleVerticalAuto["videoAmountOfMaterials"]
}

const VideoBundleVerticalAutomatic = ({
  goVideoTitle,
  embedVideo,
  cqlSearch,
  videoAmountOfMaterials,
}: VideoBundleVerticalAutomaticProps) => {
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
      {showSkeleton && <VideoBundleVerticalSkeleton />}
      {!showSkeleton && (
        <VideoBundleVertical
          works={data?.complexSearch.works}
          title={goVideoTitle}
          videoUrl={embedVideo.mediaVideotoolVertical}
        />
      )}
    </div>
  )
}

export default VideoBundleVerticalAutomatic
