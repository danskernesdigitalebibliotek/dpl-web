"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import { WheelControls, defaultSliderOptions } from "@/components/paragraphs/MaterialSlider/helper"
import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import WorkCard, { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import { cyKeys } from "@/cypress/support/constants"
import {
  ParagraphGoMaterialSliderAutomatic,
  ParagraphGoMaterialSliderManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type MaterialSliderProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  title: ParagraphGoMaterialSliderAutomatic["title"] | ParagraphGoMaterialSliderManual["title"]
}

const MaterialSlider = ({ works, title }: MaterialSliderProps) => {
  const [sliderRef, internalSlider] = useKeenSlider(defaultSliderOptions, [WheelControls])
  const [reachedStart, setReachStart] = useState(true)
  const [reachedEnd, setReachEnd] = useState(true)
  const size = useWindowSize()

  useEffect(() => {
    updateSlidePosition()
    internalSlider.current?.on("slideChanged", () => {
      updateSlidePosition()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If window size or children amount changes, update the slider
  useEffect(() => {
    internalSlider.current?.update()
  }, [size.width, internalSlider])

  const updateSlidePosition = () => {
    setReachStart(internalSlider.current?.track?.details?.rel === 0)
    setReachEnd(
      internalSlider.current?.track?.details?.maxIdx === internalSlider.current?.track?.details?.rel
    )
  }

  const onLeftClick = () => {
    internalSlider.current?.prev()
  }

  const onRightClick = () => {
    internalSlider.current?.next()
  }

  return (
    <div className="bg-background-overlay overflow-hidden" data-cy={cyKeys["material-slider"]}>
      <div className="content-container grid-go">
        <div className="pt-paragraph-spacing col-span-full flex items-center justify-between">
          <h2 className="text-typo-heading-2">{title}</h2>
          <div className="flex flex-row justify-end gap-x-4">
            <Button
              disabled={reachedStart}
              variant="icon"
              ariaLabel="Vis forrige værker"
              onClick={() => onLeftClick()}
              data-cy={cyKeys["material-slider-prev-button"]}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              disabled={reachedEnd}
              variant="icon"
              ariaLabel="Vis næste værker"
              onClick={() => onRightClick()}
              data-cy={cyKeys["material-slider-next-button"]}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        </div>

        <div className="-mx-grid-edge px-grid-edge col-span-full">
          <div className="my-paragraph-spacing">
            <div ref={sliderRef} className={"keen-slider !overflow-visible"}>
              {works &&
                works.map(work => {
                  const manifestations = sortManifestationsBySortPriority(
                    filterManifestationsByEdition(
                      filterManifestationsByMaterialType(
                        filterMaterialTypes(work.manifestations.all)
                      )
                    )
                  )

                  const manifestation = getEbookManifestationOrFallbackManifestation(
                    work.manifestations.bestRepresentation,
                    manifestations
                  )

                  const title = work.titles.full[0]
                  const url = manifestation
                    ? resolveUrl({
                        routeParams: { work: "work", wid: work.workId },
                        queryParams: {
                          type: manifestation.materialTypes[0].materialTypeGeneral.code,
                        },
                      })
                    : ""

                  return (
                    <Link
                      prefetch={false}
                      key={work.workId}
                      aria-label={`Tilgå værket ${title} af ${displayCreators(work.creators, 1)}`}
                      className="keen-slider__slide focus-visible outline-accent-foreground focus:outline-offset-2"
                      href={url || ""}>
                      <WorkCardWithCaption title={title} creators={work.creators || []}>
                        {manifestation ? (
                          <WorkCard
                            className="dark:bg-background-overlay !dark:bg-background"
                            workId={work.workId}
                            title={title}
                            bestRepresentation={manifestation}
                            manifestations={manifestations}
                            isWithTilt={true}
                          />
                        ) : (
                          <WorkCardEmpty />
                        )}
                      </WorkCardWithCaption>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MaterialSliderSkeleton = () => {
  return (
    <div
      className="bg-background-overlay overflow-hidden"
      data-cy={cyKeys["material-slider-skeleton"]}>
      <div className="content-container gap-paragraph-spacing py-paragraph-spacing flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-typo-heading-3 bg-background-skeleton h-11 w-[50%] animate-pulse rounded-full" />
          <div className="flex gap-x-4">
            <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
            <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
          </div>
        </div>
        <div className="grid-go flex flex-row">
          <div className="col-span-full min-w-[calc(90%+6px)] md:min-w-[calc(100%/2-28px)] lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
          <div className="col-span-full block min-w-[calc(90%+6px)] md:min-w-[calc(100%/2-28px)] lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
          <div
            className="col-span-full hidden w-full md:col-span-2 md:block md:min-w-[calc(100%/2-28px)]
              lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialSlider
