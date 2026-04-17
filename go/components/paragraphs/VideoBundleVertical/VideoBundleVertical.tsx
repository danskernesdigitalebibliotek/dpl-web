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
        <div className="py-paragraph-spacing w-full">
          <div
            className="bg-background-skeleton mb-paragraph-spacing mx-auto block h-10 w-36
              animate-pulse rounded-full lg:w-72"
          />
          <div className="grid-go items-start">
            <div
              className="xl:-translate-x-grid-column-quarter xl:ml-grid-column-half
                lg:-translate-x-grid-column-quarter lg:ml-grid-column-half col-span-4 col-start-2
                lg:col-span-5 lg:col-start-2 xl:col-span-4 xl:col-start-3">
              <div
                className="rounded-base bg-background-skeleton relative aspect-9/16 w-full
                  animate-pulse overflow-hidden"
              />
            </div>
            <div
              className="xl:translate-x-grid-column-quarter lg:translate-x-grid-column-quarter
                mt-paragraph-spacing col-span-full lg:col-span-4 lg:col-start-7 lg:mt-0
                xl:col-span-3 xl:col-start-7">
              <div className="grid-go lg:pl-grid-gap-half items-center lg:block">
                <div className="col-span-1 flex justify-center lg:hidden">
                  <div className="bg-background-skeleton h-10 w-10 rounded-full" />
                </div>
                <div className="col-span-4 lg:relative lg:w-full">
                  <div
                    className="bg-background-skeleton rounded-base relative aspect-5/7 w-full
                      animate-pulse md:w-[250px] lg:w-full"
                  />
                </div>
                <div className="col-span-1 flex justify-center lg:hidden">
                  <div className="bg-background-skeleton h-10 w-10 rounded-full" />
                </div>
                <div className="hidden lg:mt-8 lg:flex lg:items-center">
                  <div className="bg-background-skeleton mr-auto h-9 w-9 animate-pulse rounded-full" />
                  <div className="space-x-grid-gap-half flex">
                    <div className="bg-background-skeleton h-10 w-10 rounded-full" />
                    <div className="bg-background-skeleton h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundleVertical
