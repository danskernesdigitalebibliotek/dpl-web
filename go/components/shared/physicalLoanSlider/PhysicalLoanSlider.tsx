"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import { loanSliderOptions } from "@/components/shared/loanSlider/helper"
import PhysicalLoanCard from "@/components/shared/physicalLoanCard/PhysicalLoanCard"
import PhysicalQuotasSection from "@/components/shared/physicalQuotasSection/PhysicalQuotasSection"
import { cyKeys } from "@/cypress/support/constants"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { type PhysicalLoanItem, type ReservationItem } from "@/lib/helpers/helper.patron"

type PhysicalLoanSliderProps = {
  items: PhysicalLoanItem[]
  reservationItems: ReservationItem[]
}

const PhysicalLoanSlider = ({ items, reservationItems }: PhysicalLoanSliderProps) => {
  const router = useRouter()
  const [sliderRef, internalSlider] = useKeenSlider(loanSliderOptions, [WheelControls])
  const [reachedStart, setReachStart] = useState(true)
  const [reachedEnd, setReachEnd] = useState(true)
  const size = useWindowSize()
  const updateSlidePosition = () => {
    setReachStart(internalSlider.current?.track?.details?.rel === 0)
    setReachEnd(
      internalSlider.current?.track?.details?.maxIdx === internalSlider.current?.track?.details?.rel
    )
  }

  useEffect(() => {
    internalSlider.current?.on("slideChanged", () => {
      updateSlidePosition()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalSlider.current])

  useEffect(() => {
    updateSlidePosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // If window size or children amount changes, update the slider
  useEffect(() => {
    internalSlider.current?.update()
  }, [size.width, internalSlider, items])
  const onLeftClick = () => {
    internalSlider.current?.prev()
  }
  const onRightClick = () => {
    internalSlider.current?.next()
  }
  // Slides move by transform, so the browser can't scroll a keyboard-focused
  // card into view itself — follow focus, but leave fully visible cards alone.
  const bringIntoView = (index: number) => {
    const slide = internalSlider.current?.track?.details?.slides[index]
    if (slide && slide.portion < 1) internalSlider.current?.moveToIdx(index)
  }

  return (
    <div
      className="bg-background-overlay grid-go p-grid-edge rounded-base col-span-full space-y-8
        overflow-hidden md:p-8">
      <div className="col-span-full flex items-center justify-between">
        <h2 className="text-typo-heading-4">Bøger jeg har lånt på biblioteket ({items.length})</h2>
        {!!items.length && (
          <div className="flex flex-row justify-end gap-x-4">
            <Button
              disabled={reachedStart}
              variant="icon"
              ariaLabel="Vis forrige værker"
              data-cy={cyKeys["physical-loan-slider-prev-button"]}
              onClick={() => onLeftClick()}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              disabled={reachedEnd}
              variant="icon"
              ariaLabel="Vis næste værker"
              data-cy={cyKeys["physical-loan-slider-next-button"]}
              onClick={() => onRightClick()}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        )}
      </div>
      <div className="-mx-grid-edge px-grid-edge col-span-full">
        <div
          ref={sliderRef}
          className={"keen-slider !overflow-visible"}
          data-cy={cyKeys["physical-loan-slider"]}>
          {items.map(({ loan, work, manifestation }, index) => (
            <div
              data-cy={cyKeys["physical-loan-slider-work"]}
              key={loan.loanId}
              onFocus={() => bringIntoView(index)}
              className="keen-slider__slide flex items-center !overflow-visible">
              <PhysicalLoanCard
                loan={loan}
                manifestation={manifestation}
                title={work.titles.full[0]}
                workId={work.workId}
                creators={displayCreators(work.creators, 1)}
                className={cn(index % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5")}
              />
            </div>
          ))}
          {/* To avoid empty looking slider for one loan or no loans, we add visual indicators for more books. */}
          {items.length < 2 && (
            <div
              className={cn("flex w-full flex-row gap-18 overflow-hidden pt-10 pb-3 pl-10", {
                "pl-16": items.length === 0,
              })}>
              {Array.from({ length: 4 - items.length }).map((item, index) => {
                return (
                  <div
                    key={index}
                    className={cn(
                      `border-foreground h-[300px] w-[250px] shrink-0 rounded-sm border-2
                      border-dashed opacity-10 sm:h-[450px] sm:w-[280px] md:h-[350px] md:w-[250px]
                      lg:block lg:h-[300px] lg:w-[200px] xl:block xl:h-[400px] xl:w-[280px]`,
                      (items.length + index) % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5"
                    )}
                  />
                )
              })}
              {/* If user doesn't have any loans - lead them to find their first material. */}
              {items.length === 0 && (
                <div
                  className="absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col
                    items-center justify-center gap-5">
                  <p className="text-typo-heading-3 text-center">Du har ikke lånt noget endnu</p>
                  <Button size="lg" className="min-w-80" onClick={() => router.push("/")}>
                    Find din næste bog
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <PhysicalQuotasSection loanItems={items} reservationItems={reservationItems} />
    </div>
  )
}

// Mirrors the loaded slider: same container padding, headline row, rotated
// covers and the two overview cards, so nothing jumps when the data arrives.
export const PhysicalLoanSliderSkeleton = () => {
  return (
    <div
      className="bg-background-overlay rounded-base grid-go p-grid-edge col-span-full space-y-8
        overflow-hidden md:p-8">
      <div className="col-span-full flex items-center justify-between">
        {/* Headline */}
        <div
          className="bg-background-skeleton h-[27px] w-48 max-w-[60%] animate-pulse rounded-sm
            md:w-80"
        />
        {/* Buttons */}
        <div className="flex flex-row justify-end gap-x-4">
          <div className="bg-background-skeleton h-10 w-10 animate-pulse rounded-full" />
          <div className="bg-background-skeleton h-10 w-10 animate-pulse rounded-full" />
        </div>
      </div>
      {/* Slider */}
      <div className="-mx-grid-edge px-grid-edge col-span-full">
        <div className="flex">
          {Array.from({ length: 4 }).map((item, index) => {
            return (
              <div
                key={index}
                className="min-w-[calc(100%/1.3)] shrink-0 md:min-w-[calc(100%/2.5)]
                  lg:min-w-[calc(100%/3.7)]">
                <div className="w-full px-[15%]">
                  <CoverPictureSkeleton
                    className={cn(
                      "aspect-2/3 w-full",
                      index % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5"
                    )}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Overview cards */}
      <div className="gap-grid-edge col-span-full flex w-full flex-col md:gap-6 lg:flex-row">
        <div className="bg-background-skeleton rounded-base h-44 w-full animate-pulse lg:flex-1" />
        <div className="bg-background-skeleton rounded-base h-44 w-full animate-pulse lg:flex-1" />
      </div>
    </div>
  )
}

export default PhysicalLoanSlider
