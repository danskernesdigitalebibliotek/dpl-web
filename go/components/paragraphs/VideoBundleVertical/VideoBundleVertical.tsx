"use client"

import CarouselSlider from "@/components/shared/carouselSlider/CarouselSlider"
import type { ParagraphGoVideoBundleVerticalManual as VideoBundleVerticalManualType } from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export type VideoBundleVerticalProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  title: VideoBundleVerticalManualType["goVideoTitle"]
  videoUrl: string
}

const VideoBundleVertical = ({ works, title, videoUrl }: VideoBundleVerticalProps) => {
  return (
    <div className="bg-background-overlay">
      <div className="content-container">
        <div className="py-paragraph-spacing w-full">
          <h2 className="text-typo-heading-2 mb-paragraph-spacing text-center">{title}</h2>
          <div className="grid-go items-start">
            <div
              className="xl:-translate-x-grid-column-quarter xl:ml-grid-column-half
                lg:-translate-x-grid-column-quarter lg:ml-grid-column-half col-span-4 col-start-2
                lg:col-span-5 lg:col-start-2 xl:col-span-4 xl:col-start-3">
              <div className="rounded-base relative aspect-9/16 w-full overflow-hidden">
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
            </div>
            <CarouselSlider
              works={works}
              className="xl:translate-x-grid-column-quarter lg:translate-x-grid-column-quarter
                lg:col-span-4 lg:col-start-7 xl:col-span-3 xl:col-start-7"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const VideoBundleVerticalSkeleton = () => {
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
              className="rounded-base bg-background-skeleton relative aspect-9/16 w-full max-w-sm
                animate-pulse self-center overflow-hidden lg:w-[50%] lg:max-w-none"
            />
            <div
              className="gap-grid-gap flex w-full flex-row flex-wrap items-center justify-center
                lg:w-[50%] lg:justify-end lg:pl-4">
              <div className="md:ml-grid-column-2 mr-auto h-[24px] w-[24px] rounded-full lg:hidden" />
              <div
                className="bg-background-skeleton rounded-base relative aspect-5/7 w-[177px]
                  animate-pulse md:w-[250px]"
              />
              <div className="md:mr-grid-column-2 ml-auto h-[24px] w-[24px] rounded-full lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundleVertical
