"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import Link from "next/link"
import React, { Suspense, useEffect, useState } from "react"

import LoanCard from "@/app/user/profile/LoanCard"
import QuotasSection, { QuotasSectionSkeleton } from "@/app/user/profile/QuotasSection"
import { loanSliderOptions } from "@/app/user/profile/helper"
import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

import FindBookButton from "./FindBookButton"

type LoanSliderProps = {
  works: WorkTeaserSearchPageFragment[]
  loanData: LoanListResult
}

const LoanSlider = ({ works, loanData }: LoanSliderProps) => {
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

  return (
    <div className="bg-background-overlay rounded-base grid-go col-span-full space-y-8 overflow-hidden py-10">
      <div className="col-span-full flex items-center justify-between px-10">
        <h2 className="text-typo-heading-4">
          E-materialer jeg har lånt ({loanData.loans?.length})
        </h2>
        {!!loanData.loans?.length && (
          <div className="flex flex-row justify-end gap-x-4">
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
        )}
      </div>
      <div className="-mx-grid-edge px-grid-edge col-span-full">
        <div ref={sliderRef} className={"keen-slider !overflow-visible"}>
          {works.map((work, index) => {
            const loanManifestation = work.manifestations.all[0]
            return (
              <Link
                key={loanManifestation.pid}
                aria-label={`Tilgå værket ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
                className={cn(
                  `keen-slider__slide focus-visible outline-accent-foreground rounded-base !overflow-visible
                  focus:outline-offset-2`
                )}
                href={resolveUrl({
                  routeParams: { work: "work", wid: work.workId },
                  queryParams: {
                    type: loanManifestation.materialTypes[0].materialTypeGeneral.code,
                  },
                })}>
                <LoanCard
                  manifestation={loanManifestation}
                  title={work.titles.full[0]}
                  className={cn(index % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5")}
                />
              </Link>
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
                      `border-foreground h-[300px] w-[250px] shrink-0 rounded-sm border-2 border-dashed opacity-10
                      sm:h-[450px] sm:w-[280px] md:h-[350px] md:w-[250px] lg:block lg:h-[300px] lg:w-[200px] xl:block
                      xl:h-[400px] xl:w-[280px]`,
                      (works.length + index) % 2 === 0 ? "rotate-5" : "mt-10 -rotate-5"
                    )}
                  />
                )
              })}
              {/* If user doesn't have any loans - lead them to find their first material. */}
              {works.length === 0 && (
                <div className="absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col items-center justify-center gap-5">
                  <p className="text-typo-heading-3">Du har ingen lånte bøger</p>
                  <FindBookButton />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Suspense fallback={<QuotasSectionSkeleton />}>
        <QuotasSection loanData={loanData} />
      </Suspense>
    </div>
  )
}

export const LoanSliderSkeleton = () => {
  return (
    <div className="bg-background-overlay rounded-base grid-go col-span-full space-y-8 overflow-hidden py-10">
      <div className="col-span-full flex items-center justify-between px-10">
        {/* Headline */}
        <div className="text-typo-heading-4 bg-background-skeleton h-[27px] w-xl animate-pulse rounded-sm" />
        {/* Buttons */}
        <div className="flex flex-row justify-end gap-x-4">
          <div className="bg-background-skeleton h-10 w-10 animate-pulse rounded-full" />
          <div className="bg-background-skeleton h-10 w-10 animate-pulse rounded-full" />
        </div>
      </div>
      {/* Slider */}
      <div className="-mx-grid-edge px-grid-edge col-span-full">
        <div className={"keen-slider !overflow-visible"}>
          {Array.from({ length: 4 }).map((item, index) => {
            return (
              <div
                key={index}
                className="relative flex aspect-5/7 h-full max-w-[400px] min-w-[400px]">
                <div className="aspect-1/1 h-full w-full p-14">
                  <CoverPictureSkeleton
                    className={cn({
                      "rotate-5": index % 2 === 0,
                      "mt-10 -rotate-5": index % 2 !== 0,
                    })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Quota section */}
      <QuotasSectionSkeleton />
    </div>
  )
}

export default LoanSlider
