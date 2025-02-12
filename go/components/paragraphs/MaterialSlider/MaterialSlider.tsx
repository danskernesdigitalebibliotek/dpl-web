import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import WorkCard from "@/components/shared/workCard/WorkCard"
import {
  ParagraphGoMaterialSliderAutomatic,
  ParagraphGoMaterialSliderManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

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

  const handleScrollEnd = () => {
    updateScrollButtons()
    setAreButtonsDisabled(false)
    sliderRef.current?.removeEventListener("scrollend", handleScrollEnd)
  }

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return
    const finalScrollAmount = direction === "left" ? -scrollAmount : scrollAmount
    setAreButtonsDisabled(true)
    sliderRef.current.scrollBy({ left: finalScrollAmount, behavior: "smooth" })
    sliderRef.current.addEventListener("scrollend", handleScrollEnd)
  }

  return (
    <div className="bg-background-overlay">
      <div className="content-container flex flex-row flex-wrap">
        <h2 className="text-typo-heading-2 my-12 w-full">{title}</h2>
        <hr className="border-foreground mb-6 w-full opacity-10" />
        <Button
          onClick={() => {
            scroll("left")
          }}
          variant="icon"
          ariaLabel="Vis forrige værker"
          className="ml-auto"
          disabled={!canScrollLeft || areButtonsDisabled}>
          <Icon className="h-[24px] w-[24px]" name="arrow-left" />
        </Button>
        <Button
          onClick={() => {
            scroll("right")
          }}
          variant="icon"
          ariaLabel="Vis næste værker"
          className="ml-6"
          disabled={!canScrollRight || areButtonsDisabled}>
          <Icon className="h-[24px] w-[24px]" name="arrow-right" />
        </Button>
        <div ref={sliderRef} className={"flex w-full flex-row gap-6 overflow-x-hidden py-12"}>
          {works.map(work => (
            <WorkCard
              key={work.workId}
              work={work}
              className={`bg-background w-[${cardWidth}px]`}
              classNameWrapper={`max-w-[${cardWidth}px]`}
            />
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
