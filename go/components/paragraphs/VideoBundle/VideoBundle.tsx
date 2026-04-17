"use client"

import CarouselSlider from "@/components/shared/carouselSlider/CarouselSlider"
import { cyKeys } from "@/cypress/support/constants"
import type {
  ParagraphGoVideoBundleAutomatic as VideoBundleAutomaticType,
  ParagraphGoVideoBundleManual as VideoBundleManualType,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export type VideoBundleProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  title: VideoBundleAutomaticType["goVideoTitle"] | VideoBundleManualType["goVideoTitle"]
  videoUrl: string
}

const VideoBundle = ({ works, title, videoUrl }: VideoBundleProps) => {
  return (
    <div className="bg-background-overlay" data-cy={cyKeys["video-bundle"]}>
      <div className="content-container">
        <div className="py-paragraph-spacing w-full">
          <h2 className="text-typo-heading-2 mb-paragraph-spacing text-center">{title}</h2>
          <div className="grid-go items-start">
            <div
              className="rounded-base relative col-span-full aspect-16/9 overflow-hidden
                lg:col-span-9 lg:mb-0">
              <iframe
                title={title || "Video"}
                aria-label={title || "Video"}
                className="absolute inset-0 h-full w-full"
                src={videoUrl}
                allowFullScreen
                allow="autoplay; fullscreen"
                loading="lazy"
              />
            </div>
            <CarouselSlider works={works} className="lg:col-span-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const VideoBundleSkeleton = () => {
  return (
    <div className="bg-background-skeleton">
      <div className="content-container">
        <div className="gap-paragraph-spacing-inner w-full py-4 text-center md:py-12 lg:py-16">
          <div
            className="bg-background-skeleton mr-auto mb-4 ml-auto block h-10 w-36 animate-pulse
              rounded-full md:mb-10 lg:w-72"
          />
          <div className="flex w-full flex-col items-start gap-11 lg:flex-row lg:gap-0">
            <div
              className="rounded-base bg-background-skeleton relative aspect-16/9 w-full
                animate-pulse overflow-hidden lg:w-[75%]"
            />
            <div
              className="gap-grid-gap flex w-full flex-row flex-wrap items-center justify-center
                lg:w-[25%] lg:justify-end lg:pl-4">
              <div className="md:ml-grid-column-2 mr-auto h-[24px] w-[24px] rounded-full lg:hidden" />
              <div
                className="bg-background-skeleton rounded-base relative aspect-4/9 h-[250px]
                  w-[177px] animate-pulse md:aspect-3/5 md:w-[300px] lg:h-[450px]"
              />
              <div className="md:mr-grid-column-2 ml-auto h-[24px] w-[24px] rounded-full lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundle
