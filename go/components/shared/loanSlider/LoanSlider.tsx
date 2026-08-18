"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { useRouter } from "next/navigation"
import React, { Suspense, useEffect, useState } from "react"

import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import LoanCard from "@/components/shared/loanCard/LoanCard"
import { loanSliderOptions } from "@/components/shared/loanSlider/helper"
import QuotasSection, {
  QuotasSectionSkeleton,
} from "@/components/shared/quotasSection/QuotasSection"
import { cyKeys } from "@/cypress/support/constants"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { buildSelectedLoan } from "@/lib/helpers/helper.patron"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { openModal } from "@/store/modal.store"

type LoanSliderProps = {
  works: WorkTeaserSearchPageFragment[]
  loanData: LoanListResult
}

const LoanSlider = ({ works, loanData }: LoanSliderProps) => {
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
  const [audioLoans, setAudioLoans] = useState<string[]>([])
  const [ebookLoans, setEbookLoans] = useState<string[]>([])
  const [blueLoans, setBlueLoans] = useState<string[]>([])

  useEffect(() => {
    internalSlider.current?.on("slideChanged", () => {
      updateSlidePosition()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalSlider.current])

  useEffect(() => {
    updateSlidePosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [works])

  // If window size or children amount changes, update the slider
  useEffect(() => {
    internalSlider.current?.update()
  }, [size.width, internalSlider, works])
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
        {/* Counts the paired works actually shown — raw Publizon loans also
            cover adult-only materials that GO filters out. */}
        <h2 className="text-typo-heading-4">Digitale lån ({works.length})</h2>
        {!!works.length && (
          <div className="flex flex-row justify-end gap-x-4">
            <Button
              disabled={reachedStart}
              variant="icon"
              ariaLabel="Vis forrige værker"
              data-cy={cyKeys["loan-slider-prev-button"]}
              onClick={() => onLeftClick()}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              disabled={reachedEnd}
              variant="icon"
              ariaLabel="Vis næste værker"
              data-cy={cyKeys["loan-slider-next-button"]}
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
          data-cy={cyKeys["loan-slider"]}>
          {works.map((work, index) => {
            const loanManifestation = work.manifestations.all[0]
            return (
              <button
                type="button"
                data-cy={cyKeys["loan-slider-work"]}
                key={loanManifestation.pid}
                onFocus={() => bringIntoView(index)}
                aria-label={`Se detaljer om dit lån af ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
                className={cn(
                  `keen-slider__slide focus-visible outline-accent-foreground rounded-base flex
                  cursor-pointer items-center !overflow-visible focus:outline-offset-2`
                )}
                onClick={() => {
                  const selection = buildSelectedLoan(work, loanData)
                  if (!selection) return
                  openModal("DigitalLoansModal", { works, loanData, initialLoan: selection })
                }}>
                <LoanCard
                  manifestation={loanManifestation}
                  title={work.titles.full[0]}
                  className={cn(index % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5")}
                  setAudioLoans={setAudioLoans}
                  setEbookLoans={setEbookLoans}
                  setBlueLoans={setBlueLoans}
                />
              </button>
            )
          })}
          {/* To avoid empty looking slider for one loan or no loans, we add visual indicators for more books. */}
          {works.length < 2 && (
            <div
              className={cn("flex w-full flex-row gap-18 overflow-hidden pt-10 pb-3 pl-10", {
                "pl-16": works.length === 0,
              })}>
              {Array.from({ length: 4 - works.length }).map((item, index) => {
                return (
                  <div
                    key={index}
                    className={cn(
                      `border-foreground h-[300px] w-[250px] shrink-0 rounded-sm border-2
                      border-dashed opacity-10 sm:h-[450px] sm:w-[280px] md:h-[350px] md:w-[250px]
                      lg:block lg:h-[300px] lg:w-[200px] xl:block xl:h-[400px] xl:w-[280px]`,
                      (works.length + index) % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5"
                    )}
                  />
                )
              })}
              {/* If user doesn't have any loans - lead them to find their first material. */}
              {works.length === 0 && (
                <div
                  className="absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col
                    items-center justify-center gap-5">
                  <p className="text-typo-heading-3">Du har ikke lånt noget endnu</p>
                  <Button size="lg" className="min-w-80" onClick={() => router.push("/")}>
                    Find din næste bog
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Suspense fallback={<QuotasSectionSkeleton />}>
        <QuotasSection
          audioLoans={audioLoans}
          ebookLoans={ebookLoans}
          blueLoans={blueLoans}
          onViewAll={() => openModal("DigitalLoansModal", { works, loanData })}
        />
      </Suspense>
    </div>
  )
}

// Mirrors the loaded slider: same container padding, headline row, slides
// per view and the quota section, so nothing jumps when the data arrives.
export const LoanSliderSkeleton = () => {
  return (
    <div
      className="bg-background-overlay grid-go p-grid-edge rounded-base col-span-full space-y-8
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
          {Array.from({ length: 4 }).map((item, index) => (
            <div
              key={index}
              className="min-w-[calc(100%/1.3)] shrink-0 md:min-w-[calc(100%/2.5)]
                lg:min-w-[calc(100%/3.7)]">
              <div
                className={cn(
                  "w-full space-y-3 px-[15%]",
                  index % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5"
                )}>
                <CoverPictureSkeleton className="aspect-2/3 w-full" />
                <div className="flex w-full justify-center pt-5">
                  <div className="bg-background-skeleton h-[30px] w-28 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quota section */}
      <QuotasSectionSkeleton />
    </div>
  )
}

export default LoanSlider
