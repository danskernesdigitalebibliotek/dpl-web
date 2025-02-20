"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { KeenSliderOptions, KeenSliderPlugin, useKeenSlider } from "keen-slider/react"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import {
  ParagraphGoMaterialSliderAutomatic,
  ParagraphGoMaterialSliderManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type MaterialSliderProps = {
  works: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] | undefined
  title: ParagraphGoMaterialSliderAutomatic["title"] | ParagraphGoMaterialSliderManual["title"]
}

const defaultSliderOptions: KeenSliderOptions = {
  initial: 0,
  slides: {
    origin: "auto",
    spacing: 12,
    perView: 1.1,
  },
  breakpoints: {
    "(min-width: 768px)": {
      slides: {
        origin: "auto",
        spacing: 12,
        perView: () => {
          return 2.1
        },
      },
    },
    "(min-width: 1024px)": {
      slides: {
        spacing: 24,
        perView: () => {
          return 3
        },
      },
    },
  },
}

const WheelControls: KeenSliderPlugin = slider => {
  let touchTimeout: ReturnType<typeof setTimeout>
  let position: {
    x: number
    y: number
  }
  let wheelActive: boolean

  function dispatch(e: WheelEvent, name: string) {
    position.x -= e.deltaX
    position.y -= e.deltaY
    slider.container.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          x: position.x,
          y: position.y,
        },
      })
    )
  }

  function wheelStart(e: WheelEvent) {
    position = {
      x: e.pageX,
      y: e.pageY,
    }
    dispatch(e, "ksDragStart")
  }

  function wheel(e: WheelEvent) {
    dispatch(e, "ksDrag")
  }

  function wheelEnd(e: WheelEvent) {
    dispatch(e, "ksDragEnd")
  }

  function eventWheel(e: WheelEvent) {
    if (e.deltaX === 0) {
      return
    }

    e.preventDefault()
    if (!wheelActive) {
      wheelStart(e)
      wheelActive = true
    }
    wheel(e)
    clearTimeout(touchTimeout)
    touchTimeout = setTimeout(() => {
      wheelActive = false
      wheelEnd(e)
    }, 50)
  }

  slider.on("created", () => {
    slider.container.addEventListener("wheel", eventWheel, {
      passive: false,
    })
  })
}

const MaterialSliderNew = ({ works, title }: MaterialSliderProps) => {
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
    setReachStart(internalSlider.current?.track.details.rel === 0)
    setReachEnd(
      internalSlider.current?.track.details.maxIdx === internalSlider.current?.track.details.rel
    )
  }

  const onLeftClick = () => {
    internalSlider.current?.prev()
  }

  const onRightClick = () => {
    internalSlider.current?.next()
  }

  return (
    <div className="bg-background-overlay">
      <div className="content-container grid-go overflow-hidden">
        <h2 className="text-typo-heading-2 col-span-full my-12">{title}</h2>
        <hr className="col-span-full mb-6" />

        <div className="gap-grid-gap col-span-full flex flex-row justify-end">
          <Button
            disabled={reachedStart}
            variant="icon"
            ariaLabel="Vis forrige værker"
            onClick={() => onLeftClick()}>
            <Icon className="h-[24px] w-[24px]" name="arrow-left" />
          </Button>
          <Button
            disabled={reachedEnd}
            variant="icon"
            ariaLabel="Vis næste værker"
            onClick={() => onRightClick()}>
            <Icon className="h-[24px] w-[24px]" name="arrow-right" />
          </Button>
        </div>

        <div className="-mx-grid-edge px-grid-edge col-span-full overflow-hidden">
          <div className="my-paragraph-spacing-inner relative">
            <div ref={sliderRef} className={"keen-slider !overflow-visible"}>
              {works ? (
                works.map((work, index) => (
                  <Link
                    key={work.workId}
                    aria-label={`Tilgå værket ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
                    className="keen-slider__slide focus-visible outline-accent-foreground focus:outline-offset-2"
                    href={resolveUrl({
                      routeParams: { work: "work", wid: work.workId },
                      queryParams: {
                        type: work.manifestations.bestRepresentation.materialTypes[0]
                          .materialTypeGeneral.code,
                      },
                    })}>
                    <WorkCardWithCaption work={work} isWithTilt />
                  </Link>
                ))
              ) : (
                <div className="">
                  <WorkCardEmpty />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MaterialSliderSkeleton = () => {
  return (
    <div className="bg-background-overlay">
      <div className="content-container flex flex-row flex-wrap">
        <h2 className="text-typo-heading-2 bg-background-skeleton my-12 h-11 w-[50%] animate-pulse rounded-full" />
        <hr className="mb-6" />
        <div className="flex w-full flex-row justify-end gap-6">
          <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
          <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
        </div>
        <div className="flex w-full flex-row gap-6 overflow-x-scroll pb-12 xl:py-12">
          <div className="w-[70%] shrink-0 sm:w-[40%] lg:w-[30%]">
            <WorkCardSkeleton />
          </div>
          <div className="w-[70%] shrink-0 sm:w-[40%] lg:w-[30%]">
            <WorkCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialSliderNew
