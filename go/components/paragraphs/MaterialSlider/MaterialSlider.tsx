import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import {
  ParagraphGoMaterialSliderAutomatic,
  ParagraphGoMaterialSliderManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type MaterialSliderProps = {
  works: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  title: ParagraphGoMaterialSliderAutomatic["title"] | ParagraphGoMaterialSliderManual["title"]
}

const MaterialSlider = ({ works, title }: MaterialSliderProps) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const cardWidth = 436
  const scrollAmount = cardWidth * 3

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
      <div className="content-container flex flex-row flex-wrap">
        <h2 className="text-typo-heading-2 my-12 w-full">{title}</h2>
        <hr className="border-foreground mb-6 w-full opacity-10" />
        {(canScrollLeft || canScrollRight) && (
          <>
            <Button
              onClick={() => {
                scroll("left")
              }}
              variant="icon"
              ariaLabel="Vis forrige værker"
              className="ml-auto hidden xl:inline-flex"
              disabled={!canScrollLeft || areButtonsDisabled}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              onClick={() => {
                scroll("right")
              }}
              variant="icon"
              ariaLabel="Vis næste værker"
              className="ml-6 hidden xl:inline-flex"
              disabled={!canScrollRight || areButtonsDisabled}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </>
        )}
        <div
          ref={sliderRef}
          className={"flex w-full flex-row gap-6 overflow-x-scroll pb-12 xl:py-12"}>
          {works.map(work => (
            <Link
              key={work.workId}
              aria-label={`Tilgå værket ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
              className="focus-visible"
              href={resolveUrl({
                routeParams: { work: "work", wid: work.workId },
                queryParams: {
                  type: work.manifestations.bestRepresentation.materialTypes[0].materialTypeGeneral
                    .code,
                },
              })}>
              <WorkCardWithCaption
                work={work}
                classNameWorkCard={"bg-background dark-mode-transition w-48 lg:w-96 xl:w-[436px]"}
                className={"max-w-48 lg:max-w-96 xl:max-w-[436px]"}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export const MaterialSliderSkeleton = () => {
  return <div>Loading...</div>
}

export const MaterialSliderEmpty = () => {
  return <div>No data.</div>
}

export default MaterialSlider
