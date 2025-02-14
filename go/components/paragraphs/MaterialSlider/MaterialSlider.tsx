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
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type MaterialSliderProps = {
  works: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] | undefined
  title: ParagraphGoMaterialSliderAutomatic["title"] | ParagraphGoMaterialSliderManual["title"]
}

const MaterialSlider = ({ works, title }: MaterialSliderProps) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth)
  }

  useEffect(() => {
    updateScrollButtons()
  }, [works])

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.9
    const finalScrollAmount = direction === "left" ? -scrollAmount : scrollAmount
    setAreButtonsDisabled(true)
    sliderRef.current.scrollBy({ left: finalScrollAmount, behavior: "smooth" })
    setTimeout(() => {
      updateScrollButtons()
      setAreButtonsDisabled(false)
    }, 500)
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    const handleScroll = () => {
      updateScrollButtons()
    }
    slider.addEventListener("scroll", handleScroll)
    return () => {
      slider.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="bg-background-overlay">
      <div className="content-container grid-go">
        <h2 className="text-typo-heading-2 col-span-full my-12">{title}</h2>
        <hr className="divider-go col-span-full mb-6" />
        {(canScrollLeft || canScrollRight) && (
          <div className="gap-grid-gap col-span-full flex flex-row justify-end">
            <Button
              onClick={() => {
                scroll("left")
              }}
              variant="icon"
              ariaLabel="Vis forrige værker"
              disabled={!canScrollLeft || areButtonsDisabled}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              onClick={() => {
                scroll("right")
              }}
              variant="icon"
              ariaLabel="Vis næste værker"
              disabled={!canScrollRight || areButtonsDisabled}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        )}
        <div
          ref={sliderRef}
          className={"gap-grid-gap col-span-full flex flex-row overflow-x-scroll py-6 md:py-12"}>
          {works ? (
            works.map(work => (
              <Link
                key={work.workId}
                aria-label={`Tilgå værket ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
                className="focus-visible w-[70%] shrink-0 sm:w-[40%] lg:w-[30%]"
                href={resolveUrl({
                  routeParams: { work: "work", wid: work.workId },
                  queryParams: {
                    type: work.manifestations.bestRepresentation.materialTypes[0]
                      .materialTypeGeneral.code,
                  },
                })}>
                <WorkCardWithCaption
                  work={work}
                  classNameWorkCard={"bg-background dark-mode-transition w-[100%]"}
                  className="max-w-[100%]"
                />
              </Link>
            ))
          ) : (
            <div className="w-[70%] shrink-0 sm:w-[40%] lg:w-[30%]">
              <WorkCardEmpty />
            </div>
          )}
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
        <hr className="divider-go mb-6" />
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

export default MaterialSlider
