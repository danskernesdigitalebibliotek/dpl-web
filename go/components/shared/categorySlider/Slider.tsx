"use client"

import { useSelector } from "@xstate/react"
import { KeenSliderOptions, useKeenSlider } from "keen-slider/react"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { cn } from "@/lib/helpers/helper.cn"
import { categoryStore } from "@/store/category.store"

import ImageBase from "../image/ImageBase"
import SmartLink from "../smartLink/SmartLink"
import { TNodeGoCategory } from "./CategorySlider"

export const sliderOptions: KeenSliderOptions = {
  initial: 0,
  slides: {
    origin: "auto",
    spacing: -12,
    perView: () => {
      return 3.5
    },
  },
  breakpoints: {
    "(min-width: 1024px)": {
      slides: {
        spacing: -24,
        perView: () => {
          return 6.5
        },
      },
    },
  },
}

type TSliderProps = {
  categories: TNodeGoCategory[]
  className?: string
}

function Slider({ categories, className }: TSliderProps) {
  const [sliderRef] = useKeenSlider(sliderOptions, [WheelControls])
  const [currentPath, setCurrentPath] = useState<string>("")
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  // Get a random number between -6 and 6 hardcoded values
  const getRandomRotateClass = () => {
    const rotations = [
      "has-checked:rotate-2",
      "has-checked:rotate-3",
      "has-checked:rotate-4",
      "has-checked:rotate-5",
      "has-checked:rotate-6",
      "has-checked:-rotate-2",
      "has-checked:-rotate-3",
      "has-checked:-rotate-4",
      "has-checked:-rotate-5",
      "has-checked:-rotate-6",
    ]
    const randomIndex = Math.floor(Math.random() * rotations.length)
    return rotations[randomIndex]
  }

  const showCategorySlider = useSelector(categoryStore, state => state.context.showCategorySlider)

  // If the category slider is not shown, return null

  return (
    <div
      className={cn(
        `lg:w-[calc(100%+48px) w-[calc(100%+24px) relative -mx-[24px] !overflow-visible px-[12px]
        lg:-mx-[48px] lg:px-[24px]`,
        className
      )}>
      <div
        ref={sliderRef}
        className={cn(
          "keen-slider relative z-10 w-full !overflow-visible opacity-0 transition-all duration-300",
          showCategorySlider ? "h-auto" : "h-0",
          loaded && showCategorySlider ? "opacity-100" : "opacity-0"
        )}>
        {categories.map((category, index) => {
          return (
            <div className="keen-slider__slide !overflow-visible" key={category.id}>
              <SmartLink
                aria-label={`Gå til kategori ${category.categoryMenuTitle}`}
                href={category.path || ""}
                className={cn(
                  `group flex h-full w-full cursor-pointer flex-col gap-y-2 !overflow-visible p-[12px] ring-0 outline-0
                  transition-all duration-200 lg:p-[24px]`,
                  `${getRandomRotateClass()}`
                )}>
                <div
                  className={cn(
                    `bg-background-overlay relative flex aspect-1/1 items-center justify-center overflow-hidden
                    rounded-sm transition-all duration-300 forced-colors:hidden`,
                    // Add hover effect based on every category by fourth index
                    index % 4 === 0 &&
                      "group-hover:bg-content-1 group-focus:bg-content-1 group-has-checked:bg-content-1",
                    index % 4 === 1 &&
                      "group-hover:bg-content-2 group-focus:bg-content-2 group-has-checked:bg-content-2",
                    index % 4 === 2 &&
                      "group-hover:bg-content-3 group-focus:bg-content-3 group-has-checked:bg-content-3",
                    index % 4 === 3 &&
                      "group-hover:bg-content-4 group-focus:bg-content-4 group-has-checked:bg-content-4"
                  )}>
                  <ImageBase
                    className="grayscale-100 transition-all duration-300 group-hover:grayscale-0 group-focus:grayscale-0
                      group-has-checked:grayscale-0"
                    sizes="10vw"
                    imageSizing="intrinsic"
                    src={category.categoryMenuImage.mediaImage.url || ""}
                    width={category.categoryMenuImage.mediaImage?.width || 0}
                    height={category.categoryMenuImage.mediaImage?.height || 0}
                    alt={category.categoryMenuImage.mediaImage?.alt || ""}
                  />
                  <input
                    type="radio"
                    name="category"
                    checked={currentPath === category.path}
                    className="pointer-events-none appearance-none"
                    disabled
                  />
                </div>
                <p className="text-typo-subtitle-sm text-center">{category.categoryMenuTitle}</p>
              </SmartLink>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Slider
